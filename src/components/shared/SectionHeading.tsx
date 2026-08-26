import React from 'react';
import Reveal from './Reveal';
import RevealText from '../fx/RevealText';

interface SectionHeadingProps {
  /** Small caption above the title, e.g. "02 — Skills". */
  eyebrow: string;
  title: string;
  /** Optional supporting sentence under the rule. */
  lead?: React.ReactNode;
  /** Right-hand slot for a count, filter control, or link. */
  aside?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * One heading treatment used by every section.
 *
 * Consistency here is what makes the page read as a single designed system:
 * eyebrow, display title and hairline rule appear in exactly the same
 * relationship every time.
 *
 * Titles are set in sentence case rather than all-caps — at display size,
 * mixed case has ascenders and descenders to give the eye a silhouette, which
 * is what makes large type feel typeset instead of stamped.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  aside,
  align = 'left',
  className = '',
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div className={className}>
      <div
        className={`flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${
          centered ? 'sm:flex-col sm:items-center' : ''
        }`}
      >
        <div className={centered ? 'text-center' : ''}>
          <Reveal>
            <p className={`label eyebrow ${centered ? 'justify-center' : ''}`}>{eyebrow}</p>
          </Reveal>

          <RevealText
            as="h2"
            text={title}
            delay={0.08}
            className="mt-5 text-[clamp(1.8rem,3.6vw,2.75rem)] font-bold text-[var(--fg)]"
          />
        </div>

        {aside && (
          <Reveal delay={0.12} className={centered ? 'mt-2' : 'shrink-0'}>
            {aside}
          </Reveal>
        )}
      </div>

      <Reveal delay={0.12}>
        <div className="rule-h mt-8" />
      </Reveal>

      {lead && (
        <Reveal delay={0.18}>
          <p
            className={`mt-8 max-w-2xl text-[1.0625rem] leading-relaxed text-[var(--fg-soft)] sm:text-lg ${
              centered ? 'mx-auto text-center' : ''
            }`}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
