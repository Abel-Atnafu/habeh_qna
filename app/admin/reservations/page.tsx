'use client';

import { useState } from 'react';
import { Check, X, Phone, MessageCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useReservations, useUpdateReservationStatus } from '@/lib/queries';
import { Reservation } from '@/types';
import { formatDate, cn } from '@/lib/utils';

/* ─── Helpers ─────────────────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<Reservation['status'], string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: Reservation['status'] }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize', STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'cancelled'] as const;

/* ─── Side Panel ─────────────────────────────────────────────────────────────── */
function ReservationPanel({
  reservation,
  onClose,
  onConfirm,
  onCancel,
}: {
  reservation: Reservation;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onCancel:  (id: string) => void;
}) {
  const waLink = `https://wa.me/${reservation.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi ${reservation.name}, we're confirming your reservation at Yeroo Coffee on ${reservation.date} at ${reservation.time}.`
  )}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lift z-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-espresso/5">
          <h2 className="font-display text-lg text-espresso">Reservation Details</h2>
          <button
            onClick={onClose}
            className="text-espresso/40 hover:text-espresso transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs text-espresso/50 font-medium uppercase tracking-wide mb-1">Guest</p>
            <p className="text-espresso font-semibold text-lg">{reservation.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-espresso/50 font-medium uppercase tracking-wide mb-1">Date</p>
              <p className="text-espresso text-sm font-medium">{reservation.date}</p>
            </div>
            <div>
              <p className="text-xs text-espresso/50 font-medium uppercase tracking-wide mb-1">Time</p>
              <p className="text-espresso text-sm font-medium">{reservation.time}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-espresso/50 font-medium uppercase tracking-wide mb-1">Guests</p>
            <p className="text-espresso text-sm font-medium">{reservation.guests} {reservation.guests === 1 ? 'person' : 'people'}</p>
          </div>

          <div>
            <p className="text-xs text-espresso/50 font-medium uppercase tracking-wide mb-1">Phone</p>
            <p className="text-espresso text-sm font-medium">{reservation.phone}</p>
          </div>

          <div>
            <p className="text-xs text-espresso/50 font-medium uppercase tracking-wide mb-1">Status</p>
            <StatusBadge status={reservation.status} />
          </div>

          {reservation.special_requests && (
            <div>
              <p className="text-xs text-espresso/50 font-medium uppercase tracking-wide mb-1">Special Requests</p>
              <p className="text-espresso text-sm bg-cream-2 rounded-xl p-3">{reservation.special_requests}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-espresso/50 font-medium uppercase tracking-wide mb-1">Submitted</p>
            <p className="text-espresso/60 text-sm">{formatDate(reservation.created_at)}</p>
          </div>

          {/* Contact links */}
          <div className="flex gap-2 pt-1">
            <a
              href={`tel:${reservation.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-espresso/15 text-sm text-espresso hover:bg-cream-2 transition-colors"
            >
              <Phone size={14} />
              Call
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-whatsapp/30 text-sm text-whatsapp hover:bg-whatsapp/5 transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Actions */}
        {reservation.status !== 'cancelled' && (
          <div className="p-6 border-t border-espresso/5 flex flex-col gap-3">
            {reservation.status === 'pending' && (
              <button
                onClick={() => onConfirm(reservation.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <Check size={15} />
                Confirm Reservation
              </button>
            )}
            <button
              onClick={() => onCancel(reservation.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <X size={15} />
              Cancel Reservation
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function ReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter,   setDateFilter]   = useState('');
  const [selected,     setSelected]     = useState<Reservation | null>(null);

  const { data: reservations = [], isLoading } = useReservations({
    status: statusFilter,
    date:   dateFilter || undefined,
  });
  const updateStatus = useUpdateReservationStatus();

  async function handleConfirm(id: string) {
    try {
      await updateStatus.mutateAsync({ id, status: 'confirmed' });
      toast.success('Reservation confirmed');
      setSelected((prev) => prev?.id === id ? { ...prev, status: 'confirmed' } : prev);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Update failed');
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await updateStatus.mutateAsync({ id, status: 'cancelled' });
      toast.success('Reservation cancelled');
      setSelected((prev) => prev?.id === id ? { ...prev, status: 'cancelled' } : prev);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Update failed');
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-espresso">Reservations</h1>
        <span className="text-espresso/50 text-sm">{reservations.length} total</span>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Status pills */}
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors',
                statusFilter === s
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-espresso/60 hover:text-espresso border border-espresso/10'
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* Date picker */}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="ml-auto rounded-xl border border-espresso/15 px-3 py-1.5 text-sm text-espresso focus:outline-none focus:border-terracotta transition-colors"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="text-espresso/40 hover:text-espresso text-sm"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-espresso/5 bg-cream-2/60">
                <th className="text-left px-5 py-3 text-espresso/50 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-espresso/50 font-medium">Phone</th>
                <th className="text-left px-5 py-3 text-espresso/50 font-medium">Date</th>
                <th className="text-left px-5 py-3 text-espresso/50 font-medium">Time</th>
                <th className="text-left px-5 py-3 text-espresso/50 font-medium">Guests</th>
                <th className="text-left px-5 py-3 text-espresso/50 font-medium max-w-[180px]">Requests</th>
                <th className="text-left px-5 py-3 text-espresso/50 font-medium">Status</th>
                <th className="text-right px-5 py-3 text-espresso/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-espresso/40">Loading...</td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-espresso/40">No reservations found.</td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr
                    key={r.id}
                    className={cn(
                      'border-b border-espresso/5 last:border-0 hover:bg-cream-2/30 transition-colors cursor-pointer',
                      selected?.id === r.id && 'bg-terracotta/5'
                    )}
                    onClick={() => setSelected(r)}
                  >
                    <td className="px-5 py-3 font-medium text-espresso">{r.name}</td>
                    <td className="px-5 py-3 text-espresso/70">{r.phone}</td>
                    <td className="px-5 py-3 text-espresso/70">{r.date}</td>
                    <td className="px-5 py-3 text-espresso/70">{r.time}</td>
                    <td className="px-5 py-3 text-espresso/70">{r.guests}</td>
                    <td className="px-5 py-3 text-espresso/60 max-w-[180px]">
                      <span className="truncate block max-w-[160px]">
                        {r.special_requests || <span className="text-espresso/30">—</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {r.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(r.id)}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                            title="Confirm"
                          >
                            <Check size={15} />
                          </button>
                        )}
                        {r.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(r.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Cancel"
                          >
                            <X size={15} />
                          </button>
                        )}
                        <ChevronRight size={14} className="text-espresso/30 ml-1" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <ReservationPanel
          reservation={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
