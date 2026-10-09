const POSTER_SIZE = 1080;

interface PosterOptions {
  imageUrl: string;
  imageLabel: string;
  message: string;
  time: string;
}

function loadImage(url: string, label: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load poster image: ${label}`));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Could not generate PNG poster.'));
      }
    }, 'image/png');
  });
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

function drawClock(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(207, 250, 254, 0.96)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 8);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 7, y + 4);
  ctx.stroke();
  ctx.restore();
}

export async function generateFinishPoster({
  imageUrl,
  imageLabel,
  message,
  time,
}: PosterOptions): Promise<Blob> {
  await document.fonts?.ready;

  const image = await loadImage(imageUrl, imageLabel);
  const canvas = document.createElement('canvas');
  canvas.width = POSTER_SIZE;
  canvas.height = POSTER_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Poster canvas is not available.');
  }

  ctx.drawImage(image, 0, 0, POSTER_SIZE, POSTER_SIZE);

  const shade = ctx.createLinearGradient(0, 0, 0, POSTER_SIZE);
  shade.addColorStop(0, 'rgba(15, 23, 42, 0.08)');
  shade.addColorStop(0.42, 'rgba(15, 23, 42, 0.12)');
  shade.addColorStop(1, 'rgba(15, 23, 42, 0.82)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, POSTER_SIZE, POSTER_SIZE);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(28, 28, POSTER_SIZE - 56, POSTER_SIZE - 56);

  ctx.strokeStyle = 'rgba(165, 243, 252, 0.3)';
  ctx.strokeRect(48, 48, POSTER_SIZE - 96, POSTER_SIZE - 96);

  ctx.fillStyle = '#67e8f9';
  ctx.shadowColor = 'rgba(103, 232, 249, 0.85)';
  ctx.shadowBlur = 24;
  ctx.fillRect(64, 64, 118, 8);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.font = '900 112px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textBaseline = 'alphabetic';
  drawWrappedText(ctx, message, 64, 742, 520, 118);

  ctx.shadowBlur = 0;
  drawClock(ctx, 80, 908);

  ctx.fillStyle = '#cffafe';
  ctx.font = '700 19px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('TIME', 112, 915);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#ecfeff';
  ctx.shadowColor = 'rgba(8, 145, 178, 0.45)';
  ctx.shadowBlur = 18;
  ctx.font = '900 74px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(time, 64, 1000);

  return canvasToBlob(canvas);
}

