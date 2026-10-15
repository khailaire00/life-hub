import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { ThemeName } from '../types';

interface ThemeOption {
  id: ThemeName;
  name: string;
  desc: string;
  colors: string[]; // preview swatches
}

const THEMES: ThemeOption[] = [
  {
    id: 'slate',
    name: 'Slate',
    desc: 'Minimalist Gray',
    colors: ['#0f172a', '#64748b', '#f1f5f9']
  },
  {
    id: 'emerald',
    name: 'Emerald',
    desc: 'Forest Green',
    colors: ['#15803d', '#435e49', '#e7f0e9']
  },
  {
    id: 'amber',
    name: 'Amber',
    desc: 'Warm Sepia',
    colors: ['#b45309', '#735d48', '#f3ece0']
  },
  {
    id: 'rose',
    name: 'Rose',
    desc: 'Pastel Pink',
    colors: ['#be185d', '#794a53', '#fce8eb']
  },
  {
    id: 'midnight',
    name: 'Midnight',
    desc: 'Dark Cyberpunk',
    colors: ['#06b6d4', '#94a3b8', '#0f172a']
  }
];

interface Props {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export const ThemeSelector: React.FC<Props> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border transition-all text-[var(--text-main)] bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
        aria-label="Theme Settings"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="font-medium">Theme: {activeThemeObj.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {activeThemeObj.colors.slice(0, 2).map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-1.5 left-0 w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-lg p-1.5 z-50 space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Color Palette
          </div>
          {THEMES.map((theme) => {
            const isSelected = theme.id === currentTheme;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium'
                    : 'text-[var(--text-main)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-0.5">
                    {theme.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="leading-tight font-medium">{theme.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{theme.desc}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
