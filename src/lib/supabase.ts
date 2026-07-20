import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

if (supabaseAnonKey?.startsWith('sb_secret_')) {
  console.error('SECURITY VULNERABILITY: Secret key (sb_secret_...) detected in public VITE_SUPABASE_ANON_KEY. This key must be kept server-side in SUPABASE_SERVICE_ROLE_KEY.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
