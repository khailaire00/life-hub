import { createClient } from '@supabase/supabase-js';

// This safely checks both local environments and production Vercel environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Falling back to LocalStorage.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
