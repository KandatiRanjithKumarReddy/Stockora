import React from 'react';
import { ShoppingBag, MapPin, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  currentView?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 dark:border-dark-border bg-white dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Summary */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-700 dark:bg-brand-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Stockora
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-dark-elevated text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-dark-border">
                Wholesale B2B
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              Built for Company A in Jabalpur—connecting 1,800+ kirana retailers with live warehouse
              stock, transparent case pricing, automated trade schemes, and direct Tally ERP export.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Richhai Industrial Area & Wright Town, Jabalpur, MP 482002</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3.5">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Wholesale Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('ai-order')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Stockora Smart Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  About Stockora
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Contact & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Portal Access */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3.5">
              Portals
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Retailer Sign In
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  New Shop Onboarding
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('desk-auth')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Order Desk Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3.5">
              Legal & Trust
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Distributor Support
                </button>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-dark-border flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>GST & HSN Verified Billing</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <p>&copy; {currentYear} Stockora — Company A Distribution, Jabalpur. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">•</span>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Help & Dispatch Desk
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
