import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  Warehouse,
  Building2,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ContactPageProps {
  onNavigate?: (view: string) => void;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'register-shop',
    question: 'How do I register my kirana shop on Stockora?',
    answer:
      'Click "Register Shop" at the top of the screen and enter your store name, owner name, Jabalpur locality, and 10-digit mobile number. Once registered, you can immediately view authorized wholesale prices and place orders.',
  },
  {
    id: 'gst-pricing',
    question: 'Do the catalog prices include GST?',
    answer:
      'Catalog case and per-pack dealer prices are shown excluding GST so you can compare base wholesale margins clearly. Each product card displays its exact GST rate (such as 5%, 12%, or 18%), and the full CGST and SGST breakdown is calculated in your cart before you confirm the order.',
  },
  {
    id: 'trade-schemes',
    question: 'How do free-case schemes and bulk discounts work?',
    answer:
      'Active promotions—such as "Buy 10 Cases, Get 1 Case Free" or "3% Off on 5+ Cases"—are applied automatically in your cart as soon as your quantity qualifies. You do not need to enter any coupon code.',
  },
  {
    id: 'smart-order',
    question: 'Can I still send my order as a simple Hindi or Hinglish list?',
    answer:
      'Yes. Open "Smart Order" from the navigation bar and paste your regular order message (for example, "5 peti biscuit chhota, 2 peti washing powder 1 kilo"). Stockora matches each line to the right product and asks you to confirm before anything is placed.',
  },
  {
    id: 'credit-limit',
    question: 'What happens if an order crosses my shop credit limit?',
    answer:
      'Your order is still recorded and stock is reserved, with the status marked as "Credit Hold". Our Wright Town Order Desk team will review your account balance or coordinate payment collection before releasing the van dispatch.',
  },
  {
    id: 'dispatch-schedule',
    question: 'When will my wholesale order be delivered?',
    answer:
      'Orders confirmed before 10:30 AM (Monday to Saturday) are scheduled for same-day route dispatch from our Richhai warehouse. Orders placed later in the day are queued for the next morning delivery van.',
  },
];

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'New Kirana Shop Onboarding',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0].id);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.post('/public/contact', formData);
      toast.success('Inquiry sent! Our Jabalpur Order Desk will respond shortly.', {
        id: 'contact-submit',
      });
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'New Kirana Shop Onboarding',
        message: '',
      });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          'Unable to send your message right now. Please verify all fields and try again.',
        { id: 'contact-error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 space-y-14">
      {/* Page Header */}
      <div className="max-w-2xl space-y-2.5">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
          Distributor Support & Operations
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Contact Company A Distribution
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Reach our Jabalpur order desk for kirana account setup, stock availability, credit ledger
          assistance, or route dispatch coordination.
        </p>
      </div>

      {/* Section 1: Redesigned Distributor Office & Warehouse Cards */}
      <section aria-labelledby="distributor-offices-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 id="distributor-offices-heading" className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Distributor Offices & Dispatch Facilities
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Serving 1,800+ kirana stores across Jabalpur city and surrounding routes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Central Warehouse */}
          <div className="surface-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 flex items-center justify-center">
                  <Warehouse className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-dark-elevated text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-dark-border">
                  Primary Hub
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Headquarters & Central Warehouse
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Bulk inventory storage & van loading bays
                </p>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300 pt-1">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                <address className="not-italic leading-relaxed">
                  Plot No. 14, Sector B, Richhai Industrial Area
                  <br />
                  Jabalpur, Madhya Pradesh 482010
                </address>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-dark-border text-xs text-zinc-500 dark:text-zinc-400">
              Direct brand inwarding & wholesale carton dispatch
            </div>
          </div>

          {/* Card 2: City Order Desk */}
          <div className="surface-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70">
                  Retailer Desk
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  City Order Desk & Billing Office
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Wright Town commercial counter & helpline
                </p>
              </div>
              <div className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300 pt-1">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                  <span>Main Road, Wright Town, Jabalpur, MP 482002</span>
                </div>
                <div className="flex items-center gap-2.5 tabular-nums">
                  <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                  <a href="tel:+919425099881" className="hover:text-brand-700 dark:hover:text-brand-400 font-medium">
                    +91 94250 99881
                  </a>
                  <span className="text-xs text-zinc-400">•</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">0761-2404800</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                  <a
                    href="mailto:orders@distributor.stockora.in"
                    className="hover:text-brand-700 dark:hover:text-brand-400 break-all"
                  >
                    orders@distributor.stockora.in
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-dark-border text-xs text-zinc-500 dark:text-zinc-400">
              Account onboarding, credit approvals & Tally billing
            </div>
          </div>

          {/* Card 3: Operating Hours */}
          <div className="surface-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-dark-elevated text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-dark-border">
                  IST Schedule
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Dispatch & Office Schedule
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Order cut-off & support availability
                </p>
              </div>
              <dl className="space-y-2.5 text-sm pt-1">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Monday – Saturday</dt>
                  <dd className="font-semibold text-zinc-900 dark:text-white tabular-nums">8:00 AM – 7:00 PM</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Same-Day Route Cut-Off</dt>
                  <dd className="font-semibold text-zinc-900 dark:text-white tabular-nums">10:30 AM</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Sunday</dt>
                  <dd className="font-medium text-zinc-700 dark:text-zinc-300">Morning Dispatch Only</dd>
                </div>
              </dl>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-dark-border text-xs text-zinc-500 dark:text-zinc-400">
              App & Smart Order stay open 24×7 for next-day queueing
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Inquiry Form & FAQ Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Send Inquiry Form */}
        <section aria-labelledby="inquiry-form-heading" className="lg:col-span-6 surface-card p-6 sm:p-8">
          <div className="mb-6">
            <h2 id="inquiry-form-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
              Send an Inquiry
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Submit your question and our distributor support desk will get back to you promptly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="form-label">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Gupta"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-phone" className="form-label">
                  Mobile Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="form-input tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-email" className="form-label">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="shop@example.com"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="form-label">
                  Topic
                </label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input"
                >
                  <option value="New Kirana Shop Onboarding">New Kirana Shop Onboarding</option>
                  <option value="Wholesale Order or Dispatch Query">Wholesale Order or Dispatch Query</option>
                  <option value="Credit Limit or Billing Statement">Credit Limit or Billing Statement</option>
                  <option value="Stock Availability & Trade Schemes">Stock Availability & Trade Schemes</option>
                  <option value="Brand & Distribution Inquiry">Brand & Distribution Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="form-label">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Include your shop name, locality, and how our team can help..."
                className="form-input resize-none"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your details are handled in accordance with our{' '}
                {onNavigate ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('privacy')}
                    className="underline font-medium text-zinc-700 dark:text-zinc-300 hover:text-brand-700 dark:hover:text-brand-400"
                  >
                    Privacy Policy
                  </button>
                ) : (
                  <span>Privacy Policy</span>
                )}
                .
              </p>

              <button type="submit" disabled={isSubmitting} className="btn-primary shrink-0">
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Inquiry</span>
              </button>
            </div>
          </form>
        </section>

        {/* Frequently Asked Questions (FAQ) Accordion */}
        <section aria-labelledby="faq-heading" className="lg:col-span-6 space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 id="faq-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
              Common Questions from Kirana Retailers
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Simple answers on pricing, GST, trade schemes, and delivery schedules.
            </p>
          </div>

          <div className="surface-card divide-y divide-zinc-200 dark:divide-dark-border overflow-hidden">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              const panelId = `faq-panel-${item.id}`;
              const buttonId = `faq-button-${item.id}`;

              return (
                <div key={item.id} className="transition-colors">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleFaq(item.id)}
                      className="w-full min-h-[52px] px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-dark-elevated/70 transition-colors"
                    >
                      <span className="text-sm sm:text-[15px] font-semibold text-zinc-900 dark:text-white">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-brand-700 dark:text-brand-400' : ''
                        }`}
                      />
                    </button>
                  </h3>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-5 pb-5 pt-0.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed animate-fadeIn"
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
