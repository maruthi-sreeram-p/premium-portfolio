import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { subscribePointer } from '../../lib/pointer';
import { useDeviceTier } from '../../hooks/useDeviceTier';

/** Elements matching this get the expanded "interactive" cursor state. */
const INTERACTIVE = 'a, button, input, textarea, select, [data-cursor]';

/**
 * Custom cursor.
 *
 * Three parts: a hard dot that tracks 1:1, a ring that lags slightly behind
 * (this lag is what makes it feel like a physical object rather than a painted
 * crosshair), and an ember trail that only becomes visible at speed.
 *
 * Rendered only where it is appropriate — `allowCursor` requires a fine
 * pointer, real hover support and no reduced-motion preference — and it is
 * always `pointer-events: none`, so clicking, selection and focus behave
 * exactly as they would without it.
 */
export default function CursorLayer() {
  const dotRef = useRef<HTMLDivElement>(null);
  const dotCoreRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const { allowCursor } = useDeviceTier();

  useEffect(() => {
    if (!allowCursor) return;
    const dot = dotRef.current;
    const dotCore = dotCoreRef.current;
    const ring = ringRef.current;
    const trail = trailRef.current;
    const label = labelRef.current;
    if (!dot || !dotCore || !ring || !trail || !label) return;

    // Hiding the native cursor is scoped to a class on <html> so it is
    // guaranteed to be reverted if this component ever unmounts.
    document.documentElement.classList.add('has-custom-cursor');

    /*
      The dot is written straight to the element's transform on the raw pointer
      position — no tween, no easing, no interpolation. Anything else, even an
      80ms quickTo, is perceptible as the cursor trailing behind the real
      pointer, which is the one thing a custom cursor must never do.

      Only the ring is allowed to lag, and only slightly: that small delay is
      what makes it read as a companion object rather than a second cursor.
    */
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.16, ease: 'power2.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.16, ease: 'power2.out' });
    const trailX = gsap.quickTo(trail, 'x', { duration: 0.34, ease: 'power2.out' });
    const trailY = gsap.quickTo(trail, 'y', { duration: 0.34, ease: 'power2.out' });
    const trailScale = gsap.quickTo(trail, 'scale', { duration: 0.4, ease: 'power2.out' });
    const trailFade = gsap.quickTo(trail, 'opacity', { duration: 0.3, ease: 'power2.out' });

    const unsubscribe = subscribePointer((p) => {
      dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      ringX(p.x);
      ringY(p.y);
      trailX(p.x);
      trailY(p.y);
      // The trail is invisible at rest and only blooms during fast movement —
      // "controlled energy", not a permanent comet stuck to the pointer.
      trailFade(Math.min(0.45, p.speed * 0.8));
      trailScale(1 + p.speed * 0.6);
    });

    /* -- Interactive state ------------------------------------------------ */
    let hoverTarget: Element | null = null;

    // An arrow const rather than a function declaration: declarations are
    // hoisted, so TypeScript discards the null-narrowing the guard above
    // established for the four refs.
    const setState = (target: Element | null) => {
      if (target === hoverTarget) return;
      hoverTarget = target;

      const cursorLabel = target?.getAttribute('data-cursor-label') ?? '';
      const isMajor = !!target?.hasAttribute('data-cursor');

      gsap.to(ring, {
        scale: target ? (isMajor ? 2.6 : 1.9) : 1,
        borderColor: target
          ? 'color-mix(in srgb, var(--accent) 85%, transparent)'
          : 'color-mix(in srgb, var(--accent) 45%, transparent)',
        backgroundColor: target
          ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
          : 'transparent',
        duration: 0.35,
        ease: 'power3.out',
      });
      // The dot's own transform is rewritten every frame by the pointer loop,
      // so its scale lives on an inner element driven by a CSS transition —
      // a GSAP tween on the dot itself would be overwritten within a frame.
      dotCore.style.transform = `translate(-50%, -50%) scale(${target ? 0 : 1})`;

      label.textContent = cursorLabel;
      gsap.to(label, {
        autoAlpha: cursorLabel ? 1 : 0,
        y: cursorLabel ? 0 : 6,
        duration: 0.3,
        ease: 'power3.out',
      });
    };

    const onOver = (e: PointerEvent) =>
      setState((e.target as Element | null)?.closest?.(INTERACTIVE) ?? null);
    const onDown = () => gsap.to(ring, { scale: 0.8, duration: 0.18 });
    const onUp = () => gsap.to(ring, { scale: hoverTarget ? 2.2 : 1, duration: 0.24 });

    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });

    return () => {
      unsubscribe();
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [allowCursor]);

  if (!allowCursor) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[300]">
      {/* Ember trail */}
      <div
        ref={trailRef}
        className="absolute -left-6 -top-6 h-12 w-12 rounded-full opacity-0"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--ember) 55%, transparent), transparent 70%)',
          filter: 'blur(6px)',
        }}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        className="absolute -left-4 -top-4 h-8 w-8 rounded-full border"
        style={{ borderColor: 'color-mix(in srgb, var(--accent) 45%, transparent)' }}
      />
      {/* 1:1 dot. The outer div carries the exact pointer position; the inner
          span carries the hover scale, so the two never fight over transform. */}
      <div ref={dotRef} className="absolute left-0 top-0">
        <span
          ref={dotCoreRef}
          className="block h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--accent)',
            // Centring lives in the same inline transform as the hover scale —
            // setState rewrites this property wholesale, so a Tailwind
            // -translate-x-1/2 class would be silently dropped on first hover.
            transform: 'translate(-50%, -50%) scale(1)',
            transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
      {/* Contextual label, e.g. "View project" */}
      <div
        ref={labelRef}
        className="label absolute left-5 top-5 whitespace-nowrap rounded-full px-2.5 py-1 opacity-0"
        style={{
          background: 'color-mix(in srgb, var(--shell) 88%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          color: 'var(--fg)',
          backdropFilter: 'blur(8px)',
        }}
      />
    </div>
  );
}
