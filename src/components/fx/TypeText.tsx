import { motion } from 'framer-motion';
import { EASE_OUT_QUINT, VIEWPORT } from '../../lib/motion';

interface TypeTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
  /** Seconds before the first character appears. */
  delay?: number;
  /** Seconds between adjacent characters. */
  stagger?: number;
  /** 'view' waits until scrolled into view; 'mount' runs immediately. */
  trigger?: 'mount' | 'view';
  /** Gate for 'mount' mode — used to wait for the boot overlay. */
  ready?: boolean;
}

/**
 * Text that appears one character at a time.
 *
 * Each character fades up from slightly below on a short stagger, so the line
 * writes itself on rather than sliding in as a block. Two things it is
 * deliberately *not*: there is no glyph scrambling — every character appears as
 * itself and never as noise — and there is no blinking caret, which is what
 * pushes a type-on effect from "elegant" into "terminal".
 *
 * Accessibility: the animating characters are `aria-hidden` and the real
 * string is exposed once via `aria-label`, so assistive tech reads a sentence
 * rather than a list of letters. Spaces are rendered as non-breaking so the
 * word gaps survive being split into spans.
 */
export default function TypeText({
  text,
  className = '',
  as: Tag = 'span',
  delay = 0,
  stagger = 0.022,
  trigger = 'view',
  ready = true,
}: TypeTextProps) {
  const MotionTag = motion[Tag];
  const chars = [...text];

  const animateProps =
    trigger === 'mount'
      ? { animate: ready ? 'visible' : 'hidden' }
      : { whileInView: 'visible', viewport: VIEWPORT };

  return (
    <MotionTag
      className={className}
      aria-label={text}
      initial="hidden"
      {...animateProps}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      <span aria-hidden="true">
        {chars.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: '0.28em' },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.42, ease: EASE_OUT_QUINT },
              },
            }}
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        ))}
      </span>
    </MotionTag>
  );
}
