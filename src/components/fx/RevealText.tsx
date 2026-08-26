import { motion } from 'framer-motion';
import { EASE_OUT_EXPO, VIEWPORT } from '../../lib/motion';

interface RevealTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
  /** Seconds before the reveal starts. */
  delay?: number;
  /** 'view' waits until scrolled into view; 'mount' runs immediately. */
  trigger?: 'mount' | 'view';
  /** Reveal word by word instead of as a single line. */
  perWord?: boolean;
  /** Optional depth tilt as the line rises — the site's shared rotation motif. */
  tilt?: boolean;
}

/**
 * The site's display-text reveal.
 *
 * The text sits inside an `overflow-hidden` mask and rises out of it, with an
 * optional slight rotation on the X axis so it settles upright rather than
 * simply sliding. That is the whole effect: no glyph scrambling, no character
 * noise, no RGB split. It reads as typesetting arriving rather than a terminal
 * decoding something.
 *
 * Because the text is real text in the DOM the entire time, there is nothing
 * special to do for screen readers or for reduced motion — Framer Motion's
 * `reducedMotion="user"` (set in App) drops the transform and keeps the fade.
 */
export default function RevealText({
  text,
  className = '',
  as: Tag = 'span',
  delay = 0,
  trigger = 'view',
  perWord = false,
  tilt = true,
}: RevealTextProps) {
  // motion.create(Tag) would build a brand-new component type on every render,
  // which remounts the subtree and resets its animation state. The static
  // motion.* proxies are stable identities.
  const MotionTag = motion[Tag];
  const animateProps =
    trigger === 'mount'
      ? { animate: 'visible' }
      : { whileInView: 'visible', viewport: VIEWPORT };

  const child = {
    hidden: {
      y: '108%',
      // Tiny rotation, applied about the line's own top edge so it hinges into
      // place. Large angles blur type during the transition; 6° does not.
      rotateX: tilt ? 32 : 0,
      opacity: 0,
    },
    visible: {
      y: '0%',
      rotateX: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: EASE_OUT_EXPO },
    },
  };

  const words = perWord ? text.split(' ') : [text];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      {...animateProps}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: perWord ? 0.06 : 0 } },
      }}
      style={{ perspective: 800 }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          // pb/-mb gives descenders (g, y, p) room inside the mask; without it
          // the mask clips them flat.
          style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}
        >
          <motion.span
            className="inline-block"
            variants={child}
            style={{ transformOrigin: 'top center' }}
          >
            {word}
            {perWord && i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
