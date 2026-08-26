import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { subscribePointer } from '../../lib/pointer';
import { useDeviceTier } from '../../hooks/useDeviceTier';

/**
 * The page's ambient ground.
 *
 * One fixed, `pointer-events: none` layer sitting behind every section. Because
 * it is fixed and shared, the sections appear to be cut out of a single
 * continuous space rather than stacked on separate backgrounds — this is what
 * carries the "one cinematic experience" continuity between Hero → About →
 * Skills → Projects → Experience → Contact.
 *
 * Nothing here ever animates layout: the grid translates, the aura moves via
 * custom properties feeding a radial-gradient, and both live on their own
 * compositor layers.
 */
export default function Backdrop() {
  const auraRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { tier, prefersReducedMotion, isTouch } = useDeviceTier();

  /* -- Aura follows the pointer ------------------------------------------ */
  useEffect(() => {
    const aura = auraRef.current;
    if (!aura || isTouch || prefersReducedMotion || tier === 'low') return;

    return subscribePointer(({ sx, sy }) => {
      // The aura trails the cursor at ~18% amplitude around the centre. A 1:1
      // follow would read as a flashlight; this reads as the interface being
      // lit from wherever attention is.
      aura.style.setProperty('--aura-x', `${50 + sx * 18}%`);
      aura.style.setProperty('--aura-y', `${42 + sy * 14}%`);
    });
  }, [isTouch, prefersReducedMotion, tier]);

  /* -- Grid drifts with scroll ------------------------------------------- */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.to(grid, {
        // Exactly two grid cells over the whole page, so the drift is felt as
        // depth without the lines ever visibly "restarting".
        y: 128,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash — a deep navy lift off pure black at the top of the page. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--accent) calc(9% * var(--vfx)), transparent) 0%, transparent 55%), var(--shell)',
        }}
      />

      {/* Technical grid */}
      <div ref={gridRef} className="fx-grid absolute -inset-y-32 inset-x-0" />

      {/* Pointer-reactive aura */}
      <div ref={auraRef} className="fx-aura absolute inset-0" />

      {/* Horizon glow — anchors the bottom of the page so Contact feels like a
          destination rather than the page simply running out. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--accent-3) calc(11% * var(--vfx)), transparent), transparent)',
        }}
      />

      {/* Vignette keeps attention centred and hides the grid's hard edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(110% 75% at 50% 50%, transparent 42%, color-mix(in srgb, var(--shell) 82%, transparent) 100%)',
        }}
      />

    </div>
  );
}
