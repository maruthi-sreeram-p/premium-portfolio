import { personal } from '../../data/personal';
import { projects } from '../../data/projects';
import { skillGroups, totalSkills } from '../../data/skills';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { useCountUp } from '../../hooks/useCountUp';

/**
 * Every figure here is derived from the data files rather than typed in.
 * A portfolio that claims "9 projects" beside a grid of 8 is worse than one
 * that claims nothing, and hand-maintained counts always drift eventually.
 */
const stats = [
  { value: projects.length, label: 'Projects built', suffix: '' },
  { value: totalSkills, label: 'Technologies', suffix: '' },
  { value: skillGroups.length, label: 'Disciplines', suffix: '' },
  { value: projects.filter((p) => p.github).length, label: 'Public repos', suffix: '' },
];

function Stat({ value, label }: { value: number; label: string }) {
  const ref = useCountUp(value);

  return (
    <div className="group relative">
      <div
        className="absolute -left-px top-0 h-full w-px transition-colors duration-300 group-hover:bg-[var(--accent)]"
        style={{ background: 'var(--rule)' }}
        aria-hidden="true"
      />
      <div className="pl-5">
        <p className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-none text-[var(--fg)]">
          {/* The real value is in the DOM from first paint; useCountUp only
              overwrites it once the element is actually on screen, so this
              never renders as a bare "0" to a crawler or a screen reader. */}
          <span ref={ref}>{value}</span>
        </p>
        <p className="label mt-3">{label}</p>
      </div>
    </div>
  );
}

/**
 * Credentials, set as an editorial fact table.
 *
 * This replaces an earlier boxed "identity card" with a big monogram in it.
 * A monogram plate is decoration standing in for information — it filled the
 * column without telling anyone anything. A hairline-ruled list of actual
 * facts is quieter, more formal, and is the thing a reader is here for.
 */
function Credentials() {
  const facts: Array<[string, string]> = [
    ['Education', 'B.Tech, Computer Science & Engineering'],
    ['Discipline', 'Java backend engineering'],
    ['Core stack', 'Java · Spring Boot · MySQL'],
    ['Depth in', 'Distributed & event-driven systems'],
    ['Also builds', 'React front-ends, REST APIs, automation'],
    ['Based in', 'India'],
  ];

  return (
    <dl className="border-t" style={{ borderColor: 'var(--rule-strong)' }}>
      {facts.map(([term, value], i) => (
        <Reveal
          key={term}
          delay={0.06 + i * 0.05}
          className="flex flex-col gap-1 border-b py-4 sm:flex-row sm:items-baseline sm:gap-6"
        >
          <dt className="label shrink-0 sm:w-32">{term}</dt>
          <dd className="text-[var(--fg)]">{value}</dd>
        </Reveal>
      ))}
    </dl>
  );
}

export default function About() {
  return (
    <SectionWrapper id="about" ariaLabel="About">
      <SectionHeading
        eyebrow="01 — About"
        title="The Engineer"
        lead={personal.about}
      />

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Credentials — 5 cols */}
        <div className="lg:col-span-5">
          <Reveal>
            <p className="label eyebrow mb-6">In brief</p>
          </Reveal>
          <Credentials />
        </div>

        {/* Narrative — 7 cols */}
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[1.0625rem] leading-relaxed text-[var(--fg)] sm:text-lg">
              {personal.aboutExpanded}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="label eyebrow mt-10">How I work</p>
          </Reveal>

          {/* Hairline dividers rather than filled cells — the ambient backdrop
              stays visible straight through the list. */}
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2">
            {personal.principles.map((principle, i) => (
              <Reveal
                as="li"
                key={principle.title}
                delay={0.12 + i * 0.06}
                tilt
                className="sweep border-t border-l-0 p-6 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--accent)_4%,transparent)] sm:even:border-l"
              >
                <span className="label label-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-lg font-bold text-[var(--fg)]">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-soft)]">
                  {principle.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-20 grid grid-cols-2 gap-y-10 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} tilt>
            <Stat value={stat.value} label={stat.label} />
          </Reveal>
        ))}
      </div>
    </SectionWrapper>
  );
}
