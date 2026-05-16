import Link from 'next/link';
import { Check, Clock, XCircle, Receipt } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderItem } from '@/types';
import OrderRefresher from './OrderRefresher';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { tx_ref: string };
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: orderRow } = await supabase
    .from('orders')
    .select('*')
    .eq('tx_ref', params.tx_ref)
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
  const isPending = order.payment_status === 'pending';
  const isFailed = order.payment_status === 'failed';

  return (
    <main className="min-h-screen bg-cream-2 pt-10 pb-20">
      {/* Auto-refresh while the webhook settles the payment */}
      {isPending && <OrderRefresher txRef={params.tx_ref} />}

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
                ? 'Payment was not completed'
                : 'Awaiting payment confirmation…'}
            </h1>
            <p className="opacity-90 text-sm mt-2">
              {isPaid
                ? "Payment confirmed — we're preparing your order."
                : isFailed
                ? 'Please try again from the cart.'
                : 'This page will update automatically.'}
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
      </div>
    </main>
  );
}
