import { useState, useCallback, useEffect } from 'react';
import { StartScreen } from '@/components/StartScreen';
import { GameScreen } from '@/components/GameScreen';
import { WinScreen } from '@/components/WinScreen';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useGameEngine } from '@/useGameEngine';
import type { GameConfig, GameScreen as ScreenType, GameState, ThemeMode } from '@/types';

function App() {
  const [screen, setScreen] = useState<ScreenType>('start');
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [completedState, setCompletedState] = useState<GameState | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [showHint, setShowHint] = useState(true);

  const engine = useGameEngine(screen === 'playing' ? config : null);
  const isDark = theme === 'dark';

  const handleToggleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const handleToggleHint = useCallback(() => {
    setShowHint((current) => !current);
  }, []);

  const handleStart = useCallback((cfg: GameConfig) => {
    setCompletedState(null);
    setConfig(cfg);
    setScreen('playing');
  }, []);

  const handleHome = useCallback(() => {
    setCompletedState(null);
    setScreen('start');
    setConfig(null);
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (config) {
      // Force re-init by creating a new config object reference
      setCompletedState(null);
      setConfig({ ...config });
      setScreen('playing');
    }
  }, [config]);

  const handleReset = useCallback(() => {
    engine.reset();
  }, [engine]);

  // Auto-detect win — must be in an effect, not during render
  useEffect(() => {
    if (screen === 'playing' && engine.state.won) {
      setCompletedState(engine.state);
      setScreen('won');
    }
  }, [screen, engine.state]);

  if (screen === 'start' || !config) {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        <StartScreen onStart={handleStart} theme={theme} />
      </>
    );
  }

  if (screen === 'won') {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        <WinScreen
          config={config}
          state={completedState ?? engine.state}
          theme={theme}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      </>
    );
  }

  // Don't render GameScreen until the engine has initialized the board
  if (engine.state.board.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
            : 'bg-gradient-to-br from-sky-50 via-white to-cyan-50'
        }`}
      >
        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        <div className="text-center">
          <div
            className={`inline-block w-10 h-10 border-3 border-t-cyan-400 rounded-full animate-spin mb-4 ${
              isDark ? 'border-slate-700' : 'border-slate-200'
            }`}
          />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Preparing puzzle...
          </p>
        </div>
      </div>
    );
  }

  return (
    <GameScreen
      config={config}
      state={engine.state}
      theme={theme}
      showHint={showHint}
      onMoveLeft={engine.moveLeft}
      onMoveRight={engine.moveRight}
      onMoveDown={engine.moveDown}
      onHardDrop={engine.hardDrop}
      onPause={engine.pause}
      onResume={engine.resume}
      onReset={handleReset}
      onHome={handleHome}
      onToggleHint={handleToggleHint}
    />
  );
}

export default App;
