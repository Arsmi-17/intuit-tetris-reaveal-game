import { useCallback, useEffect, useState } from 'react';
import { Clock, Home, RotateCcw, Share2 } from 'lucide-react';
import type { GameConfig, GameState, ThemeMode } from '@/types';
import { generateFinishPoster } from '@/poster';

interface WinScreenProps {
  config: GameConfig;
  state: GameState;
  theme: ThemeMode;
  onPlayAgain: () => void;
  onHome: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const FINISH_MESSAGE = 'Some Message';
const SLACK_CHANNEL_URL =
  'https://intuit.enterprise.slack.com/?redir=%2Farchives%2FC0BHTGZSKDZ%3Fname%3DC0BHTGZSKDZ';

export function WinScreen({ config, state, theme, onPlayAgain, onHome }: WinScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const [posterBlob, setPosterBlob] = useState<Blob | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const isDark = theme === 'dark';
  const time = formatTime(state.elapsed);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    setPosterBlob(null);
    setPosterUrl(null);
    setShareStatus('Generating poster...');

    generateFinishPoster({
      imageUrl: config.image.url,
      imageLabel: config.image.label,
      message: FINISH_MESSAGE,
      time,
    })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPosterBlob(blob);
        setPosterUrl(objectUrl);
        setShareStatus('Poster ready');
      })
      .catch((error) => {
        if (!active) return;
        setShareStatus(error instanceof Error ? error.message : 'Poster could not be generated.');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [config.image.label, config.image.url, time]);

  const downloadPoster = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `tetris-poster-${time.replace(':', '-')}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [time]);

  const sharePoster = useCallback(async () => {
    if (!posterBlob || isSharing) return;

    setIsSharing(true);
    setShareStatus('Preparing Slack share...');

    const file = new File([posterBlob], `tetris-poster-${time.replace(':', '-')}.png`, {
      type: 'image/png',
    });

    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Tetris finish poster',
          text: `${FINISH_MESSAGE} - ${time}`,
        });
        setShareStatus('Poster shared');
      } else if ('ClipboardItem' in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [posterBlob.type]: posterBlob,
          }),
        ]);
        window.open(SLACK_CHANNEL_URL, '_blank', 'noopener,noreferrer');
        setShareStatus('Poster copied. Paste it in Slack.');
      } else {
        downloadPoster(posterBlob);
        window.open(SLACK_CHANNEL_URL, '_blank', 'noopener,noreferrer');
        setShareStatus('Poster downloaded. Upload it in Slack.');
      }
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') {
        setShareStatus('Share cancelled');
      } else {
        downloadPoster(posterBlob);
        window.open(SLACK_CHANNEL_URL, '_blank', 'noopener,noreferrer');
        setShareStatus('Poster saved. Slack opened.');
      }
    } finally {
      setIsSharing(false);
    }
  }, [downloadPoster, isSharing, posterBlob, time]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center gap-5 p-4 sm:p-6 ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-sky-50 via-white to-cyan-50'
      }`}
    >
      <div
        className={`relative w-full max-w-[min(92vw,78vh,680px)] aspect-square overflow-hidden bg-slate-950 shadow-[0_32px_90px_rgba(0,0,0,0.45)] transition-all duration-700 ${
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <img
          src={config.image.url}
          alt={config.image.label}
          className="absolute inset-0 h-full w-full object-fill"
          draggable={false}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.12)_42%,rgba(15,23,42,0.82)_100%)]" />
        <div className="absolute inset-5 border border-white/45" />
        <div className="absolute inset-[30px] border border-cyan-200/30" />

        <div className="absolute left-0 right-0 top-0 flex items-start p-8 sm:p-10">
          <div className="h-1.5 w-20 bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.85)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
          <h1 className="max-w-[11ch] text-5xl sm:text-7xl font-black leading-[0.86] tracking-normal text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
            {FINISH_MESSAGE}
          </h1>

          <div className="mt-6 flex items-end justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-cyan-100">
                <Clock className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.28em]">
                  Time
                </span>
              </div>
              <div className="mt-1 text-5xl sm:text-6xl font-black tabular-nums leading-none text-cyan-50 drop-shadow-[0_6px_18px_rgba(8,145,178,0.45)]">
                {formatTime(state.elapsed)}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPlayAgain}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition"
          aria-label="Play again"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={sharePoster}
          disabled={!posterBlob || isSharing}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Share poster to Slack"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button
          onClick={onHome}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl active:scale-95 transition ${
            isDark
              ? 'bg-slate-800 text-white ring-1 ring-slate-600 hover:bg-slate-700'
              : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
          }`}
          aria-label="Main menu"
        >
          <Home className="h-5 w-5" />
        </button>
      </div>

      <div
        className={`min-h-5 text-center text-xs font-medium ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
        role="status"
        aria-live="polite"
      >
        {shareStatus}
        {posterUrl && (
          <a href={posterUrl} download={`tetris-poster-${time.replace(':', '-')}.png`} className="sr-only">
            Poster PNG
          </a>
        )}
      </div>
    </div>
  );
}
