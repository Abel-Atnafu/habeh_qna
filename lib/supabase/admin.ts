import 'server-only';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let cached: SupabaseClient<Database> | null = null;

export function createAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  if (!serviceRole) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');

  if (!cached) {
    cached = createSupabaseClient<Database>(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
