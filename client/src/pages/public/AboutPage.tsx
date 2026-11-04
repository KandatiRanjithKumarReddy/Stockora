import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Building2,
  Store,
  AlertCircle,
  Truck,
  ShieldCheck,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-12">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
          About Stockora
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
          Built around how kirana shops and wholesale desks actually work.
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Stockora modernizes daily order capture, stock reservation, and Tally accounting for
          high-volume FMCG distribution in Jabalpur, Madhya Pradesh—without forcing shopkeepers to
          abandon familiar ordering habits.
        </p>
      </div>

      {/* Operational Context & Problem Solved */}
      <section className="surface-card p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Why We Built Stockora
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Processing 600+ daily wholesale orders across 1,800 kirana retailers traditionally meant
            deciphering notebooks, informal chat messages, and handwritten slips every morning. Without
            live visibility into warehouse inventory or active trade schemes, lines were cut late and
            vans made costly return trips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Pack-Size & Unit Mix-Ups
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Informal shorthand like &ldquo;biscuit chhota&rdquo; or missing case vs. pack units caused
                wrong dispatches and redeliveries.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Post-Order Stock-Outs
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Retailers and field salesmen placed orders without seeing real-time carton availability
                in the Richhai warehouse.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Missed Trade Schemes
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Shopkeepers ordering 9 cases missed out on 10+1 free-case schemes simply because
                promotions were not visible at the counter.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Manual Morning Tally Entry
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Six office clerks spent hours retyping orders into Tally ERP before delivery vans
                could be loaded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Sided Platform Architecture */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="surface-card p-6 sm:p-7 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            For Kirana Shop Owners
          </h2>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-200">Fast Mobile Ordering:</strong>{' '}
                Designed for low-bandwidth connections with large tap targets so you can order between customers.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-200">Clear Case & Pack Pricing:</strong>{' '}
                See per-pack dealer rates, billed carton totals, MRP margins, and exact GST percentages upfront.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-200">Stockora Smart Order:</strong>{' '}
                Paste your usual Hindi or Hinglish order text and review matched cartons before placing the order.
              </span>
            </li>
          </ul>
        </div>

        <div className="surface-card p-6 sm:p-7 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            For the Distributor Order Desk
          </h2>
          <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-200">Automated Credit Holds:</strong>{' '}
                Orders crossing a retailer&apos;s credit limit are flagged automatically for desk review.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-200">Shop-Specific Alias Memory:</strong>{' '}
                Save a shopkeeper&apos;s local product phrasing once so future orders match automatically.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-200">Direct Tally CSV Export:</strong>{' '}
                Download approved sales vouchers formatted for immediate Tally import.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="surface-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <Truck className="w-4 h-4" />
            <span>Ready for Daily Dispatch</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Explore the wholesale catalog or sign in to your portal
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Protected dealer pricing and credit visibility for authorized retailers and desk staff.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="btn-secondary"
          >
            View Catalog
          </button>
          <button
            type="button"
            onClick={() => onNavigate('auth')}
            className="btn-primary"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Dealer prices and credit balances remain strictly private to each shop and the distributor desk.</span>
      </div>
    </div>
  );
};
