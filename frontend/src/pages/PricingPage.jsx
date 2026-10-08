import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { formatINR } from '../utils/formatters';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { FAQSection } from '../components/common/FAQSection';
import { SEO } from '../components/common/SEO';
import {
  CheckCircle,
  Video,
  ShieldCheck,
  Users,
  User,
  ArrowRight,
  Loader2,
  Calendar,
} from 'lucide-react';

export const PricingPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'single', 'couple'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  // Fetch active plans from Supabase PostgreSQL (admin-test-5rs excluded for public)
  const { data: plans = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['pricing', 'active'],
    queryFn: productService.getActivePlans,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Admin-only test payment plan query (₹5 INR live test)
  const { data: adminTestPlan } = useQuery({
    queryKey: ['pricing', 'admin-test'],
    queryFn: productService.getAdminTestPlan,
    enabled: Boolean(isAdmin),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleCheckout = (plan) => {
    if (!isAuthenticated) {
      navigate('/register', { state: { returnTo: '/pricing' } });
      return;
    }
    setSelectedPlanForCheckout(plan);
  };

  const filteredPlans = plans.filter((p) => {
    if (filter === 'single') return p.planType === 'single';
    if (filter === 'couple') return p.planType === 'couple';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      <SEO
        title="Plans & Pricing | Certified Gym Trainer Kush Packages | coachkush.in"
        description="Explore coaching plans and pricing by certified gym trainer Coach Kush (Kush Trainer) on coachkush.in. Live 1-on-1 virtual gym training, couple workouts, and personalized diet plans."
        keywords="gym trainer, kush trainer, kush, gym, gym trainer kush, coach kush gym trainer, certified gym trainer, personal gym trainer packages, gym workout plan, virtual gym trainer fees"
        canonical="/pricing"
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <Badge variant="accent">Official Coaching Memberships</Badge>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Online Fitness Coaching Plans & Pricing
        </h1>
        <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
          Select the program that fits your goals. Every membership includes 100% live Google Meet / Zoom coaching, custom programming, and direct access to Kush.
        </p>

        {/* Filter Tabs */}
        <div className="pt-6 flex justify-center">
          <div className="inline-flex p-1.5 rounded-xl bg-brand-card border border-brand-border gap-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-brand-accent text-black shadow-md'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              All Programs ({plans.length})
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setFilter('single')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'single'
                  ? 'bg-brand-accent text-black shadow-md'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              1-on-1 Single
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setFilter('couple')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'couple'
                  ? 'bg-brand-emerald text-black shadow-md'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Couple / Partner
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Admin-Only Live Payment Verification Card (₹5 INR) */}
      {isAdmin && (
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-brand-card to-emerald-500/10 border-2 border-brand-accent/60 shadow-2xl shadow-brand-accent/10 space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-ping" />
              <Badge variant="accent">Administrator Verification Card</Badge>
              <span className="text-xs font-mono font-bold text-brand-emerald bg-brand-surface px-2.5 py-1 rounded-md border border-brand-emerald/30">
                ₹5 INR Live Razorpay Test
              </span>
            </div>
            <span className="text-[11px] text-brand-muted font-mono">
              Live Gateway Active • Strictly visible to role="admin"
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-baseline gap-3">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Admin Production Test Payment
                </h3>
                <span className="text-2xl sm:text-3xl font-black text-brand-accent">₹5</span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed">
                Test the live production payment gateway end-to-end for ₹5. This triggers the real Razorpay modal, tests card/UPI acceptance on the live account, verifies cryptographic HMAC-SHA256 signatures via Supabase Edge Functions, and audits database enrollment creation without charging full membership rates.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-brand-text">
                <span className="inline-flex items-center gap-1 bg-brand-surface px-2.5 py-1 rounded-lg border border-brand-border">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> Live Razorpay Order (500 paise)
                </span>
                <span className="inline-flex items-center gap-1 bg-brand-surface px-2.5 py-1 rounded-lg border border-brand-border">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-emerald" /> Server-side Edge Function Verified
                </span>
                <span className="inline-flex items-center gap-1 bg-brand-surface px-2.5 py-1 rounded-lg border border-brand-border">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" /> Hidden from non-admin visitors
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider gap-2 shadow-xl shadow-brand-accent/25 hover:scale-[1.02] transition-transform"
                onClick={() =>
                  handleCheckout(
                    adminTestPlan || {
                      id: 'admin-test-5rs',
                      _id: 'a0000000-0000-0000-0000-000000000005',
                      title: 'Admin Live Test Payment (₹5)',
                      name: 'Admin Live Test Payment (₹5)',
                      slug: 'admin-test-5rs',
                      price: 5,
                      sessions: 1,
                      duration: '1 Session',
                      description: 'Admin ₹5 Live Razorpay Verification Test',
                    }
                  )
                }
              >
                <ShieldCheck className="w-4 h-4" />
                Pay ₹5 Test Payment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
          <p className="text-sm text-brand-muted">Fetching live plans from server...</p>
        </div>
      ) : isError ? (
        <div className="glass-card rounded-2xl p-10 text-center max-w-md mx-auto space-y-4">
          <p className="text-red-400 font-medium">Failed to retrieve pricing packages</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPlans.map((plan) => {
              const isCouple = plan.planType === 'couple';

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                  key={plan.id || plan._id}
                  className={`glass-card rounded-3xl p-7 flex flex-col justify-between border transition-colors duration-300 relative ${
                    isCouple
                      ? 'border-brand-emerald/40 hover:border-brand-emerald shadow-xl shadow-brand-emerald/5'
                      : 'border-brand-border hover:border-brand-accent/60 shadow-xl'
                  }`}
                >
                  {/* Plan Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={isCouple ? 'emerald' : 'accent'}>
                      {isCouple
                        ? 'Couple / Partner'
                        : plan.slug === 'diet-plan'
                        ? 'Diet & Nutrition'
                        : plan.slug === 'custom-workout-plan'
                        ? 'Custom Training'
                        : '1-on-1 Single'}
                    </Badge>
                    <span className="text-xs font-semibold text-brand-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {plan.duration}
                    </span>
                  </div>

                  {/* Plan Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{plan.title}</h3>
                      <p className="text-xs font-medium text-brand-accent mt-0.5">
                        {plan.slug === 'diet-plan'
                          ? 'Customized Nutrition Plan'
                          : plan.slug === 'custom-workout-plan'
                          ? 'Tailored Workout Structure'
                          : `${plan.sessions} Live Interactive Sessions`}
                      </p>
                    </div>

                    <div className="pt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-white">
                        {formatINR(plan.price)}
                      </span>
                      <span className="text-xs font-semibold text-brand-muted">/ {plan.duration}</span>
                    </div>

                    <p className="text-xs text-brand-muted leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>

                    {/* Features List */}
                    <div className="pt-4 border-t border-brand-border/60 space-y-2.5">
                      <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                        Included in this program:
                      </p>
                      <ul className="space-y-2 text-xs text-brand-muted">
                        {plan.features?.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <CheckCircle
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isCouple ? 'text-brand-emerald' : 'text-brand-accent'
                              }`}
                            />
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Buy Action */}
                  <div className="pt-8 mt-auto">
                    <Button
                      variant={isCouple ? 'emerald' : 'primary'}
                      size="lg"
                      className="w-full text-sm font-bold uppercase tracking-wider gap-2 shadow-xl"
                      onClick={() => handleCheckout(plan)}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <p className="text-[10px] text-center text-brand-darkMuted mt-2 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-brand-emerald" />
                      Secured Payments • Instant Tax Invoice
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Guarantee & Contact note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-2xl p-8 border border-brand-border flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <Video className="w-5 h-5 text-brand-accent" />
            Have questions about equipment, schedule, or setup?
          </h3>
          <p className="text-xs text-brand-muted">
            Kush is available directly on WhatsApp to review your goals before you enroll.
          </p>
        </div>
        <WhatsAppButton
          text="Chat with Kush on WhatsApp"
          message="Hi Coach Kush, I have a few questions about your training packages and schedule before booking a coaching membership."
        />
      </motion.div>

      {/* Interactive FAQ Section */}
      <FAQSection className="pt-8 border-t border-brand-border/60" />

      {/* Checkout Modal with Coupon Support and Razorpay */}
      <CheckoutModal
        isOpen={Boolean(selectedPlanForCheckout)}
        onClose={() => setSelectedPlanForCheckout(null)}
        plan={selectedPlanForCheckout}
        user={user}
      />
    </div>
  );
};
