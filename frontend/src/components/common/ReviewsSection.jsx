import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Users,
  User,
  Apple,
  HeartPulse,
  Sparkles,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Badge } from './Badge';

export const REVIEWS_DATA = [
  {
    id: 'rev-1',
    name: 'Rohan Sharma',
    city: 'Delhi NCR',
    country: 'India',
    avatarGradient: 'from-amber-500 to-red-600',
    initials: 'RS',
    category: 'single',
    program: 'Session 24 - Single',
    duration: '2 Months • 24 Live Sessions',
    rating: 5,
    highlight: '-11 kg Fat Loss & 100kg Bench Press',
    highlightType: 'accent',
    review:
      'I used to waste months wandering aimlessly in commercial gyms with zero real progress. Training live on camera with gym trainer Kush changed everything. Within the first 10 minutes of our first Google Meet session, he spotted my left shoulder dipping on bench press and corrected my elbow path. His biomechanics knowledge from K11 is unmatched. Down 11 kg and stronger than ever!',
  },
  {
    id: 'rev-2',
    name: 'Pooja & Ankit Verma',
    city: 'Bengaluru',
    country: 'India',
    avatarGradient: 'from-emerald-500 to-teal-700',
    initials: 'PA',
    category: 'couple',
    program: 'Session 24 - Couple Coaching',
    duration: '2 Months • Dual Programming',
    rating: 5,
    highlight: 'Joint -18 kg Combined Transformation',
    highlightType: 'emerald',
    review:
      'We booked the Couple workout program with Kush over Google Meet. Having a certified gym trainer guide both of us simultaneously was pure game changer. Kush calibrated the heavier loads for Ankit and eccentric tempo for me, plus created sustainable Indian vegetarian diet plans that fit our busy tech jobs. Kush trainer is genuine and fiercely accountable!',
  },
  {
    id: 'rev-3',
    name: 'Vikramaditya Mehta',
    city: 'Mumbai',
    country: 'India',
    avatarGradient: 'from-blue-600 to-indigo-700',
    initials: 'VM',
    category: 'special',
    program: 'Session 12 - Single',
    duration: '1 Month • Special Populations',
    rating: 5,
    highlight: 'L4-L5 Disc Bulge Rehab & Pain-Free Lifts',
    highlightType: 'accent',
    review:
      'After an L4-L5 disc injury 2 years ago, I was terrified of lifting weights in the gym. Kush’s credential in Special Populations (PT-SP) gave me immense confidence. He watched my pelvic tilt, bracing, and hip hinge on every single repetition live. Today I am deadlifting and squatting completely pain-free. An exceptional coach.',
  },
  {
    id: 'rev-4',
    name: 'Dr. Sneha Nair',
    city: 'London / Hyderabad',
    country: 'UK / India',
    avatarGradient: 'from-purple-600 to-pink-600',
    initials: 'SN',
    category: 'nutrition',
    program: 'Diet Plan + Custom Training',
    duration: '4 Weeks • Clinical Nutrition',
    rating: 5,
    highlight: 'HbA1c Dropped from 6.8 to 5.4',
    highlightType: 'emerald',
    review:
      'As a physician with irregular shifts, standard cookie-cutter diet charts always failed. Coach Kush’s academic background in B.Sc. Nutrition & Dietetics shows in the scientific depth of his meal plan. No starvation, no supplements push—just calibrated macronutrient partitioning and gut health focus. Metabolic health restored!',
  },
  {
    id: 'rev-5',
    name: 'Aman Preet Singh',
    city: 'Chandigarh',
    country: 'India',
    avatarGradient: 'from-amber-600 to-orange-700',
    initials: 'AS',
    category: 'single',
    program: 'Session 24 - Single',
    duration: '2 Months • Hypertrophy Split',
    rating: 5,
    highlight: '+5.5 kg Lean Muscle & Visible Abs',
    highlightType: 'accent',
    review:
      'Coach Kush is relentless on camera. When your set gets brutal at rep 8 and you want to drop the dumbbells, he cues your breathing and safely drives you through the final two reps. The daily WhatsApp logs and progressive overload tracking felt like having an elite private gym trainer right in my home gym.',
  },
  {
    id: 'rev-6',
    name: 'Kavita Desai',
    city: 'Gurugram',
    country: 'India',
    avatarGradient: 'from-rose-500 to-pink-700',
    initials: 'KD',
    category: 'special',
    program: 'Session 12 - Single',
    duration: '1 Month • PCOS Management',
    rating: 5,
    highlight: 'PCOS Symptoms Managed & -7 kg Down',
    highlightType: 'emerald',
    review:
      'Struggling with PCOS weight fluctuations was so demotivating until I started training with Kush. He adjusted my lifting volume based on my hormonal cycle and designed an anti-inflammatory nutrition protocol. The live 1-on-1 accountability kept me showing up every week. Truly life-changing!',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Reviews (6)' },
  { id: 'single', label: '1-on-1 Single' },
  { id: 'couple', label: 'Couple Coaching' },
  { id: 'nutrition', label: 'Diet & Nutrition' },
  { id: 'special', label: 'Rehab & Special Populations' },
];

export const ReviewsSection = ({ className = '', id = 'reviews' }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredReviews =
    selectedCategory === 'all'
      ? REVIEWS_DATA
      : REVIEWS_DATA.filter((r) => r.category === selectedCategory);

  return (
    <section
      id={id}
      aria-label="Customer Reviews and Trainee Transformations for Coach Kush"
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 ${className}`}
    >
      {/* 1. Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <Badge variant="accent">Client Transformations & Verified Reviews</Badge>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Real People. <span className="text-gradient-gold">Real Transformations.</span>
        </h2>
        <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
          Over <strong>180+ trainees</strong> coached live on camera across India, UK, USA, and UAE. Read authentic experiences from clients who transformed their health with gym trainer Kush.
        </p>

        {/* 2. Trust Stats Bar */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-brand-card/90 border border-brand-border text-center shadow-lg">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-2xl font-black text-white">4.98 / 5.0</p>
            <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">
              Average Rating
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-card/90 border border-brand-border text-center shadow-lg">
            <p className="text-2xl font-black text-brand-accent">180+</p>
            <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">
              Trainees Coached
            </p>
            <p className="text-[10px] text-brand-emerald font-semibold mt-0.5">100% Live Video</p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-card/90 border border-brand-border text-center shadow-lg">
            <p className="text-2xl font-black text-brand-emerald">99.4%</p>
            <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">
              Goal Satisfaction
            </p>
            <p className="text-[10px] text-brand-muted mt-0.5">Real-time Form Cues</p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-card/90 border border-brand-border text-center shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-base sm:text-lg font-black text-white">100% Verified</p>
            <p className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">
              Genuine Clients
            </p>
          </div>
        </div>

        {/* 3. Category Filter Pills */}
        <div className="pt-4 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-accent text-black shadow-lg shadow-brand-accent/20 font-bold scale-105'
                  : 'bg-brand-card border border-brand-border text-brand-muted hover:text-white hover:border-brand-borderLight'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 4. Reviews Grid with Fluid AnimatePresence */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        <AnimatePresence mode="popLayout">
          {filteredReviews.map((rev) => {
            return (
              <motion.div
                layout
                key={rev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between border border-brand-border hover:border-brand-accent/40 shadow-xl relative group cursor-default"
              >
                {/* Background ambient corner glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-bl-full pointer-events-none group-hover:bg-brand-accent/10 transition-colors" />

                <div className="space-y-4">
                  {/* Header: Avatar, Name, Location & Stars */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${rev.avatarGradient} flex items-center justify-center text-white font-black text-base shadow-lg shrink-0 relative`}
                      >
                        {rev.initials}
                        {/* Active Online / Verified Dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-emerald border-2 border-brand-card" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white tracking-tight truncate group-hover:text-brand-accent transition-colors">
                          {rev.name}
                        </h4>
                        <p className="text-xs text-brand-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-accent shrink-0" />
                          <span>{rev.city}, {rev.country}</span>
                        </p>
                      </div>
                    </div>

                    {/* 5-Star Rating */}
                    <div className="flex items-center gap-0.5 shrink-0 bg-black/40 px-2 py-1 rounded-lg border border-brand-border/60">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Key Result Banner */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      rev.highlightType === 'emerald'
                        ? 'bg-brand-emerald/15 text-brand-emerald border-brand-emerald/30'
                        : 'bg-brand-accent/15 text-brand-accent border-brand-accent/30'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                    <span>{rev.highlight}</span>
                  </div>

                  {/* Testimonial Quote */}
                  <div className="relative pt-1">
                    <Quote className="w-6 h-6 text-brand-borderLight/40 absolute -top-1 -left-1 pointer-events-none" />
                    <p className="text-sm text-brand-muted leading-relaxed relative z-10 pl-2">
                      "{rev.review}"
                    </p>
                  </div>
                </div>

                {/* Card Footer: Program and Verification */}
                <div className="pt-5 mt-5 border-t border-brand-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-brand-emerald font-semibold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Verified Trainee</span>
                  </div>
                  <span className="text-[11px] text-brand-darkMuted font-medium bg-brand-surface px-2.5 py-1 rounded-lg border border-brand-border">
                    {rev.program}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 5. Bottom WhatsApp Consultation Trigger */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card rounded-2xl p-6 sm:p-8 border border-brand-border text-center sm:flex sm:items-center sm:justify-between gap-6 max-w-4xl mx-auto"
      >
        <div className="text-left space-y-1 mb-4 sm:mb-0">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            Ready for your own transformation story?
          </h4>
          <p className="text-xs sm:text-sm text-brand-muted">
            Book a 1-on-1 or couple package, or message Kush directly on WhatsApp for goal assessment.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3 justify-center">
          <a
            href={`https://wa.me/917042858524?text=${encodeURIComponent('Hi Coach Kush, I saw your client reviews and transformations on coachkush.in and would love to discuss my fitness goals with you.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            Chat with Coach Kush
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </section>
  );
};
