import React from 'react';
import { motion } from 'framer-motion';
import { DURATION, EASE_OUT_QUINT, VIEWPORT } from '../../lib/motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** Travel distance in px. Small by default — reveals should settle, not fly. */
  distance?: number;
  /**
   * Depth tilt: the element hinges upright as it arrives. This is the site's
   * shared rotation motif, the same movement the hero headline and the section
   * transitions use, so every block on the page arrives the same way.
   */
  tilt?: boolean;
  /** Degrees of tilt. Kept small — large angles blur text mid-transition. */
  tiltAngle?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
}

const OFFSETS: Record<Direction, (d: number) => { x: number; y: number }> = {
  up: (d) => ({ x: 0, y: d }),
  down: (d) => ({ x: 0, y: -d }),
  left: (d) => ({ x: d, y: 0 }),
  right: (d) => ({ x: -d, y: 0 }),
  none: () => ({ x: 0, y: 0 }),
};

/**
 * The site's single scroll-reveal primitive.
 *
 * Everything reveals the same way — a short rise, an optional hinge, and a fade
 * on one shared easing. The default travel is 18px and the default tilt 7°:
 * enough to register as motion, small enough that a fast scroll never leaves
 * content visibly catching up, and small enough that type stays crisp.
 *
 * Reduced motion is handled by `MotionConfig reducedMotion="user"` in App,
 * which drops the transform and keeps the fade.
 */
export default function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = DURATION.base,
  distance = 18,
  tilt = false,
  tiltAngle = 7,
  className = '',
  as = 'div',
}: RevealProps) {
  const offset = OFFSETS[direction](distance);
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...offset, rotateX: tilt ? tiltAngle : 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotateX: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE_OUT_QUINT }}
      // transformPerspective scopes the 3D projection to this element, so a
      // tilting block does not need a `perspective` ancestor and cannot alter
      // the stacking of anything around it.
      style={tilt ? { transformPerspective: 900, transformOrigin: 'top center' } : undefined}
    >
      {children}
    </Tag>
  );
}
