import { useState, useCallback, useEffect } from 'react';
import { StartScreen } from '@/components/StartScreen';
import { GameScreen } from '@/components/GameScreen';
import { WinScreen } from '@/components/WinScreen';
import { OpacityScreen } from '@/components/OpacityScreen';
import { useGameEngine } from '@/useGameEngine';
import type { GameConfig, GameScreen as ScreenType, GameState } from '@/types';

/**
 * The game is a state machine rather than a set of pages, so the only real
 * route is the /opacity tuning page. A pathname check keeps that one extra
 * screen from pulling in a router.
 */
function usePathname(): string {
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  );

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return pathname;
}

function App() {
  const pathname = usePathname();
  const [screen, setScreen] = useState<ScreenType>('start');
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [completedState, setCompletedState] = useState<GameState | null>(null);

  const engine = useGameEngine(screen === 'playing' ? config : null);

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

  if (pathname.replace(/\/+$/, '') === '/opacity') {
    return <OpacityScreen />;
  }

  if (screen === 'start' || !config) {
    return <StartScreen onStart={handleStart} />;
  }

  if (screen === 'won') {
    return (
      <WinScreen config={config} state={completedState ?? engine.state} />
    );
  }

  // Don't render GameScreen until the engine has initialized the board
  if (engine.state.board.length === 0) {
    return (
      <div className="relative flex min-h-[100dvh] items-center justify-center">
        <div className="brand-backdrop" aria-hidden="true" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-blue/20 border-t-brand-blue" />
          <p className="text-sm text-brand-muted">Preparing puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <GameScreen
      config={config}
      state={engine.state}
      onMoveLeft={engine.moveLeft}
      onMoveRight={engine.moveRight}
      onMoveDown={engine.moveDown}
      onHardDrop={engine.hardDrop}
      onResume={engine.resume}
      onReset={handleReset}
      onHome={handleHome}
    />
  );
}

export default App;
