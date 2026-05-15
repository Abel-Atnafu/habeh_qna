'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useI18n } from '@/lib/i18n';
import { useEvents } from '@/lib/queries';
import type { Event } from '@/types';

// ── Animation variants ─────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface EventsProps {
  initialEvents?: Event[];
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function EventsSection({ initialEvents }: EventsProps) {
  const { t } = useI18n();
  const { data: events = [] } = useEvents(true);

  // Prefer live data; fall back to SSR initial data
  const displayEvents = events.length > 0 ? events : (initialEvents ?? []);

  if (displayEvents.length === 0) return null;

  return (
    <section id="events" className="py-24 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">{t('events_label')}</p>
          <h2 className="font-display text-4xl text-espresso">{t('events_title')}</h2>
        </div>

        {/* ── Events grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayEvents.map((event, i) => (
            <motion.article
              key={event.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="bg-espresso rounded-2xl overflow-hidden shadow-lift lift"
            >
              {/* Image area */}
              <div className="h-52 bg-coffee relative">
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}

                {/* Date badge — torn-ticket style */}
                <div className="absolute top-4 left-4 bg-terracotta rounded-lg px-3 py-1">
                  <span className="text-white text-sm font-semibold">
                    {format(new Date(event.date), 'MMM d')}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-xl text-cream mb-2">{event.title}</h3>

                {event.time && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-cream/60" aria-hidden="true" />
                    <span className="text-cream/60 text-sm">{event.time}</span>
                  </div>
                )}

                {event.description && (
                  <p className="text-cream/70 text-sm leading-relaxed mt-2 line-clamp-3">
                    {event.description}
                  </p>
                )}

                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-terracotta border border-terracotta/50 rounded-lg px-4 py-1.5 hover:bg-terracotta/10 transition-colors duration-200"
                >
                  {t('events_learn_more')}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
