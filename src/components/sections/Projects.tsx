import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects, type Project, type ProjectCategory } from '../../data/projects';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import ProjectCard from '../shared/ProjectCard';
import ProjectDialog from '../shared/ProjectDialog';
import { EASE_OUT_QUINT } from '../../lib/motion';

type Filter = 'All' | ProjectCategory;

/** Derived from the data so a new category never needs a second edit here. */
const FILTERS: Filter[] = [
  'All',
  ...Array.from(new Set(projects.map((p) => p.category))),
];

export default function Projects() {
  const [filter, setFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<Project | null>(null);

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  // Stable identity — the dialog registers a native `close` listener keyed on
  // this callback, and rebuilding it on every render churns that listener.
  const closeDialog = useCallback(() => setSelected(null), []);

  return (
    <SectionWrapper id="projects" ariaLabel="Selected work">
      <SectionHeading
        eyebrow="03 — Selected work"
        title="Projects"
        lead="Nine builds across backend services, distributed systems and intelligent applications. Open any card for the problem, the architecture and what I actually did."
        aside={
          <p className="label">
            <span className="text-[var(--fg)]">{visible.length}</span>
            {' / '}
            {projects.length} shown
          </p>
        }
      />

      {/* Category filter */}
      <Reveal delay={0.1}>
        <div
          className="mt-10 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects by category"
        >
          {FILTERS.map((option) => {
            const active = option === filter;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={active}
                className="relative rounded-full border px-4 py-2 text-[0.8125rem] font-medium transition-colors duration-300"
                style={{
                  borderColor: active
                    ? 'color-mix(in srgb, var(--accent) 50%, transparent)'
                    : 'var(--rule)',
                  color: active ? 'var(--accent)' : 'var(--fg-soft)',
                  background: active
                    ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                    : 'transparent',
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Two per row on desktop, one below it. Three-up squeezed each card to
          ~380px, which forced the flow and tech lists down to three items and
          left the text cramped; at two-up a card is ~580px and carries its
          content comfortably. Tablets get a single column rather than a
          two-up at ~350px, which would be tighter than the layout this
          replaced.
          Every card is still the same width, and because ProjectCard fixes the
          height of each region, the same height. Flagship work is marked with
          a pill rather than a wider cell — a ragged two-size grid was the other
          half of why the cards did not read as a set. */}
      <motion.ul layout className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => (
            <motion.li
              key={project.id}
              layout
              // The card's own entrance lives in CardReveal; this element only
              // owns filter behaviour — repositioning via `layout`, and the
              // exit when a card is filtered out. Animating both would stack
              // two rises on the same card.
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: EASE_OUT_QUINT }}
            >
              <ProjectCard project={project} onOpen={setSelected} index={i} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <ProjectDialog project={selected} onClose={closeDialog} />
    </SectionWrapper>
  );
}
