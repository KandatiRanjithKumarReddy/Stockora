import React, { useState } from 'react';
import { MessageSquarePlus, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const FeedbackModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<'GENERAL' | 'BUG' | 'ORDER_ISSUE' | 'AI_ACCURACY' | 'FEATURE_REQUEST'>('GENERAL');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length < 5) {
      setStatusMessage({ type: 'error', text: 'Please enter at least 5 characters of feedback.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await api.post('/public/feedback', {
        category,
        message,
        pageUrl: window.location.href,
        browserInfo: navigator.userAgent,
        userId: user?.id,
        role: user?.role || 'ANONYMOUS',
      });

      setStatusMessage({
        type: 'success',
        text: 'Thank you! Your feedback has been sent to our Jabalpur support team.',
      });
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setStatusMessage(null);
      }, 2500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit feedback. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Pill */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="fixed bottom-5 right-5 z-40 bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white shadow-xl rounded-full px-4 py-2.5 flex items-center space-x-2 text-xs font-semibold tracking-wide border border-blue-400/30 transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        aria-label="Send Feedback"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="hidden sm:inline">Send Feedback</span>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              aria-label="Close feedback modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-brand-700 dark:text-blue-300">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Send Product Feedback
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Help us refine Stockora for your kirana shop
                </p>
              </div>
            </div>

            {statusMessage && (
              <div
                className={`mb-4 p-3 rounded-xl flex items-start space-x-2 text-xs ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Feedback Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="GENERAL">General Suggestion</option>
                  <option value="AI_ACCURACY">AI WhatsApp Match Accuracy</option>
                  <option value="ORDER_ISSUE">Order or Scheme Calculation Issue</option>
                  <option value="BUG">Technical Bug / Broken Screen</option>
                  <option value="FEATURE_REQUEST">Request New Feature / Product</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your suggestion, missing FMCG product, or experience..."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white transition-colors flex items-center space-x-1.5 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

