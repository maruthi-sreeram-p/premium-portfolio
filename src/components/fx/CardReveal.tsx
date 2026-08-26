import React from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_EXPO, EASE_OUT_QUINT } from '../../lib/motion';
import { useDeviceTier } from '../../hooks/useDeviceTier';

interface CardRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Colour the edge draws in. */
  accent?: string;
  delay?: number;
}

/**
 * Project card entrance.
 *
 * The card lifts into place while a line of light traces its outline once and
 * fades — as though the card is being drawn rather than dropped in. Three
 * things move: a small rise, a slight scale, and a shallow hinge, all on one
 * curve, plus the edge draw on its own slower one.
 *
 * Deliberately whole. Two earlier attempts broke the card into fragments —
 * first blank plates, then real jigsaw pieces — and both drew attention to the
 * mechanism instead of the work. A card that simply arrives, cleanly and with
 * one confident flourish, reads as more expensive than one that shatters.
 *
 * Plays once on entry. Under reduced-motion the wrapper renders the card
 * straight through with nothing animating.
 */
export default function CardReveal({
  children,
  className = '',
  accent = 'var(--accent)',
  delay = 0,
}: CardRevealProps) {
  const { prefersReducedMotion } = useDeviceTier();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={`relative ${className}`}
      // transformPerspective scopes the hinge to this element, so the card
      // needs no perspective ancestor and cannot disturb anything around it.
      style={{ transformPerspective: 1000, transformOrigin: 'center top' }}
      initial={{ opacity: 0, y: 42, scale: 0.945, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.85, delay, ease: EASE_OUT_QUINT }}
    >
      {children}

      {/* The traced edge. `overflow-visible` lets the stroke straddle the card
          border so it reads as a ring of light sitting on the edge rather than
          a second border inside it. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        fill="none"
      >
        <motion.rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="8"
          stroke={accent}
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: [0, 0.9, 0.9, 0] }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{
            pathLength: { duration: 1.25, delay: delay + 0.1, ease: EASE_OUT_EXPO },
            opacity: {
              duration: 1.6,
              delay: delay + 0.1,
              times: [0, 0.15, 0.7, 1],
              ease: 'linear',
            },
          }}
          style={{ filter: `drop-shadow(0 0 6px ${accent})` }}
        />
      </svg>
    </motion.div>
  );
}
