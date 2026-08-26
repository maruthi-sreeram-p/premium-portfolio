import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE_IN_OUT_QUINT, EASE_OUT_EXPO } from '../../lib/motion';
import { setScrollLocked } from '../../lib/scroll';
import { useDeviceTier } from '../../hooks/useDeviceTier';

const LINES = [
  'establishing runtime',
  'mounting services',
  'linking data layer',
  'ready',
];

/** Once per browser session — a boot animation on every navigation is a tax. */
const SESSION_KEY = 'pms-booted';

interface BootSequenceProps {
  /** Called when the overlay has finished and the hero may begin. */
  onComplete: () => void;
}

/**
 * The "system coming online" entrance.
 *
 * Held deliberately short (~1.1s of content, ~0.5s of exit) and overlapped with
 * the hero's own entrance, so the total time to a readable page stays inside
 * the brief's 1–2s target. It is skipped outright under reduced-motion and on
 * repeat visits within a session, and any key press or click dismisses it
 * immediately — an entrance animation should never be something a visitor has
 * to sit through twice.
 */
export default function BootSequence({ onComplete }: BootSequenceProps) {
  const { prefersReducedMotion } = useDeviceTier();
  const [skip] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [running, setRunning] = useState(!skip && !prefersReducedMotion);

  useEffect(() => {
    if (!running) {
      // Unlock here rather than in `onExitComplete`. The exit animation needs
      // requestAnimationFrame to finish, and rAF does not run in a background
      // tab — so a visitor who opened the site in a background tab and came
      // back later would find the page permanently unscrollable. The overlay
      // is still fading out at this point, which is harmless: it is fixed and
      // non-interactive, and the hero is meant to begin underneath it.
      setScrollLocked(false);
      onComplete();
      return;
    }

    setScrollLocked(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode — the boot simply plays again next time */
    }

    const finish = () => setRunning(false);
    const timer = window.setTimeout(finish, 1150);

    // Escape hatches: any input dismisses the overlay at once.
    window.addEventListener('keydown', finish, { once: true });
    window.addEventListener('pointerdown', finish, { once: true });
    window.addEventListener('wheel', finish, { once: true, passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', finish);
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('wheel', finish);
      // Last-resort safety: however this component goes away, scrolling comes
      // back. Nothing should be able to leave the page locked.
      setScrollLocked(false);
    };
  }, [running, onComplete]);

  return (
    <AnimatePresence>
      {running && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[400] flex items-center justify-center"
          style={{ background: 'var(--shell)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE_IN_OUT_QUINT }}
        >
          {/* The overlay lifts as two panels parting, not a plain fade — it
              reads as a shutter opening onto the page. */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2"
            style={{ background: 'var(--shell)' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.72, ease: EASE_IN_OUT_QUINT }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{ background: 'var(--shell)' }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.72, ease: EASE_IN_OUT_QUINT }}
          />

          <motion.div
            className="relative z-10 flex w-[min(22rem,80vw)] flex-col items-center"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p
              className="font-display text-2xl font-extrabold tracking-[0.4em]"
              style={{ color: 'var(--fg)' }}
              initial={{ opacity: 0, letterSpacing: '0.9em' }}
              animate={{ opacity: 1, letterSpacing: '0.4em' }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            >
              PMS
            </motion.p>

            {/* Progress hairline */}
            <div
              className="relative mt-6 h-px w-full overflow-hidden"
              style={{ background: 'var(--rule)' }}
            >
              <motion.div
                className="absolute inset-y-0 left-0"
                style={{ background: 'var(--accent)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.05, ease: [0.5, 0, 0.2, 1] }}
              />
            </div>

            {/* Status lines cycle in place so the block never changes height. */}
            <div className="mt-4 h-4 overflow-hidden">
              {LINES.map((line, i) => (
                <motion.p
                  key={line}
                  className="label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 1.15 / LINES.length,
                    delay: i * (1.05 / LINES.length),
                    times: [0, 0.2, 0.75, 1],
                  }}
                  style={{ marginTop: i === 0 ? 0 : '-1rem' }}
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
