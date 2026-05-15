'use client';

import { useState } from 'react';
import { Star, Trash2, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  useTestimonials,
  useUpdateTestimonialVisibility,
  useDeleteTestimonial,
} from '@/lib/queries';
import { Testimonial } from '@/types';
import { formatDate, cn } from '@/lib/utils';

/* ─── Star display ───────────────────────────────────────────────────────────── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-gold fill-gold' : 'text-espresso/15'}
          fill={i < rating ? '#C9A961' : 'none'}
        />
      ))}
    </div>
  );
}

/* ─── Review Card ────────────────────────────────────────────────────────────── */
function ReviewCard({
  testimonial,
  tab,
  onApprove,
  onHide,
  onDelete,
}: {
  testimonial: Testimonial;
  tab: 'pending' | 'approved';
  onApprove: (id: string) => void;
  onHide:    (id: string) => void;
  onDelete:  (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-card flex flex-col gap-3">
      {/* Stars + Date */}
      <div className="flex items-center justify-between">
        <StarRating rating={testimonial.rating} />
        <span className="text-xs text-espresso/40">{formatDate(testimonial.created_at)}</span>
      </div>

      {/* Name */}
      <p className="font-semibold text-espresso text-sm">{testimonial.name}</p>

      {/* Body */}
      <p className="text-espresso/70 text-sm leading-relaxed flex-1">{testimonial.body}</p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-espresso/5">
        {tab === 'pending' ? (
          <>
            <button
              onClick={() => onApprove(testimonial.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-xs font-medium"
            >
              <Check size={13} />
              Approve
            </button>
            <button
              onClick={() => onDelete(testimonial.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-xs font-medium"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onHide(testimonial.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-espresso/5 text-espresso/70 hover:bg-espresso/10 transition-colors text-xs font-medium"
            >
              <EyeOff size={13} />
              Hide
            </button>
            <button
              onClick={() => onDelete(testimonial.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-xs font-medium"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function ReviewsPage() {
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');

  const { data: allTestimonials = [], isLoading } = useTestimonials(false);
  const updateVisibility = useUpdateTestimonialVisibility();
  const deleteTestimonial = useDeleteTestimonial();

  const pending  = allTestimonials.filter((t) => !t.visible);
  const approved = allTestimonials.filter((t) => t.visible);
  const displayed = tab === 'pending' ? pending : approved;

  async function handleApprove(id: string) {
    try {
      await updateVisibility.mutateAsync({ id, visible: true });
      toast.success('Review approved');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to approve');
    }
  }

  async function handleHide(id: string) {
    try {
      await updateVisibility.mutateAsync({ id, visible: false });
      toast.success('Review hidden');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to hide');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await deleteTestimonial.mutateAsync(id);
      toast.success('Review deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Delete failed');
    }
  }

  async function handleApproveAll() {
    if (pending.length === 0) return;
    if (!confirm(`Approve all ${pending.length} pending reviews?`)) return;
    try {
      await Promise.all(pending.map((t) => updateVisibility.mutateAsync({ id: t.id, visible: true })));
      toast.success(`${pending.length} reviews approved`);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to approve all');
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-espresso">Reviews</h1>
        {tab === 'pending' && pending.length > 0 && (
          <button
            onClick={handleApproveAll}
            className="btn btn-primary flex items-center gap-2"
            style={{ padding: '10px 20px', fontSize: 14 }}
          >
            <Eye size={15} />
            Approve All ({pending.length})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(['pending', 'approved'] as const).map((t) => {
          const count = t === 'pending' ? pending.length : approved.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors flex items-center gap-2',
                tab === t
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-espresso/60 hover:text-espresso border border-espresso/10'
              )}
            >
              {t}
              <span className={cn(
                'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                tab === t ? 'bg-white/20 text-white' : 'bg-espresso/8 text-espresso/60'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {isLoading ? (
        <p className="text-espresso/40 text-center py-12">Loading reviews...</p>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <p className="text-espresso/40">
            {tab === 'pending' ? 'No reviews awaiting approval.' : 'No approved reviews yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((t) => (
            <ReviewCard
              key={t.id}
              testimonial={t}
              tab={tab}
              onApprove={handleApprove}
              onHide={handleHide}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
