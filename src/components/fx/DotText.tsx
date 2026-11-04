import { useEffect, useRef } from 'react';
import { pointer, subscribePointer } from '../../lib/pointer';

/** Distance between dots, CSS px. */
const STEP = 6;
/** Dot size, CSS px. */
const DOT = 2;
/** How far the pointer's light reaches. */
const REACH = 170;

interface DotTextProps {
  text: string;
  className?: string;
}

/**
 * A word spelled out in a field of dots.
 *
 * The text is rendered once to an offscreen canvas and sampled on a grid: cells
 * under the glyphs become the brighter "lit" dots, every other cell is a faint
 * dot, so the word reads as a lighter patch in a uniform dot field. A slow wave
 * runs through the lit dots, and the dots under the pointer brighten.
 *
 * Decorative only (`aria-hidden`); the same text is already in the footer. The
 * loop runs only while the canvas is on screen, and a single still frame is
 * drawn for reduced motion.
 */
export default function DotText({ text, className = '' }: DotTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cols = 0;
    let rows = 0;
    let lit = new Uint8Array(0);
    let color = '#fafafa';
    let cancelled = false;
    let raf = 0;
    let unsubscribe: (() => void) | null = null;

    const readColor = () => {
      color = getComputedStyle(root).getPropertyValue('--fg').trim() || color;
      draw(performance.now());
    };

    /** Rasterise the text, then record which grid cells fall on a glyph. */
    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.floor(w / STEP);
      rows = Math.floor(h / STEP);

      const mask = document.createElement('canvas');
      mask.width = w;
      mask.height = h;
      const m = mask.getContext('2d', { willReadFrequently: true });
      if (!m) return;
      m.fillStyle = '#fff';
      m.textAlign = 'center';
      m.textBaseline = 'middle';
      // Fit the word to the width, but never taller than the band.
      let size = h * 0.78;
      m.font = `800 ${size}px Inter, system-ui, sans-serif`;
      const measured = m.measureText(text).width;
      if (measured > w * 0.9) {
        size *= (w * 0.9) / measured;
        m.font = `800 ${size}px Inter, system-ui, sans-serif`;
      }
      m.fillText(text, w / 2, h / 2 + size * 0.04);

      const data = m.getImageData(0, 0, w, h).data;
      lit = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = Math.floor(c * STEP + STEP / 2);
          const py = Math.floor(r * STEP + STEP / 2);
          lit[r * cols + c] = data[(py * w + px) * 4 + 3] > 120 ? 1 : 0;
        }
      }
      draw(performance.now());
    };

    function draw(now: number) {
      if (!cols) return;
      const t = reduced ? 0 : now / 1000;
      const rect = canvas!.getBoundingClientRect();
      const active = !reduced && pointer.active;
      const mx = pointer.x - rect.left;
      const my = pointer.y - rect.top;

      ctx!.clearRect(0, 0, canvas!.clientWidth, canvas!.clientHeight);
      ctx!.fillStyle = color;

      for (let r = 0; r < rows; r++) {
        const y = r * STEP + (STEP - DOT) / 2;
        for (let c = 0; c < cols; c++) {
          const x = c * STEP + (STEP - DOT) / 2;
          const on = lit[r * cols + c] === 1;

          // The wave travels diagonally through the word, so it reads as a
          // sheen passing across it rather than every dot pulsing together.
          let alpha = on ? 0.34 + 0.2 * Math.sin(t * 1.5 - c * 0.11 - r * 0.07) : 0.08;

          if (active) {
            const d = Math.hypot(x - mx, y - my);
            if (d < REACH) {
              const k = 1 - d / REACH;
              alpha += k * k * (on ? 0.55 : 0.3);
            }
          }
          if (alpha < 0.02) continue;
          ctx!.globalAlpha = Math.min(alpha, 1);
          ctx!.fillRect(x, y, DOT, DOT);
        }
      }
      ctx!.globalAlpha = 1;
    }

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced || raf) return;
      raf = requestAnimationFrame(loop);
      // The pointer module only tracks the mouse while something subscribes.
      unsubscribe = subscribePointer(() => {});
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      unsubscribe?.();
      unsubscribe = null;
    };

    const intersection = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    intersection.observe(canvas);

    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    const resize = new ResizeObserver(build);
    resize.observe(canvas);

    // The glyph shapes depend on the font being loaded.
    document.fonts?.ready.then(() => {
      if (!cancelled) {
        readColor();
        build();
      }
    });
    readColor();

    return () => {
      cancelled = true;
      stop();
      intersection.disconnect();
      themeObserver.disconnect();
      resize.disconnect();
    };
  }, [text]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block w-full ${className}`}
      style={{ height: 'clamp(120px, 17vw, 240px)' }}
    />
  );
}
