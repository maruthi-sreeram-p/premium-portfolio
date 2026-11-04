import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Project } from '../../data/projects';
import ProjectCard from './ProjectCard';

interface ProjectRingProps {
  projects: Project[];
  onOpen: (project: Project) => void;
  /** Project to bring to the front first — the one the visitor just closed. */
  startId?: string | null;
}

/** Milliseconds a card stays in front before the ring turns on its own. */
const DWELL_MS = 5200;
/** Pixels of horizontal drag that count as a swipe. */
const SWIPE_PX = 50;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** How visible a card is, by how many places it sits from the front. */
const opacityAt = (distance: number) =>
  distance === 0 ? 1 : distance === 1 ? 0.5 : distance === 2 ? 0.2 : 0;

/**
 * The project cards, set around a ring that turns one card at a time.
 *
 * Each card sits on a cylinder (`rotateY(i·step) translateZ(R)`) and the ring
 * itself is pushed back by R so the front card lands flat on the screen, at its
 * natural size — which is also what lets it grow into the project page without
 * a skewed starting shape. The ring never unwinds: `turn` only counts up or
 * down, so going from the last card to the first keeps turning the same way.
 *
 * It advances by itself every few seconds, and stops while the pointer is over
 * it or a control has keyboard focus. Arrows, the left and right keys and a
 * swipe all turn it by hand. Only the front card opens; a card off to the side
 * turns to the front first.
 */
export default function ProjectRing({ projects, onOpen, startId }: ProjectRingProps) {
  const count = projects.length;
  const step = 360 / count;

  const [turn, setTurn] = useState(() => {
    const at = projects.findIndex((p) => p.id === startId);
    return at < 0 ? 0 : at;
  });
  const [paused, setPaused] = useState(false);
  const active = mod(turn, count);

  const go = useCallback((by: number) => setTurn((t) => t + by), []);

  // Turn on its own. Restarts after every move, so a manual turn is always
  // followed by a full dwell rather than an immediate second jump.
  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setTurn((t) => t + 1);
    }, DWELL_MS);
    return () => window.clearInterval(timer);
  }, [paused, count, turn]);

  // Swipe.
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);
  const onPointerDown = (event: React.PointerEvent) => {
    dragStart.current = event.clientX;
    dragged.current = false;
  };
  const onPointerUp = (event: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = event.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) >= SWIPE_PX) {
      dragged.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(1);
    else if (event.key === 'ArrowLeft') go(-1);
  };

  // A card off to the side is brought to the front rather than opened; and the
  // click that ends a swipe opens nothing.
  const handleOpen = (project: Project, index: number) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (index === active) {
      onOpen(project);
      return;
    }
    // Shortest way round to that card.
    let delta = mod(index - active, count);
    if (delta > count / 2) delta -= count;
    go(delta);
  };

  // Too few cards to form a ring (a narrow filter): lay them out flat.
  if (count < 3) {
    return (
      <div className="mt-10 flex flex-wrap justify-center gap-5">
        {projects.map((project, i) => (
          <div key={project.id} className="w-[18rem] sm:w-[22rem] md:w-[30rem]">
            <ProjectCard project={project} onOpen={onOpen} index={i} instant />
          </div>
        ))}
      </div>
    );
  }

  // Radius that lets neighbours sit side by side with a little air between.
  const k = (1 / (2 * Math.tan(Math.PI / count))) * 1.25;

  return (
    <div
      className="mt-10"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) {
          setPaused(true);
        }
      }}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div
        // The stage. Width and height are the front card's; the ring spreads
        // out beyond it, and `overflow: visible` lets the neighbours show.
        className="relative mx-auto h-[31rem] w-[18rem] [--w:18rem] sm:w-[22rem] sm:[--w:22rem] md:h-[29rem] md:w-[30rem] md:[--w:30rem]"
        style={{ perspective: '1800px', ['--k' as string]: k }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        role="group"
        aria-roledescription="carousel"
        aria-label="Projects"
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(calc(var(--w) * var(--k) * -1)) rotateY(${-turn * step}deg)`,
            transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          {projects.map((project, i) => {
            const distance = Math.min(mod(i - active, count), mod(active - i, count));
            const front = i === active;
            return (
              <div
                key={project.id}
                className="absolute inset-0 flex"
                style={{
                  transform: `rotateY(${i * step}deg) translateZ(calc(var(--w) * var(--k)))`,
                  backfaceVisibility: 'hidden',
                  opacity: opacityAt(distance),
                  // Cards that cannot be seen should not be clicked either.
                  pointerEvents: distance > 2 ? 'none' : undefined,
                  transition: 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                aria-hidden={distance > 2 || undefined}
                aria-current={front || undefined}
              >
                <ProjectCard
                  project={project}
                  onOpen={(p) => handleOpen(p, i)}
                  index={i}
                  instant
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous project"
          className="rounded-full border p-2.5 text-[var(--fg-soft)] transition-colors duration-300 hover:border-[var(--rule-strong)] hover:text-[var(--fg)]"
          style={{ borderColor: 'var(--rule)' }}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <p className="label min-w-[7.5rem] text-center" aria-live="polite">
          <span className="text-[var(--fg)]">{String(active + 1).padStart(2, '0')}</span>
          {' / '}
          {String(count).padStart(2, '0')}
        </p>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next project"
          className="rounded-full border p-2.5 text-[var(--fg-soft)] transition-colors duration-300 hover:border-[var(--rule-strong)] hover:text-[var(--fg)]"
          style={{ borderColor: 'var(--rule)' }}
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
