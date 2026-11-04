import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-dark-elevated dark:via-dark-surface dark:to-dark-surface border border-slate-200/80 dark:border-dark-border p-8 sm:p-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-brand-900 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>FMCG Distribution Reimagined for Jabalpur</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Stockora <br />
            <span className="text-brand-700 dark:text-brand-400">Orders Made Simple.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Stop deciphering messy WhatsApp voice notes and handwritten slips. Stockora gives 1,800+
            kirana stores instant wholesale dealer prices, verified stock, automated 10+1 schemes,
            and an AI engine that turns pasted WhatsApp texts directly into structured orders.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onNavigate('catalog')}
              className="px-6 py-3.5 rounded-xl bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-900/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Browse FMCG Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('ai-order')}
              className="px-6 py-3.5 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 text-emerald-700 dark:text-emerald-400"
            >
              <span>⚡ Try WhatsApp AI Capture</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3 Core Value Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            AI WhatsApp Order Capture
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Paste rough Hinglish messages like <em>"bhaiya 5 peti biscuit chhota, 2 peti washing powder"</em>.
            Our 3-tier Gemini fallback engine matches SKUs in under 1 second without ever hallucinating financial values.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-brand-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Deterministic Scheme Engine
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Buy 10 cases get 1 free bonuses, slab percentage discounts, and per-SKU HSN GST are
            calculated 100% deterministically on the backend. Zero guesswork for kirana margins.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Tally ERP 1-Click Export
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Order Desk staff review incoming orders, manage credit limits, correct aliases, and
            export batches directly to Tally-ready CSVs in seconds—eliminating morning manual entry.
          </p>
        </div>
      </section>

      {/* FMCG Brands Banner */}
      <section className="rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated p-6 text-center">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Trusted Distributor Brands in Madhya Pradesh
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center space-x-1.5 bg-white dark:bg-dark-surface px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Parle Biscuits & Confectionery</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-white dark:bg-dark-surface px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>HomeCare Detergent Pro</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-white dark:bg-dark-surface px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Chai Gold Premium CTC</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-white dark:bg-dark-surface px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>FoodFest Instant Noodles</span>
          </span>
        </div>
      </section>
    </div>
  );
};

