import { Check } from 'lucide-react';
import { personal } from '../../data/personal';
import { projects } from '../../data/projects';
import type { Project } from '../../data/projects';
import {
  alsoBuilds,
  availability,
  bestFit,
  engagementSteps,
  services,
} from '../../data/services';
import type { Service } from '../../data/services';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import Button from '../shared/Button';
import { scrollToSection } from '../../lib/scroll';

/** Resolve a service's proof ids against the project list, dropping any that no longer exist. */
function proofFor(ids: string[]): Project[] {
  return ids
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => project !== undefined);
}

/** "MediCare — Online Medication & Prescription Tracker" → "MediCare". */
function shortTitle(project: Project) {
  return project.title.split(' — ')[0];
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const accent = `var(--${service.accent})`;
  const proof = proofFor(service.proof);

  return (
    <Reveal as="li" delay={index * 0.08} tilt className="h-full">
      {/* Hover: the card lifts, its border brightens, a band of light sweeps
          across it once and the accent edge draws in from the left. */}
      <article className="surface sweep group relative flex h-full flex-col overflow-hidden rounded-lg p-6 transition-[transform,border-color] duration-500 ease-[var(--ease-out-quint)] hover:-translate-y-1.5 hover:border-[var(--rule-strong)] sm:p-7">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />

        <p className="label" style={{ color: accent }}>
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="font-display mt-4 text-xl font-bold leading-tight text-[var(--fg)]">
          {service.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">{service.summary}</p>

        <ul className="mt-6 space-y-3">
          {service.deliverables.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--fg)]">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-500 group-hover:scale-125"
                style={{ color: accent }}
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Pinned to the foot so the three cards end on one line whatever the
            length of their lists. */}
        <div className="mt-auto pt-8">
          <div className="border-t pt-5" style={{ borderColor: 'var(--rule)' }}>
            {proof.length > 0 ? (
              <>
                <p className="label">Built before in</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {proof.map((project) => (
                    <li key={project.id}>
                      {project.github ? (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded border px-2 py-1 text-[0.6875rem] tracking-[0.02em] transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--fg)]"
                          style={{ borderColor: 'var(--rule)', color: 'var(--fg-soft)' }}
                        >
                          {shortTitle(project)}
                        </a>
                      ) : (
                        <span
                          className="inline-block rounded border px-2 py-1 text-[0.6875rem] tracking-[0.02em]"
                          style={{ borderColor: 'var(--rule)', color: 'var(--fg-soft)' }}
                        >
                          {shortTitle(project)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              service.note && (
                <p className="text-sm leading-relaxed text-[var(--fg-soft)]">{service.note}</p>
              )
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/**
 * Services — the section that says what can be hired, so a visitor with a
 * project does not have to infer it from a list of technologies.
 *
 * Everything claimed here is backed by the data files: each service points at
 * projects that exist in `projects.ts`, and the deliverables stay inside the
 * stack listed in `skills.ts`. It closes on the contact section, which is the
 * only place an enquiry is actually taken.
 */
export default function Services() {
  return (
    <SectionWrapper id="services" ariaLabel="Services">
      <SectionHeading
        eyebrow="06 — Services"
        title="Work with me"
        lead="Java backends and full-stack web apps for startups and small businesses — scoped up front, built in short cycles and delivered with documentation."
        aside={
          <p
            className="label inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5"
            style={{ borderColor: 'var(--rule-strong)' }}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                style={{ background: 'var(--accent-2)' }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: 'var(--accent-2)' }}
              />
            </span>
            {availability}
          </p>
        }
      />

      <ul className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {services.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} />
        ))}
      </ul>

      <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* How a project runs — 7 cols */}
        <div className="lg:col-span-7">
          <Reveal>
            <p className="label eyebrow">How a project runs</p>
          </Reveal>

          <ol className="mt-6 border-t" style={{ borderColor: 'var(--rule-strong)' }}>
            {engagementSteps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={0.06 + i * 0.06}
                className="flex gap-5 border-b py-5 sm:gap-8"
              >
                <span className="label label-accent shrink-0 pt-1 sm:w-8">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[var(--fg)]">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--fg-soft)]">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Fit and call to action — 5 cols */}
        <div className="lg:col-span-5">
          <Reveal>
            <p className="label eyebrow">Best fit</p>
          </Reveal>
          <ul className="mt-6 space-y-3">
            {bestFit.map((item, i) => (
              <Reveal
                as="li"
                key={item}
                delay={0.06 + i * 0.05}
                className="flex gap-3 leading-relaxed text-[var(--fg)]"
              >
                <Check
                  className="mt-1 h-4 w-4 shrink-0"
                  style={{ color: 'var(--accent)' }}
                  aria-hidden="true"
                />
                <span>{item}</span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <p className="label eyebrow mt-10">Also available</p>
          </Reveal>
          <Reveal delay={0.14}>
            <ul className="mt-5 flex flex-wrap gap-2">
              {alsoBuilds.map((item) => (
                <li
                  key={item}
                  className="rounded-full border px-3.5 py-1.5 text-[0.75rem] tracking-[0.02em]"
                  style={{ borderColor: 'var(--rule-strong)', color: 'var(--fg-soft)' }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
              <Button variant="primary" showArrow onClick={() => scrollToSection('contact')}>
                Start a project
              </Button>
              <Button
                variant="secondary"
                href={`mailto:${personal.email}?subject=${encodeURIComponent('Project enquiry')}`}
              >
                Email me
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </SectionWrapper>
  );
}
