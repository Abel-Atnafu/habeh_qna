'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, MessageCircle, Bell, PhoneCall, Smartphone, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings, useUpdateSettings } from '@/lib/queries';
import { cn } from '@/lib/utils';

/* ─── Schema ─────────────────────────────────────────────────────────────────── */
const settingsSchema = z.object({
  whatsapp:             z.string().optional(),
  announcement_text:    z.string().optional(),
  announcement_active:  z.boolean(),
  vat_note:             z.string().optional(),
  reservations_open:    z.boolean(),
  telebirr_name:        z.string().optional(),
  telebirr_number:      z.string().optional(),
  cbe_name:             z.string().optional(),
  cbe_number:           z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

/* ─── Toggle ─────────────────────────────────────────────────────────────────── */
function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-cream-2 rounded-xl">
      <span className="text-sm font-medium text-espresso">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          'relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta/30',
          value ? 'bg-terracotta' : 'bg-gray-200'
        )}
        aria-label={label}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
            value ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      whatsapp:            '',
      announcement_text:   '',
      announcement_active: false,
      vat_note:            '',
      reservations_open:   true,
      telebirr_name:       '',
      telebirr_number:     '',
      cbe_name:            '',
      cbe_number:          '',
    },
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        whatsapp:            settings.whatsapp            ?? '',
        announcement_text:   settings.announcement_text   ?? '',
        announcement_active: settings.announcement_active ?? false,
        vat_note:            settings.vat_note            ?? '',
        reservations_open:   settings.reservations_open   ?? true,
        telebirr_name:       settings.telebirr_name       ?? '',
        telebirr_number:     settings.telebirr_number     ?? '',
        cbe_name:            settings.cbe_name            ?? '',
        cbe_number:          settings.cbe_number          ?? '',
      });
    }
  }, [settings, reset]);

  const watchedAnnouncementActive = watch('announcement_active');
  const watchedReservationsOpen   = watch('reservations_open');

  async function onSubmit(values: SettingsFormValues) {
    try {
      await updateSettings.mutateAsync({
        whatsapp:            values.whatsapp            || null,
        announcement_text:   values.announcement_text   || null,
        announcement_active: values.announcement_active,
        vat_note:            values.vat_note            || null,
        reservations_open:   values.reservations_open,
        telebirr_name:       values.telebirr_name       || null,
        telebirr_number:     values.telebirr_number     || null,
        cbe_name:            values.cbe_name            || null,
        cbe_number:          values.cbe_number          || null,
      });
      toast.success('Settings saved successfully');
      reset(values); // clear dirty state
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to save settings');
    }
  }

  const labelClass = 'block text-sm font-medium text-espresso/70 mb-1.5';
  const inputClass = 'w-full rounded-xl border border-espresso/15 px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-terracotta transition-colors';

  if (isLoading) {
    return (
      <div>
        <h1 className="font-display text-3xl text-espresso mb-8">Settings</h1>
        <p className="text-espresso/40">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-espresso">Settings</h1>
          <p className="text-espresso/50 text-sm mt-1">Manage your restaurant configuration</p>
        </div>
        <button
          type="submit"
          form="settings-form"
          disabled={isSubmitting || !isDirty}
          className={cn(
            'btn btn-primary flex items-center gap-2',
            (!isDirty || isSubmitting) && 'opacity-50 cursor-not-allowed'
          )}
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-2xl">

        {/* Contact & WhatsApp */}
        <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-whatsapp/10 flex items-center justify-center">
              <MessageCircle size={16} className="text-whatsapp" />
            </div>
            <h2 className="font-semibold text-espresso">Contact</h2>
          </div>

          <div>
            <label className={labelClass}>WhatsApp Number</label>
            <input
              {...register('whatsapp')}
              className={inputClass}
              placeholder="+251 91 234 5678"
            />
            <p className="text-xs text-espresso/40 mt-1">
              Include country code, e.g. +251911234567 (used for the WhatsApp button)
            </p>
          </div>

          <div>
            <label className={labelClass}>
              <PhoneCall size={13} className="inline mr-1 text-espresso/50" />
              VAT / Footer Note
            </label>
            <input
              {...register('vat_note')}
              className={inputClass}
              placeholder="e.g. All prices include 15% VAT"
            />
          </div>
        </section>

        {/* Announcement */}
        <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Bell size={16} className="text-gold" />
            </div>
            <h2 className="font-semibold text-espresso">Announcement Banner</h2>
          </div>

          <Toggle
            value={watchedAnnouncementActive}
            onChange={(v) => setValue('announcement_active', v, { shouldDirty: true })}
            label="Show announcement banner on website"
          />

          <div>
            <label className={labelClass}>Announcement Text</label>
            <textarea
              {...register('announcement_text')}
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="e.g. Now open on Sundays! Join us for Sunday brunch from 9 AM – 2 PM."
            />
          </div>
        </section>

        {/* Reservations */}
        <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center">
              <Save size={16} className="text-terracotta" />
            </div>
            <h2 className="font-semibold text-espresso">Reservations</h2>
          </div>

          <Toggle
            value={watchedReservationsOpen}
            onChange={(v) => setValue('reservations_open', v, { shouldDirty: true })}
            label="Accept online reservations"
          />
          <p className="text-xs text-espresso/40 -mt-2">
            When disabled, the reservation form on the website will be hidden.
          </p>
        </section>

        {/* Payment accounts */}
        <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center">
              <Smartphone size={16} className="text-terracotta" />
            </div>
            <h2 className="font-semibold text-espresso">Payment accounts</h2>
          </div>
          <p className="text-xs text-espresso/50 -mt-2">
            Shown to customers at checkout. They&rsquo;ll transfer the total to one of these accounts and
            upload a screenshot for you to verify.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Smartphone size={13} className="inline mr-1 text-espresso/50" />
                Telebirr — account name
              </label>
              <input
                {...register('telebirr_name')}
                className={inputClass}
                placeholder="e.g. Yeroo Coffee PLC"
              />
            </div>
            <div>
              <label className={labelClass}>Telebirr — phone number</label>
              <input
                {...register('telebirr_number')}
                className={inputClass}
                placeholder="e.g. 0912345678"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Landmark size={13} className="inline mr-1 text-espresso/50" />
                CBE — account name
              </label>
              <input
                {...register('cbe_name')}
                className={inputClass}
                placeholder="e.g. Yeroo Coffee PLC"
              />
            </div>
            <div>
              <label className={labelClass}>CBE — account number</label>
              <input
                {...register('cbe_number')}
                className={inputClass}
                placeholder="e.g. 1000123456789"
              />
            </div>
          </div>
        </section>

        {/* Save button (bottom, for scrolled-down convenience) */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className={cn(
              'btn btn-primary flex items-center gap-2',
              (!isDirty || isSubmitting) && 'opacity-50 cursor-not-allowed'
            )}
            style={{ padding: '10px 28px', fontSize: 14 }}
          >
            <Save size={15} />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
