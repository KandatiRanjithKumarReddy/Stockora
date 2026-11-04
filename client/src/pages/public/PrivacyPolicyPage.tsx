import React from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  Cookie,
  Mail,
  ArrowLeft,
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (view: string) => void;
}

const SECTIONS = [
  { id: 'overview', label: '1. Scope & Overview' },
  { id: 'information-collected', label: '2. Information We Collect' },
  { id: 'how-we-use', label: '3. How Information Is Used' },
  { id: 'pricing-confidentiality', label: '4. Pricing & Credit Confidentiality' },
  { id: 'smart-order-processing', label: '5. Smart Order Text Processing' },
  { id: 'storage-cookies', label: '6. Browser Storage & Cookies' },
  { id: 'contact-desk', label: '7. Contact & Data Requests' },
];

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-10">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-dark-border pb-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Wholesale Data & Account Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This policy explains what business and account information Stockora collects on behalf of
            Company A Distribution (Jabalpur, Madhya Pradesh), how wholesale order records are
            protected, and who can view your shop&apos;s pricing and credit details.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 pt-1">
            Effective for Stockora Wholesale Ordering Platform • Jabalpur Operations
          </p>
        </div>
      </div>

      {/* Main Layout: Sticky TOC Sidebar + Structured Policy Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Table of Contents */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 surface-card p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Contents
          </h2>
          <nav aria-label="Privacy Policy sections" className="space-y-1">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  document.getElementById(sec.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-dark-elevated hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {sec.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Policy Sections */}
        <div className="lg:col-span-8 space-y-6">
          <section id="overview" className="surface-card p-6 sm:p-7 space-y-3 scroll-mt-24">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              1. Scope & Overview
            </h2>
            <p className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 leading-7">
              Stockora is a business-to-business (B2B) wholesale ordering platform operated for
              authorized kirana retailers, field sales representatives, and distributor order desk
              personnel of Company A in Jabalpur, Madhya Pradesh. We collect only the operational
              details required to price, verify, reserve, and dispatch wholesale FMCG orders.
            </p>
          </section>

          <section id="information-collected" className="surface-card p-6 sm:p-7 space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                2. Information We Collect
              </h2>
            </div>
            <ul className="space-y-3 text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 leading-7 list-disc pl-5">
              <li>
                <strong className="text-zinc-900 dark:text-white">Retailer & Account Profile:</strong>{' '}
                Owner name, mobile phone number, optional email address, kirana store name, Jabalpur
                locality/street address, and optional GSTIN provided during shop registration.
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-white">Wholesale Order & Ledger Data:</strong>{' '}
                Ordered SKUs, case quantities, applied trade schemes, HSN tax breakdowns, credit
                limit snapshots, outstanding wholesale balances, and Tally export status.
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-white">Smart Order Inputs & Aliases:</strong>{' '}
                Order text pasted into Stockora Smart Order and confirmed shop-specific product
                keyword mappings (aliases) saved to improve future SKU matching accuracy.
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-white">Support & Feedback Submissions:</strong>{' '}
                Messages submitted through the Contact inquiry form or in-app Feedback dialog,
                alongside basic page context to help resolve reported issues.
              </li>
            </ul>
          </section>

          <section id="how-we-use" className="surface-card p-6 sm:p-7 space-y-3 scroll-mt-24">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              3. How Information Is Used
            </h2>
            <p className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 leading-7">
              We use your business information strictly to authenticate your account, display
              applicable dealer prices and active promotional schemes, reserve warehouse carton
              inventory, perform credit-limit checks, prepare Tally ERP accounting exports, and
              coordinate delivery van dispatches. Stockora does not sell or rent kirana store data to
              advertising networks or unrelated third parties.
            </p>
          </section>

          <section id="pricing-confidentiality" className="surface-card p-6 sm:p-7 space-y-3 scroll-mt-24">
            <div className="flex items-center gap-2.5">
              <EyeOff className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                4. Pricing & Credit Confidentiality
              </h2>
            </div>
            <p className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 leading-7">
              A retailer&apos;s custom wholesale rates, order history, credit limit, and outstanding
              balance are restricted by role-based access controls. These records are visible only to
              the authenticated retailer account and authorized Company A Order Desk and administrative
              personnel—never to other retail stores.
            </p>
          </section>

          <section id="smart-order-processing" className="surface-card p-6 sm:p-7 space-y-3 scroll-mt-24">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                5. Smart Order Text Processing
              </h2>
            </div>
            <p className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 leading-7">
              When you paste an order note into Stockora Smart Order, the text is processed solely to
              identify matching catalog SKUs and quantities. Financial totals, discounts, and GST
              amounts are calculated deterministically by our backend rules engine, and no order is
              ever submitted until you review and confirm the matched items.
            </p>
          </section>

          <section id="storage-cookies" className="surface-card p-6 sm:p-7 space-y-3 scroll-mt-24">
            <div className="flex items-center gap-2.5">
              <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                6. Browser Storage & Cookies
              </h2>
            </div>
            <p className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 leading-7">
              Stockora uses strictly functional browser storage and cookies—no third-party tracking
              pixels or marketing cookies are loaded:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border">
                <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-white">
                  stockora_token / cookie
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Maintains your authenticated sign-in session securely.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border">
                <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-white">
                  stockora_cart
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Preserves draft wholesale cart items between page refreshes.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-dark-elevated border border-zinc-200 dark:border-dark-border">
                <div className="text-xs font-mono font-semibold text-zinc-900 dark:text-white">
                  stockora_theme
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Remembers your Light or True Black display preference.
                </p>
              </div>
            </div>
          </section>

          <section id="contact-desk" className="surface-card p-6 sm:p-7 space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                7. Contact & Data Requests
              </h2>
            </div>
            <p className="text-sm sm:text-[15px] text-zinc-600 dark:text-zinc-300 leading-7">
              To update your kirana shop details, correct GSTIN records, or inquire about your
              account data, contact our Jabalpur Distributor Office at{' '}
              <a
                href="mailto:orders@distributor.stockora.in"
                className="font-medium text-brand-700 dark:text-brand-400 hover:underline"
              >
                orders@distributor.stockora.in
              </a>{' '}
              or visit our{' '}
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="font-medium text-brand-700 dark:text-brand-400 hover:underline"
              >
                Contact & Support page
              </button>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
