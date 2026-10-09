import { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ChevronsDown,
  Pause,
  Play,
  Home,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { GameConfig, GameState } from '@/types';
import type { ThemeMode } from '@/types';
import { GameBoard } from './GameBoard';
import { SPAWN_ROWS } from '@/gameLogic';

interface GameScreenProps {
  config: GameConfig;
  state: GameState;
  theme: ThemeMode;
  showHint: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onHome: () => void;
  onToggleHint: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GameScreen({
  config,
  state,
  theme,
  showHint,
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onHardDrop,
  onPause,
  onResume,
  onReset,
  onHome,
  onToggleHint,
}: GameScreenProps) {
  const isDark = theme === 'dark';
  const { cols, rows } = config.difficulty;

  const cellSize = useMemo(() => {
    const maxBoardWidth = Math.min(
      typeof window !== 'undefined' ? window.innerWidth - 32 : 600,
      600,
    );
    const maxBoardHeight = Math.min(
      typeof window !== 'undefined' ? window.innerHeight - 168 : 600,
      600,
    );
    const sizeByWidth = Math.floor(maxBoardWidth / cols);
    const sizeByHeight = Math.floor(maxBoardHeight / (rows + SPAWN_ROWS));
    return Math.min(sizeByWidth, sizeByHeight, 64);
  }, [cols, rows]);

  const btnBase =
    'flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90 font-medium';

  return (
    <div
      className={`min-h-[100dvh] flex flex-col overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-sky-50 via-white to-cyan-50'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 backdrop-blur-sm border-b shadow-sm ${
          isDark
            ? 'bg-slate-900/80 border-slate-700/70'
            : 'bg-white/85 border-slate-200/80'
        }`}
      >
        <button
          onClick={onHome}
          className={`flex items-center gap-2 transition-colors ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Menu</span>
        </button>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <div className={`text-[10px] uppercase tracking-wide leading-none ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Time</div>
              <div className={`text-base font-bold leading-tight tabular-nums ${isDark ? 'text-white' : 'text-slate-950'}`}>{formatTime(state.elapsed)}</div>
            </div>
          </div>
        </div>

        <div className="mr-14 flex items-center gap-2">
          <button
            onClick={onToggleHint}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950'
            }`}
            aria-label={showHint ? 'Hide hint' : 'Show hint'}
          >
            {showHint ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Hint</span>
          </button>

          <button
            onClick={state.paused ? onResume : onPause}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950'
            }`}
          >
            {state.paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span className="hidden sm:inline">{state.paused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto p-4 pb-28">
        <div className="min-h-full flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            <GameBoard
              state={state}
              config={config}
              cellSize={cellSize}
              theme={theme}
              showHint={showHint}
            />
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-sm border-t ${
          isDark ? 'bg-slate-900/80 border-slate-700/70' : 'bg-white/85 border-slate-200/80'
        }`}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto">
          <button
            onClick={onMoveLeft}
            className={`${btnBase} h-12 w-12 sm:h-14 sm:w-14 ring-1 shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 ring-slate-600/50 text-white'
                : 'bg-white hover:bg-slate-100 ring-slate-300 text-slate-700'
            }`}
            aria-label="Move left"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onClick={onHardDrop}
            className={`${btnBase} h-12 w-12 sm:h-14 sm:w-14 bg-emerald-500 hover:bg-emerald-400 ring-1 ring-emerald-300 text-white shadow-sm`}
            aria-label="Hard drop"
          >
            <ChevronsDown className="w-6 h-6" />
          </button>

          <button
            onClick={onMoveDown}
            className={`${btnBase} h-12 w-12 sm:h-14 sm:w-14 ring-1 shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 ring-slate-600/50 text-white'
                : 'bg-white hover:bg-slate-100 ring-slate-300 text-slate-700'
            }`}
            aria-label="Soft drop"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          <button
            onClick={onMoveRight}
            className={`${btnBase} h-12 w-12 sm:h-14 sm:w-14 ring-1 shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 ring-slate-600/50 text-white'
                : 'bg-white hover:bg-slate-100 ring-slate-300 text-slate-700'
            }`}
            aria-label="Move right"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {state.paused && !state.won && (
        <div
          className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center animate-fade-in ${
            isDark ? 'bg-slate-950/80' : 'bg-white/80'
          }`}
        >
          <div className="text-center">
            <Pause className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>Paused</h2>
            <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Take a breather. Resume when ready.</p>
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={onResume}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
              >
                <Play className="w-5 h-5" />
                Resume
              </button>
              <button
                onClick={onReset}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                Restart
              </button>
              <button
                onClick={onHome}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                <Home className="w-5 h-5" />
                Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {state.wrongFlash && (
        <div className="fixed inset-0 z-40 bg-red-500/10 pointer-events-none animate-flash" />
      )}
    </div>
  );
}
