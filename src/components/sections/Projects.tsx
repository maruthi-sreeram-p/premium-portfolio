import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects, type Project, type ProjectCategory } from '../../data/projects';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import ProjectCard from '../shared/ProjectCard';
import ProjectDetail from '../shared/ProjectDetail';
import ProjectConveyor from '../shared/ProjectConveyor';
import { useDeviceTier } from '../../hooks/useDeviceTier';
import { EASE_OUT_QUINT } from '../../lib/motion';
import { CLOSE_PROJECT_EVENT, scrollToPosition } from '../../lib/scroll';
import { ScrollTrigger } from '../../lib/gsap';

interface ProjectsProps {
  /** Tells the page when a project is open, so it can hide everything else. */
  onOpenChange?: (open: boolean) => void;
}

type Filter = 'All' | ProjectCategory;

/** Derived from the data so a new category never needs a second edit here. */
const FILTERS: Filter[] = [
  'All',
  ...Array.from(new Set(projects.map((p) => p.category))),
];

export default function Projects({ onOpenChange }: ProjectsProps) {
  const { prefersReducedMotion } = useDeviceTier();
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
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = useCallback(() => {
    setSelected(null);
    onOpenChange?.(false);
  }, [onOpenChange]);

  // An open project takes over the page — the rest of it is hidden — so the
  // document is a different length the moment `selected` changes. Move the
  // scroll position in the same frame, before paint: to the top when a project
  // opens, and back to where the visitor was when it closes. The first run is
  // the initial mount, which must not scroll anywhere.
  const mounted = useRef(false);
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    scrollToPosition(selected ? 0 : returnY.current, true);
    ScrollTrigger.refresh();
  }, [selected]);

  // Escape closes, and so does navigating to another section.
  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(CLOSE_PROJECT_EVENT, close);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(CLOSE_PROJECT_EVENT, close);
    };
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

            {prefersReducedMotion ? (
              /* Visitors who ask for less motion get a still grid instead of
                 the moving band: two per row on desktop, one below it. */
              <motion.ul layout className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {visible.map((project, i) => (
                    <motion.li
                      key={project.id}
                      layout
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
            ) : (
              // Keyed on the filter so changing it restarts the band cleanly
              // rather than re-measuring a loop that is mid-way along.
              <div className="mt-6">
                <ProjectConveyor key={filter} projects={visible} onOpen={open} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
