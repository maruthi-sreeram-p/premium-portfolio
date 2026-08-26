/**
 * Shared motion vocabulary.
 *
 * Every reveal on the site pulls its easing and duration from here so the whole
 * page moves with one accent instead of a dozen slightly different ones.
 */

/** Matches --ease-out-expo in index.css. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/** Matches --ease-out-quint. The default for reveals. */
export const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;
/** Symmetric ease for things that travel out and back. */
export const EASE_IN_OUT_QUINT = [0.83, 0, 0.17, 1] as const;

export const DURATION = {
  /** Hover / press feedback. */
  instant: 0.18,
  /** Standard UI state change. */
  quick: 0.32,
  /** Section reveals. */
  base: 0.6,
  /** Hero-scale entrances. */
  slow: 0.9,
} as const;

/** Stagger steps, in seconds. */
export const STAGGER = {
  tight: 0.04,
  base: 0.07,
  loose: 0.12,
} as const;

/**
 * Viewport config for `whileInView`. A negative bottom margin means the reveal
 * fires slightly *before* the element is fully on screen, which reads as
 * "already there" rather than "popped in late" while scrolling at speed.
 */
export const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const;

/** The standard reveal: rise + fade. */
export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: DURATION.base, delay, ease: EASE_OUT_QUINT },
});

/** Container/child pair for staggered lists. */
export const staggerParent = (stagger = STAGGER.base, delay = 0) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: VIEWPORT,
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  },
});

export const staggerChild = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT_QUINT },
  },
};

/** Clamp helper used by the pointer/tilt maths. */
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Frame-rate independent smoothing toward a target. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
