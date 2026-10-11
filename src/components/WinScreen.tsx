import { useCallback, useEffect, useState } from 'react';
import { Share } from 'lucide-react';
import type { GameConfig, GameState } from '@/types';
import { generateFinishPoster } from '@/poster';
import { logShareEvent } from '@/shareLog';

interface WinScreenProps {
  config: GameConfig;
  state: GameState;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const HEADLINE = 'The Next level?';
const SUBHEAD = ['That’s going to be', 'game-changing.'];
const SLACK_CHANNEL_URL =
  'https://intuit.enterprise.slack.com/?redir=%2Farchives%2FC0BHTGZSKDZ%3Fname%3DC0BHTGZSKDZ';

export function WinScreen({ config, state }: WinScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const [posterBlob, setPosterBlob] = useState<Blob | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState('');
  const [isSharing, setIsSharing] = useState(false);
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
      time,
      headline: HEADLINE,
      subhead: SUBHEAD,
    })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPosterBlob(blob);
        setPosterUrl(objectUrl);
        setShareStatus('');
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

  const posterFileName = `into-the-next-${time.replace(':', '-')}.png`;

  const downloadPoster = useCallback(
    (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = posterFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    [posterFileName],
  );

  /**
   * A new tab keeps the poster page alive behind Slack. Popup blockers can
   * refuse it after an await, so fall back to navigating this tab.
   */
  const openSlack = useCallback(() => {
    const opened = window.open(SLACK_CHANNEL_URL, '_blank');
    if (!opened) window.location.href = SLACK_CHANNEL_URL;
  }, []);

  /**
   * Every device goes to the Slack channel. We deliberately do NOT use
   * navigator.share: it opens the OS share sheet (WhatsApp, Instagram, Nearby
   * Sharing...) and the poster belongs in one place.
   */
  const sharePoster = useCallback(async () => {
    if (!posterBlob || isSharing) return;
    setIsSharing(true);

    // Fire-and-forget: logging must never delay or block the share.
    void logShareEvent({ completionSeconds: state.elapsed, completionDisplay: time });

    // Leave the poster somewhere it can be attached from, then open Slack.
    try {
      if ('ClipboardItem' in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': posterBlob })]);
        setShareStatus('Poster copied. Paste it in Slack.');
      } else {
        downloadPoster(posterBlob);
        setShareStatus('Poster saved. Attach it in Slack.');
      }
    } catch {
      downloadPoster(posterBlob);
      setShareStatus('Poster saved. Attach it in Slack.');
    }

    openSlack();
    setIsSharing(false);
  }, [downloadPoster, isSharing, openSlack, posterBlob, state.elapsed, time]);

  return (
    <div className="relative min-h-[100dvh] w-full">
      <div className="brand-backdrop" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-md flex-col items-center overflow-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[clamp(1rem,3vh,2.5rem)] text-center lg:h-auto lg:min-h-[100dvh] lg:max-w-5xl lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 lg:overflow-visible lg:py-12 lg:text-left">
        {/* ---- The poster itself. Long-press / right-click saves this PNG. ---- */}
        <div className="order-2 flex min-h-0 w-full flex-1 items-center justify-center lg:order-1 lg:row-span-2 lg:block lg:flex-none">
          <div
            className={`mx-auto w-full max-w-sm transition-all duration-700 lg:max-w-none ${
              revealed ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            style={{ maxHeight: '100%' }}
          >
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`Finish poster — completed in ${time}`}
                className="poster-image mx-auto max-h-full w-auto max-w-full rounded-2xl object-contain shadow-card"
              />
            ) : (
              <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/50" />
            )}
          </div>
        </div>

        {/* ---- Headline ---- */}
        <header className="order-1 shrink-0 lg:order-2 lg:self-end">
          <h1 className="font-display text-[clamp(1.75rem,4.6vh,3rem)] font-bold leading-[1.05] tracking-tight text-brand-ink lg:text-6xl">
            Congra<span className="text-brand-blue">tulations!</span>
          </h1>
          <p className="mx-auto mt-[clamp(0.3rem,1vh,0.75rem)] max-w-xs text-[clamp(0.85rem,1.9vh,1.125rem)] leading-snug text-brand-body lg:mx-0 lg:max-w-sm lg:text-lg">
            Brick by brick, look what we made possible together.
          </p>
        </header>

        {/* ---- Stats + actions ---- */}
        <div className="order-3 mt-[clamp(0.6rem,2vh,1.75rem)] w-full shrink-0 lg:mt-0 lg:self-start">
          <button
            onClick={sharePoster}
            disabled={!posterBlob || isSharing}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-blue px-8 py-[clamp(0.7rem,2vh,1.25rem)] text-[clamp(1rem,2.4vh,1.25rem)] font-medium text-white shadow-cta transition hover:bg-brand-blue-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Share Poster
            <Share className="h-5 w-5" strokeWidth={2.25} />
          </button>

          <p className="mt-[clamp(0.5rem,1.6vh,1.25rem)] text-center text-[clamp(0.75rem,1.7vh,0.875rem)] text-brand-body">
            First 50 to complete and share earn Buzzbox points.
          </p>

          <div
            className="min-h-5 text-center text-xs font-medium text-brand-muted"
            role="status"
            aria-live="polite"
          >
            {shareStatus}
          </div>

          <div className="mt-[clamp(0.5rem,2vh,1.75rem)] flex justify-center">
            <img
              src="/assets/into-the-next-logo.png"
              alt="Into The Next"
              className="h-[clamp(1.5rem,3.5vh,2.25rem)] w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
