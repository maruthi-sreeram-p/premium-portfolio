import { useDeviceTier } from '../../hooks/useDeviceTier';

interface MarqueeProps {
  items: string[];
  /** Seconds for one full pass. Longer = calmer. */
  duration?: number;
  /** Scroll direction. */
  reverse?: boolean;
  className?: string;
}

/**
 * A continuously scrolling headline band.
 *
 * The track holds the item list twice and translates by exactly -50%, so the
 * second copy is in the first copy's starting position at the moment the
 * animation loops — the seam is mathematically invisible rather than being
 * hidden by a fade. `aria-hidden` on the duplicate keeps the words from being
 * announced twice.
 *
 * Pauses on hover so the text can actually be read, and stops entirely under
 * reduced-motion, where it becomes a plain static row.
 */
export default function Marquee({
  items,
  duration = 32,
  reverse = false,
  className = '',
}: MarqueeProps) {
  const { prefersReducedMotion } = useDeviceTier();

  const row = (hidden: boolean) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="marquee-item">
          <span>{item}</span>
          <span className="marquee-sep" aria-hidden="true">
            {/* A small diamond rather than a slash — reads as ornament, not
                as punctuation being mistakenly announced. */}
            ◆
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`marquee ${className}`} data-static={prefersReducedMotion || undefined}>
      <div
        className="marquee-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
