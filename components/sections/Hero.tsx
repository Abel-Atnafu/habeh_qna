'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Jebena } from '@/lib/icons';
import { useI18n } from '@/lib/i18n';

// Royalty-free Pexels CDN — coffee being poured (loops cleanly)
const VIDEO_MP4 =
  'https://videos.pexels.com/video-files/2098989/2098989-uhd_2560_1440_30fps.mp4';
// Poster image — instant first paint while the video downloads
const POSTER =
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=2400&q=80';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

export default function Hero() {
  const { t } = useI18n();
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Skip the video on small viewports to save mobile data
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const showVideo = !reducedMotion && !isMobile;

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden"
      aria-label="Hero — Yeroo Coffee"
    >
      {/* ── Background: poster always, video on top when allowed ── */}
      <div
        className="absolute inset-0 bg-espresso bg-cover bg-center"
        style={{ backgroundImage: `url(${POSTER})` }}
        aria-hidden="true"
      />
      {showVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER}
          aria-hidden="true"
        >
          <source src={VIDEO_MP4} type="video/mp4" />
        </video>
      )}

      {/* ── Legibility overlays ── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/40 to-espresso/85"
        aria-hidden="true"
      />
      <div className="grain absolute inset-0" aria-hidden="true" />

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center px-6 py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span
            className="inline-block bg-terracotta/20 text-terracotta border border-terracotta/30
                       text-xs tracking-widest uppercase rounded-full px-4 py-1.5 mb-6"
          >
            {t('hero_badge')}
          </span>
        </motion.div>

        {/* Jebena icon */}
        <motion.div variants={itemVariants} className="mb-4">
          <Jebena
            size={120}
            color="rgba(201,169,97,0.85)"
            className="animate-pulse-glow"
          />
        </motion.div>

        {/* H1 */}
        <motion.h1 variants={itemVariants} className="leading-none font-display">
          <span
            className="block text-cream font-bold drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)]"
            style={{ fontSize: 'clamp(64px, 11vw, 132px)' }}
          >
            {t('hero_title_1')}
          </span>
          <span
            className="block italic text-terracotta drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)]"
            style={{ fontSize: 'clamp(48px, 9vw, 110px)' }}
          >
            {t('hero_title_2')}
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-cream/85 text-base md:text-xl mt-5 font-light max-w-xl"
        >
          {t('hero_sub')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8"
        >
          <a href="#menu" className="btn btn-primary">
            <ShoppingBag size={16} strokeWidth={2} aria-hidden="true" />
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
        <div className="relative w-px h-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-terracotta" />
          <motion.div
            className="absolute top-0 left-0 w-full bg-terracotta"
            style={{ height: '50%' }}
            animate={{ y: ['0%', '200%'] }}
            transition={{
              duration: 1.4,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 0.3,
            }}
          />
        </div>
        <span className="text-cream/60" style={{ fontSize: 10, letterSpacing: '0.12em' }}>
          Scroll
        </span>
      </div>
    </section>
  );
}
