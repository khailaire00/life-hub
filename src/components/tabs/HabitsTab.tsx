import React, { useState } from 'react';
import {
  Flame,
  Check,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  Settings,
  Edit2
} from 'lucide-react';
import { Habit, HabitLog } from '../../types';

interface Props {
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
  habitLogs: HabitLog[];
  onUpdateHabitLogs: (logs: HabitLog[]) => void;
}

export const HabitsTab: React.FC<Props> = ({
  habits,
  onUpdateHabits,
  habitLogs,
  onUpdateHabitLogs,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTarget, setNewHabitTarget] = useState('Daily');

  // Generate last 14 days dates array (from 13 days ago to today)
  const days: { dateStr: string; dayLabel: string; dateNum: number; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const dateNum = d.getDate();
    days.push({
      dateStr,
      dayLabel,
      dateNum,
      isToday: i === 0,
    });
  }

  const todayStr = days[days.length - 1].dateStr;

  const isCompleted = (habitId: string, dateStr: string): boolean => {
    const log = habitLogs.find(l => l.habitId === habitId && l.date === dateStr);
    return !!log?.completed;
  };

  const toggleHabitDay = (habitId: string, dateStr: string) => {
    const existingIndex = habitLogs.findIndex(l => l.habitId === habitId && l.date === dateStr);
    if (existingIndex >= 0) {
      const updated = [...habitLogs];
      updated[existingIndex] = {
        ...updated[existingIndex],
        completed: !updated[existingIndex].completed,
      };
      onUpdateHabitLogs(updated);
    } else {
      const newLog: HabitLog = {
        id: `hl-${Date.now()}-${habitId}`,
        habitId,
        date: dateStr,
        completed: true,
      };
      onUpdateHabitLogs([...habitLogs, newLog]);
    }
  };

  // Calculate current streak
  const calculateStreak = (habitId: string): number => {
    let streak = 0;
    const current = new Date();

    // Check if completed today; if not, check from yesterday
    let checkDate = new Date(current);
    let checkDateStr = checkDate.toISOString().split('T')[0];
    const doneToday = isCompleted(habitId, checkDateStr);

    if (!doneToday) {
      // If not done today, start checking from yesterday to see if unbroken
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = checkDate.toISOString().split('T')[0];
    }

    while (true) {
      if (isCompleted(habitId, checkDateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkDateStr = checkDate.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate completion percentage over last 14 days
  const calculateRate = (habitId: string): number => {
    const completedCount = days.filter(d => isCompleted(habitId, d.dateStr)).length;
    return Math.round((completedCount / days.length) * 100);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newH: Habit = {
      id: `h-${Date.now()}`,
      name: newHabitName.trim(),
      target: newHabitTarget.trim() || 'Daily',
      createdAt: new Date().toISOString(),
    };

    onUpdateHabits([...habits, newH]);
    setNewHabitName('');
    setShowAddForm(false);
  };

  const handleDeleteHabit = (id: string) => {
    onUpdateHabits(habits.filter(h => h.id !== id));
    onUpdateHabitLogs(habitLogs.filter(l => l.habitId !== id));
  };

  const todayCompletedCount = habits.filter(h => isCompleted(h.id, todayStr)).length;
  const overallTodayRate = habits.length > 0 ? Math.round((todayCompletedCount / habits.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            Habit Tracker
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            14-day horizontal visual calendar checklist with continuous streak calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-mono tabular-nums">
            <span className="text-[var(--text-muted)]">Today's Rate:</span>
            <span className="font-bold text-[var(--accent)]">{overallTodayRate}%</span>
            <span className="text-[var(--text-muted)]">({todayCompletedCount}/{habits.length})</span>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Habit
          </button>
        </div>
      </div>

      {/* Add Habit Form Modal/Card */}
      {showAddForm && (
        <form onSubmit={handleAddHabit} className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Habit title (e.g. Read 30m, Cold Shower, 10k Steps)..."
            className="flex-1 w-full text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)]"
          />
          <input
            type="text"
            value={newHabitTarget}
            onChange={(e) => setNewHabitTarget(e.target.value)}
            placeholder="Target (e.g. Daily, 2.5L, 30m)..."
            className="w-full sm:w-40 text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]"
            >
              Save Habit
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2.5 text-xs rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Horizontal Calendar Grid Checklist */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 overflow-x-auto space-y-4">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 pb-3 border-b border-[var(--border-subtle)] items-center text-xs font-medium text-[var(--text-muted)]">
            <div className="col-span-4 pl-2">
              <span>Habit & Target</span>
            </div>
            <div className="col-span-6 flex items-center justify-between px-2">
              {days.map((d) => (
                <div
                  key={d.dateStr}
                  className={`flex flex-col items-center w-8 py-1 rounded-lg transition-colors ${
                    d.isToday ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold' : ''
                  }`}
                >
                  <span className="text-[10px] uppercase">{d.dayLabel}</span>
                  <span className="text-xs font-mono tabular-nums">{d.dateNum}</span>
                </div>
              ))}
            </div>
            <div className="col-span-2 flex items-center justify-end gap-6 pr-2">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Streak
              </span>
              <span>Rate</span>
              <span className="w-5"></span>
            </div>
          </div>

          {/* Habit Rows */}
          <div className="divide-y divide-[var(--border-subtle)]">
            {habits.map((habit) => {
              const streak = calculateStreak(habit.id);
              const rate = calculateRate(habit.id);

              return (
                <div
                  key={habit.id}
                  className="grid grid-cols-12 gap-2 py-3.5 items-center hover:bg-[var(--bg-canvas)]/50 transition-colors group"
                >
                  {/* Title & Target */}
                  <div className="col-span-4 pl-2 space-y-0.5">
                    <h4 className="text-xs font-semibold text-[var(--text-main)] truncate">
                      {habit.name}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {habit.target}
                    </p>
                  </div>

                  {/* 14 Checkboxes Grid */}
                  <div className="col-span-6 flex items-center justify-between px-2">
                    {days.map((d) => {
                      const done = isCompleted(habit.id, d.dateStr);

                      return (
                        <button
                          key={d.dateStr}
                          onClick={() => toggleHabitDay(habit.id, d.dateStr)}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                            d.isToday ? 'ring-1 ring-[var(--accent)]' : ''
                          } ${
                            done
                              ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-contrast)] shadow-xs scale-102'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                          }`}
                          title={`${habit.name} on ${d.dateStr}: ${done ? 'Completed' : 'Click to complete'}`}
                        >
                          {done && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Streak & Rate Counters */}
                  <div className="col-span-2 flex items-center justify-end gap-6 pr-2 text-xs font-mono tabular-nums">
                    <div className="flex items-center gap-1 font-semibold text-[var(--text-main)]">
                      <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-[var(--text-muted)]'}`} />
                      <span>{streak}d</span>
                    </div>

                    <span className="text-[var(--text-muted)] font-medium">
                      {rate}%
                    </span>

                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-600 transition-opacity"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
