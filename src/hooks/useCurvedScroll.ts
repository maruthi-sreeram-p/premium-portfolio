import { useEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useDeviceTier } from './useDeviceTier';

/** Degrees of tilt at the top and bottom of the viewport. */
const MAX_ANGLE = 13;
/** How far the middle of the curve sits back from the edges, in pixels. */
const DEPTH = 240;
/** Focal length. Shorter = more pronounced curve. */
export const CURVE_PERSPECTIVE = 1200;

/**
 * Maps an element onto the inside of a very large cylinder as it scrolls.
 *
 * The page reads as though it is printed on a concave surface: a section
 * entering from the bottom has its lower edge leaning toward the viewer, it
 * flattens as it passes the middle of the screen, and its top edge leans
 * toward the viewer again as it exits.
 *
 *   rotateX = −d · MAX_ANGLE       (d = −1 below the viewport … +1 above it)
 *   z       = −DEPTH · (1 − |d|)   (middle furthest, edges nearest)
 *
 * The negative-z form matters: pushing the *middle* away produces the dish
 * shape without ever translating anything toward the camera, which would scale
 * it past its container and clip. And because rotateX is 0 at d = 0, content
 * is perfectly flat exactly where it is being read — the curve never costs
 * legibility.
 *
 * Note that the transformed element must NOT carry `transform-style:
 * preserve-3d`. The section is a flat plane being tilted, not a 3D scene;
 * preserve-3d would promote its entire subtree into a 3D rendering context and
 * rasterise all of it, which on sections several thousand pixels tall is
 * exactly the kind of cost that shows up as scroll stutter.
 *
 * Skipped on `low` and under reduced-motion for the same reason.
 *
 * @param outer the element whose scroll position drives the curve
 * @param inner the element the transform is applied to
 * @param enabled caller-side opt-out
 */
export function useCurvedScroll(
  outer: RefObject<HTMLElement | null>,
  inner: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const { prefersReducedMotion, tier } = useDeviceTier();
  const active = enabled && !prefersReducedMotion && tier !== 'low';

  useEffect(() => {
    const section = outer.current;
    const target = inner.current;
    if (!active || !section || !target) return;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        // The element's entire travel across the viewport, so the curve is
        // continuous rather than a one-shot tilt on entry.
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const d = self.progress * 2 - 1;
          gsap.set(target, {
            rotateX: -d * MAX_ANGLE,
            z: -DEPTH * (1 - Math.abs(d)),
            force3D: true,
          });
        },
      });
      return () => trigger.kill();
    }, section);

    return () => {
      ctx.revert();
      // Leave no residual transform behind if the tier or preference changes.
      gsap.set(target, { clearProps: 'transform' });
    };
  }, [active, outer, inner]);

  return active;
}
