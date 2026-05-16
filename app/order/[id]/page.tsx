import Link from 'next/link';
import Image from 'next/image';
import { Check, Clock, XCircle, Receipt, FileImage } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderItem } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: orderRow } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  const order = orderRow as Order | null;

  if (!order) {
    return (
      <main className="min-h-screen bg-cream-2 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-card p-10 text-center max-w-md">
          <XCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h1 className="font-display text-2xl text-espresso mb-2">Order not found</h1>
          <p className="text-espresso/60 text-sm mb-6">
            The order reference is invalid or has been removed.
          </p>
          <Link href="/" className="btn btn-primary text-sm">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const { data: itemRows } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);
  const items = (itemRows ?? []) as OrderItem[];

  const isPaid = order.payment_status === 'paid';
  const isPending = order.payment_status === 'pending_review';
  const isFailed = order.payment_status === 'failed';

  return (
    <main className="min-h-screen bg-cream-2 pt-10 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Status banner */}
          <div
            className={
              isPaid
                ? 'bg-green-600 text-white px-6 py-8 text-center'
                : isFailed
                ? 'bg-red-600 text-white px-6 py-8 text-center'
                : 'bg-gold text-espresso px-6 py-8 text-center'
            }
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-3">
              {isPaid ? (
                <Check size={28} strokeWidth={2.5} />
              ) : isFailed ? (
                <XCircle size={28} strokeWidth={2.5} />
              ) : (
                <Clock size={28} strokeWidth={2.5} />
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl">
              {isPaid
                ? 'Thank you for your order!'
                : isFailed
                ? 'Payment could not be verified'
                : 'Payment under review'}
            </h1>
            <p className="opacity-90 text-sm mt-2">
              {isPaid
                ? "Payment verified — we're preparing your order."
                : isFailed
                ? 'Please contact us if you believe this is a mistake.'
                : 'We received your screenshot and will confirm your transfer shortly.'}
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 text-sm">
              <span className="inline-flex items-center gap-2 text-espresso/60">
                <Receipt size={16} className="text-terracotta" />
                Order #{order.order_number}
              </span>
              <span className="text-espresso/40 text-xs">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-y-2 text-sm mb-6">
              <dt className="text-espresso/50">Customer</dt>
              <dd className="font-medium text-espresso text-right">{order.customer_name}</dd>
              <dt className="text-espresso/50">Phone</dt>
              <dd className="font-medium text-espresso text-right">{order.phone}</dd>
              <dt className="text-espresso/50">Type</dt>
              <dd className="font-medium text-espresso text-right capitalize">{order.type}</dd>
              {order.delivery_address && (
                <>
                  <dt className="text-espresso/50">Address</dt>
                  <dd className="font-medium text-espresso text-right">{order.delivery_address}</dd>
                </>
              )}
              {order.payment_method && (
                <>
                  <dt className="text-espresso/50">Paid via</dt>
                  <dd className="font-medium text-espresso text-right capitalize">
                    {order.payment_method === 'cbe' ? 'CBE' : 'Telebirr'}
                  </dd>
                </>
              )}
              {order.payment_reference && (
                <>
                  <dt className="text-espresso/50">Reference</dt>
                  <dd className="font-mono text-xs text-espresso text-right break-all">
                    {order.payment_reference}
                  </dd>
                </>
              )}
            </dl>

            <div className="border-t border-espresso/10 pt-4">
              <ul className="space-y-2 mb-4">
                {items.map((line) => (
                  <li key={line.id} className="flex justify-between text-sm">
                    <span className="text-espresso">
                      <span className="text-espresso/40 mr-2">{line.qty}×</span>
                      {line.name}
                    </span>
                    <span className="text-espresso/70 tabular-nums">
                      {formatPrice(line.line_total)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-3 border-t border-espresso/10">
                <span className="font-semibold text-espresso">Total</span>
                <span className="font-display text-2xl text-terracotta font-bold">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {order.payment_proof_url && (
              <div className="mt-6 pt-6 border-t border-espresso/10">
                <p className="inline-flex items-center gap-2 text-xs text-espresso/50 mb-2">
                  <FileImage size={14} />
                  Your submitted screenshot
                </p>
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-cream-2">
                  <Image
                    src={order.payment_proof_url}
                    alt="Payment screenshot"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {isFailed && (
                <Link href="/cart" className="btn btn-primary flex-1 justify-center">
                  Try again
                </Link>
              )}
              <Link href="/" className="btn btn-dark flex-1 justify-center">
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {isPending && (
          <p className="text-center text-xs text-espresso/50 mt-4">
            You can safely close this page — we&rsquo;ll reach out at {order.phone} once your payment is confirmed.
          </p>
        )}
      </div>
    </main>
  );
}
