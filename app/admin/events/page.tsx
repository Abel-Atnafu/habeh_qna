'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X, Megaphone, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '@/lib/queries';
import { Event } from '@/types';
import { cn } from '@/lib/utils';

/* ─── Schema ─────────────────────────────────────────────────────────────────── */
const eventSchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date:        z.string().min(1, 'Date is required'),
  time:        z.string().optional(),
  image_url:   z.string().url('Must be a valid URL').optional().or(z.literal('')),
  active:      z.boolean(),
});

type EventFormValues = z.infer<typeof eventSchema>;

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

/* ─── Event Modal ────────────────────────────────────────────────────────────── */
function EventModal({
  event,
  onClose,
}: {
  event: Event | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(event);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title:       event?.title       ?? '',
      description: event?.description ?? '',
      date:        event?.date        ?? new Date().toISOString().split('T')[0],
      time:        event?.time        ?? '7:00 PM',
      image_url:   event?.image_url   ?? '',
      active:      event?.active      ?? true,
    },
  });

  const watchedActive = watch('active');

  async function onSubmit(values: EventFormValues) {
    try {
      const payload = {
        ...values,
        image_url:   values.image_url   || null,
        description: values.description || null,
        time:        values.time        || null,
      };
      if (isEdit && event) {
        await updateEvent.mutateAsync({ id: event.id, ...payload });
        toast.success('Event updated');
      } else {
        await createEvent.mutateAsync(payload);
        toast.success('Event created');
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
            {isEdit ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button onClick={onClose} className="text-espresso/40 hover:text-espresso transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className={labelClass}>Title *</label>
            <input {...register('title')} className={inputClass} placeholder="e.g. Ethiopian Coffee Ceremony" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              {...register('description')}
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="Event details..."
            />
          </div>

          {/* Date */}
          <div>
            <label className={labelClass}>Date *</label>
            <input type="date" {...register('date')} className={inputClass} />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          {/* Time */}
          <div>
            <label className={labelClass}>Time</label>
            <input
              {...register('time')}
              className={inputClass}
              placeholder="e.g. 7:00 PM"
            />
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function EventsPage() {
  const { data: events = [], isLoading } = useEvents();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [modalEvent, setModalEvent] = useState<Event | null | undefined>(undefined);

  function openCreate() { setModalEvent(null); }
  function openEdit(e: Event) { setModalEvent(e); }
  function closeModal() { setModalEvent(undefined); }

  async function handleToggleActive(e: Event) {
    try {
      await updateEvent.mutateAsync({ id: e.id, active: !e.active });
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Update failed');
    }
  }

  async function handleDelete(e: Event) {
    if (!confirm(`Delete "${e.title}"?`)) return;
    try {
      await deleteEvent.mutateAsync(e.id);
      toast.success('Event deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Delete failed');
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-espresso">Events</h1>
        <button
          onClick={openCreate}
          className="btn btn-primary flex items-center gap-2"
          style={{ padding: '10px 20px', fontSize: 14 }}
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-espresso/40 text-center py-12">Loading events...</p>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <Megaphone size={40} className="text-espresso/20 mx-auto mb-3" />
          <p className="text-espresso/40">No events yet. Add your first event!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* Image */}
              {e.image_url && (
                <div className="h-40 bg-cream-2 overflow-hidden">
                  <img src={e.image_url} alt={e.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-espresso">{e.title}</h3>
                  <ActiveToggle active={e.active} onChange={() => handleToggleActive(e)} />
                </div>

                {e.description && (
                  <p className="text-sm text-espresso/60 leading-relaxed line-clamp-2">{e.description}</p>
                )}

                <div className="flex items-center gap-3 text-sm text-espresso/50">
                  <span className="flex items-center gap-1">
                    <Megaphone size={12} />
                    {e.date}
                  </span>
                  {e.time && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {e.time}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-espresso/5">
                  <button
                    onClick={() => openEdit(e)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-espresso/60 hover:text-terracotta hover:bg-terracotta/5 transition-colors text-xs font-medium"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(e)}
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
      {modalEvent !== undefined && (
        <EventModal event={modalEvent} onClose={closeModal} />
      )}
    </div>
  );
}
