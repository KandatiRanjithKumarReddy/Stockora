import React from 'react';
import { ShoppingBag, MapPin, ShieldCheck, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  currentView?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-900 dark:bg-brand-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Stockora
              </span>
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                B2B FMCG
              </span>
            </div>
            <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
              Orders Made Simple
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Empowering 1,800+ Kirana retailers across Jabalpur with instant dealer prices,
              transparent schemes, WhatsApp AI order capture, and seamless Tally ERP integration.
            </p>
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-1 pt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Headquartered in Jabalpur, Madhya Pradesh</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  About Stockora
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Product Catalog
                </button>
              </li>
            </ul>
          </div>

          {/* Account & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Retailer Access
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('auth')}
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Retailer Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  New Shop Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('desk-auth')}
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Order Desk Portal
                </button>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>GST Verified Distribution</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 space-y-2 sm:space-y-0">
          <div>
            &copy; {currentYear} Stockora (Company A, Jabalpur). All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1">
              <HeartHandshake className="w-3.5 h-3.5 text-blue-500" />
              <span>Built for Madhya Pradesh Kirana Stores</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

