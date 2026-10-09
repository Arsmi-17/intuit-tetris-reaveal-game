import { useMemo } from 'react';
import type { GameState, GameConfig, ThemeMode } from '@/types';
import { PieceTile } from './PieceTile';
import { SPAWN_ROWS } from '@/gameLogic';

interface GameBoardProps {
  state: GameState;
  config: GameConfig;
  cellSize: number;
  theme: ThemeMode;
  showHint: boolean;
}

export function GameBoard({ state, config, cellSize, theme, showHint }: GameBoardProps) {
  const isDark = theme === 'dark';
  const { cols, rows } = config.difficulty;
  const imageUrl = config.image.url;
  const boardWidth = cols * cellSize;
  const boardHeight = rows * cellSize;
  const spawnHeight = SPAWN_ROWS * cellSize;
  const bgSize = `${boardWidth}px ${boardHeight}px`;

  const ghost = useMemo(() => {
    if (!showHint || !state.currentPiece || state.won) return null;
    const target = state.targets.get(state.currentPiece.id);
    if (!target) return null;
    return { pieceId: state.currentPiece.id, ...target };
  }, [showHint, state.currentPiece, state.targets, state.won]);

  const ghostCells = useMemo(() => {
    if (!ghost) return new Set<string>();
    const cells = new Set<string>();
    for (const cell of ghost.cells) {
      cells.add(`${ghost.col + cell.x},${ghost.row + cell.y}`);
    }
    return cells;
  }, [ghost]);

  const getTiles = (pieceId: number) => state.partitions.get(pieceId) ?? [];

  if (state.board.length === 0 || cellSize <= 0) {
    return (
      <div
        className={`rounded-lg ring-1 shadow-2xl animate-pulse ${
          isDark ? 'bg-slate-900/80 ring-slate-600/50' : 'bg-white/80 ring-slate-200'
        }`}
        style={{ width: cols * 40, height: rows * 40 }}
      />
    );
  }

  return (
    <div
      className="relative"
      style={{ width: boardWidth, height: boardHeight + spawnHeight }}
    >
      <div
        className={`absolute left-0 top-0 rounded-t-lg border border-dashed ${
          isDark ? 'border-cyan-300/35 bg-cyan-300/[0.03]' : 'border-cyan-500/45 bg-cyan-100/40'
        }`}
        style={{ width: boardWidth, height: spawnHeight }}
      >
        <div
          className={`absolute inset-x-0 bottom-0 border-b shadow-[0_0_18px_rgba(34,211,238,0.18)] ${
            isDark ? 'border-cyan-300/30' : 'border-cyan-500/35'
          }`}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,116,139,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.18) 1px, transparent 1px)',
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
        />
      </div>

      <div
        className={`absolute left-0 rounded-b-lg overflow-hidden ring-1 shadow-2xl ${
          isDark ? 'bg-slate-900/80 ring-slate-600/50' : 'bg-white/90 ring-slate-300'
        }`}
        style={{ top: spawnHeight, width: boardWidth, height: boardHeight }}
      >
        <img
          src={imageUrl}
          alt="Puzzle reference"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none ${
            isDark ? 'opacity-[0.07]' : 'opacity-[0.12]'
          }`}
          draggable={false}
        />

        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const key = `${col},${row}`;
            const cellValue = state.board[row][col];
            const isGhostCell = ghostCells.has(key);

            const ghostEdges = isGhostCell
              ? {
                  top: !ghostCells.has(`${col},${row - 1}`),
                  bottom: !ghostCells.has(`${col},${row + 1}`),
                  left: !ghostCells.has(`${col - 1},${row}`),
                  right: !ghostCells.has(`${col + 1},${row}`),
                }
              : null;

            return (
              <div
                key={i}
                className={`relative border ${isDark ? 'border-slate-700/30' : 'border-slate-300/70'}`}
                style={{ width: cellSize, height: cellSize }}
              >
                <div className={`absolute inset-0 ${isDark ? 'bg-slate-800/20' : 'bg-white/10'}`} />

                {isGhostCell && cellValue === null && state.currentPiece && (() => {
                  const tileIdx = ghost!.cells.findIndex(
                    (c) => ghost!.col + c.x === col && ghost!.row + c.y === row,
                  );
                  const ghostTile = getTiles(state.currentPiece.id)[tileIdx];
                  if (!ghostTile || !ghostEdges) return null;
                  return (
                    <div
                      className="absolute inset-0 animate-pulse-glow"
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: bgSize,
                        backgroundPosition: `${ghostTile.bgPosX}% ${ghostTile.bgPosY}%`,
                        opacity: 0.3,
                      }}
                    >
                      <div className="absolute inset-0 bg-amber-400/20" />
                      {ghostEdges.top && (
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      )}
                      {ghostEdges.bottom && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      )}
                      {ghostEdges.left && (
                        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      )}
                      {ghostEdges.right && (
                        <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      )}
                    </div>
                  );
                })()}

                {cellValue !== null && (() => {
                  const tiles = getTiles(cellValue);
                  const target = state.targets.get(cellValue);
                  if (!target) return null;
                  const tileIdx = tiles.findIndex((_, idx) => {
                    const expectedX = cols > 1 ? `${(col / (cols - 1)) * 100}` : '50';
                    const expectedY = rows > 1 ? `${(row / (rows - 1)) * 100}` : '50';
                    return tiles[idx].bgPosX === expectedX && tiles[idx].bgPosY === expectedY;
                  });
                  if (tileIdx < 0) return null;
                  return (
                    <PieceTile
                      tile={tiles[tileIdx]}
                      imageUrl={imageUrl}
                      bgSize={bgSize}
                      isPlaced
                      className="w-full h-full"
                    />
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>

      {state.currentPiece && (() => {
        const tiles = getTiles(state.currentPiece.id);
        return state.currentPiece.cells.map((cell, tileIdx) => {
          const tile = tiles[tileIdx];
          if (!tile) return null;
          return (
            <div
              key={`${state.currentPiece!.id}-${tileIdx}`}
              className="absolute z-30"
              style={{
                left: (state.currentPiece!.col + cell.x) * cellSize,
                top: (state.currentPiece!.row + cell.y + SPAWN_ROWS) * cellSize,
                width: cellSize,
                height: cellSize,
              }}
            >
              <PieceTile
                tile={tile}
                imageUrl={imageUrl}
                bgSize={bgSize}
                isFalling
                isWrong={state.wrongFlash}
                className="w-full h-full"
              />
            </div>
          );
        });
      })()}
    </div>
  );
}
