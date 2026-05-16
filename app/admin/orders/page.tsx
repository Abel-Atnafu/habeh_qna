'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Receipt,
  Clock,
  Truck,
  Check,
  ChefHat,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  FileImage,
  ExternalLink,
  Search,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  useOrders,
  useOrderItems,
  useUpdateOrderStatus,
  useVerifyPayment,
  useRejectPayment,
  useOrderCounts,
} from '@/lib/queries';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatPrice, cn } from '@/lib/utils';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

type Tab = 'pending_review' | 'paid' | 'failed';
type SortCol = 'date' | 'total';

const TABS: { value: Tab; label: string; description: string }[] = [
  { value: 'pending_review', label: 'Pending review', description: 'Customers awaiting payment verification' },
  { value: 'paid', label: 'Paid', description: 'Verified orders ready to fulfil' },
  { value: 'failed', label: 'Rejected', description: 'Payments you marked invalid' },
];

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

const PAY_STYLES: Record<PaymentStatus, string> = {
  pending_review: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-espresso/10 text-espresso/60',
};

function formatOrderTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? time : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${time}`;
}

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>('pending_review');
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: orders = [], isLoading, refetch } = useOrders({
    paymentStatus: tab,
    status: tab === 'paid' ? filter : 'all',
  });
  const { data: counts } = useOrderCounts();
  const updateStatus = useUpdateOrderStatus();
  const verifyPayment = useVerifyPayment();
  const rejectPayment = useRejectPayment();
  const qc = useQueryClient();

  const selected = useMemo<Order | null>(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  );
  const { data: orderItems = [] } = useOrderItems(selectedId);

  const displayOrders = useMemo(() => {
    let list = orders;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.customer_name?.toLowerCase().includes(q) ||
          o.phone?.includes(q) ||
          String(o.order_number).includes(q),
      );
    }
    if (sortCol) {
      list = [...list].sort((a, b) => {
        const diff =
          sortCol === 'date'
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : a.total - b.total;
        return sortDir === 'asc' ? diff : -diff;
      });
    }
    return list;
  }, [orders, search, sortCol, sortDir]);

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col) return <ArrowUpDown size={11} className="text-espresso/30" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-terracotta" />
      : <ChevronDown size={11} className="text-terracotta" />;
  }

  // Realtime: invalidate on any orders row change
  useEffect(() => {
    const sb = getSupabaseClient();
    const channel = sb
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        qc.invalidateQueries({ queryKey: ['orders'] });
        qc.invalidateQueries({ queryKey: ['order_counts'] });
      })
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

  async function handleVerify(o: Order) {
    try {
      await verifyPayment.mutateAsync(o.id);
      toast.success(`Order #${o.order_number} payment verified`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  async function handleReject(o: Order) {
    if (!confirm(`Reject payment for order #${o.order_number}? The customer will see "Payment could not be verified".`)) {
      return;
    }
    try {
      await rejectPayment.mutateAsync(o.id);
      toast.success(`Order #${o.order_number} payment rejected`);
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

      {/* Payment-status tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {TABS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => {
              setTab(s.value);
              setSelectedId(null);
              setFilter('all');
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all',
              tab === s.value
                ? 'bg-espresso text-cream'
                : 'bg-white text-espresso/60 border border-espresso/10 hover:border-espresso/30',
            )}
          >
            {s.label}
            {counts !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-[16px] h-4 px-1',
                  tab === s.value ? 'bg-cream/20 text-cream' : 'bg-espresso/10 text-espresso/60',
                )}
              >
                {counts[s.value]}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-espresso/40 mb-5">
        {TABS.find((s) => s.value === tab)?.description}
      </p>

      {/* Fulfilment status sub-filter only meaningful for paid orders */}
      {tab === 'paid' && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setFilter(s.value)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap transition-all',
                filter === s.value
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-espresso/60 border border-espresso/10 hover:border-espresso/30',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40 pointer-events-none" />
        <input
          type="search"
          placeholder="Search by name, phone, or order #…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-espresso/10 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 placeholder:text-espresso/30"
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* List */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/5 bg-cream-2/60">
                  <th className="text-left px-4 py-3 text-espresso/50 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('date')}
                      className="inline-flex items-center gap-1 hover:text-espresso transition-colors"
                    >
                      Order
                      <SortIcon col="date" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-espresso/50 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-espresso/50 font-medium">Method</th>
                  <th className="text-right px-4 py-3 text-espresso/50 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort('total')}
                      className="inline-flex items-center gap-1 hover:text-espresso transition-colors ml-auto"
                    >
                      <SortIcon col="total" />
                      Total
                    </button>
                  </th>
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
                      No orders in this view.
                    </td>
                  </tr>
                ) : displayOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-espresso/40">
                      No orders match your search.
                    </td>
                  </tr>
                ) : (
                  displayOrders.map((o) => {
                    const isPending = o.payment_status === 'pending_review';
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
                            {formatOrderTime(o.created_at)}
                          </div>
                          <span
                            className={cn(
                              'inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize',
                              o.type === 'delivery'
                                ? 'bg-blue-100 text-blue-600'
                                : o.type === 'dine-in'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-amber-100 text-amber-700',
                            )}
                          >
                            {o.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-espresso">{o.customer_name}</div>
                          <div className="text-xs text-espresso/40">{o.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center font-medium text-xs px-2 py-0.5 rounded-full',
                              o.payment_method === 'cbe'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700',
                            )}
                          >
                            {o.payment_method === 'cbe' ? 'CBE' : 'Telebirr'}
                          </span>
                          {o.payment_reference && (
                            <div className="text-[10px] text-espresso/40 font-mono mt-0.5">
                              {o.payment_reference}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-espresso tabular-nums">
                          {formatPrice(o.total)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isPending ? (
                            <span
                              className={cn(
                                'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium',
                                PAY_STYLES.pending_review,
                              )}
                            >
                              Pending review
                            </span>
                          ) : (
                            <span
                              className={cn(
                                'inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                                STATUS_STYLES[o.status],
                              )}
                            >
                              {o.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleVerify(o)}
                                disabled={verifyPayment.isPending}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
                              >
                                <ShieldCheck size={12} />
                                Verify
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(o)}
                                disabled={rejectPayment.isPending}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-60"
                              >
                                <ShieldOff size={12} />
                                Reject
                              </button>
                            </div>
                          ) : next ? (
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
                    selected.payment_status === 'pending_review'
                      ? PAY_STYLES.pending_review
                      : STATUS_STYLES[selected.status],
                  )}
                >
                  {selected.payment_status === 'pending_review' ? 'Pending review' : selected.status}
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
                <Row
                  label="Placed"
                  value={new Date(selected.created_at).toLocaleString([], {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              </dl>

              {/* Payment block */}
              <div className="text-sm space-y-2 mb-4 pb-4 border-b border-espresso/5">
                <Row
                  label="Method"
                  value={selected.payment_method === 'cbe' ? 'CBE' : selected.payment_method ?? '—'}
                />
                {selected.payment_reference && (
                  <Row label="Reference" value={selected.payment_reference} mono />
                )}

                {selected.payment_proof_url && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 text-xs text-espresso/50">
                        <FileImage size={12} />
                        Screenshot
                      </span>
                      <a
                        href={selected.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark transition-colors"
                      >
                        Open full size
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    <a
                      href={selected.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block w-full h-56 rounded-xl overflow-hidden bg-cream-2"
                    >
                      <Image
                        src={selected.payment_proof_url}
                        alt={`Payment proof for order #${selected.order_number}`}
                        fill
                        className="object-contain"
                        sizes="400px"
                      />
                    </a>
                  </div>
                )}
              </div>

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

              {selected.payment_status === 'pending_review' && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleVerify(selected)}
                    disabled={verifyPayment.isPending}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    <ShieldCheck size={14} />
                    Verify payment
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(selected)}
                    disabled={rejectPayment.isPending}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60"
                  >
                    <ShieldOff size={14} />
                    Reject
                  </button>
                </div>
              )}

              {selected.payment_status === 'paid' &&
                selected.status !== 'completed' &&
                selected.status !== 'cancelled' && (
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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-espresso/50 shrink-0">{label}</dt>
      <dd
        className={cn(
          'font-medium text-espresso text-right break-all',
          mono ? 'font-mono text-xs' : 'capitalize',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
