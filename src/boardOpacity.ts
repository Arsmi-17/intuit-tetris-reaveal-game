/**
 * How strongly the finished picture shows through the empty board.
 *
 * Stored and edited as a whole percentage (10, 15, 20 …) because that is how
 * it is talked about; only the CSS layer needs the 0–1 form.
 *
 * The /opacity page writes an override to localStorage so values can be tried
 * without a rebuild. Change DEFAULT_BOARD_IMAGE_OPACITY below to set the value
 * every player gets.
 */

export const DEFAULT_BOARD_IMAGE_OPACITY = 20;

export const MIN_BOARD_IMAGE_OPACITY = 0;
export const MAX_BOARD_IMAGE_OPACITY = 100;

const STORAGE_KEY = 'tetris.boardImageOpacity';

export function clampOpacity(percent: number): number {
  if (!Number.isFinite(percent)) return DEFAULT_BOARD_IMAGE_OPACITY;
  return Math.min(
    MAX_BOARD_IMAGE_OPACITY,
    Math.max(MIN_BOARD_IMAGE_OPACITY, Math.round(percent)),
  );
}

/** The percentage in force right now: the saved override, else the default. */
export function getBoardImageOpacity(): number {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return DEFAULT_BOARD_IMAGE_OPACITY;
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? DEFAULT_BOARD_IMAGE_OPACITY : clampOpacity(parsed);
  } catch {
    // Private mode or blocked storage — fall back to the compiled-in value.
    return DEFAULT_BOARD_IMAGE_OPACITY;
  }
}

export function setBoardImageOpacity(percent: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(clampOpacity(percent)));
  } catch {
    // Nothing to do: the preview still works, it just will not persist.
  }
}

export function resetBoardImageOpacity(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

/** The 0–1 value CSS wants. */
export function toCssOpacity(percent: number): number {
  return clampOpacity(percent) / 100;
}
