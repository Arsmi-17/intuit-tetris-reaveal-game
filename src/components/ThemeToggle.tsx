import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '@/types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      className={`fixed right-4 top-4 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-xl shadow-lg transition active:scale-95 ${
        isDark
          ? 'bg-slate-800 text-cyan-200 ring-1 ring-slate-600 hover:bg-slate-700'
          : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
      }`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
