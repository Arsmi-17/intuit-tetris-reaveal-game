import type { GridTile } from '@/types';

interface PieceTileProps {
  tile: GridTile;
  imageUrl: string;
  /** Background size: the image is scaled to cover the entire board area. */
  bgSize: string;
  /** Whether this tile is part of the ghost (target hint). */
  isGhost?: boolean;
  /** Whether this tile is part of the currently falling piece. */
  isFalling?: boolean;
  /** Whether this tile is part of a wrong-placement flash. */
  isWrong?: boolean;
  /** Whether this tile is correctly placed. */
  isPlaced?: boolean;
  /** Optional className for custom sizing. */
  className?: string;
}

/**
 * Renders a single tile that shows a slice of the source image
 * using CSS background-position.
 */
export function PieceTile({
  tile,
  imageUrl,
  bgSize,
  isGhost = false,
  isFalling = false,
  isWrong = false,
  isPlaced = false,
  className = '',
}: PieceTileProps) {
  const baseStyle: React.CSSProperties = {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: bgSize,
    backgroundPosition: `${tile.bgPosX}% ${tile.bgPosY}%`,
  };

  let stateClasses = '';
  if (isWrong) {
    stateClasses = 'z-20 ring-2 ring-red-500 shadow-lg shadow-red-500/40 animate-shake';
  } else if (isPlaced) {
    stateClasses = 'ring-1 ring-white/20 shadow-sm';
  } else if (isFalling) {
    stateClasses = 'z-20 ring-2 ring-cyan-300/80 shadow-lg shadow-cyan-500/30';
  } else if (isGhost) {
    stateClasses = 'z-10 ring-2 ring-dashed ring-yellow-400/80 animate-pulse-glow';
  }

  return (
    <div
      className={`relative overflow-hidden transition-all duration-150 ${stateClasses} ${className}`}
      style={baseStyle}
    >
      {isFalling && (
        <div className="absolute inset-0 bg-cyan-400/10" />
      )}
      {isGhost && (
        <div
          className="absolute inset-0 border-2 border-dashed border-yellow-400/90"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: bgSize,
            backgroundPosition: `${tile.bgPosX}% ${tile.bgPosY}%`,
            opacity: 0.35,
          }}
        />
      )}
    </div>
  );
}
