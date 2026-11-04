import React, { useState } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
  cartItemCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, cartItemCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-slate-200 dark:border-dark-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-900 dark:bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-900/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Stockora
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  Jabalpur
                </span>
              </div>
              <p className="text-[11px] font-medium text-brand-700 dark:text-brand-400 leading-none">
                Orders Made Simple
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors ${
                currentView === 'home'
                  ? 'text-brand-700 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('catalog')}
              className={`transition-colors ${
                currentView === 'catalog'
                  ? 'text-brand-700 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => handleNavClick('ai-order')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                currentView === 'ai-order'
                  ? 'bg-blue-100 text-brand-800 dark:bg-brand-900/50 dark:text-blue-200'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <span>⚡ WhatsApp AI Order</span>
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`transition-colors ${
                currentView === 'about'
                  ? 'text-brand-700 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`transition-colors ${
                currentView === 'contact'
                  ? 'text-brand-700 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            {/* Cart Button (for Retailer) */}
            {(!user || user.role === 'RETAILER') && (
              <button
                onClick={() => handleNavClick('cart')}
                className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-dark-border">
                {user.role === 'ORDER_DESK' ? (
                  <button
                    onClick={() => handleNavClick('desk-dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Desk Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('my-orders')}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-blue-300 text-xs font-semibold flex items-center space-x-1.5 border border-brand-200 dark:border-brand-800"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[120px] truncate">{user.retailer?.storeName || user.name}</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-dark-border">
                <button
                  onClick={() => handleNavClick('auth')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white shadow-sm transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            {(!user || user.role === 'RETAILER') && (
              <button
                onClick={() => handleNavClick('cart')}
                className="relative p-2 rounded-lg text-slate-700 dark:text-slate-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <button
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('catalog')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Product Catalog
          </button>
          <button
            onClick={() => handleNavClick('ai-order')}
            className="block w-full text-left py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            ⚡ WhatsApp AI Order Capture
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            About Stockora
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="block w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Contact & Support
          </button>

          <div className="pt-3 border-t border-slate-200 dark:border-dark-border">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Signed in as {user.name} ({user.role})
                </div>
                {user.role === 'ORDER_DESK' ? (
                  <button
                    onClick={() => handleNavClick('desk-dashboard')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-xs font-semibold flex items-center justify-center space-x-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Order Desk Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick('my-orders')}
                    className="w-full py-2.5 rounded-xl bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-blue-200 text-xs font-semibold flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Order History</span>
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full py-2 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNavClick('auth')}
                  className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-dark-border text-center text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full py-2.5 rounded-xl bg-brand-900 dark:bg-brand-600 text-center text-xs font-semibold text-white"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

