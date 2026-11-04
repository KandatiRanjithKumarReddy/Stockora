import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { FeedbackModal } from './components/common/FeedbackModal';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { CatalogPage } from './pages/retailer/CatalogPage';
import { CartPage } from './pages/retailer/CartPage';
import { AiOrderCapturePage } from './pages/retailer/AiOrderCapturePage';
import { MyOrdersPage } from './pages/retailer/MyOrdersPage';
import { OrderDeskDashboardPage } from './pages/desk/OrderDeskDashboardPage';
import { AuthCard } from './components/auth/AuthCard';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const { user } = useAuth();
  const { itemCount } = useCart();

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Responsive Navigation */}
      <Navbar onNavigate={handleNavigate} currentView={currentView} cartItemCount={itemCount} />

      {/* Dynamic View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Public Views */}
        {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentView === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {currentView === 'contact' && <ContactPage />}

        {/* Authentication Views */}
        {currentView === 'auth' && (
          <div className="py-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to your kirana store or order desk account
              </p>
            </div>
            <AuthCard
              initialMode="signin"
              onSuccess={() => handleNavigate(user?.role === 'ORDER_DESK' ? 'desk-dashboard' : 'catalog')}
            />
          </div>
        )}

        {currentView === 'register' && (
          <div className="py-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Register Your Kirana Shop
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Join 1,800+ kirana retailers ordering directly from Company A
              </p>
            </div>
            <AuthCard initialMode="signup" onSuccess={() => handleNavigate('catalog')} />
          </div>
        )}

        {currentView === 'desk-auth' && (
          <div className="py-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Order Desk Portal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Company A Internal Employee Login
              </p>
            </div>
            <AuthCard initialMode="desk" onSuccess={() => handleNavigate('desk-dashboard')} />
          </div>
        )}

        {/* Retailer Applications */}
        {currentView === 'catalog' && <CatalogPage onNavigate={handleNavigate} />}
        {currentView === 'cart' && <CartPage onNavigate={handleNavigate} />}
        {currentView === 'ai-order' && <AiOrderCapturePage onNavigate={handleNavigate} />}
        {currentView === 'my-orders' && <MyOrdersPage onNavigate={handleNavigate} />}

        {/* Order Desk Application */}
        {currentView === 'desk-dashboard' && <OrderDeskDashboardPage />}
      </main>

      {/* Global Persistent Elements */}
      <Footer onNavigate={handleNavigate} currentView={currentView} />
      <FeedbackModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
