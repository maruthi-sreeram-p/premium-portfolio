import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useDeviceTier } from './useDeviceTier';

interface MagneticOptions {
  /** How far the element may travel, as a fraction of its own size. */
  strength?: number;
  /** Optional inner element that travels further than its container. */
  childSelector?: string;
}

/**
 * Magnetic hover: the element leans toward the cursor while it is nearby and
 * springs back on exit.
 *
 * Deliberately subtle — the default strength moves a button by a few pixels.
 * The point is that the button feels *alive under the cursor*, not that it
 * visibly chases it around the page.
 *
 * Disabled entirely on touch and under reduced-motion, where the hover state it
 * depends on either does not exist or should not animate.
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 0.22,
  childSelector,
}: MagneticOptions = {}) {
  const ref = useRef<T>(null);
  const { allowCursor } = useDeviceTier();

  useEffect(() => {
    const el = ref.current;
    // strength 0 is how callers opt out; skip the listeners entirely rather
    // than running the maths every pointermove and multiplying it by zero.
    if (!el || !allowCursor || strength === 0) return;

    const child = childSelector
      ? el.querySelector<HTMLElement>(childSelector)
      : null;

    // quickTo builds a reusable tween once instead of allocating a new one on
    // every pointermove — this is what keeps magnetic hover off the GC path.
    const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const childX = child
      ? gsap.quickTo(child, 'x', { duration: 0.6, ease: 'power3.out' })
      : null;
    const childY = child
      ? gsap.quickTo(child, 'y', { duration: 0.6, ease: 'power3.out' })
      : null;

    function handleMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      moveX(dx * strength);
      moveY(dy * strength);
      childX?.(dx * strength * 0.5);
      childY?.(dy * strength * 0.5);
    }

    function handleLeave() {
      moveX(0);
      moveY(0);
      childX?.(0);
      childY?.(0);
    }

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerleave', handleLeave);
    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerleave', handleLeave);
      // Clear the inline transform so the element is not left off-centre if it
      // unmounts mid-hover.
      gsap.set(el, { x: 0, y: 0 });
      if (child) gsap.set(child, { x: 0, y: 0 });
    };
  }, [allowCursor, strength, childSelector]);

  return ref;
}
