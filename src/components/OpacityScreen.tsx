import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { PUZZLE_IMAGES, DIFFICULTIES } from '@/gameLogic';
import {
  DEFAULT_BOARD_IMAGE_OPACITY,
  MAX_BOARD_IMAGE_OPACITY,
  MIN_BOARD_IMAGE_OPACITY,
  clampOpacity,
  getBoardImageOpacity,
  resetBoardImageOpacity,
  setBoardImageOpacity,
  toCssOpacity,
} from '@/boardOpacity';

/** Values worth trying first. */
const PRESETS = [0, 10, 15, 20, 30];

const { cols, rows } = DIFFICULTIES.hard;
const PREVIEW_IMAGE = PUZZLE_IMAGES[0];

/**
 * A tuning page for how strongly the finished picture shows through the empty
 * board. Values are entered as whole percentages; the saved value takes effect
 * in the game immediately.
 */
export function OpacityScreen() {
  // `draft` is what is typed (may be empty mid-edit); `percent` is what renders.
  const [percent, setPercent] = useState(() => getBoardImageOpacity());
  const [draft, setDraft] = useState(() => String(getBoardImageOpacity()));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 1600);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const apply = (value: number) => {
    const next = clampOpacity(value);
    setPercent(next);
    setDraft(String(next));
    setBoardImageOpacity(next);
    setSaved(true);
  };

  const handleReset = () => {
    resetBoardImageOpacity();
    setPercent(DEFAULT_BOARD_IMAGE_OPACITY);
    setDraft(String(DEFAULT_BOARD_IMAGE_OPACITY));
    setSaved(true);
  };

  return (
    <div className="relative min-h-[100dvh] w-full">
      <div className="brand-backdrop" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-md px-6 py-10 lg:max-w-5xl lg:py-14">
        <header>
          <img src="/assets/intuit-logo.png" alt="Intuit" className="h-8 w-auto" />
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-brand-ink lg:text-5xl">
            Board image <span className="text-brand-blue">opacity</span>
          </h1>
          <p className="mt-2 text-brand-body">
            How strongly the finished picture shows through the empty board.
            Enter a whole percentage &mdash; 10, 15, 20.
          </p>
        </header>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
          {/* ---- Live preview, built exactly like the real board ---- */}
          <div>
            <div
              className="relative mx-auto w-full max-w-sm overflow-hidden bg-black lg:max-w-none"
              style={{ aspectRatio: `${cols} / ${rows}` }}
            >
              <img
                src={PREVIEW_IMAGE.url}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
                style={{ opacity: toCssOpacity(percent) }}
              />

              <div
                className="absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                }}
              >
                {Array.from({ length: cols * rows }).map((_, i) => (
                  <div key={i} style={{ boxShadow: 'inset 0 0 0 1px #ffffff' }} />
                ))}
              </div>
            </div>

            <p className="mt-3 text-center text-sm text-brand-muted lg:text-left">
              Empty board at {percent}% &mdash; this is what a player sees before
              placing any blocks.
            </p>
          </div>

          {/* ---- Controls ---- */}
          <div className="mt-8 lg:mt-0">
            <label
              htmlFor="opacity-input"
              className="block text-sm font-medium text-brand-body"
            >
              Opacity (%)
            </label>

            <div className="mt-2 flex gap-3">
              <input
                id="opacity-input"
                type="number"
                inputMode="numeric"
                min={MIN_BOARD_IMAGE_OPACITY}
                max={MAX_BOARD_IMAGE_OPACITY}
                step={1}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  // Keep the preview live while typing, but ignore an empty box.
                  if (e.target.value !== '') setPercent(clampOpacity(Number(e.target.value)));
                }}
                onBlur={() => apply(draft === '' ? DEFAULT_BOARD_IMAGE_OPACITY : Number(draft))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') apply(draft === '' ? DEFAULT_BOARD_IMAGE_OPACITY : Number(draft));
                }}
                className="w-28 rounded-xl bg-white px-4 py-3 font-display text-2xl font-bold tabular-nums text-brand-ink shadow-card outline-none ring-brand-blue focus:ring-2"
              />

              <button
                onClick={() => apply(Number(draft))}
                className="flex-1 rounded-xl bg-brand-blue px-6 py-3 font-medium text-white shadow-cta transition hover:bg-brand-blue-dark active:scale-[0.98]"
              >
                Save
              </button>
            </div>

            <input
              type="range"
              aria-label="Opacity"
              min={MIN_BOARD_IMAGE_OPACITY}
              max={MAX_BOARD_IMAGE_OPACITY}
              step={1}
              value={percent}
              onChange={(e) => {
                setPercent(Number(e.target.value));
                setDraft(e.target.value);
              }}
              onMouseUp={() => apply(percent)}
              onTouchEnd={() => apply(percent)}
              onKeyUp={() => apply(percent)}
              className="mt-5 w-full accent-brand-blue"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {PRESETS.map((value) => (
                <button
                  key={value}
                  onClick={() => apply(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium shadow-card transition active:scale-95 ${
                    percent === value
                      ? 'bg-brand-blue text-white'
                      : 'bg-white text-brand-body hover:bg-white/70'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition hover:text-brand-ink"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to default ({DEFAULT_BOARD_IMAGE_OPACITY}%)
              </button>

              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue transition-opacity ${
                  saved ? 'opacity-100' : 'opacity-0'
                }`}
                role="status"
                aria-live="polite"
              >
                <Check className="h-4 w-4" />
                Saved
              </span>
            </div>

            <div className="mt-8 rounded-2xl bg-white/70 p-5 text-sm leading-relaxed text-brand-body shadow-card">
              <p>
                Saving stores the value in this browser and the game picks it up
                straight away.
              </p>
              <p className="mt-3">
                To change it for <strong>everyone</strong>, set{' '}
                <code className="rounded bg-brand-sky px-1.5 py-0.5 text-brand-ink">
                  DEFAULT_BOARD_IMAGE_OPACITY = {percent}
                </code>{' '}
                in <code className="text-brand-ink">src/boardOpacity.ts</code> and
                redeploy.
              </p>
            </div>

            <a
              href="/"
              className="mt-8 inline-block text-sm font-medium text-brand-blue hover:underline"
            >
              &larr; Back to the game
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
