import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Both values are safe to expose: the anon key is designed to sit in client
 * code, and row-level security is what actually stops strangers writing.
 */
export const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;

/** Returns null when the project isn't configured, so callers can fall back. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

export const SCORES_TABLE = 'course_scores';
