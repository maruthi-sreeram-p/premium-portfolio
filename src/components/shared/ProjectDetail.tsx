import { useEffect, useRef, type Ref } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Project } from '../../data/projects';
import { EASE_OUT_QUINT } from '../../lib/motion';
import { GithubIcon } from './SocialIcons';
import ArchitectureFlow from './ArchitectureFlow';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  /** AnimatePresence's `popLayout` mode measures its direct child through this. */
  ref?: Ref<HTMLElement>;
}

/** Content that arrives after the shell has started moving, so it never
    distorts mid-morph. */
const settle = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: EASE_OUT_QUINT },
});

/**
 * A project, opened in place.
 *
 * Replaces the section's grid rather than floating over it. The header panel
 * carries the same `layoutId` as the card's background shell (see
 * ProjectCard), so the card appears to straighten and grow into this panel
 * instead of a separate window appearing. The shell is empty on purpose: it is
 * the only thing that gets scaled, so no text is ever stretched mid-animation —
 * the words fade in on top once it has started to settle.
 *
 * The article itself only animates on exit. Fading it in would multiply into
 * the shell's opacity and hide the very morph this view exists for.
 */
export default function ProjectDetail({ project, onBack, ref }: ProjectDetailProps) {
  const backRef = useRef<HTMLButtonElement>(null);
  const accent = `var(--${project.accent})`;

  // Move focus into the new view; the card that opened it is gone from the DOM
  // for as long as this is showing.
  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
  }, [project.id]);

  return (
    <motion.article
      ref={ref}
      aria-labelledby="project-detail-title"
      className="mx-auto w-full max-w-3xl"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <motion.div {...settle(0.1)}>
        <button
          ref={backRef}
          type="button"
          onClick={onBack}
          data-cursor
          className="inline-flex items-center gap-2 rounded-md py-2 pr-3 text-sm font-medium text-[var(--fg-soft)] transition-colors duration-300 hover:text-[var(--fg)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to projects
        </button>
      </motion.div>

      {/* The morph target. */}
      <div className="relative isolate mt-4 rounded-xl p-6 sm:p-8">
        <motion.span
          layoutId={`project-shell-${project.id}`}
          aria-hidden="true"
          className="surface absolute inset-0 -z-10"
          style={{ borderRadius: 12 }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUINT }}
        />

        <motion.div {...settle(0.2)} className="flex min-h-[14rem] flex-col justify-between gap-10 sm:min-h-[18rem]">
          <div className="flex items-start justify-between gap-4">
            <p className="label">{project.category}</p>
            {project.priority === 'flagship' && (
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

          <ArchitectureFlow architecture={project.architecture} accent={accent} size="detail" />

          <div>
            <h2
              id="project-detail-title"
              className="text-2xl font-bold leading-tight text-[var(--fg)] sm:text-4xl"
            >
              {project.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--fg-soft)] sm:text-base">{project.subtitle}</p>
          </div>
        </motion.div>
      </div>

      <motion.div {...settle(0.3)}>
        {/* Links and chips, in the order a visitor wants them: where is it,
            what is it made of. */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg)] transition-colors duration-300 hover:text-[var(--fg-soft)]"
            >
              <GithubIcon className="h-4 w-4" />
              {project.github.replace(/^https?:\/\//, '')}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg)] transition-colors duration-300 hover:text-[var(--fg-soft)]"
            >
              Live demo
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <ul className="mt-5 flex flex-wrap gap-2">
          {[project.role, ...project.tech].map((chip) => (
            <li
              key={chip}
              className="rounded-md border px-2.5 py-1 text-[0.75rem] tracking-[0.02em] text-[var(--fg-soft)]"
              style={{ borderColor: 'var(--rule-strong)' }}
            >
              {chip}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-lg leading-relaxed text-[var(--fg)]">{project.approach}</p>

        <section className="mt-12">
          <h3 className="label eyebrow">The problem</h3>
          <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">{project.problem}</p>
        </section>

        <section className="mt-12">
          <h3 className="label eyebrow">What it does</h3>
          <ul className="mt-4 space-y-3">
            {project.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[var(--fg-soft)]">
                <span
                  aria-hidden="true"
                  className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full"
                  style={{ background: accent }}
                />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h3 className="label eyebrow">My contribution</h3>
          <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">{project.contribution}</p>
        </section>

        <div className="mt-14 border-t pt-6">
          <button
            type="button"
            onClick={onBack}
            data-cursor
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-soft)] transition-colors duration-300 hover:text-[var(--fg)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to projects
          </button>
        </div>
      </motion.div>
    </motion.article>
  );
}
