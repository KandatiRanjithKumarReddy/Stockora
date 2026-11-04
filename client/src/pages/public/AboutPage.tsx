import React from 'react';
import { ArrowRight, CheckCircle2, Building2, Store } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-brand-700 dark:text-blue-400">
          The Stockora Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Bridging Kirana Habits with Modern Distribution
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Stockora is engineered specifically for high-volume FMCG distribution in Tier-2 and Tier-3
          markets, starting with Jabalpur, Madhya Pradesh.
        </p>
      </div>

      {/* The Problem We Solved */}
      <section className="p-8 rounded-3xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          The Everyday Challenge in FMCG Distribution
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          For years, FMCG distributors serving over 1,800 kirana shops relied on informal ordering channels:
          unformatted WhatsApp texts, Hindi voice notes, handwritten lists on paper slips, and phone calls.
          Every morning, 6 dedicated office clerks would spend hours typing these orders by hand into Tally ERP.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          This manual process led to severe operational bottlenecks:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 text-xs text-rose-900 dark:text-rose-200 border border-rose-200/60 dark:border-rose-900/50">
            ❌ <strong>Incorrect SKU Mappings:</strong> "Biscuit chhota" mistaken for 120g instead of 75g pack.
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 text-xs text-rose-900 dark:text-rose-200 border border-rose-200/60 dark:border-rose-900/50">
            ❌ <strong>Stock Availability Friction:</strong> Taking orders for items that ran out in the warehouse.
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 text-xs text-rose-900 dark:text-rose-200 border border-rose-200/60 dark:border-rose-900/50">
            ❌ <strong>Missed Schemes:</strong> Shop owners missing out on 10+1 free peti schemes.
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 text-xs text-rose-900 dark:text-rose-200 border border-rose-200/60 dark:border-rose-900/50">
            ❌ <strong>Costly Redeliveries:</strong> Returns and delivery vehicle wait times caused by wrong quantities.
          </div>
        </div>
      </section>

      {/* Two-Sided Platform Value */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* For Kirana Retailers */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-brand-700 dark:text-blue-300 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            For Kirana Retailers
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Order in 30 Seconds:</strong> Designed for quick taps between store customers.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Transparent Wholesale Margins:</strong> Always see your dealer price and per-pack unit breakdown.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>WhatsApp AI Capture:</strong> Paste existing WhatsApp lists without changing your habits.</span>
            </li>
          </ul>
        </div>

        {/* For Distributor Order Desk */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            For Distributor Order Desk
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Tally ERP Sync:</strong> Export verified orders directly to Tally-ready CSVs with zero manual keying.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Credit Limit Guard:</strong> Automatic credit-hold flagging prevents outstanding balance overruns.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Learned Alias Context:</strong> Correct once, and Stockora remembers retailer-specific product slang.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA Card */}
      <section className="text-center p-8 rounded-3xl bg-brand-900 text-white dark:bg-brand-950 border border-blue-800 shadow-xl space-y-4">
        <h3 className="text-2xl font-bold">Ready to Simplify Your FMCG Orders?</h3>
        <p className="text-sm text-blue-100 max-w-lg mx-auto">
          Sign in now as Gupta Kirana Bhandar or test the Order Desk triage console.
        </p>
        <div className="pt-2 flex justify-center space-x-4">
          <button
            onClick={() => onNavigate('auth')}
            className="px-6 py-3 rounded-xl bg-white text-brand-900 font-bold text-xs shadow hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <span>Sign In to Stockora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

