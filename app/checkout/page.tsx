'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/providers/CartProvider';
import { useI18n } from '@/lib/i18n';
import { formatPrice, cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(9, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  delivery_type: z.enum(['pickup', 'delivery']),
  delivery_address: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.delivery_type === 'pickup' || (data.delivery_address?.trim().length ?? 0) > 0,
  { message: 'Delivery address required', path: ['delivery_address'] },
);

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { lines, subtotal, count, clear, hydrated } = useCart();
  const { t } = useI18n();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { delivery_type: 'pickup' },
  });

  const deliveryType = watch('delivery_type');

  const onSubmit = async (data: FormData) => {
    if (lines.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: lines.map((l) => ({ menu_item_id: l.menu_item_id, qty: l.qty })),
          customer: {
            name: data.name,
            phone: data.phone,
            email: data.email || undefined,
          },
          delivery: {
            type: data.delivery_type,
            address: data.delivery_address,
          },
          notes: data.notes,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Checkout failed');
      }
      clear();
      window.location.href = body.checkout_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  if (hydrated && count === 0 && !submitting) {
    router.replace('/cart');
  }

  const inputCls =
    'w-full rounded-xl border border-espresso/15 px-4 py-3 text-sm text-espresso focus:outline-none focus:border-terracotta transition-colors';
  const labelCls = 'block text-sm font-medium text-espresso/70 mb-1.5';

  return (
    <main className="min-h-screen bg-cream-2 pt-10 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-espresso/60 hover:text-espresso transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {t('checkout_back')}
        </Link>

        <h1 className="font-display text-3xl md:text-4xl text-espresso mb-8">
          {t('checkout_title')}
        </h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-card p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-xl text-espresso">{t('checkout_contact')}</h2>

            <div>
              <label className={labelCls}>{t('form_name')} *</label>
              <input {...register('name')} className={inputCls} autoComplete="name" placeholder="Abebe Kebede" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t('form_phone')} *</label>
                <input {...register('phone')} className={inputCls} autoComplete="tel" placeholder="+251 9__ __ __ __" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input {...register('email')} className={inputCls} autoComplete="email" type="email" placeholder="you@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <span className={labelCls}>{t('checkout_delivery')} / {t('checkout_pickup')}</span>
              <div className="grid grid-cols-2 gap-3">
                {(['pickup', 'delivery'] as const).map((opt) => (
                  <label
                    key={opt}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-all',
                      deliveryType === opt
                        ? 'border-terracotta bg-terracotta/5 text-terracotta'
                        : 'border-espresso/15 text-espresso/60 hover:border-espresso/30',
                    )}
                  >
                    <input
                      type="radio"
                      value={opt}
                      {...register('delivery_type')}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium capitalize">
                      {opt === 'pickup' ? t('checkout_pickup') : t('checkout_delivery')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <div>
                <label className={labelCls}>{t('checkout_address')} *</label>
                <input
                  {...register('delivery_address')}
                  className={inputCls}
                  placeholder={t('checkout_address_placeholder')}
                />
                {errors.delivery_address && (
                  <p className="text-red-500 text-xs mt-1">{errors.delivery_address.message}</p>
                )}
              </div>
            )}

            <div>
              <label className={labelCls}>{t('checkout_notes')}</label>
              <textarea
                {...register('notes')}
                rows={3}
                className={cn(inputCls, 'resize-none')}
                placeholder={t('checkout_notes_placeholder')}
              />
            </div>

            <div className="rounded-xl bg-cream-2 p-3 text-xs text-espresso/60 flex items-start gap-2">
              <Shield size={14} className="text-terracotta shrink-0 mt-0.5" />
              <span>{t('checkout_securely')}</span>
            </div>

            <button
              type="submit"
              disabled={submitting || count === 0}
              className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Redirecting to Chapa…
                </>
              ) : (
                t('checkout_pay')
              )}
            </button>
          </form>

          {/* ── Order summary ── */}
          <aside className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-6 h-fit">
            <h2 className="font-display text-lg text-espresso mb-4">Summary</h2>
            <ul className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
              {lines.map((l) => (
                <li key={l.menu_item_id} className="flex gap-3 text-sm">
                  <span className="w-6 text-espresso/40 shrink-0">{l.qty}×</span>
                  <span className="flex-1 text-espresso">{l.name}</span>
                  <span className="text-espresso/70 tabular-nums">
                    {formatPrice(l.price * l.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-4 border-t border-espresso/5">
              <span className="font-semibold text-espresso">{t('cart_total')}</span>
              <span className="font-display text-xl text-terracotta font-bold">
                {formatPrice(subtotal)}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
