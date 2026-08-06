import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Both values are safe to expose: the anon key is designed to sit in client
 * code, and row-level security is what actually stops strangers writing.
 */
export const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const SCORES_TABLE = 'course_scores';

export type ScoreRow = { course_id: string; scores: Record<string, number> };

/**
 * Reading is a plain REST call so visitors never download the Supabase SDK —
 * it is ~220 kB, and nobody reading the page needs it. Works on the server at
 * build time and in the browser.
 */
export async function fetchScores(signal?: AbortSignal): Promise<ScoreRow[] | null> {
  if (!isSupabaseConfigured) return null;
  const url = `${SUPABASE_URL}/rest/v1/${SCORES_TABLE}?select=course_id,scores`;
  try {
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as ScoreRow[];
  } catch {
    return null;
  }
}

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * The full SDK, loaded on demand. Only the editor needs it — for signing in
 * and writing — so it stays out of the bundle every visitor downloads.
 */
export function loadClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    );
  }
  return clientPromise;
}

/** True when a session already exists, without pulling in the SDK. */
export function hasStoredSession(): boolean {
  if (!isSupabaseConfigured) return false;
  try {
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
    return Boolean(localStorage.getItem(`sb-${ref}-auth-token`));
  } catch {
    return false;
  }
}
