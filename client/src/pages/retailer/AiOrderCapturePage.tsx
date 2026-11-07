import React, { useRef, useState } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProductImage } from '../../components/common/ProductImage';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Plus,
  Minus,
  PackageCheck,
} from 'lucide-react';

interface AiOrderCapturePageProps {
  onNavigate: (view: string) => void;
}

export const AiOrderCapturePage: React.FC<AiOrderCapturePageProps> = ({ onNavigate }) => {
  const [rawText, setRawText] = useState(
    'bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti'
  );
  const [isParsing, setIsParsing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[] | null>(null);

  const { addItemsBatch } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const parseLockRef = useRef(false);

  const handleParse = async () => {
    if (parseLockRef.current) return;

    if (!user) {
      toast.warning('Please sign in to match items against your shop catalog and pricing.', {
        id: 'smart-order-signin',
      });
      onNavigate('auth');
      return;
    }

    if (!rawText.trim()) {
      toast.warning('Please enter or paste an order message first.', { id: 'smart-order-empty' });
      return;
    }

    parseLockRef.current = true;
    setIsParsing(true);
    setSuggestions(null);

    try {
      const res = await api.post('/ai/parse-order', { rawText }, { timeout: 95000 });
      if (res.data.success) {
        const enriched = (res.data.suggestions || []).map((item: any) => ({
          ...item,
          confirmedCases:
            item.unit === 'PIECE' && item.product?.unitsPerCase
              ? Math.max(1, Math.ceil(item.quantity / item.product.unitsPerCase))
              : Math.max(1, item.quantity || 1),
          unitConfirmed: !item.unitAmbiguous && item.unit === 'CASE',
        }));
        setSuggestions(enriched);

        const hasUnclearUnits = enriched.some(
          (s: any) => s.product && s.product.stockStatus !== 'OUT_OF_STOCK' && !s.unitConfirmed
        );
        if (hasUnclearUnits) {
          toast.warning(
            `Matched ${enriched.length} item${enriched.length === 1 ? '' : 's'}. Confirm case units below.`,
            { id: 'smart-order-parse' }
          );
        } else {
          toast.success(
            `Matched ${enriched.length} item${enriched.length === 1 ? '' : 's'} from your order note.`,
            { id: 'smart-order-parse' }
          );
        }
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          'We could not process that order text right now. Please check your note or add items from the catalog.',
        { id: 'smart-order-error' }
      );
    } finally {
      parseLockRef.current = false;
      setIsParsing(false);
    }
  };

  const handleStepCases = (index: number, delta: number) => {
    setSuggestions((prev) => {
      if (!prev) return prev;
      const updated = [...prev];
      const nextQty = Math.max(1, (updated[index].confirmedCases || 1) + delta);
      updated[index] = {
        ...updated[index],
        confirmedCases: nextQty,
        unitConfirmed: true,
      };
      return updated;
    });
  };

  const handleConfirmUnitAsCases = (index: number) => {
    setSuggestions((prev) => {
      if (!prev) return prev;
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        unitConfirmed: true,
      };
      return updated;
    });
  };

  const handleSelectAlternative = (itemIndex: number, altProduct: any) => {
    setSuggestions((prev) => {
      if (!prev) return prev;
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        suggestedSku: altProduct.sku,
        product: {
          ...updated[itemIndex].product,
          ...altProduct,
        },
        clarificationNeeded: undefined,
      };
      return updated;
    });
    toast.info(`Switched line to ${altProduct.name}.`, { id: `smart-alt-${itemIndex}` });
  };

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions((prev) => (prev ? prev.filter((_, idx) => idx !== index) : prev));
  };

  const unconfirmedCount = (suggestions || []).filter(
    (s) => s.product && s.product.stockStatus !== 'OUT_OF_STOCK' && !s.unitConfirmed
  ).length;

  const eligibleItems = (suggestions || []).filter(
    (s) => s.product && s.product.stockStatus !== 'OUT_OF_STOCK'
  );

  const handleAddAllToCart = () => {
    if (!suggestions || eligibleItems.length === 0 || unconfirmedCount > 0) return;

    addItemsBatch(
      eligibleItems.map((item) => ({
        product: item.product,
        cases: item.confirmedCases || 1,
      }))
    );

    try {
      sessionStorage.setItem('stockora_smart_order_raw', rawText.trim());
    } catch {}

    toast.success(
      `Added ${eligibleItems.length} confirmed item${eligibleItems.length === 1 ? '' : 's'} to cart.`,
      { id: 'smart-order-added' }
    );
    onNavigate('cart');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 space-y-8 pb-16">
      {/* Page Header */}
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stockora Smart Order</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Instant Order Capture
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Paste your shop&apos;s Hindi or Hinglish order message below. Smart Order maps each line
          to your authorized wholesale catalog and asks before confirming any unclear case or pack units.
        </p>
      </div>

      {/* Input Card */}
      <section className="surface-card p-6 sm:p-7 space-y-4">
        <div>
          <label htmlFor="smart-order-input" className="form-label">
            Order Message or List
          </label>
          <textarea
            id="smart-order-input"
            rows={4}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo..."
            className="form-input font-mono resize-none leading-relaxed"
          />
        </div>

        {/* Sample Order Prompts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mr-1">
            Try sample notes:
          </span>
          <button
            type="button"
            onClick={() =>
              setRawText(
                'bhaiya 5 peti biscuit chhota, 2 peti washing powder 1 kilo, chai patti 250 wala 1 peti'
              )
            }
            className="min-h-[34px] px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-dark-elevated hover:bg-zinc-200 dark:hover:bg-dark-hover text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            3-Item Mixed Note
          </button>
          <button
            type="button"
            onClick={() => setRawText('10 peti biscuit chhota, 5 peti washing powder 1 kilo')}
            className="min-h-[34px] px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-dark-elevated hover:bg-zinc-200 dark:hover:bg-dark-hover text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            10+1 Scheme & Slab Discount
          </button>
          <button
            type="button"
            onClick={() => setRawText('bhaiya 4 biscuit chhota, 2 masala noodles')}
            className="min-h-[34px] px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-dark-elevated hover:bg-zinc-200 dark:hover:bg-dark-hover text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            Unclear Unit Check
          </button>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-200 dark:border-dark-border">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            No order is placed until you review and confirm the matched items.
          </span>
          <button
            type="button"
            onClick={handleParse}
            disabled={isParsing || !rawText.trim()}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Matching Catalog Items...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Review Matched Items</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Matched Suggestions & Human Confirmation */}
      {suggestions && (
        <section className="space-y-5 animate-fadeIn" aria-label="Matched order items">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-dark-border">
            <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                Matched <strong className="text-zinc-900 dark:text-white">{suggestions.length}</strong>{' '}
                line{suggestions.length === 1 ? '' : 's'} from your note
              </span>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Verify quantities and stock status before adding to cart
            </span>
          </div>

          <div className="space-y-3.5">
            {suggestions.map((item, index) => {
              const isOutOfStock = item.product?.stockStatus === 'OUT_OF_STOCK';
              const needsUnitConfirmation = !isOutOfStock && !item.unitConfirmed;

              return (
                <div
                  key={`${item.suggestedSku}-${index}`}
                  className={`surface-card p-5 space-y-4 ${
                    needsUnitConfirmation
                      ? 'border-amber-300 dark:border-amber-700'
                      : ''
                  }`}
                >
                  {/* Original Phrase & Match Confidence */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-dark-border">
                    <div className="text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">Note text: </span>
                      <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        &ldquo;{item.originalPhrase}&rdquo;
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-md font-semibold border tabular-nums ${
                          item.confidenceScore >= 0.88
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70'
                            : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70'
                        }`}
                      >
                        {item.confidenceScore >= 0.88 ? 'High Match' : 'Review Match'} (
                        {(item.confidenceScore * 100).toFixed(0)}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSuggestion(index)}
                        className="px-2 py-1 rounded-md text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Matched Catalog SKU Row */}
                  {item.product ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <ProductImage
                          sku={item.product.sku}
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover bg-zinc-100 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                              {item.product.name}
                            </h3>
                            {isOutOfStock && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                            {item.product.sku} • {item.product.packSize} • ₹
                            {item.product.dealerPricePerPack.toFixed(2)}/pack •{' '}
                            <strong className="text-zinc-800 dark:text-zinc-200">
                              ₹{item.product.calculatedCasePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/case
                            </strong>{' '}
                            (Excl. GST)
                          </p>
                        </div>
                      </div>

                      {/* Case Stepper */}
                      {!isOutOfStock ? (
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Cases:
                          </div>
                          <div className="inline-flex items-center rounded-lg border border-zinc-300 dark:border-dark-borderStrong bg-zinc-50 dark:bg-dark-elevated">
                            <button
                              type="button"
                              onClick={() => handleStepCases(index, -1)}
                              aria-label="Decrease cases"
                              className="min-w-[38px] min-h-[40px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-dark-hover rounded-l-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                              {item.confirmedCases}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStepCases(index, 1)}
                              aria-label="Increase cases"
                              className="min-w-[38px] min-h-[40px] flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-dark-hover rounded-r-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                          Skipped at checkout (0 stock)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                      No matching active catalog SKU found for this line.
                    </div>
                  )}

                  {/* Ambiguous Unit / Clarification Prompt */}
                  {(needsUnitConfirmation || item.clarificationNeeded) && !isOutOfStock && (
                    <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-amber-900 dark:text-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <span>
                          {item.clarificationNeeded ||
                            `Wholesale orders ship in full cases (${item.product?.unitsPerCase || ''} packs/case). Please confirm ${item.confirmedCases} case(s).`}
                        </span>
                      </div>
                      {needsUnitConfirmation && (
                        <button
                          type="button"
                          onClick={() => handleConfirmUnitAsCases(index)}
                          className="shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm {item.confirmedCases} Case(s)</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Alternative SKU Switcher */}
                  {item.alternatives && item.alternatives.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Did you mean:
                      </span>
                      {item.alternatives.map((alt: any) => (
                        <button
                          key={alt.sku}
                          type="button"
                          onClick={() => handleSelectAlternative(index, alt)}
                          className="min-h-[34px] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-dark-borderStrong bg-zinc-50 dark:bg-dark-elevated hover:border-brand-500 text-zinc-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>
                            Switch to {alt.name} (₹{alt.calculatedCasePrice}/case)
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confirm & Add to Cart Footer */}
          <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {unconfirmedCount > 0 ? (
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  Please confirm {unconfirmedCount} item{unconfirmedCount > 1 ? 's' : ''} with
                  unspecified case units above before continuing.
                </span>
              ) : eligibleItems.length === 0 ? (
                <span>No in-stock items available to add to cart.</span>
              ) : (
                <span>
                  Ready to add <strong className="text-zinc-900 dark:text-white">{eligibleItems.length}</strong>{' '}
                  in-stock product line{eligibleItems.length > 1 ? 's' : ''} to your wholesale cart.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddAllToCart}
              disabled={eligibleItems.length === 0 || unconfirmedCount > 0}
              className="btn-primary shrink-0"
            >
              <span>Add Confirmed Items to Cart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
