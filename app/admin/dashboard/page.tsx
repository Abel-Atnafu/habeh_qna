'use client';

import Link from 'next/link';
import { Calendar, Star, UtensilsCrossed, ImageIcon, ShoppingBag } from 'lucide-react';
import {
  useAdminStats,
  useReservations,
  useTestimonials,
} from '@/lib/queries';
import { formatDate } from '@/lib/utils';
import { Reservation } from '@/types';

/* ─── Status badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Reservation['status'] }) {
  const map = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  } as const;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

/* ─── Stat card ────────────────────────────────────────────────────────────── */
function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="font-display text-4xl font-bold text-espresso">{value}</p>
        <p className="text-sm text-espresso/60 mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data: stats } = useAdminStats();
  const { data: reservations = [] } = useReservations();
  const { data: allTestimonials = [] } = useTestimonials(false);

  const recentReservations = reservations.slice(0, 10);
  const pendingReviews = allTestimonials.filter((t) => !t.visible);

  return (
    <div>
      <h1 className="font-display text-3xl text-espresso mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        <StatCard
          icon={<ShoppingBag size={22} className="text-terracotta" />}
          iconBg="bg-terracotta/10"
          value={stats?.activeOrders ?? 0}
          label="Active Orders"
        />
        <StatCard
          icon={<Calendar size={22} className="text-terracotta" />}
          iconBg="bg-terracotta/10"
          value={stats?.todayReservations ?? 0}
          label="Today's Reservations"
        />
        <StatCard
          icon={<Star size={22} className="text-gold" />}
          iconBg="bg-gold/10"
          value={stats?.pendingReviews ?? 0}
          label="Pending Reviews"
        />
        <StatCard
          icon={<UtensilsCrossed size={22} className="text-forest" />}
          iconBg="bg-forest/10"
          value={stats?.activeMenuItems ?? 0}
          label="Active Menu Items"
        />
        <StatCard
          icon={<ImageIcon size={22} className="text-coffee" />}
          iconBg="bg-coffee/10"
          value={stats?.galleryItems ?? 0}
          label="Gallery Items"
        />
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-espresso/5 flex items-center justify-between">
          <h2 className="font-display text-lg text-espresso">Recent Reservations</h2>
          <Link href="/admin/reservations" className="text-terracotta text-sm hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-espresso/5 bg-cream-2/60">
                <th className="text-left px-6 py-3 text-espresso/50 font-medium">Name</th>
                <th className="text-left px-6 py-3 text-espresso/50 font-medium">Date</th>
                <th className="text-left px-6 py-3 text-espresso/50 font-medium">Time</th>
                <th className="text-left px-6 py-3 text-espresso/50 font-medium">Guests</th>
                <th className="text-left px-6 py-3 text-espresso/50 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-espresso/50 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-espresso/40">
                    No reservations yet.
                  </td>
                </tr>
              ) : (
                recentReservations.map((r) => (
                  <tr key={r.id} className="border-b border-espresso/5 last:border-0 hover:bg-cream-2/40 transition-colors">
                    <td className="px-6 py-3 font-medium text-espresso">{r.name}</td>
                    <td className="px-6 py-3 text-espresso/70">{r.date}</td>
                    <td className="px-6 py-3 text-espresso/70">{r.time}</td>
                    <td className="px-6 py-3 text-espresso/70">{r.guests}</td>
                    <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-3 text-espresso/50">{formatDate(r.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-espresso">Pending Reviews</h2>
            <p className="text-espresso/60 text-sm mt-1">
              {pendingReviews.length === 0
                ? 'No reviews awaiting approval.'
                : `${pendingReviews.length} review${pendingReviews.length > 1 ? 's' : ''} awaiting approval`}
            </p>
          </div>
          <Link href="/admin/reviews" className="btn btn-primary text-sm" style={{ padding: '10px 20px', fontSize: 13 }}>
            Manage Reviews
          </Link>
        </div>
      </div>
    </div>
  );
}
