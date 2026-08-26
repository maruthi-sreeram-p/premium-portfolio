import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { skillGroups } from '../../data/skills';
import { engineeringNotes } from '../../data/engineeringNotes';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import SkillIcon from '../shared/SkillIcon';
import { EASE_OUT_QUINT, STAGGER } from '../../lib/motion';

/**
 * Skills as a system map rather than a wall of logos.
 *
 * The left rail is the index of disciplines; selecting one loads its
 * technologies into the right panel, each with a line on how it is actually
 * used. That turns "here are 24 logos" into "here is what I do with them",
 * which is the only version of a skills section a senior reader cares about.
 *
 * Implemented as a real tablist: arrow keys move between disciplines, Home/End
 * jump to the ends, and the panel is associated with its tab, so it works
 * identically with a keyboard or a screen reader.
 */
export default function Skills() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = skillGroups[active];

  function handleKeyDown(event: React.KeyboardEvent) {
    const last = skillGroups.length - 1;
    let next: number | null = null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = active === last ? 0 : active + 1;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;

    if (next !== null) {
      event.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <SectionWrapper id="skills" ariaLabel="Skills">
      <SectionHeading
        eyebrow="02 — Skills"
        title="Technical Stack"
        lead="Organised around what I build with, not everything I have ever opened. Select a discipline to see how each piece is actually used."
      />

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Discipline rail */}
        <div className="lg:col-span-4">
          <div
            role="tablist"
            aria-label="Technical disciplines"
            aria-orientation="vertical"
            onKeyDown={handleKeyDown}
            className="flex flex-col"
          >
            {skillGroups.map((item, i) => {
              const selected = i === active;
              return (
                <Reveal key={item.id} delay={i * 0.05} tilt tiltAngle={5}>
                  <button
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    role="tab"
                    id={`skill-tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls={`skill-panel-${item.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(i)}
                    className="sweep group relative flex w-full items-baseline gap-4 border-t py-5 pl-5 pr-3 text-left transition-colors duration-300"
                  >
                    {/* Active indicator — a lit edge rather than a filled row. */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-full w-[2px] origin-top transition-transform duration-500"
                      style={{
                        background: `var(--${item.accent})`,
                        transform: `scaleY(${selected ? 1 : 0})`,
                        boxShadow: selected
                          ? `0 0 16px color-mix(in srgb, var(--${item.accent}) 70%, transparent)`
                          : 'none',
                      }}
                    />
                    <span
                      className="label shrink-0 transition-colors duration-300"
                      style={{ color: selected ? `var(--${item.accent})` : undefined }}
                    >
                      {item.index}
                    </span>
                    <span className="flex-1">
                      <span
                        className="font-display block text-lg font-bold transition-colors duration-300 sm:text-xl"
                        style={{ color: selected ? 'var(--fg)' : 'var(--fg-faint)' }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="mt-1 block text-sm leading-snug transition-opacity duration-300"
                        style={{
                          color: 'var(--fg-soft)',
                          opacity: selected ? 1 : 0.55,
                        }}
                      >
                        {item.summary}
                      </span>
                    </span>
                    <span
                      className="label shrink-0 self-center transition-opacity duration-300"
                      style={{ opacity: selected ? 1 : 0 }}
                      aria-hidden="true"
                    >
                      {item.skills.length}
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Active discipline panel */}
        <div className="lg:col-span-8">
          <div
            role="tabpanel"
            id={`skill-panel-${group.id}`}
            aria-labelledby={`skill-tab-${group.id}`}
            tabIndex={0}
            className="h-full rounded-lg focus-visible:outline-2"
          >
            <AnimatePresence mode="wait">
              <motion.ul
                key={group.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: STAGGER.tight } },
                  exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
                }}
                className="grid grid-cols-1 sm:grid-cols-2"
              >
                {group.skills.map((skill) => (
                  <motion.li
                    key={skill.name}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.45, ease: EASE_OUT_QUINT },
                      },
                      exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
                    }}
                    className="sweep group relative border-t p-5 transition-colors duration-300 sm:even:border-l"
                    style={{ ['--accent' as string]: `var(--${group.accent})` }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Core technologies get a lit tile; the rest a quiet one.
                          A subtle way to show depth vs. breadth without a
                          made-up percentage bar. */}
                      <span
                        aria-hidden="true"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border transition-all duration-300 group-hover:-translate-y-0.5"
                        style={{
                          borderColor: skill.core
                            ? `color-mix(in srgb, var(--${group.accent}) 42%, transparent)`
                            : 'var(--rule-strong)',
                          background: skill.core
                            ? `color-mix(in srgb, var(--${group.accent}) 10%, transparent)`
                            : 'color-mix(in srgb, var(--fg) 4%, transparent)',
                          color: skill.core ? `var(--${group.accent})` : 'var(--fg-soft)',
                          boxShadow: skill.core
                            ? `0 0 16px -6px color-mix(in srgb, var(--${group.accent}) 80%, transparent)`
                            : 'none',
                        }}
                      >
                        <SkillIcon name={skill.icon} className="h-[18px] w-[18px]" />
                      </span>
                      <h3 className="font-display text-base font-bold text-[var(--fg)]">
                        {skill.name}
                      </h3>
                      {skill.core && (
                        <span className="label">core</span>
                      )}
                    </div>
                    <p className="mt-2.5 pl-12 text-sm leading-relaxed text-[var(--fg-soft)]">
                      {skill.note}
                    </p>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Engineering focus — the concepts behind the tool names. */}
      <div className="mt-24">
        <Reveal>
          <p className="label eyebrow">Engineering focus</p>
        </Reveal>
        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {engineeringNotes.map((note, i) => (
            <Reveal
              as="li"
              key={note.id}
              delay={(i % 3) * 0.06}
              tilt
              className="sweep border-t p-6 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--accent)_4%,transparent)] sm:[&:nth-child(even)]:border-l lg:[&:nth-child(even)]:border-l-0 lg:[&:not(:nth-child(3n+1))]:border-l"
            >
              <h3 className="font-display text-base font-bold text-[var(--fg)]">
                {note.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--fg-soft)]">
                {note.description}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}
