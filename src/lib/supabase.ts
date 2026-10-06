import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'bb_supabase_url';
const STORAGE_KEY_KEY = 'bb_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  // Check env first, then localStorage
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  const url = (localUrl || envUrl).trim();
  const anonKey = (localKey || envKey).trim();

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.length > 20
  );
}

let cachedClient: SupabaseClient | null = null;
let cachedCredentials = '';

export function getSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  const credsSignature = `${url}::${anonKey}`;

  if (cachedClient && cachedCredentials === credsSignature) {
    return cachedClient;
  }

  // Fallback placeholder credentials if not configured yet to avoid crash on import
  const validUrl = isSupabaseConfigured() ? url : 'https://placeholder-project.supabase.co';
  const validKey = isSupabaseConfigured() ? anonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  cachedClient = createClient(validUrl, validKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'bb_supabase_auth_token',
    },
  });

  cachedCredentials = credsSignature;
  return cachedClient;
}

export const supabase = getSupabaseClient();

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
  // Reset cache
  cachedClient = null;
  cachedCredentials = '';
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
  cachedClient = null;
  cachedCredentials = '';
}

export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Supabase URL and Anon Key are not yet configured.',
    };
  }

  try {
    const client = getSupabaseClient();
    // Test auth session check
    const { error: authError } = await client.auth.getSession();
    if (authError) {
      return { ok: false, message: authError.message };
    }

    // Test a basic select check
    const { error: queryError } = await client.from('businesses').select('id').limit(1);
    if (queryError && queryError.code !== 'PGRST116') {
      // If error is relation does not exist, schema might not be migrated yet
      if (queryError.message.includes('relation') || queryError.message.includes('does not exist')) {
        return {
          ok: true,
          message: 'Connected to Supabase! Note: Please run 001_initial_schema.sql in Supabase SQL editor to create the tables.',
        };
      }
      return { ok: false, message: queryError.message };
    }

    return { ok: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Connection test failed.' };
  }
}
