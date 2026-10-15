import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  BookOpen,
  Flame,
  Calendar,
  Database,
  Download,
  Upload,
  Settings2,
  RefreshCw,
  X
} from 'lucide-react';
import { TabId, ThemeName, AppData } from '../types';
import { ThemeSelector } from './ThemeSelector';
import { exportAllDataAsJSON, importDataFromJSON } from '../lib/storage';
import { getSupabaseCredentials } from '../lib/supabase';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard & Productivity', icon: LayoutDashboard },
  { id: 'finance', label: 'Finance & Shopping', icon: CreditCard },
  { id: 'notes', label: 'Notes & Vault', icon: FileText },
  { id: 'journal', label: 'Journal & Sandbox', icon: BookOpen },
  { id: 'habits', label: 'Habit Tracker', icon: Flame },
  { id: 'planner', label: 'Life Planner', icon: Calendar },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  data: AppData;
  onDataUpdated: (newData: AppData) => void;
  onOpenSyncModal: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  currentTheme,
  onThemeChange,
  data,
  onDataUpdated,
  onOpenSyncModal,
  mobileOpen,
  onCloseMobile,
}) => {
  const creds = getSupabaseCredentials();
  const isCloudConnected = !!creds.url && !!creds.key;

  const handleQuickImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJSON(content);
      if (res.success && res.data) {
        onDataUpdated(res.data);
      } else {
        alert(res.error || 'Failed to import JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Fixed Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] z-40 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Brand Lockup */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              LH
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-[var(--text-main)]">
                Life Hub Workspace
              </h1>
              <p className="text-[11px] text-[var(--text-muted)]">Unified Operating System</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Fixed Navigation Tabs */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Workspaces
          </div>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  onCloseMobile();
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)]/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[var(--accent-soft)] rounded-xl border border-[var(--accent-border)]/50 z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 z-10 transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                <span className="truncate z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar Footer: Theme Refresh & Cloud Sync */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]/40 space-y-3 shrink-0">
          
          {/* Theme Settings Dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block px-1">
              Palette Refresh
            </span>
            <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
          </div>

          {/* Manual Cloud Sync & Persistent Database Panel */}
          <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="text-xs font-semibold text-[var(--text-main)]">Cloud Sync Engine</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} title={isCloudConnected ? 'Supabase Connected' : 'Local Storage Mode'} />
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              {isCloudConnected ? 'Supabase cloud active' : 'Local fallback · Zero-setup JSON sync'}
            </p>

            {/* Quick Export & Import Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={() => exportAllDataAsJSON(data)}
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-main)] transition-colors"
                title="Export all data to JSON file"
              >
                <Download className="w-3 h-3 text-[var(--text-muted)]" />
                Export
              </button>

              <label className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] text-[var(--text-main)] transition-colors cursor-pointer">
                <Upload className="w-3 h-3 text-[var(--text-muted)]" />
                Import
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleQuickImport}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={onOpenSyncModal}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-3 h-3" />
              Configure Cloud & SQL
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};
