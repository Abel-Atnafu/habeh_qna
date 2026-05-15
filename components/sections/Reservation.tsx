'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Check, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useCreateReservation } from '@/lib/queries';
import { cn } from '@/lib/utils';

// ── Schema ─────────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Enter a valid phone number'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string(),
  // Use z.number() directly — react-hook-form provides the coerced value from <select>
  guests: z.number().min(1).max(20),
  special_requests: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

// ── Time slots (9:00 AM – 9:00 PM in 30-min intervals) ───────────────────────

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) continue;
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h < 12 ? 'AM' : 'PM';
      const minStr = m === 0 ? '00' : '30';
      slots.push(`${hour12}:${minStr} ${ampm}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

// ── Input / select shared class ───────────────────────────────────────────────

const inputCls =
  'w-full bg-white/10 border border-cream/20 rounded-xl px-4 py-2.5 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-terracotta/60 focus:ring-1 focus:ring-terracotta/30 transition-colors duration-200';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ReservationProps {
  whatsapp?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Reservation({ whatsapp }: ReservationProps) {
  const { t } = useI18n();
  const [confirmed, setConfirmed] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const { mutateAsync, isPending } = useCreateReservation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { guests: 2, time: '12:00 PM' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({
        name: data.name,
        phone: data.phone,
        date: data.date,
        time: data.time,
        guests: data.guests,
        // DB column is `string | null`; form value is `string | null | undefined`
        special_requests: data.special_requests ?? null,
      });
      setSubmittedData(data);
      setConfirmed(true);
      reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
    }
  };

  const waNumber = whatsapp?.replace(/\D/g, '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=Hello!%20I'd%20like%20to%20make%20a%20reservation%20at%20Yeroo%20Coffee.`
    : '#';

  return (
    <section
      id="reservation"
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #2F4A42 0%, #1A0F08 100%)' }}
    >
      {/* Decorative background Amharic text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="font-display italic text-cream/[0.03] leading-none select-none whitespace-nowrap"
          style={{ fontSize: '120px' }}
        >
          ቡና ዳቦ ነው
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Left: Info panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] }}
            className="flex flex-col justify-center pt-4"
          >
            <p className="eyebrow mb-3">{t('reservation_label')}</p>
            <h2 className="font-display text-4xl text-cream mb-3">{t('reservation_title')}</h2>
            <p className="text-cream/70 mt-2 leading-relaxed">{t('reservation_sub')}</p>

            <ul className="mt-8 flex flex-col gap-4 text-cream/60 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-terracotta mt-0.5" aria-hidden="true">✦</span>
                <span>Reserve online or call us at +251 11 123 4567</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-terracotta mt-0.5" aria-hidden="true">✦</span>
                <span>We&apos;ll confirm your booking within 30 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-terracotta mt-0.5" aria-hidden="true">✦</span>
                <span>Private dining available for groups of 10+</span>
              </li>
            </ul>

            {/* WhatsApp link */}
            {waNumber && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-whatsapp hover:underline text-sm font-medium w-fit"
              >
                <MessageCircle size={16} aria-hidden="true" />
                {t('form_whatsapp')}
              </a>
            )}
          </motion.div>

          {/* ── Right: Glass form card ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] as [number,number,number,number], delay: 0.1 }}
          >
            <div className="glass rounded-2xl p-8">
              <AnimatePresence mode="wait">
                {confirmed && submittedData ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center text-center py-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center mb-4">
                      <Check size={28} className="text-green-400" aria-hidden="true" />
                    </div>

                    <h3 className="font-display text-2xl text-cream mb-2">
                      {t('form_success_title')}
                    </h3>
                    <p className="text-cream/70 text-sm mb-6">{t('form_success_sub')}</p>

                    {/* Booking summary */}
                    <dl className="bg-cream/10 rounded-xl p-4 text-left w-full text-sm text-cream/80 space-y-2">
                      {[
                        { label: 'Name', value: submittedData.name },
                        { label: 'Date', value: submittedData.date },
                        { label: 'Time', value: submittedData.time },
                        {
                          label: 'Guests',
                          value: `${submittedData.guests} ${submittedData.guests === 1 ? 'guest' : 'guests'}`,
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-4">
                          <dt className="text-cream/50 shrink-0">{label}</dt>
                          <dd className="font-medium text-right">{value}</dd>
                        </div>
                      ))}
                      {submittedData.special_requests && (
                        <div className="flex justify-between gap-4 border-t border-cream/10 pt-2 mt-2">
                          <dt className="text-cream/50 shrink-0">Note</dt>
                          <dd className="font-medium text-right">{submittedData.special_requests}</dd>
                        </div>
                      )}
                    </dl>

                    <button
                      type="button"
                      onClick={() => { setConfirmed(false); setSubmittedData(null); }}
                      className="btn mt-6 text-sm border border-cream/30 text-cream/70 hover:text-cream hover:border-cream/50 rounded-xl px-5 py-2 transition-colors"
                    >
                      Make another reservation
                    </button>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-5"
                  >
                    {/* Full Name */}
                    <div>
                      <label className="block text-cream/80 text-sm mb-1">
                        {t('form_name')} <span className="text-terracotta" aria-hidden="true">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        placeholder="Abebe Kebede"
                        autoComplete="name"
                        className={cn(inputCls, errors.name && 'border-red-400/60')}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-xs mt-1" role="alert">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-cream/80 text-sm mb-1">
                        {t('form_phone')} <span className="text-terracotta" aria-hidden="true">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="+251 9__ __ __ __"
                        autoComplete="tel"
                        className={cn(inputCls, errors.phone && 'border-red-400/60')}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-xs mt-1" role="alert">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Date + Time row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-cream/80 text-sm mb-1">
                          {t('form_date')} <span className="text-terracotta" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="date"
                          {...register('date')}
                          min={todayString()}
                          className={cn(inputCls, errors.date && 'border-red-400/60')}
                        />
                        {errors.date && (
                          <p className="text-red-400 text-xs mt-1" role="alert">{errors.date.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-cream/80 text-sm mb-1">
                          {t('form_time')}
                        </label>
                        <select
                          {...register('time')}
                          className={inputCls}
                        >
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot} className="bg-espresso text-cream">
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-cream/80 text-sm mb-1">{t('form_guests')}</label>
                      <select {...register('guests')} className={inputCls}>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n} className="bg-espresso text-cream">
                            {n} {n === 1 ? 'guest' : 'guests'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="block text-cream/80 text-sm mb-1">
                        {t('form_special')}
                        <span className="text-cream/40 text-xs ml-1">(optional)</span>
                      </label>
                      <textarea
                        {...register('special_requests')}
                        rows={3}
                        placeholder="Dietary requirements, special occasions, seating preferences…"
                        className={cn(inputCls, 'resize-none')}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn btn-primary w-full justify-center"
                    >
                      {isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                            aria-hidden="true"
                          />
                          Processing…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Check size={16} aria-hidden="true" />
                          {t('form_submit')}
                        </span>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
