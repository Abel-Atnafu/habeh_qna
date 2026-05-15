'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useDailySpecials } from '@/lib/queries';
import { formatPrice, cn } from '@/lib/utils';
import type { DailySpecial } from '@/types';

interface DailySpecialsProps {
  initialSpecials?: DailySpecial[];
}

export default function DailySpecials({ initialSpecials }: DailySpecialsProps) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const { data: items = [] } = useDailySpecials(true);
  const specials = items.length > 0 ? items : (initialSpecials ?? []);

  // Hide section entirely if no specials
  if (specials.length === 0) return null;

  const activeSpecial = specials[activeIndex];

  const prev = () =>
    setActiveIndex((i) => (i - 1 + specials.length) % specials.length);
  const next = () =>
    setActiveIndex((i) => (i + 1) % specials.length);

  return (
    <section
      id="specials"
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-coffee to-espresso relative overflow-hidden"
    >
      {/* Subtle noise grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* ── Header ───────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className="eyebrow text-terracotta tracking-widest mb-3">
            {t('specials_label')}
          </p>
          <h2 className="font-display text-4xl text-cream">
            {t('specials_title')}
          </h2>
        </motion.div>

        {/* ── Two-column carousel layout ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — Featured card */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.article
                key={activeSpecial.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(92,61,46,0.5) 0%, rgba(26,15,8,0.7) 100%)',
                  border: '1px solid rgba(249,245,240,0.08)',
                }}
                initial={{ opacity: 0, scale: 0.97, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -16 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Image area */}
                <div className="relative h-64 bg-espresso-2 overflow-hidden">
                  {activeSpecial.image_url ? (
                    <img
                      src={activeSpecial.image_url}
                      alt={activeSpecial.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-8xl opacity-20" aria-hidden="true">
                        🍽️
                      </span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-espresso to-transparent"
                  />
                  {/* Day badge */}
                  <div className="absolute top-4 left-4">
                    <span className="badge badge-gold text-xs tracking-wider uppercase">
                      Today&rsquo;s Special
                    </span>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-display text-2xl text-cream leading-tight">
                      {activeSpecial.title}
                    </h3>
                    <span className="badge badge-price shrink-0 text-sm">
                      {formatPrice(activeSpecial.price)}
                    </span>
                  </div>
                  {activeSpecial.description && (
                    <p className="text-cream/70 text-sm leading-relaxed">
                      {activeSpecial.description}
                    </p>
                  )}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* RIGHT — Thumbnail list + nav */}
          <div className="lg:col-span-1 flex flex-col">
            {/* Prev / Next arrows */}
            <div className="flex gap-2 justify-end mb-4">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous special"
                disabled={specials.length <= 1}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                  'border border-cream/20 text-cream/60',
                  'hover:border-cream/50 hover:text-cream hover:bg-cream/10',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next special"
                disabled={specials.length <= 1}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                  'border border-cream/20 text-cream/60',
                  'hover:border-cream/50 hover:text-cream hover:bg-cream/10',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Thumbnail list */}
            <div className="flex flex-col gap-2 flex-1">
              {specials.map((special, i) => (
                <button
                  key={special.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'flex gap-3 items-center p-3 rounded-xl cursor-pointer text-left',
                    'transition-all duration-200 w-full',
                    i === activeIndex
                      ? 'bg-cream/10 border border-cream/20'
                      : 'border border-transparent hover:bg-cream/5'
                  )}
                  aria-pressed={i === activeIndex}
                  aria-label={`View special: ${special.title}`}
                >
                  {/* Thumbnail image or colour block */}
                  <div className="w-14 h-14 rounded-lg bg-espresso-2 overflow-hidden shrink-0 relative">
                    {special.image_url ? (
                      <img
                        src={special.image_url}
                        alt={special.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl opacity-40" aria-hidden="true">
                          🍽️
                        </span>
                      </div>
                    )}
                    {/* Active indicator ring */}
                    {i === activeIndex && (
                      <div className="absolute inset-0 rounded-lg ring-2 ring-terracotta" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        'text-sm font-medium truncate',
                        i === activeIndex ? 'text-cream' : 'text-cream/70'
                      )}
                    >
                      {special.title}
                    </span>
                    <span className="text-xs text-terracotta mt-0.5">
                      {formatPrice(special.price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination dots */}
            {specials.length > 1 && (
              <div className="flex gap-1.5 justify-center mt-4 pt-4 border-t border-cream/10">
                {specials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Go to special ${i + 1}`}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === activeIndex
                        ? 'w-5 h-1.5 bg-terracotta'
                        : 'w-1.5 h-1.5 bg-cream/30 hover:bg-cream/50'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
