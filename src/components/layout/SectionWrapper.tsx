import React from 'react';
import Container from './Container';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  /** Optional label announced to assistive tech for this landmark. */
  ariaLabel?: string;
  /** Removes the horizontal container, for full-bleed content. */
  bleed?: boolean;
}

/**
 * Standard section shell.
 *
 * Sections are transparent: the backdrop shows through all of them, so the page
 * reads as one continuous space rather than a stack of separately-coloured
 * bands. Sections are flat — nothing tilts or curves as they scroll.
 */
export default function SectionWrapper({
  children,
  id,
  className = '',
  ariaLabel,
  bleed = false,
}: SectionWrapperProps) {
  const content = bleed ? children : <Container>{children}</Container>;

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative py-24 md:py-32 lg:py-36 ${className}`}
    >
      {content}
    </section>
  );
}
