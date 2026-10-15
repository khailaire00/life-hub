import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Clock,
  Calendar,
  Sparkles,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { ScheduleBlock, Task } from '../../types';

interface Props {
  scheduleBlocks: ScheduleBlock[];
  onUpdateSchedule: (blocks: ScheduleBlock[]) => void;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const DashboardTab: React.FC<Props> = ({
  scheduleBlocks,
  onUpdateSchedule,
  tasks,
  onUpdateTasks,
}) => {
  // Pomodoro State
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const durationMap = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
  const [timeLeft, setTimeLeft] = useState(durationMap.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Audio chime via Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // Audio fallback silent
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playChime();
      if (timerMode === 'focus') {
        setCompletedSessions(c => c + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  const handleModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setTimerMode(mode);
    setIsRunning(false);
    setTimeLeft(durationMap[mode]);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durationMap[timerMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Task checklist state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      priority: taskPriority,
      createdAt: new Date().toISOString(),
    };
    onUpdateTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    onUpdateTasks(
      tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'active') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  // Time-Blocking state
  const [editingHour, setEditingHour] = useState<string | null>(null);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockCategory, setBlockCategory] = useState<ScheduleBlock['category']>('work');

  const handleSaveBlock = (hour: string) => {
    if (!blockTitle.trim()) {
      // Remove block if title empty
      onUpdateSchedule(scheduleBlocks.filter(b => b.hour !== hour));
      setEditingHour(null);
      return;
    }

    const existingIndex = scheduleBlocks.findIndex(b => b.hour === hour);
    if (existingIndex >= 0) {
      const updated = [...scheduleBlocks];
      updated[existingIndex] = {
        ...updated[existingIndex],
        title: blockTitle.trim(),
        category: blockCategory,
      };
      onUpdateSchedule(updated);
    } else {
      const newBlock: ScheduleBlock = {
        id: `sb-${Date.now()}`,
        hour,
        title: blockTitle.trim(),
        category: blockCategory,
        completed: false,
      };
      onUpdateSchedule([...scheduleBlocks, newBlock]);
    }
    setEditingHour(null);
    setBlockTitle('');
  };

  const toggleBlockCompleted = (hour: string) => {
    onUpdateSchedule(
      scheduleBlocks.map(b => (b.hour === hour ? { ...b, completed: !b.completed } : b))
    );
  };

  const removeBlock = (hour: string) => {
    onUpdateSchedule(scheduleBlocks.filter(b => b.hour !== hour));
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
            Dashboard & Productivity
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Synchronized hourly scheduling, deep work interval timer, and action checklist.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono tabular-nums">
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span>·</span>
          <span>{completedTasksCount}/{tasks.length} Tasks Done</span>
        </div>
      </div>

      {/* Split Layout: Left Timeline, Right Timer + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Time-Blocking Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm font-semibold text-[var(--text-main)]">Daily Chronological Time-Blocking</h2>
            </div>
            <span className="text-xs text-[var(--text-muted)]">Click any hour to assign or edit blocks</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {HOURS.map((hour) => {
              const block = scheduleBlocks.find(b => b.hour === hour);
              const isEditing = editingHour === hour;

              return (
                <div
                  key={hour}
                  className={`group flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                    block
                      ? block.completed
                        ? 'bg-[var(--bg-muted)]/50 border-[var(--border-subtle)] opacity-70'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                      : 'bg-transparent border-dashed border-[var(--border-subtle)]/70 hover:border-[var(--border-strong)] hover:bg-[var(--bg-canvas)]'
                  }`}
                >
                  {/* Hour Marker */}
                  <span className="w-12 text-xs font-mono font-medium text-[var(--text-muted)] tabular-nums pt-0.5 shrink-0">
                    {hour}
                  </span>

                  {/* Content or Edit Form */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={blockTitle}
                          onChange={(e) => setBlockTitle(e.target.value)}
                          placeholder="What will you accomplish during this hour?"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveBlock(hour);
                            if (e.key === 'Escape') setEditingHour(null);
                          }}
                          className="w-full text-xs p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)]"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={blockCategory}
                            onChange={(e) => setBlockCategory(e.target.value as any)}
                            className="text-[11px] p-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-main)]"
                          >
                            <option value="deep_work">Deep Work</option>
                            <option value="work">Work & Meetings</option>
                            <option value="fitness">Fitness & Health</option>
                            <option value="personal">Personal / Errands</option>
                            <option value="break">Rest & Meal Break</option>
                          </select>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSaveBlock(hour)}
                              className="px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--accent)] text-[var(--accent-contrast)]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingHour(null)}
                              className="px-2.5 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : block ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleBlockCompleted(hour)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              block.completed
                                ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-contrast)]'
                                : 'border-[var(--border-strong)] hover:border-[var(--accent)]'
                            }`}
                          >
                            {block.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <span
                            onClick={() => {
                              setEditingHour(hour);
                              setBlockTitle(block.title);
                              setBlockCategory(block.category);
                            }}
                            className={`text-xs cursor-pointer truncate ${
                              block.completed
                                ? 'line-through text-[var(--text-muted)]'
                                : 'text-[var(--text-main)] font-medium'
                            }`}
                          >
                            {block.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {block.category === 'deep_work' && 'Deep Work'}
                            {block.category === 'work' && 'Work'}
                            {block.category === 'fitness' && 'Fitness'}
                            {block.category === 'personal' && 'Personal'}
                            {block.category === 'break' && 'Break'}
                          </span>
                          <button
                            onClick={() => removeBlock(hour)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-600 transition-opacity"
                            title="Delete timeblock"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingHour(hour);
                          setBlockTitle('');
                          setBlockCategory('work');
                        }}
                        className="w-full text-left text-xs text-[var(--text-muted)]/70 hover:text-[var(--text-main)] py-0.5 flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Empty slot · Click to schedule</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Pomodoro Timer + Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Pomodoro Countdown Timer */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Focus Engine
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                {completedSessions} {completedSessions === 1 ? 'Sprint' : 'Sprints'} Completed
              </span>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center p-1 bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-subtle)] text-xs font-medium">
              <button
                onClick={() => handleModeChange('focus')}
                className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
                  timerMode === 'focus'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                25m Focus
              </button>
              <button
                onClick={() => handleModeChange('shortBreak')}
                className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
                  timerMode === 'shortBreak'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                5m Break
              </button>
              <button
                onClick={() => handleModeChange('longBreak')}
                className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
                  timerMode === 'longBreak'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                15m Rest
              </button>
            </div>

            {/* Giant Tabular Clock Display */}
            <div className="text-center py-2">
              <div className="text-5xl font-mono font-bold tracking-tight text-[var(--text-main)] tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {isRunning ? 'Session in progress' : 'Paused / Ready'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-opacity bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 shadow-sm"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={handleResetTimer}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-xs border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--bg-muted)] transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Reset
              </button>
            </div>
          </div>

          {/* Minimalist To-Do Checklist */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-sm font-semibold text-[var(--text-main)]">Action Checklist</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2 py-0.5 rounded ${taskFilter === 'all' ? 'text-[var(--accent)] font-semibold underline' : 'hover:text-[var(--text-main)]'}`}
                >
                  All
                </button>
                <span>·</span>
                <button
                  onClick={() => setTaskFilter('active')}
                  className={`px-2 py-0.5 rounded ${taskFilter === 'active' ? 'text-[var(--accent)] font-semibold underline' : 'hover:text-[var(--text-main)]'}`}
                >
                  Active
                </button>
                <span>·</span>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-2 py-0.5 rounded ${taskFilter === 'completed' ? 'text-[var(--accent)] font-semibold underline' : 'hover:text-[var(--text-main)]'}`}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex items-center gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add high-priority task..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)]"
              />
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="text-xs p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-muted)] focus:outline-none"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2 pt-1 max-h-80 overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                  No tasks in this view.
                </div>
              ) : (
                filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className="group flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/40 hover:bg-[var(--bg-canvas)] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleTask(t.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          t.completed
                            ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-contrast)]'
                            : 'border-[var(--border-strong)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span
                        className={`text-xs truncate ${
                          t.completed
                            ? 'line-through text-[var(--text-muted)]'
                            : 'text-[var(--text-main)] font-medium'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--text-muted)] capitalize">
                        {t.priority}
                      </span>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-600 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
