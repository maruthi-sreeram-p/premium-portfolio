import { useEffect, useRef } from 'react';
import { subscribePointer } from '../../lib/pointer';
import { damp } from '../../lib/motion';

/** Distance between dots, in CSS pixels. */
const SPACING = 30;
/** How far from the pointer the grid is still visible. */
const RADIUS = 260;
/** Diameter of the soft lift under the pointer. */
const GLOW = 620;

/**
 * The page's ground.
 *
 * One fixed, `pointer-events: none` layer behind every section. It is plain
 * black everywhere except under the pointer, where a grid of dots fades in and
 * falls away again with distance — the grid only exists where you are looking.
 *
 * The dots are drawn on a canvas, and only the ~300 inside the pointer's radius
 * are touched per frame. The shared pointer loop calls this every frame, so the
 * callback bails out early once the light has settled: an idle page costs
 * nothing.
 */
export default function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !glow || !ctx) return;

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    // Smoothed light position and intensity (0 = unlit, 1 = fully lit).
    let x = 0;
    let y = 0;
    let level = 0;
    // A finger has no hover state: once it lifts, the light should go out
    // rather than stay parked where the last touch ended.
    let lifted = false;
    let dirty = true;
    let dotColor = '#fafafa';

    // Dots take the theme's foreground, so the same grid reads white-on-black
    // in dark mode and black-on-white in light.
    const readColor = () => {
      dotColor = getComputedStyle(root).getPropertyValue('--fg').trim() || dotColor;
      dirty = true;
    };
    readColor();
    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = () => {
      lifted = false;
    };
    const onLift = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') lifted = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onLift, { passive: true });
    window.addEventListener('pointercancel', onLift, { passive: true });

    const unsubscribe = subscribePointer((p, dt) => {
      const lit = p.active && !lifted;
      const nextLevel = damp(level, lit ? 1 : 0, lit ? 9 : 5, dt);
      // A light that is currently off appears under the pointer instead of
      // gliding in from wherever it last went out.
      const snap = reduced || level < 0.02;
      const nextX = snap ? p.x : damp(x, p.x, 22, dt);
      const nextY = snap ? p.y : damp(y, p.y, 22, dt);

      const settled =
        Math.abs(nextX - x) < 0.05 &&
        Math.abs(nextY - y) < 0.05 &&
        Math.abs(nextLevel - level) < 0.002;
      x = nextX;
      y = nextY;
      level = nextLevel;
      if (settled && !dirty) return;
      dirty = false;

      glow.style.opacity = String(level);
      glow.style.transform = `translate3d(${x - GLOW / 2}px, ${y - GLOW / 2}px, 0)`;

      ctx.clearRect(0, 0, width, height);
      if (level < 0.003) return;

      const colFrom = Math.max(0, Math.floor((x - RADIUS) / SPACING));
      const colTo = Math.min(Math.ceil(width / SPACING), Math.ceil((x + RADIUS) / SPACING));
      const rowFrom = Math.max(0, Math.floor((y - RADIUS) / SPACING));
      const rowTo = Math.min(Math.ceil(height / SPACING), Math.ceil((y + RADIUS) / SPACING));

      ctx.fillStyle = dotColor;
      for (let row = rowFrom; row <= rowTo; row++) {
        const py = row * SPACING + SPACING / 2;
        for (let col = colFrom; col <= colTo; col++) {
          const px = col * SPACING + SPACING / 2;
          const t = 1 - Math.hypot(px - x, py - y) / RADIUS;
          if (t <= 0) continue;
          // Smoothstep: the edge of the light is soft, the centre is crisp.
          const falloff = t * t * (3 - 2 * t);
          const alpha = falloff * 0.9 * level;
          if (alpha < 0.01) continue;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, 0.9 + falloff * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    });

    return () => {
      unsubscribe();
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onLift);
      window.removeEventListener('pointercancel', onLift);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: 'var(--shell)' }}
    >
      <div
        ref={glowRef}
        className="absolute left-0 top-0 opacity-0"
        style={{
          width: GLOW,
          height: GLOW,
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--fg) 6%, transparent), transparent)',
          willChange: 'transform, opacity',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
