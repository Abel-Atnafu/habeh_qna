'use client';

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { EthiopianCross } from '@/lib/icons';
import { cn } from '@/lib/utils';

const features = [
  { emoji: '🍳', titleKey: 'about_f1_title', descKey: 'about_f1_desc' },
  { emoji: '🔥', titleKey: 'about_f2_title', descKey: 'about_f2_desc' },
  { emoji: '🍝', titleKey: 'about_f3_title', descKey: 'about_f3_desc' },
  { emoji: '☕', titleKey: 'about_f4_title', descKey: 'about_f4_desc' },
  { emoji: '🌿', titleKey: 'about_f5_title', descKey: 'about_f5_desc' },
] as const;

const ease: [number, number, number, number] = [0.4, 0, 0.2, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease },
  }),
};

export default function About() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 bg-cream overflow-hidden"
    >
      {/* Radial blob top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(212,132,90,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Two-column hero ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center mb-16 lg:mb-20">
          {/* LEFT — Story text */}
          <div>
            <motion.p
              className="eyebrow tracking-widest text-terracotta mb-4"
              custom={0}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeUp}
            >
              {t('about_label')}
            </motion.p>

            <motion.h2
              className="font-display text-4xl md:text-5xl text-espresso leading-tight mb-6"
              custom={1}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeUp}
            >
              {t('about_title')}
            </motion.h2>

            <motion.p
              className="text-espresso/70 leading-relaxed mb-4"
              custom={2}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeUp}
            >
              {t('about_body_1')}
            </motion.p>

            <motion.p
              className="text-espresso/70 leading-relaxed"
              custom={3}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeUp}
            >
              {t('about_body_2')}
            </motion.p>

            {/* Proverb block */}
            <motion.blockquote
              className="border-l-2 border-terracotta pl-4 my-6"
              custom={4}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeUp}
            >
              <p className="font-display italic text-xl text-coffee leading-relaxed">
                {t('about_proverb')}
              </p>
              <cite className="block text-sm text-espresso/50 mt-1 not-italic">
                {t('about_proverb_tr')}
              </cite>
            </motion.blockquote>
          </div>

          {/* RIGHT — Decorative card */}
          <motion.div
            className="relative bg-espresso rounded-2xl p-8 overflow-hidden"
            custom={2}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={fadeUp}
          >
            {/* Watermark cross */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <EthiopianCross
                size={200}
                color="rgba(249,245,240,0.05)"
              />
            </div>

            {/* Card content */}
            <div className="relative z-10">
              <p className="text-terracotta text-sm tracking-widest uppercase mb-6">
                Since 2014
              </p>
              <blockquote className="font-display italic text-2xl text-cream leading-relaxed mb-6">
                &ldquo;We don&rsquo;t just serve coffee — we share a ceremony
                passed down through generations, a ritual of warmth, community,
                and belonging.&rdquo;
              </blockquote>
              <p className="text-cream/60 text-sm">
                — Founder, Yeroo Coffee
              </p>

              {/* Decorative accent line */}
              <div className="mt-8 h-px bg-gradient-to-r from-terracotta/40 via-gold/30 to-transparent" />

              <div className="mt-6 flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-display text-gold font-bold">10+</span>
                  <span className="text-cream/50 text-xs tracking-wide">Years of tradition</span>
                </div>
                <div className="w-px h-10 bg-cream/10" />
                <div className="flex flex-col">
                  <span className="text-3xl font-display text-gold font-bold">3</span>
                  <span className="text-cream/50 text-xs tracking-wide">Coffee origins</span>
                </div>
                <div className="w-px h-10 bg-cream/10" />
                <div className="flex flex-col">
                  <span className="text-3xl font-display text-gold font-bold">50+</span>
                  <span className="text-cream/50 text-xs tracking-wide">Menu items</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Feature grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map(({ emoji, titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              className={cn(
                'rounded-xl bg-white p-5 shadow-card lift',
                'flex flex-col gap-2'
              )}
              custom={i}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={fadeUp}
            >
              <span className="text-3xl leading-none" role="img" aria-label={t(titleKey)}>
                {emoji}
              </span>
              <p className="font-medium text-espresso text-sm mt-1">{t(titleKey)}</p>
              <p className="text-xs text-espresso/60 leading-relaxed">{t(descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
