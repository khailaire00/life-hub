import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Flame,
  Trash2,
  Calendar,
  Save,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { JournalEntry } from '../../types';

interface Props {
  journalEntries: JournalEntry[];
  onUpdateJournal: (entries: JournalEntry[]) => void;
  brainDump: string;
  onUpdateBrainDump: (text: string) => void;
}

const MOODS = [
  { value: 1, emoji: '😫', label: 'Drained' },
  { value: 2, emoji: '😔', label: 'Subdued' },
  { value: 3, emoji: '😐', label: 'Centered' },
  { value: 4, emoji: '😊', label: 'Energized' },
  { value: 5, emoji: '⚡', label: 'Radiant' },
];

export const JournalTab: React.FC<Props> = ({
  journalEntries,
  onUpdateJournal,
  brainDump,
  onUpdateBrainDump,
}) => {
  const [activeView, setActiveView] = useState<'journal' | 'sandbox'>('journal');

  // Journal form state
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(4);
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Brain Dump state
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;

    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      title: journalTitle.trim() || `Reflection · ${journalDate}`,
      content: journalContent.trim(),
      mood: selectedMood,
      date: journalDate,
      createdAt: new Date().toISOString(),
    };

    onUpdateJournal([newEntry, ...journalEntries]);
    setJournalTitle('');
    setJournalContent('');
    setSelectedMood(4);
  };

  const handleDeleteEntry = (id: string) => {
    onUpdateJournal(journalEntries.filter(j => j.id !== id));
  };

  const handlePurgeDump = () => {
    onUpdateBrainDump('');
    setShowPurgeConfirm(false);
  };

  const wordCount = brainDump.trim() ? brainDump.trim().split(/\s+/).length : 0;
  const charCount = brainDump.length;

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            Journal & Sandbox
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Reflective daily journaling with mood calibration and raw thought sandbox.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
          <button
            onClick={() => setActiveView('journal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'journal'
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Daily Journal ({journalEntries.length})
          </button>
          <button
            onClick={() => setActiveView('sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'sandbox'
                ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Brain Dump Sandbox
          </button>
        </div>
      </div>

      {/* VIEW 1: DAILY JOURNAL */}
      {activeView === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Compose Entry (7 cols) */}
          <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                New Journal Entry
              </h2>
              <input
                type="date"
                value={journalDate}
                onChange={(e) => setJournalDate(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] font-mono tabular-nums text-[var(--text-muted)]"
              />
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <input
                type="text"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                placeholder="Entry title (e.g. Morning Horizon & Focus Strategy)..."
                className="w-full text-sm font-medium p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)]"
              />

              {/* 5-Emoji Mood Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)]">State of Mind Calibration:</label>
                <div className="grid grid-cols-5 gap-2">
                  {MOODS.map((m) => {
                    const isSelected = selectedMood === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setSelectedMood(m.value)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-xs scale-102'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <span className="text-xl mb-0.5">{m.emoji}</span>
                        <span className={`text-[10px] ${isSelected ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Large Textarea */}
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                rows={8}
                placeholder="What was the dominant rhythm of your day? What challenged you, what energized you, and what are you grateful for?"
                className="w-full text-xs p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)] leading-relaxed resize-y"
              />

              <button
                type="submit"
                disabled={!journalContent.trim()}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                Save Entry
              </button>
            </form>
          </div>

          {/* RIGHT: Chronological History (5 cols) */}
          <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent)]" />
                Chronological History
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                {journalEntries.length} Logs
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pt-1">
              {journalEntries.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                  No journal entries logged yet. Write your first reflection on the left!
                </div>
              ) : (
                journalEntries.map((entry) => {
                  const moodObj = MOODS.find(m => m.value === entry.mood) || MOODS[2];
                  const isExpanded = expandedEntryId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/50 hover:bg-[var(--bg-canvas)] transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{moodObj.emoji}</span>
                            <h4 className="text-xs font-semibold text-[var(--text-main)] truncate">
                              {entry.title}
                            </h4>
                          </div>
                          <span className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums pl-6 inline-block">
                            {entry.date} · {moodObj.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-600 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-xs text-[var(--text-muted)] leading-relaxed pl-6 whitespace-pre-line ${
                        isExpanded ? '' : 'line-clamp-2'
                      }`}>
                        {entry.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: BRAIN DUMP SANDBOX */}
      {activeView === 'sandbox' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-main)]">
                Unstructured Brain Dump Container
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Messy drafting space. Everything you type is automatically cached into memory.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                <span>{wordCount} Words</span>
                <span className="mx-1.5">·</span>
                <span>{charCount} Chars</span>
              </div>

              <button
                onClick={() => setShowPurgeConfirm(true)}
                disabled={!brainDump.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge / Clear Text
              </button>
            </div>
          </div>

          {/* Purge Confirm Dialog */}
          {showPurgeConfirm && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Are you sure you want to permanently clear all text in the brain dump?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowPurgeConfirm(false)}
                  className="px-3 py-1 text-xs rounded-md border border-[var(--border-subtle)] text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-muted)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurgeDump}
                  className="px-3 py-1 text-xs rounded-md bg-rose-600 text-white font-medium hover:bg-rose-700"
                >
                  Confirm Purge
                </button>
              </div>
            </div>
          )}

          {/* Single Massive Unstructured Textbox */}
          <textarea
            value={brainDump}
            onChange={(e) => onUpdateBrainDump(e.target.value)}
            rows={18}
            placeholder="Start typing without filters. Stream of consciousness, raw meeting notes, unformatted code snippets, shower thoughts..."
            className="w-full text-xs font-mono p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)] leading-relaxed resize-y"
          />
        </div>
      )}
    </div>
  );
};
