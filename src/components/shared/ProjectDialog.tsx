import { useCallback, useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { Project } from '../../data/projects';
import { setScrollLocked } from '../../lib/scroll';
import { GithubIcon } from './SocialIcons';
import ArchitectureFlow from './ArchitectureFlow';

interface ProjectDialogProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * Project detail, built on the native <dialog> element.
 *
 * Using `showModal()` rather than a hand-rolled overlay means focus trapping,
 * Escape-to-close, inert background content and the top-layer stacking are all
 * handled by the platform — which is both more correct and less code than any
 * React modal implementation would be. The entrance/exit animation is CSS
 * (`@starting-style` + `allow-discrete`), so no JS runs during the transition.
 */
export default function ProjectDialog({ project, onClose }: ProjectDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  /**
   * The `project` prop is the single source of truth; the native dialog just
   * follows it.
   *
   * An earlier version keyed the unlock off the dialog's own `close` event,
   * which turned out to be a trap: if that event is ever missed — and it is not
   * guaranteed to fire promptly once `display` is transitioned with
   * `allow-discrete` — the page is left permanently scroll-locked *and* the
   * dialog can never reopen, because React still believes a project is
   * selected. Driving both directions from this effect (and its cleanup) means
   * open/locked and closed/unlocked cannot drift apart.
   */
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !project) return;

    if (!dialog.open) dialog.showModal();
    setScrollLocked(true);

    return () => {
      setScrollLocked(false);
      if (dialog.open) dialog.close();
    };
  }, [project]);

  /** Every dismissal path clears React state; the effect above does the rest. */
  const requestClose = useCallback(() => onClose(), [onClose]);

  const accent = project ? `var(--${project.accent})` : 'var(--accent)';

  return (
    <dialog
      ref={ref}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onCancel={(event) => {
        // Escape. Cancel the native close so React state stays authoritative,
        // then let the effect perform the actual close.
        event.preventDefault();
        requestClose();
      }}
      onClose={requestClose}
      onClick={(event) => {
        // The dialog element itself only receives clicks on its backdrop area;
        // clicks on the content land on the inner wrapper and stop there.
        if (event.target === ref.current) requestClose();
      }}
    >
      {project && (
        <div
          className="relative flex max-h-[86vh] flex-col overflow-hidden rounded-xl"
          style={{ ['--card-accent' as string]: accent }}
        >
          {/* Header */}
          <div
            className="relative shrink-0 border-b p-6 pr-16 sm:p-8 sm:pr-20"
            style={{
              background:
                'linear-gradient(140deg, color-mix(in srgb, var(--card-accent) calc(14% * var(--vfx)), transparent), transparent 65%)',
            }}
          >
            <p className="label" style={{ color: accent }}>
              {project.category}
            </p>
            <h2
              id="project-dialog-title"
              className="font-display mt-3 text-xl font-extrabold leading-tight text-[var(--fg)] sm:text-3xl"
            >
              {project.title}
            </h2>
            <p className="mt-2 text-sm text-[var(--fg-soft)] sm:text-base">
              {project.subtitle}
            </p>

            <button
              type="button"
              onClick={requestClose}
              aria-label="Close project details"
              className="absolute right-5 top-5 rounded-full border p-2 text-[var(--fg-soft)] transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--fg)] sm:right-6 sm:top-6"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div>
                <dt className="label">Role</dt>
                <dd className="mt-2 text-sm font-medium text-[var(--fg)]">{project.role}</dd>
              </div>
              <div>
                <dt className="label">Focus</dt>
                <dd className="mt-2 text-sm font-medium capitalize text-[var(--fg)]">
                  {project.priority}
                </dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="label">Stack</dt>
                <dd className="mt-2 text-sm font-medium text-[var(--fg)]">
                  {project.tech.join(' · ')}
                </dd>
              </div>
            </dl>

            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <section>
                <h3 className="label eyebrow">The problem</h3>
                <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">{project.problem}</p>
              </section>
              <section>
                <h3 className="label eyebrow">The approach</h3>
                <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">{project.approach}</p>
              </section>
            </div>

            <section className="mt-10">
              <h3 className="label eyebrow">Architecture</h3>
              <div className="surface mt-4 rounded-lg p-5 sm:p-6">
                <ArchitectureFlow
                  architecture={project.architecture}
                  accent={accent}
                  size="detail"
                />
              </div>
            </section>

            <section className="mt-10">
              <h3 className="label eyebrow">What it does</h3>
              <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[var(--fg-soft)]">
                    <span
                      aria-hidden="true"
                      className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full"
                      style={{ background: accent }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <h3 className="label eyebrow">My contribution</h3>
              <p className="mt-4 leading-relaxed text-[var(--fg-soft)]">{project.contribution}</p>
            </section>
          </div>

          {/* Footer */}
          {(project.github || project.live) && (
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t p-6 sm:px-8">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="energy-ring inline-flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm font-medium text-[var(--fg)] transition-colors duration-300 hover:border-[var(--accent)]"
                >
                  <GithubIcon className="h-4 w-4" />
                  View source
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="energy-ring inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-[var(--shell)]"
                  style={{ background: 'var(--accent)' }}
                >
                  Live demo
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
