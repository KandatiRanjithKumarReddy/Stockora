import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, Store, MapPin, User as UserIcon, AlertCircle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuthCardProps {
  initialMode?: 'signin' | 'signup' | 'desk';
  onSuccess: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ initialMode = 'signin', onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp' | 'desk'>(initialMode);
  const [phone, setPhone] = useState('9826012345');
  const [password, setPassword] = useState('retailer123');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [locality, setLocality] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, requestOtp, verifyOtp, loginWithGoogleDemo } = useAuth();

  const handlePhonePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(phone, password);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        name,
        phone,
        password,
        storeName,
        locality,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await requestOtp(phone);
      setOtpSentMessage(res.message);
      setOtp(res.mockOtp);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await verifyOtp(phone, otp);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleDemoClick = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogleDemo();
      onSuccess();
    } catch (err: any) {
      setError('Google Sign-In failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToDeskMode = () => {
    setMode('desk');
    setPhone('9425099881');
    setPassword('desk123');
    setError(null);
  };

  const switchToRetailerMode = () => {
    setMode('signin');
    setPhone('9826012345');
    setPassword('retailer123');
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl overflow-hidden transition-all duration-200">
      {/* Mode Header Tabs */}
      <div className="flex border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setError(null);
          }}
          className={`flex-1 py-3 text-center transition-colors ${
            mode === 'signin' || mode === 'otp'
              ? 'bg-white dark:bg-dark-surface text-brand-900 dark:text-blue-400 border-b-2 border-brand-900 dark:border-blue-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Retailer Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setError(null);
          }}
          className={`flex-1 py-3 text-center transition-colors ${
            mode === 'signup'
              ? 'bg-white dark:bg-dark-surface text-brand-900 dark:text-blue-400 border-b-2 border-brand-900 dark:border-blue-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          New Shop Sign Up
        </button>
        <button
          type="button"
          onClick={switchToDeskMode}
          className={`flex-1 py-3 text-center transition-colors ${
            mode === 'desk'
              ? 'bg-white dark:bg-dark-surface text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Order Desk
        </button>
      </div>

      <div className="p-6">
        {/* Desk Warning Banner */}
        {mode === 'desk' && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start space-x-2 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Distributor Office Portal</p>
              <p>For Jabalpur office employees processing orders & Tally export. Pre-filled with demo credentials.</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center space-x-2 text-xs text-rose-800 dark:text-rose-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google (Prominent Official Button) */}
        {mode !== 'desk' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleDemoClick}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-colors group"
            >
              {/* Google Brand SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/50">
                1-Click Demo
              </span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
                <span className="bg-white dark:bg-dark-surface px-2 text-slate-400">
                  Or continue with phone
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1. Sign In (Phone + Password or Mock OTP) */}
        {(mode === 'signin' || mode === 'desk') && (
          <form onSubmit={handlePhonePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('otp')}
                    className="text-[11px] font-semibold text-brand-600 dark:text-blue-400 hover:underline"
                  >
                    Login with Mock OTP
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow transition-colors flex items-center justify-center space-x-1.5 ${
                mode === 'desk'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700'
              }`}
            >
              <span>{mode === 'desk' ? 'Sign In to Order Desk' : 'Sign In as Retailer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 2. Mock OTP Flow */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[11px] font-semibold text-brand-600 dark:text-blue-400 hover:underline"
                >
                  Use Password Instead
                </button>
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 outline-none"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isSubmitting}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Get Mock OTP
                </button>
              </div>
            </div>

            {otpSentMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{otpSentMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full tracking-widest text-center text-base font-bold py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 shadow transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Verify & Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 3. New Retailer Registration */}
        {mode === 'signup' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shop / Kirana Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Shri Ganesh Kirana Stores"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Owner Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Owner name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Locality (Jabalpur)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Wright Town"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-2 rounded-xl text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 shadow transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Register Kirana Shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* Demo Credentials Helper Pill in Footer */}
      <div className="p-3 bg-slate-50 dark:bg-dark-elevated border-t border-slate-200 dark:border-dark-border text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Demo Credentials:</span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={switchToRetailerMode}
            className="text-brand-700 dark:text-blue-400 underline font-semibold"
          >
            Gupta Kirana
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={switchToDeskMode}
            className="text-amber-700 dark:text-amber-400 underline font-semibold"
          >
            Order Desk
          </button>
        </div>
      </div>
    </div>
  );
};

