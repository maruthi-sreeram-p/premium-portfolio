import { useEffect, useRef } from 'react';
import { pointer, subscribePointer } from '../../lib/pointer';

/** Distance between dots, CSS px. */
const STEP = 3;
/** Dot size, CSS px. */
const DOT = 1.3;
/** How far the pointer's light reaches. */
const REACH = 140;
/** Signature script, loaded in index.html. */
const FONT = '"Mrs Saint Delafield", cursive';
const REFERENCE = 100;
/** Share of the width the word fills. */
const FILL = 0.92;

interface DotTextProps {
  text: string;
  className?: string;
}

/**
 * A word spelled out in a field of dots, set in a signature script.
 *
 * The text is rasterised once to an offscreen canvas and sampled on a grid:
 * cells under the strokes become the brighter "lit" dots, every other cell is a
 * faint dot, so the word reads as a lighter patch in a uniform field. A slow
 * sheen runs diagonally through the lit dots, and dots near the pointer
 * brighten.
 *
 * A thin script falls between grid cells and vanishes, so the glyphs are
 * stroked as well as filled before sampling, which thickens them just enough to
 * land on several dots without changing the letterforms.
 *
 * Decorative (`aria-hidden`) — the caller supplies the real text for assistive
 * tech. The loop runs only while the canvas is on screen; reduced motion gets a
 * single still frame.
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
    let lastWidth = 0;
    let unsubscribe: (() => void) | null = null;

    const readColor = () => {
      color = getComputedStyle(root).getPropertyValue('--fg').trim() || color;
      draw(performance.now());
    };

    /** Rasterise the text, then record which grid cells fall on a stroke. */
    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      if (!w || w === lastWidth) return;
      lastWidth = w;

      // Fit the word to the width, then size the canvas to its real ink bounds
      // so there is no empty band above or below it.
      const probe = document.createElement('canvas').getContext('2d');
      if (!probe) return;
      probe.font = `${REFERENCE}px ${FONT}`;
      probe.textAlign = 'center';
      probe.textBaseline = 'alphabetic';
      // A script's flourishes reach past its advance width, so fit to the
      // glyphs' real ink extent rather than the nominal text width.
      const ref = probe.measureText(text);
      const inkRef = ref.actualBoundingBoxLeft + ref.actualBoundingBoxRight;
      const size = (REFERENCE * w * FILL) / inkRef;
      probe.font = `${size}px ${FONT}`;
      const metrics = probe.measureText(text);
      // With centred text, the ink's midpoint sits this far from the anchor.
      const inkShift = (metrics.actualBoundingBoxLeft - metrics.actualBoundingBoxRight) / 2;
      const stroke = Math.max(1.5, size * 0.022);
      const pad = STEP * 4 + stroke;
      const ascent = metrics.actualBoundingBoxAscent;
      const h = Math.ceil(ascent + metrics.actualBoundingBoxDescent + pad * 2);

      canvas.style.height = `${h}px`;
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
      m.strokeStyle = '#fff';
      m.lineWidth = stroke;
      m.lineJoin = 'round';
      m.font = `${size}px ${FONT}`;
      m.textAlign = 'center';
      m.textBaseline = 'alphabetic';
      m.fillText(text, w / 2 + inkShift, pad + ascent);
      m.strokeText(text, w / 2 + inkShift, pad + ascent);

      const data = m.getImageData(0, 0, w, h).data;
      lit = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = Math.floor(c * STEP + STEP / 2);
          const py = Math.floor(r * STEP + STEP / 2);
          lit[r * cols + c] = data[(py * w + px) * 4 + 3] > 70 ? 1 : 0;
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

          // The sheen travels diagonally through the word, so it reads as light
          // passing across it rather than every dot pulsing together.
          let alpha = on ? 0.5 + 0.25 * Math.sin(t * 1.5 - c * 0.12 - r * 0.08) : 0.08;

          if (active) {
            const d = Math.hypot(x - mx, y - my);
            if (d < REACH) {
              const k = 1 - d / REACH;
              alpha += k * k * (on ? 0.5 : 0.3);
            }
          }
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

    // The glyph shapes depend on the script font being loaded.
    const fontReady = document.fonts
      ? document.fonts.load(`${REFERENCE}px ${FONT}`, text)
      : Promise.resolve();
    fontReady
      .catch(() => undefined)
      .then(() => {
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
      style={{ height: 100 }}
    />
  );
}
