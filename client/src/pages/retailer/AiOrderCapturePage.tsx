import React, { useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

interface AiOrderCapturePageProps {
  onNavigate: (view: string) => void;
}

export const AiOrderCapturePage: React.FC<AiOrderCapturePageProps> = ({ onNavigate }) => {
  const [rawText, setRawText] = useState(
    'bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti'
  );
  const [isParsing, setIsParsing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[] | null>(null);
  const [aiMeta, setAiMeta] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useCart();

  const handleParse = async () => {
    if (!rawText.trim()) return;

    setIsParsing(true);
    setError(null);
    setSuggestions(null);

    try {
      const res = await api.post('/ai/parse-order', { rawText });
      if (res.data.success) {
        setSuggestions(res.data.suggestions);
        setAiMeta({
          modelUsed: res.data.modelUsed,
          durationMs: res.data.durationMs,
          fallbackTriggered: res.data.fallbackTriggered,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'AI parsing failed. You can enter your order manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!suggestions) return;

    suggestions.forEach((item) => {
      if (item.product) {
        addToCart(item.product, item.quantity);
      }
    });

    onNavigate('cart');
  };

  const handleSelectAlternative = (itemIndex: number, altProduct: any) => {
    setSuggestions((prev) => {
      if (!prev) return prev;
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        suggestedSku: altProduct.sku,
        product: altProduct,
      };
      return updated;
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WhatsApp-to-Cart AI Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Convert WhatsApp Order Messages
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Paste rough Hindi or Hinglish order notes. Stockora matches your distributor catalog
          without ever guessing ambiguous units.
        </p>
      </div>

      {/* WhatsApp Input Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Pasted WhatsApp Order Text
          </label>
          <textarea
            rows={3}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. bhaiya 5 peti biscuit chhota, 2 peti washing powder..."
            className="w-full text-xs sm:text-sm rounded-2xl border border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated text-slate-900 dark:text-slate-100 p-3.5 focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-mono"
          />
        </div>

        {/* Quick Sample Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-slate-400">Quick test phrases:</span>
          <button
            type="button"
            onClick={() =>
              setRawText('bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti')
            }
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-elevated text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
          >
            Sample 1: Mixed 3 Brands
          </button>
          <button
            type="button"
            onClick={() => setRawText('10 peti biscuit chhota, 5 peti washing powder')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-elevated text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px]"
          >
            Sample 2: Scheme Triggers (10+1 Bonanza)
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleParse}
            disabled={isParsing || !rawText.trim()}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Gemini 3-Tier Cascade...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract & Suggest with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Extraction Results & Confirmation Card */}
      {suggestions && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b pb-2">
            <div>
              Extracted <strong>{suggestions.length} items</strong> via{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {aiMeta?.modelUsed}
              </span>{' '}
              in {aiMeta?.durationMs}ms
            </div>
            <div className="text-[11px]">Human Confirmation Required Before Order Submit</div>
          </div>

          <div className="space-y-3">
            {suggestions.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-dark-border pb-2.5">
                  <div className="text-xs">
                    <span className="text-slate-400">Retailer Wrote:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      "{item.originalPhrase}"
                    </strong>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        item.confidenceScore >= 0.9
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {(item.confidenceScore * 100).toFixed(0)}% Confidence
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>

                {item.product ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          SKU: {item.product.sku} • {item.product.packSize} • Pack ₹
                          {item.product.dealerPricePerPack} (Case ₹
                          {item.product.calculatedCasePrice})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matched</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-rose-600 font-semibold">
                    Product SKU not found in active catalog.
                  </div>
                )}

                {/* Alternative SKUs if applicable */}
                {item.alternatives && item.alternatives.length > 0 && (
                  <div className="pt-2 text-xs flex items-center space-x-2">
                    <span className="text-slate-400 text-[11px]">Alternatives:</span>
                    {item.alternatives.map((alt: any) => (
                      <button
                        key={alt.sku}
                        type="button"
                        onClick={() => handleSelectAlternative(index, alt)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:border-brand-500 flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Switch to {alt.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action to Cart */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleAddAllToCart}
              className="px-6 py-3 rounded-xl bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white font-bold text-xs shadow flex items-center space-x-2"
            >
              <span>Add Verified Items to Cart & Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

