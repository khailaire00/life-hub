export type ThemeName = 'slate' | 'emerald' | 'amber' | 'rose' | 'midnight';

export type TabId =
  | 'dashboard'
  | 'finance'
  | 'notes'
  | 'journal'
  | 'habits'
  | 'planner';

export interface ScheduleBlock {
  id: string;
  hour: string; // e.g. "07:00"
  title: string;
  category: 'work' | 'personal' | 'fitness' | 'deep_work' | 'break';
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number; // positive = income, negative = expense
  category: string;
  date: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  url?: string;
  price?: number;
  priority: 'low' | 'medium' | 'high';
  acquired: boolean;
  notes?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VaultItem {
  id: string;
  title: string;
  username?: string;
  secret: string;
  category: 'password' | 'gate_code' | 'api_key' | 'secret_note';
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number; // 1 to 5
  date: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  target: string;
  color?: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface MealPlanDay {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast: string;
  lunch: string;
  dinner: string;
  snack?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  createdAt: string;
}

export interface AppData {
  scheduleBlocks: ScheduleBlock[];
  tasks: Task[];
  transactions: Transaction[];
  wishlistItems: WishlistItem[];
  notes: Note[];
  vaultItems: VaultItem[];
  vaultPin: string; // stored hashed or pin string
  journalEntries: JournalEntry[];
  brainDump: string;
  habits: Habit[];
  habitLogs: HabitLog[];
  mealPlans: MealPlanDay[];
  groceryItems: GroceryItem[];
}
