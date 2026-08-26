import { ArrowUpRight } from 'lucide-react';
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
}

/*
  Caps on what the card shows.

  These are what guarantee equal card heights: the containers below have
  *fixed* heights, so the contents must never need more rows than those
  heights allow. At the two-up card width (~580px) five chips fit on one row
  and the flow fits in two, which is what these numbers are set against —
  they would need lowering again if the grid ever went back to three-up.

  Anything beyond the cap becomes a "+N" pill, and the full list is one click
  away in the dialog.
*/
const MAX_TECH = 5;
const MAX_FLOW = 4;

/**
 * A project card.
 *
 * **Every card is structurally identical.** That is the point, and it takes
 * deliberate work because the underlying projects are not: the flows run from
 * three steps to six, the tech lists from three entries to six, only some are
 * flagged flagship, and only some have a public repo. Left alone that produced
 * nine visibly different cards — some two rows of chips taller than others,
 * some with a footer and some without.
 *
 * So each region is given a fixed shape:
 *   • the meta row always exists, with the flagship pill occupying it or not
 *   • the title, subtitle and description are clamped to a set number of lines
 *   • the flow shows at most four nodes, overflow becomes "+N"
 *   • the tech list shows at most five chips, overflow becomes "+N"
 *   • the footer always renders, with or without links in it
 *
 * The full, unclamped detail is one click away in the dialog, so nothing is
 * lost — the card is an index entry, not the record.
 *
 * Interaction model: the title is the real button and its `::after` covers the
 * whole card, so the entire surface is clickable while assistive tech still
 * sees exactly one clearly-labelled control. The repo link is raised above that
 * overlay so it stays independently reachable.
 */
export default function ProjectCard({ project, onOpen, index = 0 }: ProjectCardProps) {
  const tiltRef = useTilt<HTMLDivElement>({ max: 4.5, lift: 8 });
  const accent = `var(--${project.accent})`;
  const isFlagship = project.priority === 'flagship';

  const shownTech = project.tech.slice(0, MAX_TECH);
  const extraTech = project.tech.length - shownTech.length;

  const flowNodes = project.architecture.nodes;
  const shownFlow = { nodes: flowNodes.slice(0, MAX_FLOW) };
  const extraFlow = flowNodes.length - shownFlow.nodes.length;

  return (
    <article className="tilt-scene h-full">
      <CardReveal accent={accent} delay={Math.min(index * 0.06, 0.3)} className="h-full">
        <div
          ref={tiltRef}
          className="tilt-card spotlight surface group relative flex h-full flex-col overflow-hidden rounded-lg p-6 transition-[border-color,box-shadow] duration-500 hover:border-[color-mix(in_srgb,var(--card-accent)_45%,transparent)] sm:p-7"
          style={{ ['--card-accent' as string]: accent }}
        >
          {/* Accent edge — the card's identity colour, lit on hover. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
            style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
          />

          {/* Meta row — always present, so the pill never shifts the layout. */}
          <div className="relative flex h-5 items-start justify-between gap-4">
            <p className="label truncate">{project.category}</p>
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

          {/* Title — the card's single control. Two lines, always. */}
          <h3 className="relative mt-4 h-[1.35em]">
            <button
              type="button"
              onClick={() => onOpen(project)}
              data-cursor
              data-cursor-label="View project"
              className="text-left after:absolute after:inset-0 after:content-['']"
              aria-label={`View details for ${project.title}`}
            >
              <span className="font-display line-clamp-1 block text-xl font-bold leading-tight text-[var(--fg)] transition-transform duration-500 group-hover:translate-x-1">
                {project.title}
              </span>
            </button>
          </h3>

          <p className="relative mt-2 line-clamp-1 text-sm text-[var(--fg-soft)]">
            {project.subtitle}
          </p>

          <p className="relative mt-3 line-clamp-2 h-[2.7rem] text-sm leading-relaxed text-[var(--fg-soft)]">
            {project.approach}
          </p>

          {/* Flow — capped so a six-step path cannot make this card taller. */}
          <div className="relative mt-5">
            <p className="label mb-2.5">Flow</p>
            <div className="flex h-[4.25rem] flex-wrap items-start gap-1.5 overflow-hidden md:h-[2.15rem]">
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

          {/* Tech — capped for the same reason. */}
          <ul className="relative mt-4 flex h-[4rem] flex-wrap gap-1.5 overflow-hidden md:h-[1.9rem]">
            {shownTech.map((tech) => (
              <li
                key={tech}
                className="rounded border px-2 py-1 text-[0.6875rem] tracking-[0.02em] transition-colors duration-500"
                style={{ borderColor: 'var(--rule)', color: 'var(--fg-faint)' }}
              >
                <span className="transition-colors duration-500 group-hover:text-[var(--fg-soft)]">
                  {tech}
                </span>
              </li>
            ))}
            {extraTech > 0 && (
              <li
                className="rounded border px-2 py-1 text-[0.6875rem] tracking-[0.02em]"
                style={{ borderColor: 'var(--rule)', color: 'var(--fg-faint)' }}
              >
                +{extraTech}
              </li>
            )}
          </ul>

          {/* Footer — always rendered, links or not, so the base aligns. */}
          <div className="relative mt-auto flex h-[2.9rem] items-center justify-between gap-4 border-t pt-5">
            <p className="label truncate">{project.role}</p>

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
