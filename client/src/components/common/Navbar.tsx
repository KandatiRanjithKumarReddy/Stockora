import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
  cartItemCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, cartItemCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const isStaffRole = user?.role === 'ORDER_DESK' || user?.role === 'ADMIN';

  const handleSignOut = () => {
    logout();
    setMobileMenuOpen(false);
    toast.info('Signed out successfully.', { id: 'auth-logout' });
    if (currentView === 'desk-dashboard' || currentView === 'my-orders') {
      onNavigate('home');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navLinkClass = (view: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      currentView === view
        ? 'bg-zinc-100 dark:bg-dark-elevated text-zinc-900 dark:text-white font-semibold'
        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-dark-elevated/60'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-zinc-200 dark:border-dark-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left rounded-lg py-1 pr-2"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-700 dark:bg-brand-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                  Stockora
                </span>
                <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-dark-elevated text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-dark-border">
                  Jabalpur
                </span>
              </div>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-none">
                Wholesale Distribution
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <button type="button" onClick={() => handleNavClick('home')} className={navLinkClass('home')}>
              Home
            </button>
            <button type="button" onClick={() => handleNavClick('catalog')} className={navLinkClass('catalog')}>
              Catalog
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('ai-order')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'ai-order'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-dark-elevated'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Smart Order</span>
            </button>
            <button type="button" onClick={() => handleNavClick('about')} className={navLinkClass('about')}>
              About
            </button>
            <button type="button" onClick={() => handleNavClick('contact')} className={navLinkClass('contact')}>
              Contact
            </button>
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />

            {(!user || user.role === 'RETAILER') && (
              <button
                type="button"
                onClick={() => handleNavClick('cart')}
                className={`relative min-w-[40px] min-h-[40px] px-2.5 py-2 rounded-lg border transition-colors inline-flex items-center gap-1.5 ${
                  currentView === 'cart'
                    ? 'bg-zinc-100 dark:bg-dark-elevated border-zinc-300 dark:border-dark-borderStrong text-zinc-900 dark:text-white'
                    : 'bg-white dark:bg-dark-elevated border-zinc-200 dark:border-dark-borderStrong text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-dark-hover'
                }`}
                aria-label={`View wholesale cart (${cartItemCount} cases)`}
              >
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-semibold leading-none tabular-nums">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2.5 border-l border-zinc-200 dark:border-dark-border">
                {isStaffRole ? (
                  <button
                    type="button"
                    onClick={() => handleNavClick('desk-dashboard')}
                    className={`min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                      currentView === 'desk-dashboard'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 hover:bg-amber-100 dark:hover:bg-amber-950'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{user.role === 'ADMIN' ? 'Admin Desk' : 'Order Desk'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNavClick('my-orders')}
                    className={`min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 border transition-colors ${
                      currentView === 'my-orders'
                        ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-800 dark:text-brand-300 border-brand-200 dark:border-brand-700 font-semibold'
                        : 'bg-white dark:bg-dark-elevated text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-dark-borderStrong hover:bg-zinc-50 dark:hover:bg-dark-hover'
                    }`}
                  >
                    <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span className="max-w-[140px] truncate">{user.retailer?.storeName || user.name}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="min-w-[40px] min-h-[40px] p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2.5 border-l border-zinc-200 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => handleNavClick('auth')}
                  className="min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-dark-elevated transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('register')}
                  className="min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold bg-brand-700 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white shadow-sm transition-colors"
                >
                  Register Shop
                </button>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {(!user || user.role === 'RETAILER') && (
              <button
                type="button"
                onClick={() => handleNavClick('cart')}
                className="relative min-w-[40px] min-h-[40px] p-2 rounded-lg border border-zinc-200 dark:border-dark-borderStrong bg-white dark:bg-dark-elevated text-zinc-700 dark:text-zinc-200 flex items-center justify-center"
                aria-label={`View cart (${cartItemCount} cases)`}
              >
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center tabular-nums">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[40px] min-h-[40px] p-2 rounded-lg border border-zinc-200 dark:border-dark-borderStrong bg-white dark:bg-dark-elevated text-zinc-700 dark:text-zinc-200 flex items-center justify-center"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 pt-3 pb-5 space-y-1.5 animate-fadeIn">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="w-full min-h-[44px] px-3 py-2.5 rounded-lg text-left text-sm font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-dark-elevated flex items-center"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('catalog')}
            className="w-full min-h-[44px] px-3 py-2.5 rounded-lg text-left text-sm font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-dark-elevated flex items-center"
          >
            Wholesale Catalog
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('ai-order')}
            className="w-full min-h-[44px] px-3 py-2.5 rounded-lg text-left text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Stockora Smart Order</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className="w-full min-h-[44px] px-3 py-2.5 rounded-lg text-left text-sm font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-dark-elevated flex items-center"
          >
            About Stockora
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className="w-full min-h-[44px] px-3 py-2.5 rounded-lg text-left text-sm font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-dark-elevated flex items-center"
          >
            Contact & FAQ
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('privacy')}
            className="w-full min-h-[44px] px-3 py-2.5 rounded-lg text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-dark-elevated flex items-center"
          >
            Privacy Policy
          </button>

          <div className="pt-3 mt-2 border-t border-zinc-200 dark:border-dark-border">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Signed in as <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{user.name}</span>
                </div>
                {isStaffRole ? (
                  <button
                    type="button"
                    onClick={() => handleNavClick('desk-dashboard')}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{user.role === 'ADMIN' ? 'Admin Desk Dashboard' : 'Order Desk Dashboard'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNavClick('my-orders')}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-dark-elevated text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-dark-borderStrong text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('auth')}
                  className="btn-secondary w-full"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('register')}
                  className="btn-primary w-full"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
