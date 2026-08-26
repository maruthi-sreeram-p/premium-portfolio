import { useEffect, useRef } from 'react';
import { useDeviceTier } from './useDeviceTier';

/**
 * Counts from 0 to `target` the first time the element scrolls into view.
 *
 * Writes straight to the DOM node rather than through React state — a stat row
 * of four counters at 60fps would otherwise mean ~240 re-renders per second for
 * text that no other component depends on. The "already run" flag is a ref for
 * the same reason: it guards the effect without causing a render of its own.
 */
export function useCountUp(target: number, duration = 1.4) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);
  const { prefersReducedMotion } = useDeviceTier();

  useEffect(() => {
    const el = ref.current;
    if (!el || hasRun.current) return;

    if (prefersReducedMotion) {
      hasRun.current = true;
      el.textContent = String(target);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        hasRun.current = true;

        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / (duration * 1000));
          // easeOutExpo — fast start, long settle, so the final value lands
          // gently instead of snapping.
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = String(Math.round(eased * target));
          if (p < 1) raf = requestAnimationFrame(step);
          else el.textContent = String(target);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration, prefersReducedMotion]);

  return ref;
}
