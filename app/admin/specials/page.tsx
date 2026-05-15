'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import {
  useDailySpecials,
  useCreateDailySpecial,
  useUpdateDailySpecial,
  useDeleteDailySpecial,
} from '@/lib/queries';
import { DailySpecial } from '@/types';
import { formatPrice, cn } from '@/lib/utils';

/* ─── Schema ─────────────────────────────────────────────────────────────────── */
const specialSchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price:       z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a valid price'),
  valid_date:  z.string().min(1, 'Date is required'),
  image_url:   z.string().url('Must be a valid URL').optional().or(z.literal('')),
  active:      z.boolean(),
});

type SpecialFormValues = z.infer<typeof specialSchema>;

/* ─── Active Toggle ──────────────────────────────────────────────────────────── */
function ActiveToggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={cn(
        'relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none',
        active ? 'bg-terracotta' : 'bg-gray-200'
      )}
      aria-label="Toggle active"
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          active ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

/* ─── Special Modal ──────────────────────────────────────────────────────────── */
function SpecialModal({
  special,
  onClose,
}: {
  special: DailySpecial | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(special);
  const createSpecial = useCreateDailySpecial();
  const updateSpecial = useUpdateDailySpecial();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<SpecialFormValues>({
    resolver: zodResolver(specialSchema),
    defaultValues: {
      title:       special?.title                    ?? '',
      description: special?.description              ?? '',
      price:       String(special?.price             ?? 0),
      valid_date:  special?.valid_date               ?? new Date().toISOString().split('T')[0],
      image_url:   special?.image_url                ?? '',
      active:      special?.active                   ?? true,
    },
  });

  const watchedActive = watch('active');

  async function onSubmit(values: SpecialFormValues) {
    try {
      const payload = {
        ...values,
        price:       Number(values.price),
        image_url:   values.image_url   || null,
        description: values.description || null,
      };
      if (isEdit && special) {
        await updateSpecial.mutateAsync({ id: special.id, ...payload });
        toast.success('Special updated');
      } else {
        await createSpecial.mutateAsync(payload);
        toast.success('Special created');
      }
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Something went wrong');
    }
  }

  const labelClass = 'block text-sm font-medium text-espresso/70 mb-1';
  const inputClass = 'w-full rounded-xl border border-espresso/15 px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-terracotta transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lift">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-espresso">
            {isEdit ? 'Edit Special' : 'Add Daily Special'}
          </h2>
          <button onClick={onClose} className="text-espresso/40 hover:text-espresso transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Title *</label>
            <input {...register('title')} className={inputClass} placeholder="e.g. Lunch Special Combo" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              {...register('description')}
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="What's included..."
            />
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>Price (Birr) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price')}
              className={inputClass}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>

          {/* Valid Date */}
          <div>
            <label className={labelClass}>Valid Date *</label>
            <input type="date" {...register('valid_date')} className={inputClass} />
            {errors.valid_date && <p className="text-red-500 text-xs mt-1">{errors.valid_date.message}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label className={labelClass}>Image URL</label>
            <input type="url" {...register('image_url')} className={inputClass} placeholder="https://..." />
            {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url.message}</p>}
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <ActiveToggle active={watchedActive} onChange={(v) => setValue('active', v)} />
            <label className="text-sm text-espresso">Active (show on website)</label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-espresso/15 text-sm text-espresso hover:bg-cream-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn btn-primary"
              style={{ padding: '10px 20px', fontSize: 14 }}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Special'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function SpecialsPage() {
  const { data: specials = [], isLoading } = useDailySpecials();
  const updateSpecial = useUpdateDailySpecial();
  const deleteSpecial = useDeleteDailySpecial();

  const [modalSpecial, setModalSpecial] = useState<DailySpecial | null | undefined>(undefined);

  function openCreate() { setModalSpecial(null); }
  function openEdit(s: DailySpecial) { setModalSpecial(s); }
  function closeModal() { setModalSpecial(undefined); }

  async function handleToggleActive(s: DailySpecial) {
    try {
      await updateSpecial.mutateAsync({ id: s.id, active: !s.active });
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Update failed');
    }
  }

  async function handleDelete(s: DailySpecial) {
    if (!confirm(`Delete "${s.title}"?`)) return;
    try {
      await deleteSpecial.mutateAsync(s.id);
      toast.success('Special deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Delete failed');
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-espresso">Daily Specials</h1>
        <button
          onClick={openCreate}
          className="btn btn-primary flex items-center gap-2"
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Plus size={16} />
          Add Special
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-espresso/40 text-center py-12">Loading specials...</p>
      ) : specials.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <CalendarDays size={40} className="text-espresso/20 mx-auto mb-3" />
          <p className="text-espresso/40">No specials yet. Add your first daily special!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {specials.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* Image */}
              {s.image_url && (
                <div className="h-40 bg-cream-2 overflow-hidden">
                  <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-espresso">{s.title}</h3>
                  <ActiveToggle active={s.active} onChange={() => handleToggleActive(s)} />
                </div>

                {s.description && (
                  <p className="text-sm text-espresso/60 leading-relaxed">{s.description}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-terracotta">{formatPrice(s.price)}</span>
                  <span className="text-espresso/50 flex items-center gap-1">
                    <CalendarDays size={12} />
                    {s.valid_date}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-espresso/5">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-espresso/60 hover:text-terracotta hover:bg-terracotta/5 transition-colors text-xs font-medium"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-espresso/60 hover:text-red-500 hover:bg-red-50 transition-colors text-xs font-medium"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalSpecial !== undefined && (
        <SpecialModal special={modalSpecial} onClose={closeModal} />
      )}
    </div>
  );
}
