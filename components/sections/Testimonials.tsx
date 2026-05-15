'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Star } from '@/lib/icons';
import { useTestimonials, useCreateTestimonial } from '@/lib/queries';
import { formatDate } from '@/lib/utils';

// ── Coffee ring decoration ─────────────────────────────────────────────────────

interface RingProps {
  className: string;
}

function CoffeeRing({ className }: RingProps) {
  return (
    <div
      className={`absolute rounded-full border-2 border-coffee/8 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}

// ── Star rating picker ─────────────────────────────────────────────────────────

interface StarPickerProps {
  value: number;
  onChange: (rating: number) => void;
}

function StarPicker({ value, onChange }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded transition-transform duration-100 hover:scale-110"
        >
          <Star
            size={24}
            filled={star <= (hovered || value)}
            color="#C9A961"
          />
        </button>
      ))}
    </div>
  );
}

// ── Card animation ─────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.1,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  }),
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function Testimonials() {
  const { t } = useI18n();
  const { data: testimonials = [] } = useTestimonials();
  const { mutateAsync, isPending } = useCreateTestimonial();

  // Review form state
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    try {
      await mutateAsync({ name: name.trim(), body: message.trim(), rating });
      setSubmitted(true);
      setName('');
      setMessage('');
      setRating(5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review.';
      toast.error(msg);
    }
  };

  const sharedInputCls =
    'border-b border-espresso/20 bg-transparent focus:outline-none focus:border-terracotta/60 w-full py-2 text-espresso text-sm placeholder:text-espresso/30 transition-colors duration-200';

  return (
    <section id="testimonials" className="py-24 bg-beige relative overflow-hidden">
      {/* Scattered coffee ring stain decorations */}
      <CoffeeRing className="w-40 h-40 -top-8 -left-8 rotate-12 opacity-60" />
      <CoffeeRing className="w-56 h-56 top-1/3 -right-12 -rotate-6 opacity-40" />
      <CoffeeRing className="w-32 h-32 bottom-24 left-1/4 rotate-45 opacity-50" />
      <CoffeeRing className="w-48 h-48 -bottom-10 right-1/3 rotate-12 opacity-30" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">{t('testimonials_label')}</p>
          <h2 className="font-display text-4xl text-espresso">{t('testimonials_title')}</h2>
        </div>

        {/* ── Reviews grid ── */}
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.article
                key={testimonial.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="bg-cream rounded-2xl p-6 border-l-4 border-gold shadow-card lift relative overflow-hidden"
              >
                {/* Decorative large quote mark */}
                <span
                  className="absolute top-4 right-4 font-display text-9xl text-gold/15 leading-none select-none pointer-events-none"
                  aria-hidden="true"
                >
                  ❝
                </span>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3" aria-label={`Rating: ${testimonial.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      filled={star <= testimonial.rating}
                      color="#C9A961"
                    />
                  ))}
                </div>

                {/* Message */}
                <blockquote className="text-espresso/80 leading-relaxed mt-2 relative z-10 text-sm">
                  {testimonial.body}
                </blockquote>

                {/* Author + date */}
                <footer className="mt-4">
                  <p className="font-semibold text-espresso text-sm">{testimonial.name}</p>
                  <time
                    dateTime={testimonial.created_at}
                    className="text-xs text-espresso/40"
                  >
                    {formatDate(testimonial.created_at)}
                  </time>
                </footer>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-espresso/40">
            <p className="font-display text-xl">Be the first to share your experience!</p>
          </div>
        )}

        {/* ── Review submission form ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-lg mx-auto mt-16 bg-white rounded-2xl p-8 shadow-card"
        >
          <h3 className="font-display text-2xl text-espresso mb-6">Share Your Experience</h3>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center text-center py-4 gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
                  <Check size={22} className="text-green-600" aria-hidden="true" />
                </div>
                <p className="text-espresso font-semibold">{t('review_pending')}</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-espresso/50 hover:text-espresso underline transition-colors"
                >
                  Submit another review
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5"
              >
                {/* Star rating picker */}
                <div>
                  <label className="block text-espresso/60 text-xs uppercase tracking-widest mb-2">
                    Your Rating
                  </label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="review-name" className="block text-espresso/60 text-xs uppercase tracking-widest mb-1">
                    {t('review_name')}
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={sharedInputCls}
                    autoComplete="name"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="review-message" className="block text-espresso/60 text-xs uppercase tracking-widest mb-1">
                    {t('review_message')}
                  </label>
                  <textarea
                    id="review-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your experience…"
                    className={`${sharedInputCls} resize-none`}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isPending || !name.trim() || !message.trim()}
                  className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Submitting…
                    </span>
                  ) : (
                    t('review_submit')
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
