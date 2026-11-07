import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, User, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { FeedbackModal } from './components/common/FeedbackModal';
import { HomePage } from './pages/public/HomePage';
import { CatalogPage } from './pages/retailer/CatalogPage';
import { CartPage } from './pages/retailer/CartPage';
import { AuthCard } from './components/auth/AuthCard';

const AboutPage = lazy(() =>
  import('./pages/public/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import('./pages/public/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/public/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const AiOrderCapturePage = lazy(() =>
  import('./pages/retailer/AiOrderCapturePage').then((m) => ({ default: m.AiOrderCapturePage }))
);
const MyOrdersPage = lazy(() =>
  import('./pages/retailer/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage }))
);
const OrderDeskDashboardPage = lazy(() =>
  import('./pages/desk/OrderDeskDashboardPage').then((m) => ({ default: m.OrderDeskDashboardPage }))
);

const VALID_VIEWS = new Set([
  'home',
  'about',
  'contact',
  'privacy',
  'auth',
  'register',
  'desk-auth',
  'catalog',
  'cart',
  'ai-order',
  'my-orders',
  'desk-dashboard',
]);

function readViewFromHash(): string {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (raw === 'smart-order') return 'ai-order';
  return VALID_VIEWS.has(raw) ? raw : 'home';
}

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>(() => readViewFromHash());
  const { itemCount } = useCart();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const onHashChange = () => {
      setCurrentView(readViewFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Enforce client-side role & authentication route boundaries
  useEffect(() => {
    if (isLoading) return;
    const isStaff = user?.role === 'ORDER_DESK' || user?.role === 'ADMIN';

    if (currentView === 'desk-dashboard' && !isStaff) {
      handleNavigate(user ? 'catalog' : 'desk-auth');
      return;
    }

    if (currentView === 'my-orders' && !user) {
      handleNavigate('auth');
      return;
    }

    if ((currentView === 'cart' || currentView === 'my-orders') && isStaff) {
      handleNavigate('desk-dashboard');
    }
  }, [currentView, user, isLoading]);

  const handleNavigate = (view: string) => {
    const normalized = VALID_VIEWS.has(view) ? view : 'home';
    setCurrentView(normalized);
    const targetHash = normalized === 'home' ? '' : `#${normalized}`;
    if (window.location.hash !== targetHash) {
      if (targetHash) {
        window.history.pushState(null, '', targetHash);
      } else {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    const isDeskOrAdmin =
      authenticatedUser.role === 'ORDER_DESK' || authenticatedUser.role === 'ADMIN';
    handleNavigate(isDeskOrAdmin ? 'desk-dashboard' : 'catalog');
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-zinc-900 dark:text-zinc-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand-700 focus:text-white focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <Navbar onNavigate={handleNavigate} currentView={currentView} cartItemCount={itemCount} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Suspense
          fallback={
            <div className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading workspace...
            </div>
          }
        >
          {/* Public Pages */}
          {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}
          {currentView === 'about' && <AboutPage onNavigate={handleNavigate} />}
          {currentView === 'contact' && <ContactPage onNavigate={handleNavigate} />}
          {currentView === 'privacy' && <PrivacyPolicyPage onNavigate={handleNavigate} />}

          {/* Authentication Pages */}
          {currentView === 'auth' && (
            <div className="py-8 sm:py-12">
              <div className="max-w-md mx-auto text-center mb-6 space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Sign in to Stockora
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Access your kirana wholesale account or distributor order desk
                </p>
              </div>
              <AuthCard initialMode="signin" onSuccess={handleAuthSuccess} />
            </div>
          )}

          {currentView === 'register' && (
            <div className="py-8 sm:py-12">
              <div className="max-w-md mx-auto text-center mb-6 space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Register Your Kirana Shop
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Get direct wholesale dealer pricing, live stock status, and scheme benefits
                </p>
              </div>
              <AuthCard initialMode="signup" onSuccess={handleAuthSuccess} />
            </div>
          )}

          {currentView === 'desk-auth' && (
            <div className="py-8 sm:py-12">
              <div className="max-w-md mx-auto text-center mb-6 space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Order Desk Sign In
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Authorized distributor staff portal for order review and Tally export
                </p>
              </div>
              <AuthCard initialMode="desk" onSuccess={handleAuthSuccess} />
            </div>
          )}

          {/* Retailer Workspace */}
          {currentView === 'catalog' && <CatalogPage onNavigate={handleNavigate} />}
          {currentView === 'cart' && <CartPage onNavigate={handleNavigate} />}
          {currentView === 'ai-order' && <AiOrderCapturePage onNavigate={handleNavigate} />}
          {currentView === 'my-orders' && <MyOrdersPage onNavigate={handleNavigate} />}

          {/* Order Desk Workspace */}
          {currentView === 'desk-dashboard' && <OrderDeskDashboardPage />}
        </Suspense>
      </main>

      <Footer onNavigate={handleNavigate} currentView={currentView} />
      <FeedbackModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
