import { AppData, ScheduleBlock, Task, Transaction, WishlistItem, Note, VaultItem, JournalEntry, Habit, HabitLog, MealPlanDay, GroceryItem } from '../types';
import { getSupabaseClient } from './supabase';

const LOCAL_STORAGE_KEY = 'lifehub_workspace_data_v1';

export const INITIAL_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  { id: 'sb-1', hour: '07:00', title: 'Morning Light, Hydration & Mobility Stretch', category: 'fitness', completed: true },
  { id: 'sb-2', hour: '08:00', title: 'Deep Work: Architecture Blueprint Review', category: 'deep_work', completed: true },
  { id: 'sb-3', hour: '10:00', title: 'Team Sync & Project Roadmap Priorities', category: 'work', completed: true },
  { id: 'sb-4', hour: '11:30', title: 'Client Feedback & Design Iteration Turnaround', category: 'work', completed: false },
  { id: 'sb-5', hour: '13:00', title: 'Nutritious Lunch & 15m Offline Walk', category: 'break', completed: false },
  { id: 'sb-6', hour: '14:30', title: 'Focused Coding: Supabase Integration Layer', category: 'deep_work', completed: false },
  { id: 'sb-7', hour: '17:00', title: 'Financial Audit & Weekly Expense Logging', category: 'personal', completed: false },
  { id: 'sb-8', hour: '19:00', title: 'Strength Training / Evening Run', category: 'fitness', completed: false },
  { id: 'sb-9', hour: '21:00', title: 'Wind-Down Journaling & Reading', category: 'personal', completed: false },
];

export const INITIAL_TASKS: Task[] = [
  { id: 'task-1', title: 'Finalize Life Hub database schema for Supabase', completed: true, priority: 'high', createdAt: '2026-10-14T08:00:00Z' },
  { id: 'task-2', title: 'Verify responsive touch layout on Safari mobile', completed: false, priority: 'high', createdAt: '2026-10-15T09:15:00Z' },
  { id: 'task-3', title: 'Set up 4-digit PIN for Secret Vault storage', completed: false, priority: 'medium', createdAt: '2026-10-15T09:30:00Z' },
  { id: 'task-4', title: 'Prepare grocery list for Sunday meal prep', completed: false, priority: 'low', createdAt: '2026-10-15T10:00:00Z' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', title: 'Consulting Retainer - Q4', amount: 4850.00, category: 'Salary', date: '2026-10-01', createdAt: '2026-10-01T08:00:00Z' },
  { id: 'tx-2', title: 'Monthly Studio Rent & Utilities', amount: -1450.00, category: 'Housing', date: '2026-10-03', createdAt: '2026-10-03T10:00:00Z' },
  { id: 'tx-3', title: 'Artisan Grocery & Whole Foods', amount: -184.50, category: 'Food', date: '2026-10-07', createdAt: '2026-10-07T14:30:00Z' },
  { id: 'tx-4', title: 'Software Subscriptions (Cloud & Tools)', amount: -92.00, category: 'Utilities', date: '2026-10-10', createdAt: '2026-10-10T11:00:00Z' },
  { id: 'tx-5', title: 'Dividend Distribution', amount: 320.00, category: 'Investment', date: '2026-10-12', createdAt: '2026-10-12T09:00:00Z' },
  { id: 'tx-6', title: 'High-Altitude Aeropress Specialty Coffee Beans', amount: -38.00, category: 'Food', date: '2026-10-14', createdAt: '2026-10-14T16:20:00Z' },
];

export const INITIAL_WISHLIST: WishlistItem[] = [
  { id: 'wl-1', title: 'Keychron Q1 Pro Wireless Mechanical Keyboard', url: 'https://keychron.com', price: 198.00, priority: 'high', acquired: false, notes: 'Banana tactile switches, matte black case', createdAt: '2026-10-10T12:00:00Z' },
  { id: 'wl-2', title: 'Herman Miller Embody Gaming Chair', url: 'https://hermanmiller.com', price: 1695.00, priority: 'medium', acquired: false, notes: 'Ergonomic lumbar support investment', createdAt: '2026-10-11T15:00:00Z' },
  { id: 'wl-3', title: 'Cal Newport - Deep Work Hardcover', url: 'https://calnewport.com', price: 24.50, priority: 'low', acquired: true, notes: 'Finished chapter 3 already', createdAt: '2026-10-05T09:00:00Z' },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Principles of Minimalist High-Leverage Execution',
    content: '1. Simplify before automating.\n2. Protect morning cognitive peak for high-value synthesis.\n3. Keep external dependencies explicit and isolated.\n4. Measure actions by weekly momentum, not daily noise.',
    tags: ['Productivity', 'Mindset'],
    pinned: true,
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-14T12:00:00Z'
  },
  {
    id: 'note-2',
    title: 'Clean Architecture Specs for Vercel & Mobile Safari',
    content: 'Always provide responsive drawer views on touch devices. Abstract local state to tolerate zero-latency offline browsing with transparent cloud synchronization.',
    tags: ['Engineering', 'Architecture'],
    pinned: false,
    createdAt: '2026-10-12T14:30:00Z',
    updatedAt: '2026-10-12T14:30:00Z'
  }
];

export const INITIAL_VAULT: VaultItem[] = [
  { id: 'v-1', title: 'Studio Main Gate Door Code', secret: '#4892*', category: 'gate_code', createdAt: '2026-10-08T09:00:00Z', updatedAt: '2026-10-08T09:00:00Z' },
  { id: 'v-2', title: 'Primary Production Cloud Master Key', username: 'admin@workspace.internal', secret: 'lh_live_9f81a70c32b50d99ef', category: 'api_key', createdAt: '2026-10-09T11:00:00Z', updatedAt: '2026-10-09T11:00:00Z' },
  { id: 'v-3', title: 'Hardware Wallet Backup Seed Passphrase', secret: 'copper meadow timber anchor velvet horizon quartz cascade flame whisper solar drift', category: 'secret_note', createdAt: '2026-10-11T13:45:00Z', updatedAt: '2026-10-11T13:45:00Z' },
];

export const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: 'je-1',
    title: 'Clear Horizon & Deep Morning Focus',
    content: 'Woke at 6:30 without an alarm. Cold brew on the balcony while watching the sunrise. The new workspace structure feels substantially calmer—having the schedule and checklist directly beside each other removes cognitive switching cost.',
    mood: 5,
    date: '2026-10-14',
    createdAt: '2026-10-14T07:15:00Z'
  },
  {
    id: 'je-2',
    title: 'Midweek Calibration & Energy Management',
    content: 'Finished the core integration ahead of schedule. Noticed slight fatigue in the afternoon after back-to-back reviews; solved by a quick walk outside without looking at my phone.',
    mood: 4,
    date: '2026-10-13',
    createdAt: '2026-10-13T18:40:00Z'
  }
];

export const INITIAL_BRAIN_DUMP = `Raw ideas & thought stream:
- Look into local SQLite WASM vs Supabase realtime subscriptions
- Plan trip to Kyoto in November; check train passes and packing weight
- Test ergonomic wrist rest with Keychron
- Remember to hydrate every 90 minutes during deep sprints
- Need to restock sourdough starter feed`;

export const INITIAL_HABITS: Habit[] = [
  { id: 'h-1', name: 'Read 30 Minutes', target: 'Daily', createdAt: '2026-10-01T00:00:00Z' },
  { id: 'h-2', name: 'Drink 2.5L Water', target: 'Daily', createdAt: '2026-10-01T00:00:00Z' },
  { id: 'h-3', name: 'Daily Mobility Stretch', target: 'Daily', createdAt: '2026-10-01T00:00:00Z' },
  { id: 'h-4', name: '2h Deep Work Sprint', target: 'Daily', createdAt: '2026-10-01T00:00:00Z' },
  { id: 'h-5', name: '10,000 Steps Outside', target: 'Daily', createdAt: '2026-10-01T00:00:00Z' },
];

// Helper to generate sample streak logs for recent 7 days
function generateSampleHabitLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Seed realistic check marks
    logs.push({ id: `hl-1-${dateStr}`, habitId: 'h-1', date: dateStr, completed: i < 5 });
    logs.push({ id: `hl-2-${dateStr}`, habitId: 'h-2', date: dateStr, completed: i < 6 });
    logs.push({ id: `hl-3-${dateStr}`, habitId: 'h-3', date: dateStr, completed: i % 2 === 0 });
    logs.push({ id: `hl-4-${dateStr}`, habitId: 'h-4', date: dateStr, completed: i < 4 });
    logs.push({ id: `hl-5-${dateStr}`, habitId: 'h-5', date: dateStr, completed: i !== 3 });
  }
  return logs;
}

export const INITIAL_MEAL_PLANS: MealPlanDay[] = [
  { id: 'mp-1', day: 'Monday', breakfast: 'Greek Yogurt with chia seeds & blueberries', lunch: 'Grilled chicken quinoa power bowl', dinner: 'Wild caught salmon with roasted asparagus', snack: 'Almonds & dark chocolate' },
  { id: 'mp-2', day: 'Tuesday', breakfast: 'Avocado toast on sourdough with poached eggs', lunch: 'Lentil & vegetable stew with sourdough', dinner: 'Grass-fed beef stir-fry with broccoli & jasmine rice', snack: 'Green matcha smoothie' },
  { id: 'mp-3', day: 'Wednesday', breakfast: 'Rolled oats with almond butter & sliced banana', lunch: 'Mediterranean chickpea salad with feta', dinner: 'Baked cod with sweet potato mash and greens', snack: 'Crisp honeycrisp apple' },
  { id: 'mp-4', day: 'Thursday', breakfast: 'Spinach, berry and whey protein smoothie bowl', lunch: 'Turkey breast wrap with avocado & arugula', dinner: 'Slow-cooked lamb stew with carrots and rosemary', snack: 'Walnuts' },
  { id: 'mp-5', day: 'Friday', breakfast: '3 scrambled eggs with cherry tomatoes & olive oil', lunch: 'Poke bowl with fresh salmon & edamame', dinner: 'Artisan sourdough flatbread with burrata & basil', snack: 'Pistachios' },
  { id: 'mp-6', day: 'Saturday', breakfast: 'Protein buckwheat pancakes with pure maple syrup', lunch: 'Warm soba noodle bowl with sesame chicken', dinner: 'Charred ribeye steak with grilled zucchini', snack: 'Greek yogurt' },
  { id: 'mp-7', day: 'Sunday', breakfast: 'Poached eggs benedict on English muffin', lunch: 'Roasted butternut squash soup with pepitas', dinner: 'Family roasted herb chicken with garlic potatoes', snack: 'Fresh berries' },
];

export const INITIAL_GROCERY_ITEMS: GroceryItem[] = [
  { id: 'gi-1', name: 'Fresh wild salmon fillets', category: 'Meat & Seafood', checked: false, createdAt: '2026-10-14T09:00:00Z' },
  { id: 'gi-2', name: 'Organic Greek whole milk yogurt', category: 'Dairy', checked: true, createdAt: '2026-10-14T09:05:00Z' },
  { id: 'gi-3', name: 'Artisan sourdough loaf', category: 'Bakery', checked: false, createdAt: '2026-10-14T09:10:00Z' },
  { id: 'gi-4', name: 'Avocados (ripe Haas, 4 pack)', category: 'Produce', checked: true, createdAt: '2026-10-14T09:12:00Z' },
  { id: 'gi-5', name: 'Organic baby spinach & arugula', category: 'Produce', checked: false, createdAt: '2026-10-14T09:15:00Z' },
  { id: 'gi-6', name: 'Extra virgin cold-pressed olive oil', category: 'Pantry', checked: false, createdAt: '2026-10-14T09:20:00Z' },
  { id: 'gi-7', name: 'Blueberries & blackberries', category: 'Produce', checked: true, createdAt: '2026-10-14T09:22:00Z' },
  { id: 'gi-8', name: 'Rolled whole oats', category: 'Pantry', checked: false, createdAt: '2026-10-14T09:25:00Z' },
];

export const DEFAULT_APP_DATA: AppData = {
  scheduleBlocks: INITIAL_SCHEDULE_BLOCKS,
  tasks: INITIAL_TASKS,
  transactions: INITIAL_TRANSACTIONS,
  wishlistItems: INITIAL_WISHLIST,
  notes: INITIAL_NOTES,
  vaultItems: INITIAL_VAULT,
  vaultPin: '1234', // default PIN for easy testing; user can change it
  journalEntries: INITIAL_JOURNAL,
  brainDump: INITIAL_BRAIN_DUMP,
  habits: INITIAL_HABITS,
  habitLogs: generateSampleHabitLogs(),
  mealPlans: INITIAL_MEAL_PLANS,
  groceryItems: INITIAL_GROCERY_ITEMS,
};

export function loadLocalData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_APP_DATA;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      saveLocalData(DEFAULT_APP_DATA);
      return DEFAULT_APP_DATA;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_APP_DATA, ...parsed };
  } catch (err) {
    console.warn('Error reading from localStorage, using defaults', err);
    return DEFAULT_APP_DATA;
  }
}

export function saveLocalData(data: AppData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }
}

/**
 * Sync from Supabase tables if connected, with fallback to local storage
 */
export async function fetchAllDataFromCloud(): Promise<{ data: AppData; synced: boolean; error?: string }> {
  const client = getSupabaseClient();
  const local = loadLocalData();

  if (!client) {
    return { data: local, synced: false };
  }

  try {
    // Attempt concurrent table fetches
    const [
      { data: tasksData, error: taskErr },
      { data: scheduleData, error: schedErr },
      { data: txData, error: txErr },
      { data: wlData, error: wlErr },
      { data: notesData, error: notesErr },
      { data: vaultData, error: vaultErr },
      { data: journalData, error: journalErr },
      { data: dumpData, error: dumpErr },
      { data: habitsData, error: habitsErr },
      { data: habitLogsData, error: habitLogsErr },
      { data: mealData, error: mealErr },
      { data: groceryData, error: groceryErr },
    ] = await Promise.all([
      client.from('tasks').select('*'),
      client.from('schedule_blocks').select('*'),
      client.from('transactions').select('*'),
      client.from('wishlist_items').select('*'),
      client.from('notes').select('*'),
      client.from('vault_items').select('*'),
      client.from('journal_entries').select('*'),
      client.from('brain_dumps').select('*').limit(1),
      client.from('habits').select('*'),
      client.from('habit_logs').select('*'),
      client.from('meal_plans').select('*'),
      client.from('grocery_items').select('*'),
    ]);

    // If any table query has an error (e.g. table not created yet), return local data with error notice
    if (taskErr || schedErr || txErr || notesErr) {
      const msg = taskErr?.message || schedErr?.message || txErr?.message || notesErr?.message || 'Supabase tables not found. Run SQL schema in Supabase Editor.';
      return { data: local, synced: false, error: msg };
    }

    const merged: AppData = {
      ...local,
      tasks: tasksData && tasksData.length > 0 ? tasksData.map(t => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority, createdAt: t.created_at })) : local.tasks,
      scheduleBlocks: scheduleData && scheduleData.length > 0 ? scheduleData.map(s => ({ id: s.id, hour: s.hour, title: s.title, category: s.category, completed: s.completed })) : local.scheduleBlocks,
      transactions: txData && txData.length > 0 ? txData.map(t => ({ id: t.id, title: t.title, amount: Number(t.amount), category: t.category, date: t.date, createdAt: t.created_at })) : local.transactions,
      wishlistItems: wlData && wlData.length > 0 ? wlData.map(w => ({ id: w.id, title: w.title, url: w.url, price: Number(w.price), priority: w.priority, acquired: w.acquired, notes: w.notes, createdAt: w.created_at })) : local.wishlistItems,
      notes: notesData && notesData.length > 0 ? notesData.map(n => ({ id: n.id, title: n.title, content: n.content, tags: n.tags || [], pinned: n.pinned, createdAt: n.created_at, updatedAt: n.updated_at })) : local.notes,
      vaultItems: vaultData && vaultData.length > 0 ? vaultData.map(v => ({ id: v.id, title: v.title, username: v.username, secret: v.secret, category: v.category, createdAt: v.created_at, updatedAt: v.updated_at })) : local.vaultItems,
      journalEntries: journalData && journalData.length > 0 ? journalData.map(j => ({ id: j.id, title: j.title, content: j.content, mood: j.mood, date: j.date, createdAt: j.created_at })) : local.journalEntries,
      brainDump: dumpData && dumpData[0] ? dumpData[0].content : local.brainDump,
      habits: habitsData && habitsData.length > 0 ? habitsData.map(h => ({ id: h.id, name: h.name, target: h.target, color: h.color, createdAt: h.created_at })) : local.habits,
      habitLogs: habitLogsData && habitLogsData.length > 0 ? habitLogsData.map(l => ({ id: l.id, habitId: l.habit_id, date: l.date, completed: l.completed })) : local.habitLogs,
      mealPlans: mealData && mealData.length > 0 ? mealData.map(m => ({ id: m.id, day: m.day, breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner, snack: m.snack })) : local.mealPlans,
      groceryItems: groceryData && groceryData.length > 0 ? groceryData.map(g => ({ id: g.id, name: g.name, category: g.category, checked: g.checked, createdAt: g.created_at })) : local.groceryItems,
    };

    saveLocalData(merged);
    return { data: merged, synced: true };
  } catch (e: any) {
    console.warn('Error syncing with Supabase:', e);
    return { data: local, synced: false, error: e?.message };
  }
}

/**
 * Push all local data to Supabase (Initial seed or full sync)
 */
export async function pushAllDataToCloud(data: AppData): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    // Upsert tasks
    if (data.tasks.length > 0) {
      await client.from('tasks').upsert(
        data.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority, created_at: t.createdAt }))
      );
    }

    // Upsert schedule blocks
    if (data.scheduleBlocks.length > 0) {
      await client.from('schedule_blocks').upsert(
        data.scheduleBlocks.map(s => ({ id: s.id, hour: s.hour, title: s.title, category: s.category, completed: s.completed }))
      );
    }

    // Upsert transactions
    if (data.transactions.length > 0) {
      await client.from('transactions').upsert(
        data.transactions.map(tx => ({ id: tx.id, title: tx.title, amount: tx.amount, category: tx.category, date: tx.date, created_at: tx.createdAt }))
      );
    }

    // Upsert wishlist
    if (data.wishlistItems.length > 0) {
      await client.from('wishlist_items').upsert(
        data.wishlistItems.map(w => ({ id: w.id, title: w.title, url: w.url, price: w.price, priority: w.priority, acquired: w.acquired, notes: w.notes, created_at: w.createdAt }))
      );
    }

    // Upsert notes
    if (data.notes.length > 0) {
      await client.from('notes').upsert(
        data.notes.map(n => ({ id: n.id, title: n.title, content: n.content, tags: n.tags, pinned: n.pinned, created_at: n.createdAt, updated_at: n.updatedAt }))
      );
    }

    // Upsert vault
    if (data.vaultItems.length > 0) {
      await client.from('vault_items').upsert(
        data.vaultItems.map(v => ({ id: v.id, title: v.title, username: v.username, secret: v.secret, category: v.category, created_at: v.createdAt, updated_at: v.updatedAt }))
      );
    }

    // Upsert journal
    if (data.journalEntries.length > 0) {
      await client.from('journal_entries').upsert(
        data.journalEntries.map(j => ({ id: j.id, title: j.title, content: j.content, mood: j.mood, date: j.date, created_at: j.createdAt }))
      );
    }

    // Upsert brain dump
    await client.from('brain_dumps').upsert({ id: 'primary_dump', content: data.brainDump });

    // Upsert habits
    if (data.habits.length > 0) {
      await client.from('habits').upsert(
        data.habits.map(h => ({ id: h.id, name: h.name, target: h.target, color: h.color, created_at: h.createdAt }))
      );
    }

    // Upsert habit logs
    if (data.habitLogs.length > 0) {
      await client.from('habit_logs').upsert(
        data.habitLogs.map(l => ({ id: l.id, habit_id: l.habitId, date: l.date, completed: l.completed }))
      );
    }

    // Upsert meal plans
    if (data.mealPlans.length > 0) {
      await client.from('meal_plans').upsert(
        data.mealPlans.map(m => ({ id: m.id, day: m.day, breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner, snack: m.snack }))
      );
    }

    // Upsert grocery items
    if (data.groceryItems.length > 0) {
      await client.from('grocery_items').upsert(
        data.groceryItems.map(g => ({ id: g.id, name: g.name, category: g.category, checked: g.checked, created_at: g.createdAt }))
      );
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Sync failed' };
  }
}

/**
 * Export all data to JSON and trigger file download
 */
export function exportAllDataAsJSON(data: AppData) {
  const exportPayload = {
    app: 'Life Hub Workspace',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `lifehub-workspace-backup-${dateStr}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validate and import data from JSON
 */
export function importDataFromJSON(jsonString: string): { success: boolean; data?: AppData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const candidateData = parsed.data || parsed;

    // Check basic presence of keys
    if (!candidateData || typeof candidateData !== 'object') {
      return { success: false, error: 'Invalid JSON format: missing root data object.' };
    }

    const merged: AppData = {
      scheduleBlocks: Array.isArray(candidateData.scheduleBlocks) ? candidateData.scheduleBlocks : DEFAULT_APP_DATA.scheduleBlocks,
      tasks: Array.isArray(candidateData.tasks) ? candidateData.tasks : DEFAULT_APP_DATA.tasks,
      transactions: Array.isArray(candidateData.transactions) ? candidateData.transactions : DEFAULT_APP_DATA.transactions,
      wishlistItems: Array.isArray(candidateData.wishlistItems) ? candidateData.wishlistItems : DEFAULT_APP_DATA.wishlistItems,
      notes: Array.isArray(candidateData.notes) ? candidateData.notes : DEFAULT_APP_DATA.notes,
      vaultItems: Array.isArray(candidateData.vaultItems) ? candidateData.vaultItems : DEFAULT_APP_DATA.vaultItems,
      vaultPin: typeof candidateData.vaultPin === 'string' ? candidateData.vaultPin : DEFAULT_APP_DATA.vaultPin,
      journalEntries: Array.isArray(candidateData.journalEntries) ? candidateData.journalEntries : DEFAULT_APP_DATA.journalEntries,
      brainDump: typeof candidateData.brainDump === 'string' ? candidateData.brainDump : DEFAULT_APP_DATA.brainDump,
      habits: Array.isArray(candidateData.habits) ? candidateData.habits : DEFAULT_APP_DATA.habits,
      habitLogs: Array.isArray(candidateData.habitLogs) ? candidateData.habitLogs : DEFAULT_APP_DATA.habitLogs,
      mealPlans: Array.isArray(candidateData.mealPlans) ? candidateData.mealPlans : DEFAULT_APP_DATA.mealPlans,
      groceryItems: Array.isArray(candidateData.groceryItems) ? candidateData.groceryItems : DEFAULT_APP_DATA.groceryItems,
    };

    saveLocalData(merged);
    return { success: true, data: merged };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Could not parse JSON file.' };
  }
}
