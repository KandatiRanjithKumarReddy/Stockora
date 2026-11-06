import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { AIProcessingLog, IAIAttemptError } from '../../models/AIProcessingLog.js';

export interface ParsedLineSuggestion {
  originalPhrase: string;
  suggestedSku: string;
  quantity: number;
  unit: 'CASE' | 'PIECE';
  confidenceScore: number;
  alternativeSkus: string[];
  clarificationNeeded?: string;
  unitAmbiguous: boolean;
}

export interface CascadeResult {
  suggestions: ParsedLineSuggestion[];
  modelUsed: string;
  attemptedModels: string[];
  fallbackTriggered: boolean;
  durationMs: number;
  status: 'SUCCESS' | 'PARTIAL_MATCH' | 'FALLBACK_EXHAUSTED' | 'ERROR';
}

interface ModelHealthState {
  consecutiveFailures: number;
  cooldownUntil: number;
  lastError?: string;
}

export class GeminiCascadeService {
  private genAI: GoogleGenerativeAI | null = null;
  private models: string[];
  private healthMap: Map<string, ModelHealthState> = new Map();

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    // Deduplicate while preserving configured priority order
    this.models = Array.from(
      new Set(
        [
          env.GEMINI_PRIMARY_MODEL,
          env.GEMINI_SECONDARY_MODEL,
          env.GEMINI_TERTIARY_MODEL,
        ].filter(Boolean)
      )
    );

    for (const modelName of this.models) {
      this.healthMap.set(modelName, {
        consecutiveFailures: 0,
        cooldownUntil: 0,
      });
    }
  }

  /**
   * Detects fatal global authentication/key errors where trying other models on the same key is pointless
   */
  private isFatalCredentialError(error: any): boolean {
    const status = error?.status || error?.statusCode;
    const msg = String(error?.message || '').toLowerCase();
    return (
      status === 401 ||
      status === 403 ||
      msg.includes('api_key_invalid') ||
      msg.includes('api key not valid') ||
      msg.includes('permission_denied')
    );
  }

  /**
   * Evaluates if an error is a transient network/capacity condition suitable for cooldown tracking
   */
  private isTransientCapacityError(error: any): boolean {
    const errorMsg = String(error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode;

    return (
      status === 429 ||
      status === 500 ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      error?.name === 'AbortError' ||
      errorMsg.includes('429') ||
      errorMsg.includes('503') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('rate limit') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('aborted') ||
      errorMsg.includes('overloaded') ||
      errorMsg.includes('high demand') ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('temporarily') ||
      errorMsg.includes('resource_exhausted') ||
      errorMsg.includes('deadline_exceeded') ||
      errorMsg.includes('fetch failed')
    );
  }

  private isModelInCooldown(modelName: string): boolean {
    const state = this.healthMap.get(modelName);
    if (!state || state.cooldownUntil === 0) return false;
    if (Date.now() >= state.cooldownUntil) {
      // Half-open recovery: cooldown expired, allow probe attempt on this model again
      state.cooldownUntil = 0;
      return false;
    }
    return true;
  }

  private recordSuccess(modelName: string): void {
    this.healthMap.set(modelName, {
      consecutiveFailures: 0,
      cooldownUntil: 0,
    });
  }

  private recordFailure(
    modelName: string,
    errorMessage: string,
    isTransient: boolean,
    isUnavailableModel: boolean
  ): void {
    const prev = this.healthMap.get(modelName) || { consecutiveFailures: 0, cooldownUntil: 0 };
    const consecutiveFailures = prev.consecutiveFailures + 1;

    let cooldownUntil = 0;
    if (isUnavailableModel) {
      cooldownUntil = Date.now() + env.AI_MODEL_COOLDOWN_MS * 4;
    } else if (isTransient && consecutiveFailures >= 2) {
      cooldownUntil = Date.now() + env.AI_MODEL_COOLDOWN_MS;
    }

    this.healthMap.set(modelName, {
      consecutiveFailures,
      cooldownUntil,
      lastError: errorMessage,
    });
  }

  /**
   * Executes a single bounded model invocation with AbortController cancellation (default 30s) and timer cleanup
   */
  private async invokeSingleAttempt(
    modelName: string,
    prompt: string,
    timeoutMs: number
  ): Promise<ParsedLineSuggestion[]> {
    if (!this.genAI) {
      throw new Error('AI service key is not configured.');
    }

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error(`Timeout after ${timeoutMs}ms on ${modelName}`));
        }, timeoutMs);
      });

      const aiCall = model.generateContent(prompt, {
        signal: controller.signal,
      });

      const result = await Promise.race([aiCall, timeoutPromise]);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (!Array.isArray(parsed)) {
        throw new Error('Model response was not a JSON array.');
      }

      return parsed as ParsedLineSuggestion[];
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  /**
   * Executes AI-only prompt across the 3 configured Gemini models, waiting up to 30s per model before switching.
   * Keeps all telemetry strictly internal.
   */
  public async parseOrderText(
    rawText: string,
    catalogContext: { sku: string; name: string; packSize: string; unitsPerCase: number }[],
    retailerAliases: { rawKeyword: string; mappedSku: string }[],
    retailerId?: string
  ): Promise<CascadeResult> {
    const startTime = Date.now();
    const attemptedModels: string[] = [];
    const attemptErrors: IAIAttemptError[] = [];
    let fallbackTriggered = false;

    const catalogString = catalogContext
      .map((p) => `- SKU: ${p.sku} | Name: "${p.name}" | Pack: ${p.packSize} | Units/Case: ${p.unitsPerCase}`)
      .join('\n');

    const aliasString =
      retailerAliases.length > 0
        ? retailerAliases.map((a) => `- Retailer often writes "${a.rawKeyword}" to mean SKU: ${a.mappedSku}`).join('\n')
        : 'None recorded yet';

    const fullPrompt = `You are an expert FMCG wholesale order parser for Company A in Jabalpur, Madhya Pradesh.
Retailers write informal orders in mixed Hindi, Hinglish, and English (e.g. "bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti").

AVAILABLE PRODUCTS IN CATALOG:
${catalogString}

KNOWN RETAILER-SPECIFIC ALIASES:
${aliasString}

CRITICAL RULES:
1. "peti", "case", "carton", or "box" means "CASE". "packet", "pouch", "piece", or "pcs" without peti means "PIECE".
2. Match every product mention to an exact SKU from the catalog above.
3. If the ordering unit (case vs piece) is not explicitly stated in a phrase (e.g. "5 biscuit chhota"), set "unit": "CASE" as wholesale default AND set "unitAmbiguous": true with a brief "clarificationNeeded" question.
4. If pack size is unclear (e.g. biscuit could be 75g or 120g), suggest the best matching SKU, include the other SKU in "alternativeSkus", and set "clarificationNeeded".
5. NEVER invent SKUs not in the catalog.
6. NEVER return rupee prices, discounts, or final financial totals.
7. Return ONLY a valid JSON array of objects.

JSON STRUCTURE:
[
  {
    "originalPhrase": "extracted substring from message",
    "suggestedSku": "SKU-BS-075",
    "quantity": 5,
    "unit": "CASE",
    "confidenceScore": 0.95,
    "alternativeSkus": ["SKU-BS-120"],
    "clarificationNeeded": null,
    "unitAmbiguous": false
  }
]

RAW RETAILER ORDER MESSAGE:
"""${rawText}"""`;

    const activeCandidates = this.models.filter((m) => !this.isModelInCooldown(m));
    const orderedModels = activeCandidates.length > 0 ? activeCandidates : [...this.models];

    if (orderedModels[0] !== this.models[0]) {
      fallbackTriggered = true;
    }

    for (let i = 0; i < orderedModels.length; i++) {
      const modelName = orderedModels[i];
      const isPrimaryModel = modelName === this.models[0];
      const timeoutMs = isPrimaryModel ? env.AI_PRIMARY_TIMEOUT_MS : env.AI_FALLBACK_TIMEOUT_MS;

      if (i > 0) {
        fallbackTriggered = true;
      }

      attemptedModels.push(modelName);
      const attemptStart = Date.now();

      try {
        const suggestions = await this.invokeSingleAttempt(modelName, fullPrompt, timeoutMs);
        this.recordSuccess(modelName);

        const durationMs = Date.now() - startTime;

        await AIProcessingLog.create({
          retailerId,
          rawInputText: rawText,
          selectedModel: modelName,
          attemptedModels,
          fallbackTriggered,
          durationMs,
          status: 'SUCCESS',
          errorCategory: attemptErrors.length > 0 ? attemptErrors[0].error : undefined,
          attemptErrors,
          matchedSkus: suggestions.map((s) => s.suggestedSku),
          unmatchedPhrases: [],
        }).catch(() => {});

        return {
          suggestions,
          modelUsed: modelName,
          attemptedModels,
          fallbackTriggered,
          durationMs,
          status: 'SUCCESS',
        };
      } catch (err: any) {
        const attemptDuration = Date.now() - attemptStart;
        const errMsg = String(err?.message || 'Unknown upstream model error');
        const status = err?.status || err?.statusCode;
        const isTransient = this.isTransientCapacityError(err);
        const isUnavailable = status === 404 || errMsg.toLowerCase().includes('not found');

        attemptErrors.push({
          model: modelName,
          attempt: 1,
          error: errMsg.slice(0, 500),
          durationMs: attemptDuration,
        });

        console.warn(
          `[SmartOrder Internal] Tier ${modelName} failed in ${attemptDuration}ms: ${errMsg.slice(0, 180)}`
        );

        this.recordFailure(modelName, errMsg, isTransient, isUnavailable);

        if (this.isFatalCredentialError(err)) {
          break;
        }
      }
    }

    // All 3 AI tiers exhausted — do NOT run any non-AI local keyword parser
    const durationMs = Date.now() - startTime;
    const primaryRootCause = attemptErrors.length > 0 ? attemptErrors[0].error : 'CASCADE_EXHAUSTED';

    await AIProcessingLog.create({
      retailerId,
      rawInputText: rawText,
      selectedModel: 'NONE',
      attemptedModels,
      fallbackTriggered: true,
      durationMs,
      status: 'FALLBACK_EXHAUSTED',
      errorCategory: primaryRootCause,
      attemptErrors,
      matchedSkus: [],
      unmatchedPhrases: [],
    }).catch(() => {});

    return {
      suggestions: [],
      modelUsed: '',
      attemptedModels,
      fallbackTriggered: true,
      durationMs,
      status: 'FALLBACK_EXHAUSTED',
    };
  }
}

export const geminiCascade = new GeminiCascadeService();
