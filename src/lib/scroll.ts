import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

let lenis: Lenis | null = null;

/**
 * Start Lenis and bind it to GSAP's ticker and ScrollTrigger.
 *
 * The three systems have to share one clock. Lenis owns the scroll position,
 * GSAP's ticker owns the frame, and ScrollTrigger has to be told the position
 * changed — if any of those runs on its own rAF the page develops a subtle
 * one-frame lag between the content and its pinned/parallax effects.
 *
 * Returns a teardown function. Safe to call when smooth scroll is not wanted:
 * pass `enabled: false` and it wires up nothing but still returns a no-op.
 */
export function initSmoothScroll(enabled: boolean): () => void {
  if (!enabled) {
    // Native scrolling handles it; ScrollTrigger listens to the scroll event
    // itself, so it keeps working without any of the wiring below.
    return () => {};
  }

  lenis = new Lenis({
    /*
      `lerp` rather than `duration`, and a fairly high one.

      Duration-based smoothing runs a fixed-length tween for every wheel event,
      which is what makes smooth scrolling feel *laggy*: the page keeps gliding
      well after the input stopped. A lerp follows the target continuously and
      settles quickly, so the page starts moving the instant the wheel does and
      stops close to when it stops, while still removing the stepping of raw
      wheel deltas.
    */
    lerp: 0.14,
    smoothWheel: true,
    // Touch devices get native scrolling. Hijacking it on mobile costs frames
    // and breaks the platform's own overscroll/refresh gestures.
    syncTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  const onScroll = () => ScrollTrigger.update();
  lenis.on('scroll', onScroll);

  const raf = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);

  // ScrollTrigger's default scroller detection assumes native scroll; pointing
  // it at Lenis keeps `scrollTo` and pinning accurate.
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (value !== undefined) lenis?.scrollTo(value, { immediate: true });
      return lenis?.scroll ?? window.scrollY;
    },
  });

  return () => {
    gsap.ticker.remove(raf);
    lenis?.off('scroll', onScroll);
    lenis?.destroy();
    lenis = null;
  };
}

/** Pause/resume — used while the mobile menu or boot overlay owns the screen. */
export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  // Lenis is absent on touch/reduced-motion, so the overflow lock still matters.
  document.body.style.overflow = locked ? 'hidden' : '';
}

/**
 * Scroll to a section by id. Uses Lenis when it is driving, native smooth
 * scrolling otherwise, and an instant jump under reduced-motion.
 */
export function scrollToSection(id: string) {
  const target = document.getElementById(id.replace(/^#/, ''));
  if (!target) return;

  // Offset for the fixed header so the section heading is not tucked under it.
  const offset = window.innerWidth < 768 ? -64 : -80;

  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.2 });
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}

/** Scroll back to the very top (logo click). */
export function scrollToTop() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.2 });
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}
