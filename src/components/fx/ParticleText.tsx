import { useEffect, useRef } from 'react';
import { pointer, subscribePointer } from '../../lib/pointer';

/** Grid the text is sampled on, CSS px. Smaller = denser letters. */
const STEP = 3;
/** Signature script, loaded in index.html. */
const SCRIPT = '"Mrs Saint Delafield", cursive';
const SANS = 'Inter, system-ui, sans-serif';
const REFERENCE = 100;
/** Widest the signature ever gets, CSS px. */
const SIGNATURE_MAX = 680;
const LINE_GAP = 22;
/** Room above and below the words for the drifting particles, CSS px. */
const SPACE_TOP = 70;
const SPACE_BOTTOM = 26;
/** How far the pointer pushes particles. */
const REACH = 110;
/** Loose particles drifting through the whole band, per 1000px of width. */
const AMBIENT_PER_1000 = 55;

interface ParticleTextProps {
  /** The large line, set in the signature script. */
  signature: string;
  /** The small line beneath it, set in spaced capitals. */
  caption: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Where the particle belongs, on a letter. */
  hx: number;
  hy: number;
  r: number;
  phase: number;
}

interface Drifter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  phase: number;
}

/**
 * A sign-off made of particles.
 *
 * Both lines are rasterised once and sampled on a grid; every sampled cell
 * becomes a small particle with a home on a letter. Particles start scattered
 * and spring home when the band first scrolls into view, so the words form out
 * of loose dots. The pointer pushes particles aside and they spring back.
 * Between the letters, a sparse field of larger loose particles drifts slowly
 * through the whole band.
 *
 * A thin script falls between grid cells and vanishes, so glyphs are stroked as
 * well as filled before sampling — that thickens them just enough to land on
 * several particles without changing the letterforms.
 *
 * Decorative (`aria-hidden`); the caller supplies the real text for assistive
 * tech. The loop runs only while the canvas is on screen. Reduced motion gets
 * one still frame with every particle at home and no drifters.
 */
export default function ParticleText({ signature, caption, className = '' }: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let particles: Particle[] = [];
    let drifters: Drifter[] = [];
    let width = 0;
    let height = 0;
    let color = '#fafafa';
    let cancelled = false;
    let raf = 0;
    let last = 0;
    let lastWidth = 0;
    let unsubscribe: (() => void) | null = null;

    const readColor = () => {
      color = getComputedStyle(root).getPropertyValue('--fg').trim() || color;
      if (!raf) draw(0);
    };

    /** Rasterise both lines and turn every sampled cell into a particle. */
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

      // Caption: a small size, tracked out.
      const capSize = Math.min(30, Math.max(18, w * 0.022));
      const capSpacing = capSize * 0.14;
      const capFont = `700 ${capSize}px ${SANS}`;
      probe.font = capFont;
      probe.letterSpacing = `${capSpacing}px`;
      const cap = probe.measureText(caption);
      const capShift = (cap.actualBoundingBoxLeft - cap.actualBoundingBoxRight) / 2;

      const sigAscent = sig.actualBoundingBoxAscent;
      const sigHeight = sigAscent + sig.actualBoundingBoxDescent;
      const capAscent = cap.actualBoundingBoxAscent;
      const capHeight = capAscent + cap.actualBoundingBoxDescent;
      const h = Math.ceil(SPACE_TOP + sigHeight + LINE_GAP + capHeight + SPACE_BOTTOM);

      width = w;
      height = h;
      canvas.style.height = `${h}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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

      const sigY = SPACE_TOP + sigAscent;
      m.font = `${sigSize}px ${SCRIPT}`;
      m.lineWidth = sigStroke;
      m.fillText(signature, w / 2 + sigShift, sigY);
      m.strokeText(signature, w / 2 + sigShift, sigY);

      const capY = SPACE_TOP + sigHeight + LINE_GAP + capAscent;
      m.font = capFont;
      m.letterSpacing = `${capSpacing}px`;
      m.lineWidth = 0.9;
      m.fillText(caption, w / 2 + capShift, capY);
      m.strokeText(caption, w / 2 + capShift, capY);

      const data = m.getImageData(0, 0, w, h).data;
      const next: Particle[] = [];
      for (let y = STEP / 2; y < h; y += STEP) {
        for (let x = STEP / 2; x < w; x += STEP) {
          if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] <= 70) continue;
          // Jitter inside the cell so the letters read as scattered particles
          // rather than a regular grid.
          const hx = x + (Math.random() - 0.5) * STEP * 0.7;
          const hy = y + (Math.random() - 0.5) * STEP * 0.7;
          next.push({
            // Scattered start; they spring home once the band is on screen.
            x: reduced ? hx : Math.random() * w,
            y: reduced ? hy : Math.random() * h,
            vx: 0,
            vy: 0,
            hx,
            hy,
            r: 0.7 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      particles = next;

      const count = reduced ? 0 : Math.round((w / 1000) * AMBIENT_PER_1000);
      drifters = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.04 - Math.random() * 0.16,
        r: 0.8 + Math.random() * 2.4,
        alpha: 0.18 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      }));

      draw(0);
    };

    function step(dt: number) {
      const rect = canvas!.getBoundingClientRect();
      const active = pointer.active;
      const mx = pointer.x - rect.left;
      const my = pointer.y - rect.top;

      for (const p of particles) {
        // Spring toward home, damped.
        p.vx += (p.hx - p.x) * 0.045 * dt;
        p.vy += (p.hy - p.y) * 0.045 * dt;

        if (active) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < REACH * REACH && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = (1 - d / REACH) ** 2 * 5 * dt;
            p.vx += (dx / d) * push;
            p.vy += (dy / d) * push;
          }
        }

        const damp = Math.pow(0.86, dt);
        p.vx *= damp;
        p.vy *= damp;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      for (const d of drifters) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.y < -6) d.y = height + 6;
        if (d.x < -6) d.x = width + 6;
        if (d.x > width + 6) d.x = -6;
      }
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = color;

      // The letters: one path, one fill.
      ctx!.globalAlpha = 0.9;
      ctx!.beginPath();
      for (const p of particles) {
        const r = p.r * (1 + 0.22 * Math.sin(t * 1.8 + p.phase));
        ctx!.moveTo(p.x + r, p.y);
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
      }
      ctx!.fill();

      // The loose particles, each at its own brightness.
      for (const d of drifters) {
        ctx!.globalAlpha = d.alpha * (0.7 + 0.3 * Math.sin(t * 0.9 + d.phase));
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    const loop = (now: number) => {
      // Frame-rate independent: `dt` is 1 at 60fps, clamped so a backgrounded
      // tab cannot fling everything across the band on its return.
      const dt = last ? Math.min((now - last) / 16.67, 3) : 1;
      last = now;
      step(dt);
      draw(now / 1000);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced || raf) return;
      last = 0;
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
      style={{ height: 240 }}
    />
  );
}
