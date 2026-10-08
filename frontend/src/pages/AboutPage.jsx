import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { SEO } from '../components/common/SEO';
import { CertificationsMarquee, CERTIFICATIONS } from '../components/common/CertificationsMarquee';
import { ReviewsSection } from '../components/common/ReviewsSection';
import {
  ShieldCheck,
  Target,
  Dumbbell,
  CheckCircle2,
  Users2,
  HeartPulse,
  Flame,
  ArrowRight,
  GraduationCap,
  Award,
  Apple,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-24">
      <SEO
        title="About Coach Kush | Certified Gym Trainer & Online Coach - Kush Trainer | coachkush.in"
        description="Meet Coach Kush (Kush Trainer), certified gym trainer with K11 School of Fitness Sciences and ACE credentials. Live 1-on-1 virtual gym coaching and custom nutrition plans across India and globally."
        keywords="gym, gym trainer, kush trainer, kush, gym trainer kush, coach kush gym trainer, certified gym trainer, ACE certified gym trainer, K11 gym trainer, online gym trainer, personal trainer Kush, gym workout coach, virtual gym trainer"
        canonical="/about"
      />
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent">The Coach Behind Your Results</Badge>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          About Coach Kush
        </h1>
        <p className="text-lg text-brand-muted leading-relaxed">
          Certified gym trainer and online fitness coach pioneering high-accountability virtual coaching where every session is live, interactive, and tailored to your biomechanics. Based in Delhi NCR, training clients across India and globally.
        </p>

        {/* Coach Kush Portrait Banner */}
        <div className="pt-4 max-w-2xl mx-auto">
          <div className="rounded-3xl overflow-hidden glass-card border border-brand-border shadow-2xl relative">
            <img
              src="/assets/images/coach_kush.jpg"
              alt="Coach Kush - Certified Gym Trainer and Online Fitness Coach"
              width="600"
              height="450"
              className="w-full h-80 sm:h-96 object-cover object-top filter brightness-[0.95] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent flex items-end p-6">
              <div className="flex justify-between items-center w-full">
                <div>
                  <h3 className="text-xl font-bold text-white">Coach Kush</h3>
                  <p className="text-xs text-brand-accent font-semibold">Certified Gym Trainer & Founder, CoachKush</p>
                </div>
                <span className="text-xs font-bold text-brand-emerald bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-brand-emerald/30">
                  Google Meet & Zoom Certified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Moving Side-by-Side Credentials Marquee */}
      <CertificationsMarquee showHeader={true} />

      {/* 2. Coach Philosophy */}
      <div className="glass-card rounded-3xl p-8 sm:p-14 border border-brand-border grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge variant="emerald">Coaching Philosophy</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Consistency Through Real-Time Connection
          </h2>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            Most workout regimens fail not because people lack motivation, but because they are left on their own with a video library or PDF sheet. There is no feedback loop when your shoulder pinches during a press or when your knees collapse on a squat.
          </p>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            My philosophy centers on <strong>interactive accountability</strong>. In our sessions, I am with you on screen for every rep, coaching tempo, adjusting range of motion, and celebrating breakthroughs.
          </p>
          <div className="pt-2">
            <WhatsAppButton text="Chat with Kush on WhatsApp" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-brand-accent" />
              1. Biomechanics Over Ego
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              We prioritize joint health and targeted muscle activation so you stay injury-free and progress for decades.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-brand-emerald" />
              2. Sustainable Nutrition
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              No starvation diets. We build realistic caloric and macro guidelines tailored to your cultural foods and lifestyle.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-accent" />
              3. Relentless Accountability
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Scheduled calendar slots and direct WhatsApp check-ins ensure you never miss a workout or fall off track.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Methodology */}
      <div className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="accent">Online Methodology</Badge>
          <h2 className="text-3xl font-extrabold text-white">How We Train Online</h2>
          <p className="text-sm text-brand-muted">
            High definition video, audio cues, and instant schedule synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center font-bold text-lg">
              01
            </div>
            <h3 className="text-xl font-bold text-white">Intake & Movement Assessment</h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              We begin with an in-depth consultation reviewing your history, injuries, goals, and setup (whether home dumbbells or a commercial gym).
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-emerald/15 text-brand-emerald flex items-center justify-center font-bold text-lg">
              02
            </div>
            <h3 className="text-xl font-bold text-white">Live Guided Workouts</h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Each session is 50-60 minutes of focused lifting. Kush is on video watching every angle, cueing breathing, and timing recovery intervals.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/15 text-brand-accent flex items-center justify-center font-bold text-lg">
              03
            </div>
            <h3 className="text-xl font-bold text-white">Progressive Adaptation</h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              We log weights and reps across each mesocycle, adjusting nutrition targets and recovery protocols as your body adapts.
            </p>
          </div>
        </div>
      </div>

      {/* 3.5. ACCREDITED CERTIFICATIONS DETAIL SECTION */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="accent">Professional Qualifications</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Accredited Certifications & Academic Credentials
          </h2>
          <p className="text-sm text-brand-muted leading-relaxed">
            Every fitness protocol prescribed by Coach Kush is anchored in exercise science, functional anatomy, and evidence-based nutrition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CERTIFICATIONS.map((cert) => {
            const Icon = cert.icon;
            return (
              <div
                key={cert.id}
                className="glass-card rounded-3xl p-6 sm:p-8 border border-blue-500/20 hover:border-blue-400/50 shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                        {cert.title}
                      </h3>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {cert.badge}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-brand-accent">
                      {cert.subtitle}
                    </p>
                    <p className="text-xs text-blue-300/80 font-medium">
                      {cert.institution}
                    </p>
                    <p className="text-xs sm:text-sm text-brand-muted leading-relaxed pt-2">
                      {cert.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CLIENT REVIEWS & TRANSFORMATIONS */}
      <ReviewsSection className="pt-4" />

      {/* 5. CTA */}
      <div className="glass-card rounded-3xl p-10 text-center border border-brand-accent/30 relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Transform With Kush Today</h2>
          <p className="text-sm text-brand-muted">
            Select a 1-month or 2-month package and begin your personalized coaching journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/pricing">
              <Button size="lg" className="w-full sm:w-auto px-8 gap-2">
                View Pricing Plans
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <WhatsAppButton text="Chat on WhatsApp" />
          </div>
        </div>
      </div>
    </div>
  );
};
