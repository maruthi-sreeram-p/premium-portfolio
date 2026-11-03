import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects, type Project, type ProjectCategory } from '../../data/projects';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import ProjectCard from '../shared/ProjectCard';
import ProjectDetail from '../shared/ProjectDetail';
import { EASE_OUT_QUINT } from '../../lib/motion';
import { scrollToPosition, scrollToSection } from '../../lib/scroll';

type Filter = 'All' | ProjectCategory;

/** Derived from the data so a new category never needs a second edit here. */
const FILTERS: Filter[] = [
  'All',
  ...Array.from(new Set(projects.map((p) => p.category))),
];

export default function Projects() {
  const [filter, setFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<Project | null>(null);
  // Once a project has been opened, cards coming back should simply be there:
  // replaying their entrance would fight the card-to-panel morph in reverse.
  const [hasOpened, setHasOpened] = useState(false);

  const returnY = useRef(0);
  const lastTrigger = useRef<string | null>(null);

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  const open = useCallback((project: Project) => {
    returnY.current = window.scrollY;
    lastTrigger.current = project.id;
    setHasOpened(true);
    setSelected(project);
    // The detail view replaces the grid, so bring the top of it into view while
    // the card is still growing into it.
    scrollToSection('projects');
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    scrollToPosition(returnY.current);
  }, []);

  // Escape closes, like the dialog this replaced.
  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, close]);

  // Hand focus back to the card that opened the project.
  useEffect(() => {
    if (selected || !lastTrigger.current) return;
    const id = lastTrigger.current;
    lastTrigger.current = null;
    const frame = requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-project-trigger="${id}"]`)
        ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected]);

  return (
    <SectionWrapper id="projects" ariaLabel="Selected work">
      {/* `popLayout` takes the leaving view out of the flow immediately, so the
          view arriving lays out at its real position while the shared card
          shell travels between the two. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {selected ? (
          <ProjectDetail key="detail" project={selected} onBack={close} />
        ) : (
          <motion.div key="list" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            <SectionHeading
              eyebrow="03 — Selected work"
              title="Projects"
              lead="Seven completed builds across backend services, distributed systems and intelligent applications. Open any card for the problem, the architecture and what I actually did."
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

            {/* Two per row on desktop, one below it. Every card is the same
                width, and because ProjectCard fixes the height of each region,
                the same height. Flagship work is marked with a pill rather than
                a wider cell. */}
            <motion.ul layout className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {visible.map((project, i) => (
                  <motion.li
                    key={project.id}
                    layout
                    // The card's own entrance lives in CardReveal; this element
                    // only owns filter behaviour — repositioning via `layout`,
                    // and the exit when a card is filtered out.
                    exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.45, ease: EASE_OUT_QUINT }}
                  >
                    <ProjectCard
                      project={project}
                      onOpen={open}
                      index={i}
                      instant={hasOpened}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
