import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for manual setup
const STORAGE_KEY_SUPABASE_URL = 'lifehub_supabase_url';
const STORAGE_KEY_SUPABASE_ANON_KEY = 'lifehub_supabase_anon_key';

export function getSupabaseCredentials(): { url: string | null; key: string | null; source: 'env' | 'storage' | 'none' } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '') as string;
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') as string;

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SUPABASE_URL) : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SUPABASE_ANON_KEY) : null;

  if (storedUrl && storedKey) {
    return { url: storedUrl, key: storedKey, source: 'storage' };
  }

  return { url: null, key: null, source: 'none' };
}

export function saveCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_SUPABASE_ANON_KEY, key.trim());
    currentClient = null; // reset cached client
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
    localStorage.removeItem(STORAGE_KEY_SUPABASE_ANON_KEY);
    currentClient = null;
  }
}

let currentClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (currentClient) return currentClient;

  const creds = getSupabaseCredentials();
  if (creds.url && creds.key) {
    try {
      currentClient = createClient(creds.url, creds.key);
      return currentClient;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createClient(url, key);
    // Ping with a lightweight query
    const { error } = await client.from('tasks').select('id').limit(1);
    // If the table doesn't exist yet, it's still a valid connection to Supabase!
    if (error && error.code !== '42P01') {
      // 42P01 is relation does not exist (meaning connected successfully, just need to run SQL script)
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Connection failed' };
  }
}

export const SUPABASE_SQL_SNIPPET = `-- ==========================================================
-- LIFE HUB WORKSPACE - COMPLETE DATABASE SCHEMA
-- Paste this script into your Supabase SQL Editor and run it.
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Schedule Blocks (Time-Blocking)
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
    id TEXT PRIMARY KEY,
    hour TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'work',
    completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tasks (To-Do Checklist)
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Transactions (Finance Tracker)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Wishlist & Link Saver
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT,
    price NUMERIC,
    priority TEXT DEFAULT 'medium',
    acquired BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Notes
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Vault Items (Encrypted credentials & gate codes)
CREATE TABLE IF NOT EXISTS public.vault_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    username TEXT,
    secret TEXT NOT NULL,
    category TEXT DEFAULT 'password',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Journal Entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood INTEGER DEFAULT 3,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Brain Dump
CREATE TABLE IF NOT EXISTS public.brain_dumps (
    id TEXT PRIMARY KEY DEFAULT 'primary_dump',
    content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Habits
CREATE TABLE IF NOT EXISTS public.habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    target TEXT DEFAULT 'Daily',
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. Habit Logs
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id TEXT PRIMARY KEY,
    habit_id TEXT REFERENCES public.habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_habit_date UNIQUE (habit_id, date)
);

-- 11. Meal Plans
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL UNIQUE,
    breakfast TEXT DEFAULT '',
    lunch TEXT DEFAULT '',
    dinner TEXT DEFAULT '',
    snack TEXT DEFAULT ''
);

-- 12. Grocery Items
CREATE TABLE IF NOT EXISTS public.grocery_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Pantry',
    checked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) with open public policy for demo/workspace access
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for schedule_blocks" ON public.schedule_blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for wishlist_items" ON public.wishlist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for vault_items" ON public.vault_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for journal_entries" ON public.journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for brain_dumps" ON public.brain_dumps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for habits" ON public.habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for habit_logs" ON public.habit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for meal_plans" ON public.meal_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for grocery_items" ON public.grocery_items FOR ALL USING (true) WITH CHECK (true);
`;
