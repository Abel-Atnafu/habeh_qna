'use client';

import { useCountUp } from '@/hooks/useCountUp';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatConfig {
  target:    number;
  suffix:    string;
  labelKey:  TranslationKey;
  duration:  number;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS: StatConfig[] = [
  { target: 500, suffix: '+', labelKey: 'stats_guests', duration: 1800 },
  { target: 50,  suffix: '+', labelKey: 'stats_items',  duration: 1400 },
  { target: 10,  suffix: '+', labelKey: 'stats_years',  duration: 1200 },
  { target: 100, suffix: '%', labelKey: 'stats_beans',  duration: 1600 },
];

// ── Sub-component: individual stat card ──────────────────────────────────────

function StatCard({ target, suffix, labelKey, duration }: StatConfig) {
  const { t }       = useI18n();
  const { count, ref } = useCountUp(target, duration);

  return (
    <div ref={ref} className="py-8 text-center">
      {/* Animated number + suffix */}
      <div className="flex items-baseline justify-center gap-0.5">
        <span
          className="text-5xl md:text-6xl font-display text-gold font-bold leading-none tabular-nums"
        >
          {count}
        </span>
        <span
          className="font-display font-bold text-terracotta leading-none"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}
          aria-hidden="true"
        >
          {suffix}
        </span>
      </div>

      {/* Label */}
      <p className="text-sm text-cream/60 tracking-wider uppercase mt-2">
        {t(labelKey)}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Stats() {
  return (
    <section
      id="stats"
      className="w-full bg-espresso py-16"
      aria-label="At a glance"
    >
      {/* Top accent strip */}
      <div className="accent-strip" aria-hidden="true" />

      {/* Stats grid — divide-x handles dividers consistently across both
          breakpoints (no missing-border-on-last-row asymmetry) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-cream/10">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} {...stat} />
          ))}
        </div>
      </div>

      {/* Bottom accent strip */}
      <div className="accent-strip" aria-hidden="true" />
    </section>
  );
}
