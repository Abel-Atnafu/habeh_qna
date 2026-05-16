'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Receipt, Clock, Truck, Check, ChefHat, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useOrders, useOrderItems, useUpdateOrderStatus } from '@/lib/queries';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatPrice, cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const STATUSES: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'received', label: 'Received' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string; icon: typeof Check }>> = {
  received: { next: 'preparing', label: 'Start preparing', icon: ChefHat },
  preparing: { next: 'ready', label: 'Mark ready', icon: Truck },
  ready: { next: 'completed', label: 'Mark completed', icon: Check },
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  received: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-espresso/10 text-espresso/60',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: orders = [], isLoading, refetch } = useOrders({ status: filter });
  const updateStatus = useUpdateOrderStatus();
  const qc = useQueryClient();

  const selected = useMemo<Order | null>(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );
  const { data: orderItems = [] } = useOrderItems(selectedId);

  // ── Realtime: invalidate the query whenever the orders table changes ──
  useEffect(() => {
    const sb = getSupabaseClient();
    const channel = sb
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => qc.invalidateQueries({ queryKey: ['orders'] }),
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [qc]);

  async function handleAdvance(o: Order) {
    const next = NEXT_STATUS[o.status]?.next;
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ id: o.id, status: next });
      toast.success(`Order #${o.order_number} → ${next}`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  async function handleCancel(o: Order) {
    if (!confirm(`Cancel order #${o.order_number}?`)) return;
    try {
      await updateStatus.mutateAsync({ id: o.id, status: 'cancelled' });
      toast.success(`Order #${o.order_number} cancelled`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-espresso flex items-center gap-3">
          <ShoppingBag size={26} className="text-terracotta" />
          Orders
        </h1>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-xs text-espresso/60 hover:text-espresso transition-colors"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setFilter(s.value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all',
              filter === s.value
                ? 'bg-espresso text-cream'
                : 'bg-white text-espresso/60 border border-espresso/10 hover:border-espresso/30',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* List */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/5 bg-cream-2/60">
                  <th className="text-left px-4 py-3 text-espresso/50 font-medium">Order</th>
                  <th className="text-left px-4 py-3 text-espresso/50 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-espresso/50 font-medium">Type</th>
                  <th className="text-right px-4 py-3 text-espresso/50 font-medium">Total</th>
                  <th className="text-center px-4 py-3 text-espresso/50 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-espresso/50 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-espresso/40">
                      Loading…
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-espresso/40">
                      <Receipt size={32} className="mx-auto mb-3 opacity-50" />
                      No paid orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const next = NEXT_STATUS[o.status];
                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedId(o.id)}
                        className={cn(
                          'border-b border-espresso/5 last:border-0 cursor-pointer transition-colors',
                          selectedId === o.id ? 'bg-cream-2/60' : 'hover:bg-cream-2/30',
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-espresso">#{o.order_number}</div>
                          <div className="text-xs text-espresso/40 mt-0.5 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(o.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-espresso">{o.customer_name}</div>
                          <div className="text-xs text-espresso/40">{o.phone}</div>
                        </td>
                        <td className="px-4 py-3 capitalize text-espresso/70">{o.type}</td>
                        <td className="px-4 py-3 text-right font-medium text-espresso tabular-nums">
                          {formatPrice(o.total)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                              STATUS_STYLES[o.status],
                            )}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {next ? (
                            <button
                              type="button"
                              onClick={() => handleAdvance(o)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-terracotta text-white hover:bg-terracotta-dark transition-colors"
                            >
                              <next.icon size={12} />
                              {next.label}
                            </button>
                          ) : (
                            <span className="text-xs text-espresso/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <aside className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-6 h-fit">
          {!selected ? (
            <div className="text-center py-10 text-espresso/40">
              <Receipt size={28} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select an order to view details</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-espresso">
                  #{selected.order_number}
                </h2>
                <span
                  className={cn(
                    'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                    STATUS_STYLES[selected.status],
                  )}
                >
                  {selected.status}
                </span>
              </div>

              <dl className="text-sm space-y-2 mb-4 pb-4 border-b border-espresso/5">
                <Row label="Customer" value={selected.customer_name ?? '—'} />
                <Row label="Phone" value={selected.phone ?? '—'} />
                {selected.email && <Row label="Email" value={selected.email} />}
                <Row label="Type" value={selected.type} />
                {selected.delivery_address && (
                  <Row label="Address" value={selected.delivery_address} />
                )}
                {selected.notes && <Row label="Notes" value={selected.notes} />}
              </dl>

              <ul className="space-y-2 text-sm mb-4">
                {orderItems.map((line) => (
                  <li key={line.id} className="flex justify-between">
                    <span>
                      <span className="text-espresso/40 mr-2">{line.qty}×</span>
                      {line.name}
                    </span>
                    <span className="tabular-nums">{formatPrice(line.line_total)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-3 border-t border-espresso/10">
                <span className="font-semibold text-espresso">Total</span>
                <span className="font-display text-xl text-terracotta font-bold">
                  {formatPrice(selected.total)}
                </span>
              </div>

              {selected.status !== 'completed' && selected.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => handleCancel(selected)}
                  className="w-full mt-4 text-xs text-red-500 hover:text-red-600 underline underline-offset-2"
                >
                  Cancel order
                </button>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-espresso/50 shrink-0">{label}</dt>
      <dd className="font-medium text-espresso text-right capitalize">{value}</dd>
    </div>
  );
}
