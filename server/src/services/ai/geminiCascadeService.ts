import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';
import { AIProcessingLog } from '../../models/AIProcessingLog.js';

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

export class GeminiCascadeService {
  private genAI: GoogleGenerativeAI | null = null;
  private models: string[];

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    this.models = [
      env.GEMINI_PRIMARY_MODEL,   // e.g. gemini-3.5-flash-lite
      env.GEMINI_SECONDARY_MODEL, // e.g. gemini-3.6-flash
      env.GEMINI_TERTIARY_MODEL,  // e.g. gemini-3.8-flash
    ];
  }

  /**
   * Evaluates if an error is eligible for fallback failover
   */
  private isEligibleForFallback(error: any): boolean {
    const errorMsg = String(error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode;

    // Rate limits (429), timeouts, temporary overload (503), server errors (5xx)
    return (
      status === 429 ||
      status === 503 ||
      status === 500 ||
      status === 502 ||
      status === 504 ||
      errorMsg.includes('429') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('rate limit') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('overloaded') ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('temporarily') ||
      errorMsg.includes('resource_exhausted') ||
      errorMsg.includes('deadline_exceeded')
    );
  }

  /**
   * Executes prompt against 3-model fallback cascade using single GEMINI_API_KEY
   */
  public async parseOrderText(
    rawText: string,
    catalogContext: { sku: string; name: string; packSize: string; unitsPerCase: number }[],
    retailerAliases: { rawKeyword: string; mappedSku: string }[],
    retailerId?: string
  ): Promise<CascadeResult> {
    const startTime = Date.now();
    const attemptedModels: string[] = [];
    let fallbackTriggered = false;

    const catalogString = catalogContext
      .map((p) => `- SKU: ${p.sku} | Name: "${p.name}" | Pack: ${p.packSize} | Units/Case: ${p.unitsPerCase}`)
      .join('\n');

    const aliasString = retailerAliases.length > 0
      ? retailerAliases.map((a) => `- Retailer often writes "${a.rawKeyword}" to mean SKU: ${a.mappedSku}`).join('\n')
      : 'None recorded yet';

    const systemPrompt = `You are an expert FMCG wholesale order parser for Company A in Jabalpur, Madhya Pradesh.
Retailers write informal orders in mixed Hindi, Hinglish, and English (e.g. "bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti").

AVAILABLE PRODUCTS IN CATALOG:
${catalogString}

KNOWN RETAILER-SPECIFIC ALIASES:
${aliasString}

CRITICAL RULES:
1. "peti" means "CASE". "packet", "pouch", "piece" or "wala" without peti means "PIECE".
2. Match every product mention to an exact SKU from the catalog above.
3. If unit is ambiguous or not stated, flag "unitAmbiguous": true.
4. If pack size is unclear (e.g., biscuit could be 75g or 120g), suggest the closest SKU and provide the other in "alternativeSkus" and specify "clarificationNeeded".
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
]`;

    // Cascade: Try Primary -> Fallback 1 -> Fallback 2
    for (let i = 0; i < this.models.length; i++) {
      const modelName = this.models[i];
      attemptedModels.push(modelName);

      try {
        console.log(`[Gemini Cascade] Attempting Model ${i + 1}/${this.models.length}: ${modelName}...`);

        let responseText = '';

        if (!this.genAI) {
          throw new Error('GEMINI_API_KEY not configured.');
        }

        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after 7000ms on model ${modelName}`)), 7000)
        );

        const aiCall = model.generateContent(`${systemPrompt}\n\nRAW RETAILER ORDER MESSAGE:\n"""${rawText}"""`);
        const result = await Promise.race([aiCall, timeoutPromise]);
        responseText = result.response.text();

        // Parse JSON output
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const suggestions: ParsedLineSuggestion[] = JSON.parse(cleanJson);

        const durationMs = Date.now() - startTime;
        console.log(`[Gemini Cascade] Model ${modelName} succeeded in ${durationMs}ms with ${suggestions.length} suggestions.`);

        // Log to AIProcessingLog
        await AIProcessingLog.create({
          retailerId,
          rawInputText: rawText,
          selectedModel: modelName,
          attemptedModels,
          fallbackTriggered,
          durationMs,
          status: 'SUCCESS',
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
        console.warn(`[Gemini Cascade] Model ${modelName} failed: ${err.message}`);

        // If not the last model and eligible for failover, proceed to next tier
        if (i < this.models.length - 1 && this.isEligibleForFallback(err)) {
          fallbackTriggered = true;
          console.log(`[Gemini Cascade] Failing over to next tier: ${this.models[i + 1]}`);
          continue;
        }

        // If models exhausted or non-retryable error on first model, try fallback heuristic parser
        console.log('[Gemini Cascade] Falling back to intelligent local keyword heuristic parser.');
        const durationMs = Date.now() - startTime;
        const heuristicSuggestions = this.fallbackHeuristicParser(rawText, catalogContext, retailerAliases);

        await AIProcessingLog.create({
          retailerId,
          rawInputText: rawText,
          selectedModel: 'HEURISTIC_RULE_FALLBACK',
          attemptedModels,
          fallbackTriggered: true,
          durationMs,
          status: heuristicSuggestions.length > 0 ? 'PARTIAL_MATCH' : 'FALLBACK_EXHAUSTED',
          errorCategory: err?.message || 'CASCADE_EXHAUSTED',
          matchedSkus: heuristicSuggestions.map((s) => s.suggestedSku),
          unmatchedPhrases: [],
        }).catch(() => {});

        return {
          suggestions: heuristicSuggestions,
          modelUsed: 'HEURISTIC_FALLBACK (Rule-Based)',
          attemptedModels,
          fallbackTriggered: true,
          durationMs,
          status: heuristicSuggestions.length > 0 ? 'PARTIAL_MATCH' : 'FALLBACK_EXHAUSTED',
        };
      }
    }

    const durationMs = Date.now() - startTime;
    return {
      suggestions: [],
      modelUsed: 'NONE',
      attemptedModels,
      fallbackTriggered: true,
      durationMs,
      status: 'FALLBACK_EXHAUSTED',
    };
  }

  /**
   * Deterministic local regex heuristic parser as safety net if network/models are fully exhausted
   */
  private fallbackHeuristicParser(
    rawText: string,
    catalog: { sku: string; name: string; packSize: string }[],
    aliases: { rawKeyword: string; mappedSku: string }[]
  ): ParsedLineSuggestion[] {
    const lines = rawText.split(/[,;\n]+/).map((l) => l.trim()).filter(Boolean);
    const results: ParsedLineSuggestion[] = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      let matchedSku = '';
      let confidence = 0.6;
      let unit: 'CASE' | 'PIECE' = lower.includes('peti') ? 'CASE' : 'PIECE';

      // 1. Check known aliases
      for (const alias of aliases) {
        if (lower.includes(alias.rawKeyword.toLowerCase())) {
          matchedSku = alias.mappedSku;
          confidence = 0.9;
          break;
        }
      }

      // 2. Keyword fallback matching
      if (!matchedSku) {
        if (lower.includes('biscuit') || lower.includes('glucose')) {
          matchedSku = lower.includes('120') ? 'SKU-BS-120' : 'SKU-BS-075';
          confidence = 0.85;
        } else if (lower.includes('washing') || lower.includes('detergent') || lower.includes('powder')) {
          matchedSku = 'SKU-DT-1KG';
          confidence = 0.85;
        } else if (lower.includes('chai') || lower.includes('tea') || lower.includes('patti')) {
          matchedSku = 'SKU-TE-250';
          confidence = 0.85;
        } else if (lower.includes('noodle') || lower.includes('maggi') || lower.includes('masala')) {
          matchedSku = 'SKU-ND-070';
          confidence = 0.85;
        }
      }

      // Extract numerical quantity (e.g. "5 peti" -> 5)
      const qtyMatch = lower.match(/\b(\d+)\b/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

      if (matchedSku) {
        results.push({
          originalPhrase: line,
          suggestedSku: matchedSku,
          quantity: quantity > 0 ? quantity : 1,
          unit,
          confidenceScore: confidence,
          alternativeSkus: matchedSku === 'SKU-BS-075' ? ['SKU-BS-120'] : [],
          unitAmbiguous: !lower.includes('peti') && !lower.includes('packet'),
        });
      }
    }

    return results;
  }
}

export const geminiCascade = new GeminiCascadeService();

