import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useMagnetic } from '../../hooks/useMagnetic';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: 'button' | 'submit';
  ariaLabel?: string;
  showArrow?: boolean;
  /** Force opening in a new tab. Absolute http(s) links do this automatically. */
  newTab?: boolean;
  disabled?: boolean;
  /** Turn off the magnetic pull for buttons inside tight layouts. */
  magnetic?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--shell)] font-semibold hover:brightness-110 energy-ring',
  secondary:
    'border border-[var(--rule-strong)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] energy-ring',
  ghost: 'text-[var(--accent)] hover:brightness-125',
};

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-[0.8125rem]',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-[0.9375rem]',
};

/**
 * The site's button.
 *
 * Layers three interaction states the brief asks for, each on its own trigger
 * so they never fire at once and read as noise:
 *   • magnetic pull  — while the cursor is near (desktop, non-reduced-motion)
 *   • electric ring  — a light orbiting the border on hover *and* focus
 *   • ember trail    — behind the arrow glyph as it steps forward
 *
 * Focus-visible drives the same ring as hover, so a keyboard user gets the
 * identical affordance rather than a lesser one.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  href,
  className = '',
  type = 'button',
  ariaLabel,
  showArrow = false,
  newTab = false,
  disabled = false,
  magnetic = true,
}: ButtonProps) {
  const ref = useMagnetic<HTMLElement>({
    strength: magnetic && variant !== 'ghost' ? 0.2 : 0,
  });

  const isGhost = variant === 'ghost';
  const classes = [
    // whitespace-nowrap keeps an icon beside its label rather than stacking
    // them, and shrink-0 stops the button being squeezed narrower than its
    // own content — the global `* { min-width: 0 }` (which exists so long tech
    // names cannot blow out grid tracks) otherwise lets flex items collapse
    // below their intrinsic size. The CTA row wraps instead, which is correct.
    'group relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'tracking-wide transition-[color,background-color,border-color,filter,box-shadow] duration-300',
    'disabled:cursor-not-allowed disabled:opacity-50',
    isGhost ? 'py-1' : `${SIZES[size]} rounded-md`,
    VARIANTS[variant],
    showArrow ? 'trail-host' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {/* inline-flex, not a bare span: Tailwind's preflight sets `svg { display:
          block }`, so an icon passed as a child of a block wrapper pushes the
          label onto its own line. As a flex row they sit side by side. The span
          exists at all to lift the label above the energy ring's ::before. */}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {showArrow && (
        <ArrowRight
          className="trail-glyph relative z-10 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href) {
    // Absolute links and anything explicitly flagged (e.g. the resume PDF)
    // open in a new tab so the visitor never loses their place on the page.
    const opensNewTab = newTab || href.startsWith('http');

    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target={opensNewTab ? '_blank' : undefined}
        rel={opensNewTab ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
