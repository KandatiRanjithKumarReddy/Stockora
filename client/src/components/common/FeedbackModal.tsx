import React, { useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const FeedbackModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<'GENERAL' | 'BUG' | 'ORDER_ISSUE' | 'AI_ACCURACY' | 'FEATURE_REQUEST'>('GENERAL');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const handleClose = () => {
    if (submittingRef.current || isSubmitting) return;
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submittingRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;

    const trimmed = message.trim();
    if (!trimmed || trimmed.length < 5) {
      toast.warning('Please enter at least 5 characters of feedback.', { id: 'feedback-validation' });
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await api.post('/public/feedback', {
        category,
        message,
        pageUrl: window.location.href,
        browserInfo: navigator.userAgent,
        userId: user?.id,
        role: user?.role || 'ANONYMOUS',
      });

      setMessage('');
      setCategory('GENERAL');
      setIsOpen(false);
      toast.success('Feedback submitted successfully. Thank you!', { id: 'feedback-submit' });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Unable to submit feedback right now. Please try again.',
        { id: 'feedback-submit-error' }
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="fixed bottom-5 right-5 z-40 min-h-[44px] px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-dark-elevated dark:hover:bg-dark-hover text-white border border-zinc-700 dark:border-dark-borderStrong shadow-lg flex items-center gap-2 text-sm font-medium transition-colors"
        aria-label="Share product feedback"
      >
        <MessageSquarePlus className="w-4 h-4 text-brand-400" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            className="surface-card w-full max-w-md p-6 relative shadow-2xl"
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-dark-elevated transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Close feedback dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5 pr-8">
              <h2 id="feedback-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-white">
                Share Product Feedback
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Report an issue or request a catalog improvement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="feedback-category" className="form-label">
                  Topic
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  disabled={isSubmitting}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="form-input"
                >
                  <option value="GENERAL">General Suggestion</option>
                  <option value="AI_ACCURACY">Smart Order Match Accuracy</option>
                  <option value="ORDER_ISSUE">Order, Pricing, or Scheme Query</option>
                  <option value="BUG">Screen or Technical Issue</option>
                  <option value="FEATURE_REQUEST">Product or Feature Request</option>
                </select>
              </div>

              <div>
                <label htmlFor="feedback-message" className="form-label">
                  Details
                </label>
                <textarea
                  id="feedback-message"
                  rows={4}
                  value={message}
                  disabled={isSubmitting}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can improve your ordering workflow..."
                  className="form-input resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
