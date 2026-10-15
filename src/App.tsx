import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { AppData, TabId, ThemeName } from './types';
import {
  loadLocalData,
  saveLocalData,
  fetchAllDataFromCloud,
  DEFAULT_APP_DATA,
  exportAllDataAsJSON
} from './lib/storage';
import { getSupabaseCredentials, getSupabaseClient } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { CloudSyncModal } from './components/CloudSyncModal';

// Tabs
import { DashboardTab } from './components/tabs/DashboardTab';
import { FinanceTab } from './components/tabs/FinanceTab';
import { NotesTab } from './components/tabs/NotesTab';
import { JournalTab } from './components/tabs/JournalTab';
import { HabitsTab } from './components/tabs/HabitsTab';
import { PlannerTab } from './components/tabs/PlannerTab';

const THEME_STORAGE_KEY = 'lifehub_theme_preference';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName;
      if (['slate', 'emerald', 'amber', 'rose', 'midnight'].includes(saved)) {
        return saved;
      }
    }
    return 'slate';
  });

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App Data Central State
  const [data, setData] = useState<AppData>(loadLocalData);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);

  // Initial cloud synchronization check
  useEffect(() => {
    let isMounted = true;
    const creds = getSupabaseCredentials();
    if (creds.url && creds.key) {
      fetchAllDataFromCloud().then(res => {
        if (!isMounted) return;
        if (res.synced) {
          setData(res.data);
          setCloudNotice('Synced with Supabase Cloud');
          setTimeout(() => setCloudNotice(null), 4000);
        } else if (res.error) {
          setCloudNotice(`Cloud Notice: ${res.error}`);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Update handler that persists to localStorage and queues cloud push
  const updateData = (updater: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      saveLocalData(next);
      return next;
    });
  };

  const handleDataUpdated = (newData: AppData) => {
    setData(newData);
    saveLocalData(newData);
  };

  const creds = getSupabaseCredentials();
  const isCloudConnected = !!creds.url && !!creds.key;

  const tabTitles: Record<TabId, string> = {
    dashboard: 'Dashboard & Productivity',
    finance: 'Finance & Shopping',
    notes: 'Notes & Vault',
    journal: 'Journal & Sandbox',
    habits: 'Habit Tracker',
    planner: 'Life Planner',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentTheme={theme}
        onThemeChange={setTheme}
        data={data}
        onDataUpdated={handleDataUpdated}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset by fixed 288px sidebar on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        
        {/* Top Header Bar Contract */}
        <header className="sticky top-0 z-30 h-14 bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] px-6 flex items-center justify-between gap-8">
          
          {/* Zone 1: Breadcrumb Trail & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[var(--text-muted)]">Life Hub</span>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="font-semibold text-[var(--text-main)]">{tabTitles[activeTab]}</span>
            </div>
          </div>

          {/* Zone 2: Status indicator notice */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            {cloudNotice ? (
              <span className="text-emerald-600 flex items-center gap-1.5 font-medium animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {cloudNotice}
              </span>
            ) : isCloudConnected ? (
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Supabase Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Local Storage Active</span>
              </div>
            )}
          </div>

          {/* Zone 3: Primary Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => exportAllDataAsJSON(data)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-main)] transition-colors whitespace-nowrap"
              title="Download instant offline backup"
            >
              <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              Backup JSON
            </button>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5" />
              Cloud Sync
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardTab
                  scheduleBlocks={data.scheduleBlocks}
                  onUpdateSchedule={(blocks) => updateData(d => ({ ...d, scheduleBlocks: blocks }))}
                  tasks={data.tasks}
                  onUpdateTasks={(tasks) => updateData(d => ({ ...d, tasks }))}
                />
              )}

              {activeTab === 'finance' && (
                <FinanceTab
                  transactions={data.transactions}
                  onUpdateTransactions={(txs) => updateData(d => ({ ...d, transactions: txs }))}
                  wishlistItems={data.wishlistItems}
                  onUpdateWishlist={(items) => updateData(d => ({ ...d, wishlistItems: items }))}
                />
              )}

              {activeTab === 'notes' && (
                <NotesTab
                  notes={data.notes}
                  onUpdateNotes={(notes) => updateData(d => ({ ...d, notes }))}
                  vaultItems={data.vaultItems}
                  onUpdateVaultItems={(items) => updateData(d => ({ ...d, vaultItems: items }))}
                  vaultPin={data.vaultPin}
                  onUpdateVaultPin={(pin) => updateData(d => ({ ...d, vaultPin: pin }))}
                />
              )}

              {activeTab === 'journal' && (
                <JournalTab
                  journalEntries={data.journalEntries}
                  onUpdateJournal={(entries) => updateData(d => ({ ...d, journalEntries: entries }))}
                  brainDump={data.brainDump}
                  onUpdateBrainDump={(dump) => updateData(d => ({ ...d, brainDump: dump }))}
                />
              )}

              {activeTab === 'habits' && (
                <HabitsTab
                  habits={data.habits}
                  onUpdateHabits={(habits) => updateData(d => ({ ...d, habits }))}
                  habitLogs={data.habitLogs}
                  onUpdateHabitLogs={(logs) => updateData(d => ({ ...d, habitLogs: logs }))}
                />
              )}

              {activeTab === 'planner' && (
                <PlannerTab
                  mealPlans={data.mealPlans}
                  onUpdateMealPlans={(plans) => updateData(d => ({ ...d, mealPlans: plans }))}
                  groceryItems={data.groceryItems}
                  onUpdateGroceryItems={(items) => updateData(d => ({ ...d, groceryItems: items }))}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Cloud Sync & Persistence Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        data={data}
        onDataUpdated={handleDataUpdated}
      />
    </div>
  );
}
