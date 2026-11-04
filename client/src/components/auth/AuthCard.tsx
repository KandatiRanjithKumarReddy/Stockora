import React, { useState } from 'react';
import { useAuth, User } from '../../context/AuthContext';
import {
  Phone,
  Lock,
  Store,
  MapPin,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface AuthCardProps {
  initialMode?: 'signin' | 'signup' | 'desk';
  onSuccess: (user: User) => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ initialMode = 'signin', onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp' | 'desk'>(initialMode);
  const [phone, setPhone] = useState(initialMode === 'desk' ? '9425099881' : '9826012345');
  const [password, setPassword] = useState(initialMode === 'desk' ? 'desk123' : 'retailer123');
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
      const authenticatedUser = await login(phone, password);
      onSuccess(authenticatedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign in failed. Please verify your mobile number and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const authenticatedUser = await register({
        name,
        phone,
        password,
        storeName,
        locality,
      });
      onSuccess(authenticatedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration could not be completed.');
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
      setError(err.response?.data?.message || 'Could not send verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const authenticatedUser = await verifyOtp(phone, otp);
      onSuccess(authenticatedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const authenticatedUser = await loginWithGoogleDemo();
      onSuccess(authenticatedUser);
    } catch {
      setError('Google sign-in could not be completed right now.');
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

  const switchToRetailerMode = (phoneVal = '9826012345') => {
    setMode('signin');
    setPhone(phoneVal);
    setPassword('retailer123');
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto surface-card overflow-hidden">
      {/* Segmented Role Tabs */}
      <div
        role="tablist"
        aria-label="Account sign-in mode"
        className="grid grid-cols-3 p-1.5 gap-1 bg-zinc-100 dark:bg-dark-elevated border-b border-zinc-200 dark:border-dark-border"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin' || mode === 'otp'}
          onClick={() => switchToRetailerMode(phone === '9425099881' ? '9826012345' : phone)}
          className={`min-h-[38px] px-2 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            mode === 'signin' || mode === 'otp'
              ? 'bg-white dark:bg-dark-surface text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Retailer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          onClick={() => {
            setMode('signup');
            setPhone('');
            setPassword('');
            setError(null);
          }}
          className={`min-h-[38px] px-2 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            mode === 'signup'
              ? 'bg-white dark:bg-dark-surface text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          New Shop
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'desk'}
          onClick={switchToDeskMode}
          className={`min-h-[38px] px-2 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            mode === 'desk'
              ? 'bg-white dark:bg-dark-surface text-amber-700 dark:text-amber-400 shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Order Desk
        </button>
      </div>

      <div className="p-6 sm:p-7">
        {/* Desk Notice */}
        {mode === 'desk' && (
          <div className="mb-5 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 flex items-start gap-2.5 text-sm text-amber-900 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold">Distributor Order Desk</p>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                Authorized access for order verification, credit approval, and Tally ERP batch export.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/70 flex items-start gap-2.5 text-sm text-rose-900 dark:text-rose-200 animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In */}
        {mode !== 'desk' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="btn-secondary w-full"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-dark-surface px-3 text-zinc-500 dark:text-zinc-400">
                  or sign in with mobile
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1. Phone + Password */}
        {(mode === 'signin' || mode === 'desk') && (
          <form onSubmit={handlePhonePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-phone" className="form-label">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="auth-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="form-input pl-10 tabular-nums"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('otp');
                      setError(null);
                    }}
                    className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline"
                  >
                    Use OTP code instead
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 ${
                mode === 'desk'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-brand-700 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'desk' ? 'Sign In to Order Desk' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. Mobile OTP Flow */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="otp-phone" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Mobile Number
                </label>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline"
                >
                  Use password instead
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="otp-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="form-input pl-10 tabular-nums"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isSubmitting}
                  className="btn-secondary shrink-0 px-3.5"
                >
                  Send OTP
                </button>
              </div>
            </div>

            {otpSentMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{otpSentMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="otp-code" className="form-label">
                6-Digit Verification Code
              </label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="form-input text-center tracking-[0.35em] font-semibold text-base tabular-nums"
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. New Shop Registration */}
        {mode === 'signup' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-store" className="form-label">
                Shop / Kirana Store Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="reg-store"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Shri Ganesh Kirana Stores"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="reg-owner" className="form-label">
                  Owner Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="reg-owner"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-locality" className="form-label">
                  Locality (Jabalpur)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="reg-locality"
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Wright Town"
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="reg-phone" className="form-label">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="form-input pl-10 tabular-nums"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="form-label">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-1">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Retailer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Quick Demo Profile Switcher */}
      <div className="px-6 py-3.5 bg-zinc-50 dark:bg-dark-elevated border-t border-zinc-200 dark:border-dark-border flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium">Quick Fill:</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => switchToRetailerMode('9826012345')}
            className="text-brand-700 dark:text-brand-400 hover:underline font-medium"
          >
            Gupta Kirana
          </button>
          <span aria-hidden="true">•</span>
          <button
            type="button"
            onClick={() => switchToRetailerMode('9826054321')}
            className="text-brand-700 dark:text-brand-400 hover:underline font-medium"
          >
            Verma Store (Credit Watch)
          </button>
          <span aria-hidden="true">•</span>
          <button
            type="button"
            onClick={switchToDeskMode}
            className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
          >
            Order Desk
          </button>
        </div>
      </div>
    </div>
  );
};
