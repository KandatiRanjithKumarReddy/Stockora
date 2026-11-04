import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await api.post('/public/contact', formData);
      setStatusMessage({
        type: 'success',
        text: 'Thank you! Your message has been received. Our Jabalpur distributor team will contact you within 24 hours.',
      });
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send message. Please verify the fields.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-brand-700 dark:text-blue-400">
          Support & Distributor Operations
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Get in Touch with Stockora
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Have questions about onboarding your kirana store, stock inquiries, or distribution logistics?
          Our Jabalpur team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Distributor Office
            </h3>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-brand-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Company A Headquarters</p>
                  <p>Industrial Area, Richhai / Wright Town</p>
                  <p>Jabalpur, Madhya Pradesh 482002</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-brand-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Order Desk Helpline</p>
                  <p>+91 (0761) 240-XXXX</p>
                  <p>+91 94250 99881 (WhatsApp Dispatch)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-brand-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Official Inquiries</p>
                  <p>orders@distributor.stockora.in</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-brand-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Dispatch & Office Hours</p>
                  <p>Mon - Sat: 8:00 AM - 7:00 PM</p>
                  <p>Sunday: Dispatch Only (Morning)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Send an Inquiry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Fill in the details below and we will respond promptly.
          </p>

          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-start space-x-3 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Gupta"
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit phone"
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. New Kirana Dealership Request"
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Message
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can Company A help your shop?"
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-elevated text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-700 transition-colors flex items-center space-x-2 disabled:opacity-60 shadow"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send Inquiry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

