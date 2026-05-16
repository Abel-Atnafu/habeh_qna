'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  Smartphone,
  Landmark,
  UploadCloud,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/providers/CartProvider';
import { useSettings } from '@/lib/queries';
import { useI18n } from '@/lib/i18n';
import { formatPrice, cn } from '@/lib/utils';

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PROOF = ['image/jpeg', 'image/png', 'image/webp'];

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(9, 'Enter a valid phone number'),
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    delivery_type: z.enum(['pickup', 'delivery']),
    delivery_address: z.string().optional(),
    notes: z.string().optional(),
    payment_method: z.enum(['telebirr', 'cbe']),
    payment_reference: z.string().min(3, 'Enter the transaction reference'),
  })
  .refine(
    (d) => d.delivery_type === 'pickup' || (d.delivery_address?.trim().length ?? 0) > 0,
    { message: 'Delivery address required', path: ['delivery_address'] },
  );

type FormValues = z.infer<typeof schema>;

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success('Copied');
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error('Could not copy');
        }
      }}
      className="inline-flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function CheckoutPage() {
  const { lines, subtotal, count, clear, hydrated } = useCart();
  const { data: settings } = useSettings();
  const { t } = useI18n();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { delivery_type: 'pickup', payment_method: 'telebirr' },
  });

  const deliveryType = watch('delivery_type');
  const paymentMethod = watch('payment_method');

  function handleProofFile(file: File | null) {
    setProofError(null);
    if (!file) {
      setProofFile(null);
      return;
    }
    if (!ACCEPTED_PROOF.includes(file.type)) {
      setProofError('JPG, PNG or WebP only');
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      setProofError('Max 5 MB');
      return;
    }
    setProofFile(file);
  }

  async function onSubmit(values: FormValues) {
    if (lines.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (!proofFile) {
      setProofError('Upload your payment screenshot');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.set('lines', JSON.stringify(lines.map((l) => ({ menu_item_id: l.menu_item_id, qty: l.qty }))));
      form.set('name', values.name);
      form.set('phone', values.phone);
      if (values.email) form.set('email', values.email);
      form.set('delivery_type', values.delivery_type);
      if (values.delivery_address) form.set('delivery_address', values.delivery_address);
      if (values.notes) form.set('notes', values.notes);
      form.set('payment_method', values.payment_method);
      form.set('payment_reference', values.payment_reference);
      form.set('payment_proof', proofFile);

      const res = await fetch('/api/checkout/create', { method: 'POST', body: form });
      const body = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
      if (!res.ok) throw new Error(body.error || 'Checkout failed');

      clear();
      router.push(`/order/${body.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      toast.error(msg);
      setSubmitting(false);
    }
  }

  if (hydrated && count === 0 && !submitting) {
    router.replace('/cart');
  }

  const accountName =
    paymentMethod === 'telebirr' ? settings?.telebirr_name : settings?.cbe_name;
  const accountNumber =
    paymentMethod === 'telebirr' ? settings?.telebirr_number : settings?.cbe_number;
  const accountConfigured = !!accountNumber;

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
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-card p-6 sm:p-8 space-y-6">
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
                    <input type="radio" value={opt} {...register('delivery_type')} className="sr-only" />
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

            {/* ── Payment ── */}
            <div className="pt-4 border-t border-espresso/10">
              <h2 className="font-display text-xl text-espresso mb-1">Payment</h2>
              <p className="text-xs text-espresso/50 mb-4">
                Transfer the total below to one of the accounts and upload a screenshot of the confirmation.
              </p>

              <span className={labelCls}>Payment method</span>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {(
                  [
                    { value: 'telebirr', label: 'Telebirr', Icon: Smartphone },
                    { value: 'cbe', label: 'CBE Birr / Bank', Icon: Landmark },
                  ] as const
                ).map(({ value, label, Icon }) => (
                  <label
                    key={value}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-all',
                      paymentMethod === value
                        ? 'border-terracotta bg-terracotta/5 text-terracotta'
                        : 'border-espresso/15 text-espresso/60 hover:border-espresso/30',
                    )}
                  >
                    <input type="radio" value={value} {...register('payment_method')} className="sr-only" />
                    <Icon size={16} />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>

              {/* Account display */}
              {accountConfigured ? (
                <div className="rounded-xl bg-cream-2 p-4 mb-5 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-espresso/50">Account name</span>
                    <span className="font-medium text-espresso">{accountName || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-espresso/50">{paymentMethod === 'telebirr' ? 'Phone number' : 'Account number'}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-medium text-espresso">{accountNumber}</span>
                      <CopyButton value={accountNumber!} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-espresso/5">
                    <span className="text-espresso/50">Amount to transfer</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-medium text-terracotta">{formatPrice(subtotal)}</span>
                      <CopyButton value={String(subtotal)} />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 text-amber-800 p-3 mb-5 text-xs">
                  {paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'} account details haven&rsquo;t been
                  configured yet. Please contact the cafe by phone before paying.
                </div>
              )}

              <div className="mb-5">
                <label className={labelCls}>Transaction reference *</label>
                <input
                  {...register('payment_reference')}
                  className={inputCls}
                  placeholder={paymentMethod === 'telebirr' ? 'e.g. CIU3K7P8M2' : 'e.g. FT24A8B1234'}
                />
                <p className="text-xs text-espresso/40 mt-1">
                  The confirmation number from your {paymentMethod === 'telebirr' ? 'Telebirr SMS' : 'transfer receipt'}.
                </p>
                {errors.payment_reference && (
                  <p className="text-red-500 text-xs mt-1">{errors.payment_reference.message}</p>
                )}
              </div>

              <div>
                <span className={labelCls}>Payment screenshot *</span>
                {proofFile ? (
                  <div className="relative rounded-xl overflow-hidden border border-espresso/10 bg-cream-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(proofFile)}
                      alt="Payment proof preview"
                      className="w-full h-56 object-contain bg-espresso/5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProofFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-espresso/80 text-cream hover:bg-espresso transition-colors"
                      aria-label="Remove screenshot"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer',
                      'border-espresso/20 bg-cream-2/40 hover:bg-cream-2 hover:border-terracotta/50 transition-colors',
                      'h-40 text-center px-4',
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_PROOF.join(',')}
                      className="sr-only"
                      onChange={(e) => handleProofFile(e.target.files?.[0] ?? null)}
                    />
                    <UploadCloud size={24} className="text-terracotta/80" />
                    <span className="text-sm text-espresso/70 font-medium">Tap or drop screenshot</span>
                    <span className="text-[11px] text-espresso/40">JPG, PNG or WebP · max 5 MB</span>
                  </label>
                )}
                {proofError && <p className="text-red-500 text-xs mt-1">{proofError}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || count === 0}
              className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting order…
                </>
              ) : (
                'Submit order'
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
