import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { formatINR } from '../utils/formatters';
import {
  Video,
  CheckCircle,
  Zap,
  Target,
  Users,
  User,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Clock,
  HeartPulse,
  Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FAQSection } from '../components/common/FAQSection';

const DEFAULT_PLANS = [
  {
    _id: 'seed-1',
    id: 1,
    title: 'Session 12 - Single',
    duration: '1 Month',
    sessions: 12,
    planType: 'single',
    price: 8999,
    currency: 'INR',
    description: '12 high-intensity 1-on-1 virtual personal training sessions via Google Meet or Zoom.',
    features: [
      '12 Live 1-on-1 Video Sessions',
      'Personalized Workout Program',
      'Nutrition & Calorie Guidance',
      'Weekly Form Review & Adjustments',
      'Direct WhatsApp Support with Kush',
    ],
  },
  {
    _id: 'seed-2',
    id: 2,
    title: 'Session 12 - Couple',
    duration: '1 Month',
    sessions: 12,
    planType: 'couple',
    price: 14999,
    currency: 'INR',
    description: '12 live interactive partner coaching sessions for couples or workout partners.',
    features: [
      '12 Joint Video Sessions',
      'Custom Programs for Both Individuals',
      'Dual Nutrition & Habit Tracking',
      'Partner Motivation & Accountability',
      'Dedicated WhatsApp Group with Kush',
    ],
  },
  {
    _id: 'seed-3',
    id: 3,
    title: 'Session 24 - Single',
    duration: '2 Months',
    sessions: 24,
    planType: 'single',
    price: 14999,
    currency: 'INR',
    description: '24 comprehensive 1-on-1 coaching sessions spanning 2 full months of transformation.',
    features: [
      '24 Live 1-on-1 Video Sessions',
      'Complete Periodized Transformation Plan',
      'Macro & Meal Plan Optimization',
      'Bi-weekly Body Composition Check-ins',
      'Priority Schedule Slots & 24/7 WhatsApp',
    ],
  },
  {
    _id: 'seed-4',
    id: 4,
    title: 'Session 24 - Couple',
    duration: '2 Months',
    sessions: 24,
    planType: 'couple',
    price: 24999,
    currency: 'INR',
    description: '24 couple/partner video sessions over 2 months for double the accountability and results.',
    features: [
      '24 Joint Video Coaching Sessions',
      'Dual Transformation Periodization',
      'Synchronized Nutrition Strategy',
      'Shared Milestone Tracking & Form Audits',
      'VIP WhatsApp Support with Kush',
    ],
  },
];

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pricingFilter, setPricingFilter] = useState('all'); // 'all', 'single', 'couple'

  // Load active pricing plans from Supabase (fallback to DEFAULT_PLANS if loading or offline)
  const { data: serverPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['pricing', 'active'],
    queryFn: productService.getActivePlans,
    staleTime: 60 * 1000,
  });

  const plans = (serverPlans && serverPlans.length > 0) ? serverPlans : DEFAULT_PLANS;

  const handlePlanSelect = async (planId) => {
    navigate('/pricing');
  };

  const filteredPlans = plans.filter((p) => {
    if (pricingFilter === 'single') return p.planType === 'single';
    if (pricingFilter === 'couple') return p.planType === 'couple';
    return true;
  });

  return (
    <div className="space-y-24 sm:space-y-36 pb-24 overflow-hidden">
      {/* 1. HERO SECTION WITH COACH KUSH VISUAL */}
      <section className="relative pt-8 sm:pt-14 lg:pt-18">
        {/* Background Atmosphere Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-accent/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[300px] bg-brand-emerald/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: Headlines & CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-card/90 border border-brand-border shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  1-on-1 & Couple Live Virtual Coaching
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
                Real-Time Fitness Coaching.{' '}
                <span className="text-gradient-gold">Zero Compromise.</span>
              </h1>

              <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Train live on camera directly with Kush over <strong>Google Meet</strong> and <strong>Zoom</strong>. Precision biomechanics, instant posture corrections, progressive overload logging, and unmatched daily accountability.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/pricing">
                  <Button size="lg" className="w-full sm:w-auto gap-2.5 text-base px-8 shadow-2xl">
                    View Pricing & Book Plan
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <WhatsAppButton text="Chat with Kush on WhatsApp" />
              </div>

              {/* Key Trust Stats */}
              <div className="pt-6 border-t border-brand-border/60 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
                  <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">Live On Camera</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-brand-accent">1-on-1</p>
                  <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">& Couple Options</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-brand-emerald">Razorpay</p>
                  <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">Secure Checkouts</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Coach Kush Visual Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-full max-w-md group">
                {/* Glowing border frame */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent via-brand-emerald to-brand-accent rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-500" />
                
                <div className="relative rounded-2xl overflow-hidden glass-card border border-brand-border/80 shadow-2xl">
                  <img
                    src="/assets/images/coach_kush.jpg"
                    alt="Coach Kush in Training Facility"
                    className="w-full h-[450px] object-cover object-top filter brightness-[0.95] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Gradient Overlay & Badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/30 to-transparent flex flex-col justify-between p-6">
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-brand-emerald border border-brand-emerald/40">
                        <span className="w-2 h-2 rounded-full bg-brand-emerald animate-ping" />
                        Sessions Live Daily
                      </span>
                      <span className="text-xs font-bold text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        Google Meet • Zoom
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black text-white">Coach Kush</h3>
                        <Badge variant="accent">Head Coach</Badge>
                      </div>
                      <p className="text-xs text-brand-muted">
                        Elite Strength & Hypertrophy Coach • 1-on-1 Virtual Coaching
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. COACH INTRODUCTION & PHILOSOPHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 border border-brand-border relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Badge variant="accent">Coaching Philosophy</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                "Online training shouldn't be an email with a workout sheet. It's real-time coaching in every rep."
              </h2>
              <p className="text-base text-brand-muted leading-relaxed">
                Hi, I'm <strong>Kush</strong>. I built CoachKush around a fundamental truth: workout apps and pre-recorded videos fail because they lack <span className="text-white font-medium">real-time feedback, personalized resistance adjustments, and genuine human accountability</span>.
              </p>
              <p className="text-base text-brand-muted leading-relaxed">
                In every session with me, we connect live on camera. I monitor your posture, spine alignment, eccentric tempo, breathing rhythm, and joint angles—ensuring every repetition builds muscle safely and effectively.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-surface border border-brand-border">
                  <Flame className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Real-Time Form Cues</h4>
                    <p className="text-xs text-brand-muted mt-0.5">Instant verbal corrections to prevent injury and maximize tension.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-surface border border-brand-border">
                  <Award className="w-5 h-5 text-brand-emerald shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Systematic Progression</h4>
                    <p className="text-xs text-brand-muted mt-0.5">Weekly tracking of weights, sets, and body composition changes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-brand-border p-3 shadow-2xl">
                <img
                  src="/assets/images/virtual_session.jpg"
                  alt="Live Google Meet Zoom Coaching Demonstration"
                  className="w-full h-72 sm:h-80 object-cover rounded-xl"
                />
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      Live Session View
                    </span>
                    <span className="text-brand-accent font-semibold">Google Meet / Zoom</span>
                  </div>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    Set up your phone or laptop anywhere: home, apartment gym, or commercial gym. Kush guides your entire workout live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC PRICING CARDS SECTION (FULL CARD DISPLAY) */}
      <section id="pricing-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <Badge variant="accent">Membership & Pricing</Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Choose Your Transformation Package
          </h2>
          <p className="text-base text-brand-muted leading-relaxed">
            All programs include 100% live Google Meet / Zoom coaching with Kush, custom tailored workout splits, nutrition guidance, and WhatsApp priority messaging.
          </p>

          {/* Interactive Filter Pills */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 rounded-xl bg-brand-card border border-brand-border gap-1 shadow-lg">
              <button
                onClick={() => setPricingFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  pricingFilter === 'all'
                    ? 'bg-brand-accent text-black shadow-md'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                All Programs ({plans.length})
              </button>
              <button
                onClick={() => setPricingFilter('single')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  pricingFilter === 'single'
                    ? 'bg-brand-accent text-black shadow-md'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                1-on-1 Single
              </button>
              <button
                onClick={() => setPricingFilter('couple')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  pricingFilter === 'couple'
                    ? 'bg-brand-emerald text-black shadow-md'
                    : 'text-brand-muted hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Couple / Partner
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {filteredPlans.map((plan) => {
            const isCouple = plan.planType === 'couple';

            return (
              <div
                key={plan.id || plan._id}
                className={`glass-card rounded-3xl p-7 flex flex-col justify-between border transition-all duration-300 relative ${
                  isCouple
                    ? 'border-brand-emerald/40 hover:border-brand-emerald shadow-xl shadow-brand-emerald/5 hover:-translate-y-1'
                    : 'border-brand-border hover:border-brand-accent/60 shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Header Badge */}
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={isCouple ? 'emerald' : 'accent'}>
                    {isCouple ? 'Couple / Partner' : '1-on-1 Single'}
                  </Badge>
                  <span className="text-xs font-semibold text-brand-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {plan.duration}
                  </span>
                </div>

                {/* Plan Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-white">{plan.title}</h3>
                    <p className="text-xs font-bold text-brand-accent mt-0.5">
                      {plan.sessions} Live Coaching Sessions
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {formatINR(plan.price)}
                    </span>
                    <span className="text-xs text-brand-darkMuted ml-1.5">all inclusive</span>
                  </div>

                  <p className="text-xs text-brand-muted leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Included Features */}
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

                {/* Action CTA */}
                <div className="pt-8 mt-auto">
                  <Button
                    variant={isCouple ? 'emerald' : 'primary'}
                    size="lg"
                    className="w-full text-xs font-bold uppercase tracking-wider gap-2 shadow-xl"
                    onClick={() => handlePlanSelect(plan.id || plan._id)}
                  >
                    {isAuthenticated ? 'Buy Now' : 'Sign Up to Buy'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-[10px] text-center text-brand-darkMuted mt-2.5 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                    Razorpay Verified • Instant Tax Invoice
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/pricing">
            <Button variant="secondary" size="md" className="gap-2">
              View Detailed Comparison & Membership Terms
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. PARTNER & COUPLE COACHING SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 border border-brand-emerald/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-brand-border">
                <img
                  src="/assets/images/couple_workout.jpg"
                  alt="Couple Fitness Coaching"
                  className="w-full h-80 object-cover object-top filter contrast-[1.05]"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <Badge variant="emerald">Couple / Partner Training</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Transform Together with Dual Interactive Coaching
              </h2>
              <p className="text-base text-brand-muted leading-relaxed">
                Whether training with your partner, spouse, or gym buddy, our Couple Coaching packages provide synchronized live video workouts. Kush coordinates progressive overload for both individuals simultaneously, multiplying your motivation while keeping cost per person ultra-affordable.
              </p>
              <ul className="space-y-2.5 text-sm text-brand-text">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-emerald" />
                  Dual tailored caloric & meal guidelines for different body compositions
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-emerald" />
                  Real-time form tracking on both cameras or shared screen
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-brand-emerald" />
                  Dedicated WhatsApp group with Kush for weekly progress audits
                </li>
              </ul>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link to="/pricing">
                  <Button variant="emerald" size="md" className="gap-2">
                    Explore Couple Packages
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <WhatsAppButton text="Ask Kush About Couple Training" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE FAQ SECTION */}
      <FAQSection className="my-16 border-t border-brand-border/60 pt-16" />

      {/* 6. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-card via-brand-surface to-[#0D1524] border border-brand-border p-8 sm:p-16 text-center shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <Badge variant="accent">Start Your Transformation</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready for Unmatched Accountability & Results?
            </h2>
            <p className="text-base text-brand-muted leading-relaxed">
              Experience the power of live 1-on-1 and couple coaching with Coach Kush. Secure your membership today with Razorpay or reach out directly on WhatsApp.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/pricing">
                <Button size="lg" className="w-full sm:w-auto px-8 gap-2">
                  Get Started Today
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <WhatsAppButton text="Message Kush on WhatsApp" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
