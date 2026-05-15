'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Jebena, SteamAnimation } from '@/lib/icons';
import { useI18n } from '@/lib/i18n';

// ── Framer Motion variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 28 },
  visible:  {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
};

// ── Floating ring stain config ────────────────────────────────────────────────

interface RingStain {
  size:           number;
  top?:           string;
  left?:          string;
  right?:         string;
  bottom?:        string;
  animClass:      string;
  delay:          string;
  opacity?:       number;
}

const RING_STAINS: RingStain[] = [
  {
    size: 400,
    top: '-10%', left: '-8%',
    animClass: 'animate-drift-slow',
    delay: '0s',
  },
  {
    size: 280,
    top: '15%', right: '-5%',
    animClass: 'animate-drift',
    delay: '-4s',
  },
  {
    size: 200,
    bottom: '20%', left: '8%',
    animClass: 'animate-drift',
    delay: '-8s',
    opacity: 0.6,
  },
  {
    size: 320,
    bottom: '-12%', right: '10%',
    animClass: 'animate-drift-slow',
    delay: '-12s',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Hero() {
  const { t } = useI18n();

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden"
      aria-label="Hero — Yeroo Coffee"
    >

      {/* ── Background layer 1: espresso base ── */}
      <div className="absolute inset-0 bg-espresso" aria-hidden="true" />

      {/* ── Background layer 2: dual radial gradient ── */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 0% 100%, rgba(212,132,90,0.3) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(201,169,97,0.15) 0%, transparent 60%)',
        }}
      />

      {/* ── Background layer 3: grain noise overlay ── */}
      <div className="grain absolute inset-0" aria-hidden="true" />

      {/* ── Floating coffee ring stains ── */}
      {RING_STAINS.map((ring, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`absolute rounded-full border-2 border-terracotta/10 ${ring.animClass}`}
          style={{
            width:          ring.size,
            height:         ring.size,
            top:            ring.top,
            left:           ring.left,
            right:          ring.right,
            bottom:         ring.bottom,
            animationDelay: ring.delay,
            opacity:        ring.opacity ?? 1,
          }}
        />
      ))}

      {/* ── Main content ── */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span
            className="inline-block bg-terracotta/20 text-terracotta border border-terracotta/30
                       text-xs tracking-widest uppercase rounded-full px-4 py-1.5 mb-8"
          >
            {t('hero_badge')}
          </span>
        </motion.div>

        {/* Jebena icon + steam animation */}
        <motion.div
          variants={itemVariants}
          className="relative mb-6 flex flex-col items-center"
        >
          <Jebena
            size={180}
            color="rgba(201,169,97,0.8)"
            className="animate-pulse-glow"
          />
          {/* Steam rises directly below the jebena */}
          <div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 pointer-events-none"
            aria-hidden="true"
            style={{ width: 120 }}
          >
            <SteamAnimation />
          </div>
        </motion.div>

        {/* H1: two-line display headline */}
        <motion.h1
          variants={itemVariants}
          className="leading-none font-display"
        >
          <span
            className="block text-cream font-bold"
            style={{ fontSize: 'clamp(72px, 12vw, 140px)' }}
          >
            {t('hero_title_1')}
          </span>
          <span
            className="block italic text-terracotta"
            style={{ fontSize: 'clamp(56px, 10vw, 120px)' }}
          >
            {t('hero_title_2')}
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-cream/70 text-lg md:text-xl mt-4 font-light max-w-xl"
        >
          {t('hero_sub')}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <a href="#menu" className="btn btn-primary">
            {t('hero_cta_menu')}
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
          <a href="#reservation" className="btn btn-outline">
            {t('hero_cta_reserve')}
          </a>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
                   flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        {/* Animated descending highlight over a faded gradient line */}
        <div className="relative w-px h-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-terracotta" />
          <motion.div
            className="absolute top-0 left-0 w-full bg-terracotta"
            style={{ height: '50%' }}
            animate={{ y: ['0%', '200%'] }}
            transition={{
              duration:    1.4,
              ease:        'easeInOut',
              repeat:      Infinity,
              repeatDelay: 0.3,
            }}
          />
        </div>
        <span
          className="text-cream/50"
          style={{ fontSize: 10, letterSpacing: '0.12em' }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
