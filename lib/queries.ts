'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { MenuItem, GalleryItem, Testimonial, Reservation, Settings, DailySpecial, Event } from '@/types';

const sb = () => getSupabaseClient();

// ─── MENU ITEMS ────────────────────────────────────────────────────────────────

export function useMenuItems(opts?: {
  category?: string;
  fastingOnly?: boolean;
  vegOnly?: boolean;
  initialData?: MenuItem[];
}) {
  return useQuery({
    queryKey: ['menu_items', opts?.category, opts?.fastingOnly, opts?.vegOnly],
    queryFn: async () => {
      let q = sb().from('menu_items').select('*').order('sort_order', { ascending: true });
      if (opts?.category && opts.category !== 'All') q = q.eq('category', opts.category);
      if (opts?.fastingOnly) q = q.eq('is_fasting', true);
      if (opts?.vegOnly) q = q.eq('is_veg', true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as MenuItem[];
    },
    initialData: opts?.initialData,
  });
}

export function useAllMenuItemsAdmin() {
  return useQuery({
    queryKey: ['menu_items_admin'],
    queryFn: async () => {
      const { data, error } = await sb()
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as MenuItem[];
    },
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<MenuItem, 'id' | 'created_at'>) => {
      const { error } = await sb().from('menu_items').insert(item);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu_items'] }); qc.invalidateQueries({ queryKey: ['menu_items_admin'] }); },
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<MenuItem> & { id: string }) => {
      const { error } = await sb().from('menu_items').update(item).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu_items'] }); qc.invalidateQueries({ queryKey: ['menu_items_admin'] }); },
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb().from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['menu_items'] }); qc.invalidateQueries({ queryKey: ['menu_items_admin'] }); },
  });
}

export function useUpdateMenuSortOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ id: string; sort_order: number }>) => {
      await Promise.all(
        items.map(({ id, sort_order }) =>
          sb().from('menu_items').update({ sort_order }).eq('id', id)
        )
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu_items_admin'] }),
  });
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const { data, error } = await sb()
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as GalleryItem[];
    },
  });
}

export function useCreateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { url: string; image_url: string; caption: string | null; sort_order: number }) => {
      const { error } = await sb().from('gallery').insert(item);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb().from('gallery').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

export function useUpdateGallerySortOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ id: string; sort_order: number }>) => {
      await Promise.all(
        items.map(({ id, sort_order }) =>
          sb().from('gallery').update({ sort_order }).eq('id', id)
        )
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

export function useTestimonials(visibleOnly = true) {
  return useQuery({
    queryKey: ['testimonials', visibleOnly],
    queryFn: async () => {
      let q = sb().from('testimonials').select('*').order('created_at', { ascending: false });
      if (visibleOnly) q = q.eq('visible', true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Testimonial[];
    },
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { name: string; body: string; rating: number }) => {
      const { error } = await sb().from('testimonials').insert({ ...review, visible: false });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }),
  });
}

export function useUpdateTestimonialVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await sb().from('testimonials').update({ visible }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb().from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['testimonials'] }),
  });
}

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────

export function useReservations(filters?: { status?: string; date?: string }) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: async () => {
      let q = sb().from('reservations').select('*').order('created_at', { ascending: false });
      if (filters?.status && filters.status !== 'all') q = q.eq('status', filters.status);
      if (filters?.date) q = q.eq('date', filters.date);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Reservation[];
    },
  });
}

export function useCreateReservation() {
  return useMutation({
    mutationFn: async (res: Omit<Reservation, 'id' | 'created_at' | 'status'>) => {
      const { error } = await sb().from('reservations').insert({ ...res, status: 'pending' });
      if (error) throw error;
    },
  });
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Reservation['status'] }) => {
      const { error } = await sb().from('reservations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await sb().from('settings').select('*').single();
      if (error) throw error;
      return data as Settings;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const { data: existing } = await sb().from('settings').select('id').single();
      if (existing) {
        const { error } = await sb().from('settings').update(updates).eq('id', existing.id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

// ─── DAILY SPECIALS ───────────────────────────────────────────────────────────

export function useDailySpecials(todayOnly = false) {
  return useQuery({
    queryKey: ['daily_specials', todayOnly],
    queryFn: async () => {
      let q = sb().from('daily_specials').select('*').order('created_at', { ascending: false });
      if (todayOnly) {
        const today = new Date().toISOString().split('T')[0];
        q = q.eq('valid_date', today).eq('active', true);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as DailySpecial[];
    },
  });
}

export function useCreateDailySpecial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (special: Omit<DailySpecial, 'id' | 'created_at'>) => {
      const { error } = await sb().from('daily_specials').insert(special);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['daily_specials'] }),
  });
}

export function useUpdateDailySpecial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<DailySpecial> & { id: string }) => {
      const { error } = await sb().from('daily_specials').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['daily_specials'] }),
  });
}

export function useDeleteDailySpecial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb().from('daily_specials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['daily_specials'] }),
  });
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export function useEvents(upcomingOnly = false) {
  return useQuery({
    queryKey: ['events', upcomingOnly],
    queryFn: async () => {
      let q = sb().from('events').select('*').order('date', { ascending: true });
      if (upcomingOnly) {
        const today = new Date().toISOString().split('T')[0];
        q = q.gte('date', today).eq('active', true);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Event[];
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: Omit<Event, 'id' | 'created_at'>) => {
      const { error } = await sb().from('events').insert(event);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Event> & { id: string }) => {
      const { error } = await sb().from('events').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb().from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

// ─── ADMIN STATS ─────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const [reservations, reviews, menuItems, gallery] = await Promise.all([
        sb().from('reservations').select('id', { count: 'exact' }).eq('date', today),
        sb().from('testimonials').select('id', { count: 'exact' }).eq('visible', false),
        sb().from('menu_items').select('id', { count: 'exact' }).eq('available', true),
        sb().from('gallery').select('id', { count: 'exact' }),
      ]);
      return {
        todayReservations: reservations.count ?? 0,
        pendingReviews: reviews.count ?? 0,
        activeMenuItems: menuItems.count ?? 0,
        galleryItems: gallery.count ?? 0,
      };
    },
  });
}
