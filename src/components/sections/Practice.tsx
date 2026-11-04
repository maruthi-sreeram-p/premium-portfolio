import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Bug, Route, Server, type LucideIcon } from 'lucide-react';
import { practice, type PracticeItem } from '../../data/practice';
import SectionWrapper from '../layout/SectionWrapper';
import SectionHeading from '../shared/SectionHeading';
import Reveal from '../shared/Reveal';
import { GithubIcon } from '../shared/SocialIcons';
import { EASE_OUT_QUINT } from '../../lib/motion';
import { CLOSE_PROJECT_EVENT, scrollToPosition } from '../../lib/scroll';
import { ScrollTrigger } from '../../lib/gsap';

interface PracticeProps {
  /** Tells the page when a lab is open, so it can hide everything else. */
  onOpenChange?: (open: boolean) => void;
}

/** One glyph per item, set large and faint on its card. */
const GLYPH: Record<string, LucideIcon> = {
  'java-trail': Route,
  'java-debugging-playground': Bug,
  'spring-boot-debugging-laboratory': Server,
};

/**
 * Where each card sits in the pile. Two sets, because the pile is a different
 * shape on a phone than on a desk: `l`/`t`/`w` are percentages of the pile,
 * `r` is the resting tilt in degrees. The CSS in `.pile-card` picks the set.
 */
const POSE = [
  { l: 5, t: 7, w: 45, r: -6, ls: 3, ts: 4, ws: 62 },
  { l: 50, t: 6, w: 45, r: 4.5, ls: 35, ts: 20, ws: 62 },
  { l: 27, t: 47, w: 46, r: -1.5, ls: 14, ts: 50, ws: 64 },
] as const;

/** "https://java-trail.vercel.app/" → "java-trail.vercel.app" */
const hostOf = (item: PracticeItem) => {
  const url = item.live ?? item.github ?? '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

/** A pin and a binder clip: the two bits of stationery that hold the pile together. */
function Pin() {
  return (
    <svg viewBox="0 0 40 52" className="pile-pin" aria-hidden="true">
      <ellipse cx="20" cy="46" rx="6" ry="2.5" fill="rgba(0,0,0,0.35)" />
      <path d="M 19 24 L 20 46 L 21 24 Z" fill="currentColor" opacity="0.5" />
      <circle cx="20" cy="15" r="11" fill="var(--card-solid)" stroke="currentColor" strokeOpacity="0.55" />
      <circle cx="16.5" cy="11.5" r="3.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function Clip() {
  return (
    <svg viewBox="0 0 48 56" className="pile-clip" aria-hidden="true">
      <path
        d="M 10 22 V 8 a 14 8 0 0 1 28 0 V 22"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="4" y="20" width="40" height="26" rx="3" fill="var(--card-solid)" stroke="currentColor" strokeOpacity="0.55" />
      <path d="M 12 20 V 46 M 36 20 V 46" stroke="currentColor" strokeOpacity="0.25" />
    </svg>
  );
}

/**
 * Practice — a learning site and two debugging laboratories, built to learn
 * with rather than for a client. All three were built with AI assistance, and
 * the section says so rather than leaving it to be assumed.
 *
 * They sit in a loose pile of tilted cards. A card is a button, not a link:
 * choosing one fades the rest away, brings it to the top, centred and
 * straightened, and shows its details beneath — and only there does the link
 * to the real site or repository appear. "Back" (or Escape) returns to the
 * pile.
 */
export default function Practice({ onOpenChange }: PracticeProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = practice.find((item) => item.id === openId) ?? null;
  const backRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<string | null>(null);
  const returnY = useRef(0);

  // Set while the lab is being left through navigation: the pile then snaps
  // back instead of animating, so the page is its final length straight away
  // and the scroll that follows measures the real layout.
  const [snap, setSnap] = useState(false);

  const openCard = useCallback(
    (id: string) => {
      returnY.current = window.scrollY;
      setSnap(false);
      setOpenId(id);
      onOpenChange?.(true);
    },
    [onOpenChange],
  );

  const close = useCallback(() => {
    setOpenId(null);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const closeForNavigation = useCallback(() => {
    setSnap(true);
    close();
  }, [close]);

  // An open lab takes over the page — the rest of it is hidden — so the
  // document is a different length the moment it opens. Move the scroll
  // position in the same frame, before paint: to the top when a lab opens, and
  // back to where the visitor was when it closes. The first run is the initial
  // mount, which must not scroll anywhere.
  const mounted = useRef(false);
  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    scrollToPosition(openId ? 0 : returnY.current, true);
    ScrollTrigger.refresh();
  }, [openId]);

  // Escape closes, and so does navigating to another section.
  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(CLOSE_PROJECT_EVENT, closeForNavigation);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(CLOSE_PROJECT_EVENT, closeForNavigation);
    };
  }, [openId, close, closeForNavigation]);

  // Keyboard users follow the card: focus moves to "Back" when one opens, and
  // returns to the card that opened it.
  useEffect(() => {
    if (openId) {
      lastTrigger.current = openId;
      const frame = requestAnimationFrame(() => backRef.current?.focus({ preventScroll: true }));
      return () => cancelAnimationFrame(frame);
    }
    if (!lastTrigger.current) return;
    const id = lastTrigger.current;
    lastTrigger.current = null;
    const frame = requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>(`[data-practice-card="${id}"]`)
        ?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [openId]);

  const isLive = Boolean(open?.live);

  return (
    <SectionWrapper id="practice" ariaLabel="Practice">
      <SectionHeading
        eyebrow="04 — Practice"
        title="Engineering practice"
        lead="A learning platform and two debugging laboratories: deliberately broken Spring Boot applications made for practising what backend work is really like — reproduce the failure, trace it, find the root cause. All three were built with AI assistance."
      />

      <Reveal>
        <div className="pile-wrap mt-14">
          <div
            className="pile"
            data-open={open ? '' : undefined}
            data-snap={snap ? '' : undefined}
          >
            {practice.map((item, i) => {
              const pose = POSE[i % POSE.length];
              const Glyph = GLYPH[item.id] ?? Route;
              const selected = item.id === openId;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-practice-card={item.id}
                  data-selected={selected || undefined}
                  aria-expanded={selected}
                  aria-label={`${item.title} — open details`}
                  tabIndex={open && !selected ? -1 : undefined}
                  onClick={() => openCard(item.id)}
                  className="pile-card surface"
                  style={
                    {
                      '--l': `${pose.l}%`,
                      '--t': `${pose.t}%`,
                      '--w': `${pose.w}%`,
                      '--l-sm': `${pose.ls}%`,
                      '--t-sm': `${pose.ts}%`,
                      '--w-sm': `${pose.ws}%`,
                      '--r': `${pose.r}deg`,
                    } as React.CSSProperties
                  }
                >
                  <Glyph className="pile-glyph" aria-hidden="true" />
                  <span className="label">{item.kind}</span>
                  <span className="mt-auto block text-left">
                    <span className="font-display block text-[clamp(0.9rem,2.1vw,1.25rem)] font-bold leading-tight text-[var(--fg)]">
                      {item.title}
                    </span>
                    <span className="mt-1.5 block text-[0.6875rem] tracking-[0.02em] text-[var(--fg-faint)]">
                      {hostOf(item)}
                    </span>
                  </span>
                </button>
              );
            })}

            <span className="pile-pin-slot" aria-hidden="true">
              <Pin />
            </span>
            <span className="pile-clip-slot" aria-hidden="true">
              <Clip />
            </span>
          </div>
        </div>
      </Reveal>

      {/* The card that was opened, described. The link lives here and nowhere
          else — the cards themselves go nowhere. */}
      {/* `popLayout` takes the leaving description out of the flow the moment it
          starts to fade, so the page is already its final length while it does. */}
      <AnimatePresence mode="popLayout">
        {open && (
          <motion.div
            key={open.id}
            className="mx-auto mt-10 max-w-2xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.25, ease: EASE_OUT_QUINT } }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
          >
            <button
              ref={backRef}
              type="button"
              onClick={close}
              className="inline-flex items-center gap-2 text-sm text-[var(--fg-soft)] transition-colors duration-300 hover:text-[var(--fg)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>

            <p className="label mt-8">{open.kind}</p>
            <h3 className="font-display mt-3 text-2xl font-bold text-[var(--fg)]">{open.title}</h3>
            <p className="mt-2 text-sm text-[var(--fg-faint)]">{hostOf(open)}</p>

            <p className="mt-5 leading-relaxed text-[var(--fg-soft)]">{open.summary}</p>

            <dl className="mt-8 flex gap-10">
              {open.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-2xl font-bold leading-none text-[var(--fg)]">
                    {stat.value}
                    <span className="label mt-2 block">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-8 flex flex-wrap gap-1.5">
              {open.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded border px-2 py-1 text-[0.6875rem] tracking-[0.02em]"
                  style={{ borderColor: 'var(--rule)', color: 'var(--fg-faint)' }}
                >
                  {tag}
                </li>
              ))}
            </ul>

            <a
              href={open.live ?? open.github ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition-colors duration-300 hover:border-[var(--accent)]"
              style={{ borderColor: 'var(--rule-strong)' }}
            >
              {!isLive && <GithubIcon className="h-[18px] w-[18px]" />}
              {isLive ? 'Open the live site' : 'View on GitHub'}
              <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
