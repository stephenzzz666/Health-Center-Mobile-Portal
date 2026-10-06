import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

// Automatically strips whitespace, trailing slashes, and accidental /rest/v1 or /auth/v1 suffixes
const cleanUrl = rawUrl
  .trim()
  .replace(/\/+$|\/(rest|auth)\/v\d+\/?$/gi, '')
  .replace(/\/+$/, '');

const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Helpful log to verify the cleaned URL in your terminal
console.log('--- SUPABASE CONNECTING TO ---', cleanUrl);

export const supabase = createClient(cleanUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});