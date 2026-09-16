import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Dumbbell, Users, CreditCard, Apple, Sparkles, MessageCircle } from 'lucide-react';
import { Badge } from './Badge';

export const FAQ_DATA = [
  {
    id: 'faq-1',
    category: 'training',
    question: 'How do the live virtual coaching sessions work?',
    answer:
      'Every session is 100% live, private, and interactive via Google Meet or Zoom. Unlike pre-recorded apps or generic YouTube workouts, Coach Kush watches your repetitions in real time, provides immediate form correction, regulates rest periods, and pushes your intensity safely.',
  },
  {
    id: 'faq-2',
    category: 'equipment',
    question: 'Do I need a commercial gym membership or expensive equipment?',
    answer:
      'No! Kush tailors your exercise program entirely around your existing environment. Whether you train in a living room with bodyweight and resistance bands, have a pair of adjustable dumbbells, or train at a fully equipped commercial gym, the progressive overload is customized for you.',
  },
  {
    id: 'faq-3',
    category: 'couple',
    question: 'How does Couple / Partner Training work?',
    answer:
      'You and your partner, spouse, or gym buddy can join from the same living room with one wide camera or from separate devices. Kush coordinates synchronized workouts, sets custom weights/targets for each person, and creates separate meal and calorie targets while keeping the cost per person dramatically lower.',
  },
  {
    id: 'faq-4',
    category: 'scheduling',
    question: 'What happens if I need to reschedule a session?',
    answer:
      'Life happens! With at least 24 hours advance notice via WhatsApp, Kush will gladly reschedule your session to an alternate open time slot that fits your schedule without any session forfeiture.',
  },
  {
    id: 'faq-5',
    category: 'payments',
    question: 'What payment methods are accepted through Razorpay?',
    answer:
      'All payments are processed with end-to-end encryption via Razorpay. We support UPI (Google Pay, PhonePe, Paytm, BHIM, Cred), all major Credit/Debit cards (Visa, Mastercard, RuPay), and NetBanking. You receive an official GST Tax Invoice PDF immediately upon checkout.',
  },
  {
    id: 'faq-6',
    category: 'coupons',
    question: 'How do discount coupons work during checkout?',
    answer:
      'When you click "Buy Now" on any coaching package, a secure checkout window will open with a coupon code field. Enter your valid promo code (e.g. KUSH10) and click Apply. The discount will be verified and deducted from your total before you proceed with Razorpay.',
  },
  {
    id: 'faq-7',
    category: 'diet',
    question: 'Are diet plans and nutrition guidance included?',
    answer:
      'Yes! Every membership comes with tailored macronutrient goals, daily calorie targets, meal timing strategies, and grocery recommendations customized for your dietary lifestyle (Vegetarian, Vegan, Eggetarian, or Non-Vegetarian).',
  },
  {
    id: 'faq-8',
    category: 'training',
    question: 'How is my ongoing progress monitored?',
    answer:
      'Beyond live video sessions, you receive weekly body composition and habit check-ins, form audit reviews, and continuous direct WhatsApp support with Kush to keep you 100% accountable.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'training', label: 'Live Training', icon: Dumbbell },
  { id: 'equipment', label: 'Equipment & Diet', icon: Apple },
  { id: 'couple', label: 'Couple Coaching', icon: Users },
  { id: 'payments', label: 'Razorpay & Billing', icon: CreditCard },
  { id: 'coupons', label: 'Coupons & Promos', icon: Sparkles },
];

export const FAQSection = ({ className = '', title = 'Frequently Asked Questions', subtitle = 'Everything you need to know about live virtual coaching, pricing, Razorpay checkout, and training policies.' }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openId, setOpenId] = useState(FAQ_DATA[0].id);

  const filteredFaqs =
    activeCategory === 'all'
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === activeCategory);

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 ${className}`}>
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="accent">Got Questions? We Have Answers</Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-accent text-black shadow-lg shadow-brand-accent/20'
                  : 'bg-brand-card/80 border border-brand-border text-brand-muted hover:text-white hover:border-brand-borderLight'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Accordion Questions */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={`glass-card rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-brand-accent/50 bg-brand-surface/70 shadow-lg shadow-black/40'
                  : 'border-brand-border hover:border-brand-borderLight bg-brand-card/60'
              }`}
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {faq.question}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'bg-brand-accent text-black rotate-180'
                      : 'bg-brand-surface border border-brand-border text-brand-muted'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-brand-border/40 text-xs sm:text-sm text-brand-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Help Callout */}
      <div className="glass-card rounded-2xl p-6 border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Still have a custom question?</h4>
            <p className="text-xs text-brand-muted mt-0.5">
              Chat directly with Kush on WhatsApp to clarify anything before enrolling.
            </p>
          </div>
        </div>
        <a
          href="https://wa.me/917042858524"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-emerald text-black text-xs font-bold hover:bg-emerald-400 transition-colors shrink-0 shadow-lg shadow-brand-emerald/20"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp Kush
        </a>
      </div>
    </section>
  );
};
