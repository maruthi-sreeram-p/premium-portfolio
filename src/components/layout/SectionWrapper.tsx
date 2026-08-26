import React, { useRef } from 'react';
import Container from './Container';
import { CURVE_PERSPECTIVE, useCurvedScroll } from '../../hooks/useCurvedScroll';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  /** Optional label announced to assistive tech for this landmark. */
  ariaLabel?: string;
  /** Opt out of the curved scroll (used for full-bleed bands). */
  flat?: boolean;
  /** Removes the horizontal container, for full-bleed content. */
  bleed?: boolean;
}

/**
 * Standard section shell.
 *
 * Sections are transparent: the ambient backdrop and the 3D field show through
 * all of them, which is what makes the page feel like one continuous space
 * rather than a stack of separately-coloured bands.
 *
 * The concave scroll curve lives in `useCurvedScroll`, shared with the hero so
 * every part of the page sits on the same surface.
 */
export default function SectionWrapper({
  children,
  id,
  className = '',
  ariaLabel,
  flat = false,
  bleed = false,
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const curved = useCurvedScroll(sectionRef, innerRef, !flat);

  const content = bleed ? children : <Container>{children}</Container>;

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-label={ariaLabel}
      className={`relative py-24 md:py-32 lg:py-36 ${className}`}
      style={curved ? { perspective: CURVE_PERSPECTIVE } : undefined}
    >
      {/* No preserve-3d — see useCurvedScroll. The section is a flat plane
          being tilted, not a 3D scene. */}
      <div ref={innerRef}>{content}</div>
    </section>
  );
}
