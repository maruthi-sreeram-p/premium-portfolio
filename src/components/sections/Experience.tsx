import { useEffect, useRef } from 'react';
import { journey } from '../../data/experience';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { gsap } from '../../lib/gsap';
import { useDeviceTier } from '../../hooks/useDeviceTier';

/**
 * The journey timeline.
 *
 * A single vertical rail runs the length of the section. Its lit portion is
 * scrubbed directly by scroll position, and each node switches on as the rail
 * reaches it — so the visitor is literally drawing the timeline as they read
 * it, rather than watching five independent entries animate themselves in.
 *
 * The rail is one `scaleY` tween and the nodes are class toggles; nothing here
 * animates layout or triggers a React render during scroll.
 */
export default function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const { prefersReducedMotion } = useDeviceTier();

  useEffect(() => {
    const list = listRef.current;
    const rail = railRef.current;
    if (!list || !rail || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        rail,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: {
            trigger: list,
            // Starts filling once the first entry is comfortably in view and
            // completes on the last, so the rail tracks reading position.
            start: 'top 72%',
            end: 'bottom 72%',
            scrub: 0.4,
          },
        },
      );

      list.querySelectorAll<HTMLElement>('[data-node]').forEach((node) => {
        gsap.to(node, {
          scrollTrigger: {
            trigger: node,
            start: 'top 72%',
            toggleClass: { targets: node, className: 'is-live' },
            // Nodes stay lit once passed — scrolling back up should show the
            // timeline you have already read, not un-draw it.
            once: true,
          },
        });
      });
    }, list);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <SectionWrapper id="experience" ariaLabel="Experience and journey">
      <SectionHeading
        eyebrow="04 — Journey"
        title="The Path"
        lead="How the work has progressed — from language fundamentals to systems that have to stay correct when something fails."
      />

      <ol ref={listRef} className="relative mt-16 pl-10 sm:pl-16">
        {/* Rail — unlit base */}
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-2 bottom-2 w-px sm:left-[15px]"
          style={{ background: 'var(--rule)' }}
        />
        {/* Rail — lit portion, scrubbed by scroll */}
        <span
          ref={railRef}
          aria-hidden="true"
          className="absolute left-[7px] top-2 bottom-2 w-px origin-top sm:left-[15px]"
          style={{
            background:
              'linear-gradient(to bottom, var(--accent), var(--accent-3) 60%, var(--accent-2))',
            boxShadow: '0 0 12px color-mix(in srgb, var(--accent) calc(60% * var(--vfx)), transparent)',
          }}
        />

        {journey.map((entry) => (
          <li key={entry.id} className="relative pb-14 last:pb-0">
            {/* Node */}
            <span
              data-node
              aria-hidden="true"
              className="timeline-node absolute -left-10 top-1.5 flex h-[15px] w-[15px] items-center justify-center sm:-left-16"
            >
              <span
                className="timeline-node-ring absolute inset-0 rounded-full border transition-all duration-500"
                style={{ borderColor: 'var(--rule-strong)' }}
              />
              <span
                className="timeline-node-core h-[5px] w-[5px] rounded-full transition-all duration-500"
                style={{ background: 'var(--fg-faint)' }}
              />
              {entry.current && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '1px solid var(--accent-2)',
                    animation: 'node-pulse 2.6s ease-in-out infinite',
                  }}
                />
              )}
            </span>

            <Reveal delay={0.05} tilt tiltAngle={6}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="label label-accent">{entry.period}</p>
                {entry.current && (
                  <span
                    className="label rounded-full border px-2 py-0.5"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--accent-2) 45%, transparent)',
                      color: 'var(--accent-2)',
                    }}
                  >
                    Now
                  </span>
                )}
              </div>

              <h3 className="font-display mt-3 text-xl font-bold text-[var(--fg)] sm:text-2xl">
                {entry.title}
              </h3>
              <p className="mt-1.5 text-sm tracking-[0.01em] text-[var(--fg-faint)]">
                {entry.context}
              </p>
              <p className="mt-4 max-w-2xl leading-relaxed text-[var(--fg-soft)]">
                {entry.description}
              </p>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {entry.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="rounded border px-2.5 py-1 text-[0.6875rem] tracking-[0.02em] text-[var(--fg-faint)] transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] hover:text-[var(--fg-soft)]"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </Reveal>

          </li>
        ))}
      </ol>
    </SectionWrapper>
  );
}
