import React, { useState } from 'react';
import {
  GraduationCap,
  HeartPulse,
  Award,
  Apple,
  ShieldCheck,
  Pause,
  Play,
  CheckCircle2,
} from 'lucide-react';

export const CERTIFICATIONS = [
  {
    id: 'aptpro-dpt',
    title: 'APTPro + DPT',
    subtitle: 'K11 School of Fitness Sciences',
    badge: 'K11 Sciences',
    institution: 'K11 School of Fitness Sciences',
    fullTitle: 'Advanced Personal Training Pro + Diploma in Personal Training',
    description: 'Premier scientific education in biomechanics, kinesiology, progressive overload, and movement mechanics.',
    icon: GraduationCap,
  },
  {
    id: 'pt-sp',
    title: 'PT-SP',
    subtitle: 'Personal Trainer in Special Populations',
    institution: 'K11 School of Fitness Sciences',
    badge: 'Special Populations',
    fullTitle: 'Personal Trainer in Special Populations (K11 School of Fitness Sciences)',
    description: 'Clinical-grade training adaptations for lifestyle disorders, hypertension, diabetes, PCOS, and injury rehab.',
    icon: HeartPulse,
  },
  {
    id: 'ace-certified',
    title: 'ACE Certified',
    subtitle: 'ACE Certified Personal Trainer',
    institution: 'American Council on Exercise',
    badge: 'Gold Standard',
    fullTitle: 'ACE Certified Personal Trainer (American Council on Exercise)',
    description: 'Gold-standard international NCCA-accredited credential in evidence-based exercise programming and coaching.',
    icon: Award,
  },
  {
    id: 'bsc-nutrition',
    title: 'B.Sc. Nutrition & Dietetics',
    subtitle: 'Bachelor of Science in Nutrition and Dietetics',
    institution: 'Academic Degree',
    badge: 'Science Degree',
    fullTitle: 'Bachelor of Science in Nutrition and Dietetics',
    description: 'Rigorous academic foundation in clinical dietetics, macronutrient partitioning, and sustainable metabolic nutrition.',
    icon: Apple,
  },
];

export const CertificationsMarquee = ({
  showHeader = true,
  className = '',
  speed = 'normal', // 'normal' | 'slow' | 'fast'
}) => {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items 4 times to ensure seamless infinite looping on all screen sizes
  const duplicatedCertifications = [
    ...CERTIFICATIONS,
    ...CERTIFICATIONS,
    ...CERTIFICATIONS,
    ...CERTIFICATIONS,
  ];

  return (
    <section
      aria-label="Coach Kush Certified Credentials and Accreditations"
      className={`relative w-full border-y border-brand-border/70 bg-gradient-to-b from-[#090D14] via-[#0E1524] to-[#090D14] py-8 sm:py-10 overflow-hidden ${className}`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      {showHeader && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Gym Trainer Credentials</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Accredited Fitness Sciences & Nutrition Degrees
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted max-w-2xl">
                Certified by India’s top fitness academy (K11) and the global gold-standard American Council on Exercise (ACE).
              </p>
            </div>

            {/* Pause / Play interactive toggle button */}
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface/80 hover:bg-brand-surface border border-brand-border text-xs text-brand-muted hover:text-white transition-all shadow-sm"
                title={isPaused ? 'Resume moving credentials' : 'Pause moving credentials'}
                aria-label={isPaused ? 'Resume credentials ticker' : 'Pause credentials ticker'}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-brand-emerald fill-brand-emerald" />
                    <span>Resume Motion</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Pause Ticker</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marquee Track Container with Edge Gradient Fades */}
      <div className="relative w-full overflow-hidden select-none">
        {/* Left Edge Fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-r from-[#090D14] via-[#090D14]/80 to-transparent z-10" />

        {/* Right Edge Fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-l from-[#090D14] via-[#090D14]/80 to-transparent z-10" />

        {/* Infinite Moving Side-by-Side Track */}
        <div
          className={`flex gap-4 sm:gap-6 py-2.5 animate-marquee ${
            isPaused ? '[animation-play-state:paused]' : ''
          }`}
          style={{
            animationDuration: speed === 'fast' ? '22s' : speed === 'slow' ? '45s' : '32s',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {duplicatedCertifications.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <div
                key={`${cert.id}-${index}`}
                className="inline-flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-[#0E1628]/95 hover:bg-[#131D33] border border-blue-500/25 hover:border-blue-400/60 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 group shrink-0 cursor-pointer"
                title={`${cert.fullTitle} - ${cert.description}`}
              >
                {/* Visual Icon in Circular Blue Badge (matching user screenshot) */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-105 group-hover:shadow-blue-500/50 transition-all duration-300">
                  <Icon className="w-5 h-5 text-white stroke-[2.2]" />
                </div>

                {/* Text Content: Consistent Spelling, Capitalization, Spacing & Alignment */}
                <div className="flex flex-col justify-center text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors whitespace-nowrap">
                      {cert.title}
                    </span>
                    {cert.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 whitespace-nowrap hidden sm:inline-block">
                        {cert.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs sm:text-[13px] text-brand-muted font-medium tracking-normal whitespace-nowrap group-hover:text-slate-300 transition-colors">
                    {cert.subtitle}
                  </span>
                  {cert.institution && cert.institution !== cert.subtitle && (
                    <span className="text-[11px] text-blue-300/80 font-normal whitespace-nowrap hidden md:inline-block">
                      {cert.institution}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle micro text indicator below */}
      <div className="mt-3 text-center">
        <span className="text-[11px] text-brand-darkMuted/80 font-medium tracking-wide">
          Hover or tap any credential to pause • 100% Scientifically Certified Coaching
        </span>
      </div>
    </section>
  );
};
