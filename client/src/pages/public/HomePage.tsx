import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Percent,
  FileSpreadsheet,
  CheckCircle2,
  PackageCheck,
  Gift,
  Building2,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-6">
      {/* Commercial B2B Hero */}
      <section className="surface-card p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Concise Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-100 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Jabalpur Wholesale Distribution • 1,800+ Kirana Stores</span>
            </div>

            <div className="space-y-3.5">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
                Wholesale ordering built for busy kirana counters.
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                Check live warehouse stock, exact case rates, and free-goods schemes—or paste your
                shop list into Smart Order.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="btn-primary px-6"
              >
                <span>Browse Wholesale Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('ai-order')}
                className="btn-secondary px-5"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Open Smart Order</span>
              </button>
            </div>

            {/* Scannable Operational Highlights */}
            <div className="pt-4 border-t border-zinc-200 dark:border-dark-border flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Live Stock & GST</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Auto Free-Goods Schemes</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>1-Click Tally Export</span>
              </span>
            </div>
          </div>

          {/* Right Column: Streamlined Smart Order Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Smart Order Preview</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('ai-order')}
                  className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline"
                >
                  Try it live &rarr;
                </button>
              </div>

              <div className="px-3.5 py-2.5 rounded-lg bg-white dark:bg-dark-surface border border-zinc-200 dark:border-dark-border">
                <p className="text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  &ldquo;10 peti biscuit chhota, 5 peti detergent 1kg&rdquo;
                </p>
              </div>

              <div className="rounded-lg bg-white dark:bg-dark-surface border border-zinc-200 dark:border-dark-border divide-y divide-zinc-200 dark:divide-dark-border">
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Glucose Biscuit 75g
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                      10 Cases • ₹777.60/case
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    <Gift className="w-3.5 h-3.5" />
                    <span>+1 Free</span>
                  </span>
                </div>

                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Detergent Powder 1kg
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                      5 Cases • ₹2,030.00/case
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs font-semibold">
                    <Percent className="w-3.5 h-3.5" />
                    <span>3% Off</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Stock reserved instantly on confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Engineered for daily wholesale operations
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
            Every workflow is built to eliminate wrong deliveries, stock-out surprises, and manual morning data entry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="surface-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Stockora Smart Order
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Paste everyday Hindi or Hinglish order messages and map items directly to distributor
              SKUs using your shop&apos;s ordering history—always asking before confirming unclear units.
            </p>
          </div>

          <div className="surface-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Transparent Schemes & GST
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Buy 10 get 1 free case bonuses, slab discounts, and HSN-wise CGST/SGST splits are
              calculated with exact precision so retailers know their net landed cost upfront.
            </p>
          </div>

          <div className="surface-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Credit Guard & Tally Sync
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Orders exceeding credit limits are automatically held for desk approval, and approved
              vouchers export in one click to Tally-ready CSV batches.
            </p>
          </div>
        </div>
      </section>

      {/* Authorized Brands Strip */}
      <section className="surface-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Authorized Distributor Portfolio
            </h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
              Direct factory stock across packaged foods and household care in Jabalpur district.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {[
              'Parle Biscuits & Confectionery',
              'HomeCare Pro Detergents',
              'Chai Gold Assam CTC',
              'FoodFest Instant Noodles',
            ].map((brandName) => (
              <span
                key={brandName}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{brandName}</span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
