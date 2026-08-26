import { useSyncExternalStore } from 'react';

export type Tier = 'high' | 'mid' | 'low';

export interface DeviceProfile {
  /** Coarse pointer — phones, tablets, touch laptops in touch mode. */
  isTouch: boolean;
  /** Viewport under the `md` breakpoint. */
  isMobile: boolean;
  /** Viewport between `md` and `lg`. */
  isTablet: boolean;
  prefersReducedMotion: boolean;
  /**
   * Rendering budget:
   *   high — full cinematic experience (WebGL field, cursor, all VFX)
   *   mid  — reduced particle counts, no WebGL post work
   *   low  — CSS-only ambience, no WebGL at all
   */
  tier: Tier;
  /** WebGL scenes are only worth their cost on `high`. */
  allowWebGL: boolean;
  /** Custom cursor requires a fine pointer and hover support. */
  allowCursor: boolean;
}

const QUERIES = [
  '(pointer: coarse)',
  '(prefers-reduced-motion: reduce)',
  '(max-width: 767px)',
  '(max-width: 1023px)',
] as const;

/**
 * A one-time read of the hardware. `deviceMemory` is Chromium-only and
 * `hardwareConcurrency` can be spoofed, so these are treated as hints that can
 * only ever *downgrade* the tier — never as a guarantee of capability.
 */
function hardwareIsWeak(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || memory <= 4;
}

let cache: DeviceProfile | null = null;

function read(): DeviceProfile {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return {
      isTouch: false,
      isMobile: false,
      isTablet: false,
      prefersReducedMotion: false,
      tier: 'high',
      allowWebGL: false,
      allowCursor: false,
    };
  }

  const [coarse, reduced, mobile, tabletOrSmaller] = QUERIES.map(
    (q) => window.matchMedia(q).matches,
  );
  const isTablet = tabletOrSmaller && !mobile;
  const weak = hardwareIsWeak();

  let tier: Tier = 'high';
  if (mobile || reduced || weak) tier = 'low';
  else if (isTablet || coarse) tier = 'mid';

  const next: DeviceProfile = {
    isTouch: coarse,
    isMobile: mobile,
    isTablet,
    prefersReducedMotion: reduced,
    tier,
    allowWebGL: tier === 'high' && !reduced,
    allowCursor: !coarse && !reduced && window.matchMedia('(hover: hover)').matches,
  };

  // useSyncExternalStore compares snapshots by reference, so an unchanged
  // profile must return the *same object* or React will loop forever.
  if (
    cache &&
    (Object.keys(next) as (keyof DeviceProfile)[]).every((k) => cache![k] === next[k])
  ) {
    return cache;
  }
  cache = next;
  return next;
}

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const lists = [...QUERIES, '(hover: hover)'].map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener('change', onChange));
  return () => lists.forEach((l) => l.removeEventListener('change', onChange));
}

const serverSnapshot: DeviceProfile = {
  isTouch: false,
  isMobile: false,
  isTablet: false,
  prefersReducedMotion: false,
  tier: 'high',
  allowWebGL: false,
  allowCursor: false,
};

/**
 * Single source of truth for "how much visual work is this device allowed to
 * do". Every effect on the site gates itself through this rather than
 * re-implementing its own breakpoint and capability checks.
 */
export function useDeviceTier(): DeviceProfile {
  return useSyncExternalStore(subscribe, read, () => serverSnapshot);
}
