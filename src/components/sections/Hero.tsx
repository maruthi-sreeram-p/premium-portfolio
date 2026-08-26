import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { personal } from '../../data/personal';
import Container from '../layout/Container';
import Button from '../shared/Button';
import SystemDiagram from '../fx/SystemDiagram';
import TypeText from '../fx/TypeText';
import { EASE_OUT_EXPO, EASE_OUT_QUINT } from '../../lib/motion';
import { scrollToSection } from '../../lib/scroll';
import { CURVE_PERSPECTIVE, useCurvedScroll } from '../../hooks/useCurvedScroll';

interface HeroProps {
  /** Held false until the boot overlay finishes, so the two never overlap. */
  ready: boolean;
}

/** Shared entrance variant — one easing for every element in the sequence. */
const rise = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay, ease: EASE_OUT_QUINT },
  }),
};

/**
 * One headline line: rises out of a mask and hinges upright.
 *
 * Driven by the `ready` flag rather than the viewport, so the hero waits for
 * the boot overlay instead of firing behind it.
 */
function HeadlineLine({
  text,
  delay,
  ready,
}: {
  text: string;
  delay: number;
  ready: boolean;
}) {
  return (
    <TypeText
      as="span"
      text={text}
      trigger="mount"
      ready={ready}
      delay={delay}
      stagger={0.028}
      className="block"
    />
  );
}

export default function Hero({ ready }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  // The hero sits on the same curved surface as every section, so the effect
  // is visible from the very first scroll rather than only once About arrives.
  const curved = useCurvedScroll(sectionRef, innerRef);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center pt-24 pb-12 md:pt-28"
      aria-label="Introduction"
      style={curved ? { perspective: CURVE_PERSPECTIVE } : undefined}
    >
      <div ref={innerRef}>
      <Container className="relative w-full">
        {/*
          No graphic beside the copy, deliberately.

          Two attempts at a hero panel were tried and dropped: a generic
          UI → API → DB box diagram, which is the shape of any web app ever
          written, and an event-flow diagram, which was accurate but still a
          graphic asking to be decoded before the headline had been read.

          A hero does one job — say who this is and what they do. The type,
          the whitespace and the 3D field behind it carry that on their own,
          and the Current Focus strip below holds the technical detail. This
          is the restraint that reads as expensive; a panel has to earn its
          place, and neither of those did.
        */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Copy — 7 of 12 */}
          <div className="lg:col-span-7">
          {/* 1 — name. The primary identity line, so it is set at full
              strength rather than as a muted caption above the headline. */}
          <motion.p
            custom={0}
            variants={rise}
            initial="hidden"
            animate={ready ? 'visible' : 'hidden'}
            className="font-display text-xl font-bold tracking-tight text-[var(--fg)] sm:text-2xl"
          >
            {personal.name}
          </motion.p>

          <motion.p
            custom={0.1}
            variants={rise}
            initial="hidden"
            animate={ready ? 'visible' : 'hidden'}
            className="label mt-3"
          >
            {personal.title}
          </motion.p>

          {/* 2 — headline */}
          <h1
            aria-label={`${personal.headline.join(' ')}.`}
            className="mt-7 text-[clamp(2.25rem,5vw,3.9rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.032em] text-[var(--fg)]"
          >
            <HeadlineLine text={personal.headline[0]} delay={0.24} ready={ready} />
            <HeadlineLine text={personal.headline[1]} delay={0.36} ready={ready} />
            <HeadlineLine text={personal.headline[2]} delay={0.48} ready={ready} />
          </h1>

          {/* 3 — rule + disciplines */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={ready ? { scaleX: 1 } : {}}
            transition={{ delay: 0.76, duration: 0.8, ease: EASE_OUT_EXPO }}
            className="mt-8 h-px w-full max-w-sm origin-left"
            style={{
              background:
                'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent-3) 60%, transparent), transparent)',
            }}
          />

          <motion.p
            custom={0.84}
            variants={rise}
            initial="hidden"
            animate={ready ? 'visible' : 'hidden'}
            className="label mt-5"
          >
            {personal.disciplines.join('  ·  ')}
          </motion.p>

          {/* 4 — description */}
          <motion.p
            custom={0.9}
            variants={rise}
            initial="hidden"
            animate={ready ? 'visible' : 'hidden'}
            className="mt-5 max-w-xl leading-relaxed text-[var(--fg-soft)]"
          >
            {personal.description}
          </motion.p>

          {/* 5 — calls to action */}
          <motion.div
            custom={1}
            variants={rise}
            initial="hidden"
            animate={ready ? 'visible' : 'hidden'}
            className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <Button variant="primary" onClick={() => scrollToSection('projects')} showArrow>
              View my work
            </Button>
            <Button variant="secondary" onClick={() => scrollToSection('contact')}>
              Have a project?
            </Button>
            <Button
              variant="ghost"
              href={personal.resumeUrl}
              newTab
              ariaLabel="Open resume PDF in a new tab"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Resume
            </Button>
          </motion.div>
          </div>

          {/* The request path — 5 of 12. Held back until the copy has landed so
              the two do not compete on entry. Desktop only: the mobile hero is
              already a full screen without it. */}
          <motion.div
            className="hidden lg:col-span-5 lg:block"
            initial={{ opacity: 0, x: 20 }}
            animate={ready ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.55, ease: EASE_OUT_EXPO }}
          >
            <SystemDiagram ready={ready} />
          </motion.div>
        </div>
      </Container>

      {/* 6 — current focus, as its own band across the foot of the hero */}
      <motion.div
        custom={1.15}
        variants={rise}
        initial="hidden"
        animate={ready ? 'visible' : 'hidden'}
        className="relative mt-14 border-t md:mt-20"
        style={{ borderColor: 'var(--rule)' }}
      >
        <Container>
          <div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:gap-8">
            <p className="label shrink-0">Current focus</p>
            <ul className="flex flex-wrap gap-2">
              {personal.currentFocus.map((focus) => (
                <li
                  key={focus}
                  className="label rounded-full border px-3.5 py-1.5 transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:text-[var(--fg-soft)]"
                  style={{ borderColor: 'var(--rule-strong)' }}
                >
                  {focus}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </motion.div>
      </div>
    </section>
  );
}
