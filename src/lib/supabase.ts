import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseAnonKey.startsWith('sb_secret_')
  );
};

if (!isSupabaseConfigured()) {
  console.warn('Supabase credentials missing or invalid. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment.');
}

if (supabaseAnonKey?.startsWith('sb_secret_')) {
  console.error('SECURITY VULNERABILITY: Secret key (sb_secret_...) detected in public VITE_SUPABASE_ANON_KEY. Keep SUPABASE_SERVICE_ROLE_KEY server-side.');
}

// Fallback empty client if credentials missing to prevent instant crash
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

