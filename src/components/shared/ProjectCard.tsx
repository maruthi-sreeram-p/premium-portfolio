import { motion } from 'framer-motion';
import { ArrowUpRight, User, Workflow } from 'lucide-react';
import type { Project } from '../../data/projects';
import { useTilt } from '../../hooks/useTilt';
import { GithubIcon } from './SocialIcons';
import ArchitectureFlow from './ArchitectureFlow';
import CardReveal from '../fx/CardReveal';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  /** Position in the grid, used to stagger the entrance. */
  index?: number;
  /** Skip the entrance — the card is returning, not arriving. */
  instant?: boolean;
  /**
   * False for a repeated copy of the card (the looping band shows each project
   * twice): it must not claim the layout id or the focus-return hook that the
   * real card owns.
   */
  primary?: boolean;
}

/*
  Caps on what the card shows.

  These are what guarantee equal card heights: every region below has a
  *fixed* height, so its contents must never need more room than that. Anything
  beyond a cap becomes a "+N" pill, and the full list is one click away in the
  detail view.
*/
const MAX_TECH = 4;
const MAX_FLOW = 3;

/**
 * A project card, laid out in three bands.
 *
 *   header — a status dot and the category, with the flagship pill when earned
 *   stage  — a tiled "map" ground with two small cards floating on it: the
 *            project's request path, and the role played on it
 *   footer — the stack, as a row of labels, and the repo / live links
 *
 * Between the header and the footer sits the text a card needs: title,
 * subtitle and a two-line approach.
 *
 * **Every card is structurally identical.** The projects themselves are not —
 * flows run from three steps to six, only some are flagship, only some have a
 * public repo — so each region is given a fixed shape and the card is an index
 * entry, not the record.
 *
 * Interaction model: the title is the real button and its `::after` covers the
 * whole card, so the entire surface is clickable while assistive tech still
 * sees exactly one clearly-labelled control. The repo link is raised above that
 * overlay so it stays independently reachable.
 */
export default function ProjectCard({
  project,
  onOpen,
  index = 0,
  instant = false,
  primary = true,
}: ProjectCardProps) {
  // The card turns toward the pointer and lifts a little. Fine-pointer devices
  // only (the hook checks). It also feeds the dot grid that lights up under it.
  const tiltRef = useTilt<HTMLDivElement>({ max: 8, lift: 14, trackSpotlight: true });
  const accent = `var(--${project.accent})`;
  const isFlagship = project.priority === 'flagship';

  const shownTech = project.tech.slice(0, MAX_TECH);
  const extraTech = project.tech.length - shownTech.length;

  const flowNodes = project.architecture.nodes;
  const shownFlow = { nodes: flowNodes.slice(0, MAX_FLOW) };
  const extraFlow = flowNodes.length - shownFlow.nodes.length;

  const shellClass =
    'surface dot-reveal absolute inset-0 -z-10 transition-colors duration-300 group-hover:border-[var(--rule-strong)]';

  return (
    <article className="tilt-scene h-full">
      <CardReveal accent={accent} delay={Math.min(index * 0.06, 0.3)} className="h-full" instant={instant}>
        <div
          ref={tiltRef}
          className="tilt-card group relative isolate flex h-full flex-col"
          style={{ ['--card-accent' as string]: accent }}
        >
          {/* The card's background, as its own empty element. When the project
              opens, this is what grows into the detail view's header panel
              (same layoutId) — empty, so nothing inside it is stretched. */}
          {primary ? (
            <motion.span
              layoutId={`project-shell-${project.id}`}
              aria-hidden="true"
              className={shellClass}
              style={{ borderRadius: 12 }}
            />
          ) : (
            <span aria-hidden="true" className={shellClass} style={{ borderRadius: 12 }} />
          )}

          {/* Header band */}
          <div
            className="relative flex h-12 items-center justify-between gap-4 border-b px-5 sm:px-6"
            style={{ borderColor: 'var(--rule)' }}
          >
            <p className="label flex min-w-0 items-center gap-2.5 truncate">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
              />
              <span className="truncate">{project.category}</span>
            </p>
            {isFlagship && (
              <span
                className="label shrink-0 rounded-full border px-2 py-0.5 leading-none"
                style={{
                  borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
                  color: accent,
                }}
              >
                Flagship
              </span>
            )}
          </div>

          {/* Stage — a tiled ground with two cards floating on it. On hover the
              cards drift apart and straighten, as if lifted off the surface. */}
          <div
            className="relative h-[13rem] overflow-hidden border-b"
            style={{ borderColor: 'var(--rule)' }}
            aria-hidden="true"
          >
            <div className="map-tiles absolute inset-0" />
            {/* Fades the tiles out toward the edges so the stage has no hard
                frame of its own. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(closest-side at 50% 50%, transparent 40%, var(--card-solid) 130%)',
              }}
            />

            {/* A dashed route between two waypoints, with a pin where it meets
                the centre. */}
            <svg
              viewBox="0 0 300 184"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              fill="none"
            >
              <path
                d="M 24 150 C 90 120, 130 40, 276 44"
                stroke="var(--rule-strong)"
                strokeWidth="1"
                strokeDasharray="4 5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span
              className="absolute left-[8%] top-[78%] h-2 w-2 rounded-full"
              style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
            />
            <span
              className="absolute right-[7%] top-[22%] h-2 w-2 rounded-full"
              style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
            />
            <span
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-transform duration-700 group-hover:scale-125"
              style={{ borderColor: 'var(--rule)' }}
            />
            <span
              className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: accent, boxShadow: `0 0 18px 2px ${accent}` }}
            />

            {/* Floating card: the request path */}
            <div
              className="absolute left-4 top-4 w-[64%] -rotate-3 rounded-xl border p-3 shadow-[0_18px_30px_-16px_rgba(0,0,0,0.75)] transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:-translate-x-1 group-hover:-translate-y-1.5 group-hover:-rotate-[5deg]"
              style={{ background: 'var(--card-solid)', borderColor: 'var(--card-border)' }}
            >
              <p className="label flex items-center gap-2" style={{ color: accent }}>
                <Workflow className="h-3.5 w-3.5" />
                Request path
              </p>
              <div className="mt-2.5 flex max-h-[4.6rem] flex-wrap items-start gap-1.5 overflow-hidden">
                <ArchitectureFlow architecture={shownFlow} accent={accent} />
                {extraFlow > 0 && (
                  <span
                    className="mt-[3px] shrink-0 rounded-md border px-2 py-1 text-[0.6875rem] tracking-[0.02em]"
                    style={{ borderColor: 'var(--rule)', color: 'var(--fg-faint)' }}
                  >
                    +{extraFlow}
                  </span>
                )}
              </div>
            </div>

            {/* Floating card: the role */}
            <div
              className="absolute bottom-4 right-4 w-[50%] rotate-[2.5deg] rounded-xl border p-3 shadow-[0_18px_30px_-16px_rgba(0,0,0,0.75)] transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:translate-x-1 group-hover:translate-y-1.5 group-hover:rotate-[4deg]"
              style={{ background: 'var(--card-solid)', borderColor: 'var(--card-border)' }}
            >
              <p className="label flex items-center gap-2" style={{ color: accent }}>
                <User className="h-3.5 w-3.5" />
                Role
              </p>
              <p className="font-display mt-2 truncate text-sm font-bold text-[var(--fg)]">
                {project.role}
              </p>
            </div>
          </div>

          {/* Title — the card's single control.

              Where cards sit side by side (lg+) it reserves exactly two lines so
              every row's subtitles line up. The type size is on the h3 so the em
              height is in the title's own units (2 lines × 1.25 leading =
              2.5em), and titles sit on the bottom of that box. Below lg the
              cards stack, so the title takes its natural height; the 3-line
              clamp is only a backstop.

              Never pair `block` with `line-clamp-*` — it overrides the clamp's
              `display: -webkit-box` and silently disables it.

              The h3 is deliberately *not* positioned: the button's ::after has
              to resolve against the card to cover it, and z-10 lifts it over
              the `relative` text blocks below that would otherwise take the
              click. */}
          <h3 className="font-display mx-5 mt-5 flex items-end text-xl font-bold leading-tight sm:mx-6 lg:h-[2.5em]">
            <button
              type="button"
              onClick={() => onOpen(project)}
              data-project-trigger={primary ? project.id : undefined}
              data-cursor
              data-cursor-label="View project"
              className="w-full text-left after:absolute after:inset-0 after:z-10 after:content-['']"
              aria-label={`View details for ${project.title}`}
            >
              <span className="line-clamp-3 text-[var(--fg)] transition-transform duration-500 group-hover:translate-x-1 lg:line-clamp-2">
                {project.title}
              </span>
            </button>
          </h3>

          <p className="relative mx-5 mt-2 line-clamp-1 text-sm text-[var(--fg-soft)] sm:mx-6">
            {project.subtitle}
          </p>

          {/* 2 lines × 1.625 leading = 3.25em, in the paragraph's own units. */}
          <p className="relative mx-5 mb-5 mt-3 line-clamp-2 h-[3.25em] text-sm leading-relaxed text-[var(--fg-soft)] sm:mx-6">
            {project.approach}
          </p>

          {/* Footer band — the stack as labels, then the links. Always
              rendered, links or not, so the base aligns across cards. */}
          <div
            className="relative mt-auto flex h-12 items-center justify-between gap-4 border-t px-5 sm:px-6"
            style={{ borderColor: 'var(--rule)' }}
          >
            <ul className="flex min-w-0 flex-1 items-center overflow-hidden text-[0.75rem] text-[var(--fg-faint)]">
              {shownTech.map((tech, i) => (
                <li
                  key={tech}
                  className="flex shrink-0 items-center whitespace-nowrap transition-colors duration-500 group-hover:text-[var(--fg-soft)]"
                >
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="mx-2.5 h-3 w-px"
                      style={{ background: 'var(--rule-strong)' }}
                    />
                  )}
                  {tech}
                </li>
              ))}
              {extraTech > 0 && (
                <li className="ml-2.5 shrink-0 whitespace-nowrap">+{extraTech}</li>
              )}
            </ul>

            <div className="flex shrink-0 items-center gap-3">
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  // z-20 lifts this above the title button's card-wide ::after
                  // overlay so it remains its own independent link. The
                  // p-2.5/-m-2.5 pair grows the hit area to ~38px without
                  // changing the visual size or the surrounding layout.
                  className="relative z-20 -m-2.5 p-2.5 text-[var(--fg-faint)] transition-colors duration-300 hover:text-[var(--fg)]"
                  aria-label={`${project.title} source on GitHub`}
                  title="View source"
                >
                  <GithubIcon className="h-[18px] w-[18px]" />
                </a>
              ) : (
                // Placeholder keeps the footer's right edge identical on cards
                // that have no public repo.
                <span className="block h-[18px] w-[18px]" aria-hidden="true" />
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-20 -m-2.5 p-2.5 text-[var(--fg-faint)] transition-colors duration-300 hover:text-[var(--fg)]"
                  aria-label={`${project.title} live demo`}
                  title="Live demo"
                >
                  <ArrowUpRight className="h-[18px] w-[18px]" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardReveal>
    </article>
  );
}
