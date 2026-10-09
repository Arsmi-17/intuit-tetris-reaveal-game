import { Play } from 'lucide-react';
import { PUZZLE_IMAGES, DIFFICULTIES } from '@/gameLogic';
import type { GameConfig, ThemeMode } from '@/types';

interface StartScreenProps {
  onStart: (config: GameConfig) => void;
  theme: ThemeMode;
}

export function StartScreen({ onStart, theme }: StartScreenProps) {
  const isDark = theme === 'dark';
  const defaultConfig: GameConfig = {
    image: PUZZLE_IMAGES[0],
    difficulty: DIFFICULTIES.hard,
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 sm:p-6 ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-sky-50 via-white to-cyan-50'
      }`}
    >
      <button
        onClick={() => onStart(defaultConfig)}
        className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.03] active:scale-95 transition-all duration-200"
      >
        <Play className="w-6 h-6 fill-current" />
        Start
      </button>
    </div>
  );
}
