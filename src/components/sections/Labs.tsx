import { ArrowUpRight } from 'lucide-react';
import { labs, type Lab } from '../../data/labs';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { GithubIcon } from '../shared/SocialIcons';
import { usePointerGlow } from '../../hooks/usePointerGlow';

/**
 * One lab. The title is the card's single link and its `::after` covers the
 * whole card, so the entire surface is clickable while assistive tech still
 * sees exactly one clearly-labelled link — the same model as the project cards.
 */
function LabCard({ lab, index }: { lab: Lab; index: number }) {
  const href = lab.live ?? lab.github ?? '#';
  const isLive = Boolean(lab.live);
  const glowRef = usePointerGlow<HTMLElement>();

  return (
    <Reveal as="li" delay={index * 0.08} tilt className="h-full">
      <article ref={glowRef} className="surface dot-reveal sweep group relative isolate flex h-full flex-col overflow-hidden rounded-lg p-6 transition-[transform,border-color] duration-500 ease-[var(--ease-out-quint)] hover:-translate-y-1.5 hover:border-[var(--rule-strong)] sm:p-7">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
          style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }}
        />

        <p className="label">{lab.kind}</p>

        <h3 className="font-display mt-4 text-xl font-bold leading-tight text-[var(--fg)]">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:content-['']"
            aria-label={`${lab.title} — ${isLive ? 'open the live site' : 'view source on GitHub'}`}
          >
            {lab.title}
          </a>
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-[var(--fg-soft)]">{lab.summary}</p>

        <dl className="mt-6 flex gap-8">
          {lab.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-2xl font-bold leading-none text-[var(--fg)]">
                {stat.value}
                <span className="label mt-2 block">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        {/* Pinned to the foot so the three cards end on one line. */}
        <div className="mt-auto pt-8">
          <ul className="flex flex-wrap gap-1.5">
            {lab.tags.map((tag) => (
              <li
                key={tag}
                className="rounded border px-2 py-1 text-[0.6875rem] tracking-[0.02em]"
                style={{ borderColor: 'var(--rule)', color: 'var(--fg-faint)' }}
              >
                {tag}
              </li>
            ))}
          </ul>

          <div
            className="mt-5 flex items-center justify-between border-t pt-5 text-sm text-[var(--fg-soft)] transition-colors duration-300 group-hover:text-[var(--fg)]"
            style={{ borderColor: 'var(--rule)' }}
          >
            <span className="inline-flex items-center gap-2">
              {isLive ? null : <GithubIcon className="h-[18px] w-[18px]" />}
              {isLive ? 'Open the live site' : 'View on GitHub'}
            </span>
            <ArrowUpRight
              className="h-[18px] w-[18px] transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/**
 * Labs — what I build to practise with. All three were built with AI
 * assistance, and the section says so rather than leaving it to be assumed. A learning site and two hands-on
 * debugging laboratories: the work that sits outside the project list because
 * it is a teaching tool rather than an application for someone.
 */
export default function Labs() {
  return (
    <SectionWrapper id="labs" ariaLabel="Labs">
      <SectionHeading
        eyebrow="04 — Labs"
        title="Built to learn with"
        lead="A learning platform and two debugging laboratories: deliberately broken Spring Boot applications made for practising what backend work is really like — reproduce it, trace it, find the root cause. All three were built with AI assistance."
      />

      <ul className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {labs.map((lab, i) => (
          <LabCard key={lab.id} lab={lab} index={i} />
        ))}
      </ul>
    </SectionWrapper>
  );
}
