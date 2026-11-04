import { useEffect, useRef } from 'react';
import { pointer, subscribePointer } from '../../lib/pointer';

/** Distance between dots, CSS px. */
const STEP = 3;
/** Dot size, CSS px. */
const DOT = 1.3;
/** How far the pointer's light reaches. */
const REACH = 150;
/** Signature script, loaded in index.html. */
const SCRIPT = '"Mrs Saint Delafield", cursive';
const SANS = 'Inter, system-ui, sans-serif';
const REFERENCE = 100;
/** Widest the signature ever gets, CSS px. */
const SIGNATURE_MAX = 640;
/** Space between the signature and the caption, CSS px. */
const LINE_GAP = 20;

interface DotTextProps {
  /** The large line, set in the signature script. */
  signature: string;
  /** The small line beneath it, set in spaced capitals. */
  caption: string;
  className?: string;
}

/**
 * A sign-off spelled out in a field of dots that spans the full width.
 *
 * Both lines are rasterised once to an offscreen canvas and sampled on a grid:
 * cells under the strokes become the brighter "lit" dots, and every other cell
 * is a faint dot, so the words read as lighter patches in one continuous field.
 * A slow sheen runs diagonally through the lit dots and dots near the pointer
 * brighten.
 *
 * Thin strokes fall between grid cells and vanish, so glyphs are stroked as
 * well as filled before sampling. That thickens them just enough to land on
 * several dots without changing the letterforms.
 *
 * Decorative (`aria-hidden`) — the caller supplies the real text for assistive
 * tech. The loop runs only while the canvas is on screen; reduced motion gets a
 * single still frame.
 */
export default function DotText({ signature, caption, className = '' }: DotTextProps) {
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

    /** Rasterise both lines, then record which grid cells fall on a stroke. */
    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      if (!w || w === lastWidth) return;
      lastWidth = w;

      const probe = document.createElement('canvas').getContext('2d');
      if (!probe) return;
      probe.textAlign = 'center';
      probe.textBaseline = 'alphabetic';

      // Signature: fit the glyphs' real ink extent — a script's flourishes
      // reach past its advance width — to the target width.
      probe.font = `${REFERENCE}px ${SCRIPT}`;
      const ref = probe.measureText(signature);
      const inkRef = ref.actualBoundingBoxLeft + ref.actualBoundingBoxRight;
      const sigSize = (REFERENCE * Math.min(w * 0.9, SIGNATURE_MAX)) / inkRef;
      probe.font = `${sigSize}px ${SCRIPT}`;
      const sig = probe.measureText(signature);
      const sigShift = (sig.actualBoundingBoxLeft - sig.actualBoundingBoxRight) / 2;
      const sigStroke = Math.max(1.5, sigSize * 0.022);

      // Caption: a fixed small size, tracked out.
      const capSize = Math.min(30, Math.max(18, w * 0.022));
      const capSpacing = capSize * 0.14;
      const capFont = `700 ${capSize}px ${SANS}`;
      probe.font = capFont;
      probe.letterSpacing = `${capSpacing}px`;
      const cap = probe.measureText(caption);
      const capShift = (cap.actualBoundingBoxLeft - cap.actualBoundingBoxRight) / 2;
      const capStroke = 0.9;

      const pad = STEP * 4;
      const sigAscent = sig.actualBoundingBoxAscent;
      const sigHeight = sigAscent + sig.actualBoundingBoxDescent;
      const capAscent = cap.actualBoundingBoxAscent;
      const capHeight = capAscent + cap.actualBoundingBoxDescent;
      // Less room below than above: the field ends where the page does, so any
      // extra here shows up as a dead strip under the caption.
      const h = Math.ceil(pad + sigHeight + LINE_GAP + capHeight + STEP);

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
      m.lineJoin = 'round';
      m.textAlign = 'center';
      m.textBaseline = 'alphabetic';

      const sigY = pad + sigAscent;
      m.font = `${sigSize}px ${SCRIPT}`;
      m.lineWidth = sigStroke;
      m.fillText(signature, w / 2 + sigShift, sigY);
      m.strokeText(signature, w / 2 + sigShift, sigY);

      const capY = pad + sigHeight + LINE_GAP + capAscent;
      m.font = capFont;
      m.letterSpacing = `${capSpacing}px`;
      m.lineWidth = capStroke;
      m.fillText(caption, w / 2 + capShift, capY);
      m.strokeText(caption, w / 2 + capShift, capY);

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

          // The sheen travels diagonally through the words, so it reads as
          // light passing across them rather than every dot pulsing together.
          let alpha = on ? 0.5 + 0.25 * Math.sin(t * 1.5 - c * 0.06 - r * 0.08) : 0.08;

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

    // The glyph shapes depend on both fonts being loaded.
    const fontsReady = document.fonts
      ? Promise.all([
          document.fonts.load(`${REFERENCE}px ${SCRIPT}`, signature),
          document.fonts.load(`700 20px ${SANS}`, caption),
        ])
      : Promise.resolve();
    fontsReady
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
  }, [signature, caption]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block w-full ${className}`}
      style={{ height: 140 }}
    />
  );
}
