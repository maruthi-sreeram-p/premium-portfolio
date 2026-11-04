import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Moon, Sun } from 'lucide-react';
import MobileMenu from './MobileMenu';
import { personal } from '../../data/personal';
import { navLinks } from '../../data/nav';
import { scrollToSection, scrollToTop } from '../../lib/scroll';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  // The link the pointer (or keyboard focus) is on. The highlight pill follows
  // it, and settles back on the current section when it leaves.
  const [hovered, setHovered] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pillTarget = hovered ?? active;

  /* -- Condensed state --------------------------------------------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* -- Scroll spy --------------------------------------------------------- */
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    // A band across the upper-middle of the viewport decides what is "current".
    // Using a band rather than a single line stops the indicator flickering
    // between two sections at a boundary.
    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.filter((e) => e.isIntersecting);
        if (!inView.length) return;
        const top = inView.reduce((best, e) =>
          e.boundingClientRect.top < best.boundingClientRect.top ? e : best,
        );
        setActive(top.target.id);
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* -- Highlight pill ----------------------------------------------------- */
  useLayoutEffect(() => {
    const place = () => {
      const el = itemRefs.current[pillTarget];
      setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    place();
    // Web fonts land after first paint and change the link widths.
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [pillTarget]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/*
        At the top of the page the bar is a plain full-width strip. Once the page
        scrolls it condenses into a floating, rounded, blurred bar that sits
        clear of the edges: the outer element moves it down from the top, the
        inner one narrows, rounds and frosts. All of it is one 500ms transition
        on the same curve.
      */}
      <header
        className="pointer-events-none fixed inset-x-0 z-50 flex justify-center transition-[top,padding] duration-500 ease-[var(--ease-out-quint)]"
        style={{ top: scrolled ? 14 : 0, paddingInline: scrolled ? 16 : 0 }}
      >
        <div
          className="pointer-events-auto w-full transition-[max-width,border-radius,background-color,border-color,backdrop-filter,box-shadow] duration-500 ease-[var(--ease-out-quint)]"
          style={{
            maxWidth: scrolled ? '56rem' : '80rem',
            borderRadius: scrolled ? 18 : 0,
            background: scrolled
              ? 'color-mix(in srgb, var(--shell) 75%, transparent)'
              : 'transparent',
            border: `1px solid ${scrolled ? 'var(--rule-strong)' : 'transparent'}`,
            backdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
            boxShadow: scrolled ? '0 18px 40px -20px rgba(0, 0, 0, 0.6)' : 'none',
          }}
        >
        <div
          className={`flex items-center justify-between gap-6 transition-[height,padding] duration-500 ease-[var(--ease-out-quint)] ${
            scrolled ? 'h-14 px-4 md:px-5' : 'h-16 px-6 md:h-20 md:px-8 lg:px-12'
          }`}
        >
          {/* Logo */}
          <button
            type="button"
            onClick={scrollToTop}
            className="font-display -mx-2 shrink-0 px-2 py-3 text-sm font-extrabold tracking-[0.28em] text-[var(--fg)] transition-colors duration-300 hover:text-[var(--accent)]"
            aria-label="Back to top"
          >
            {personal.initials}
          </button>

          {/* Desktop nav. The pill is one element that slides to whichever link
              is hovered, rather than each link having its own hover background,
              so it travels between them. */}
          <nav
            ref={navRef}
            className="relative hidden items-center gap-1 rounded-full p-1 md:flex"
            aria-label="Sections"
            onMouseLeave={() => setHovered(null)}
          >
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 top-1 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--fg) 9%, transparent)',
                border: '1px solid var(--rule)',
              }}
              initial={false}
              animate={{
                left: pill?.left ?? 0,
                width: pill?.width ?? 0,
                opacity: pill ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
            {navLinks.map((link) => {
              const isActive = active === link.id;
              return (
                <button
                  key={link.id}
                  ref={(el) => {
                    itemRefs.current[link.id] = el;
                  }}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  onMouseEnter={() => setHovered(link.id)}
                  onFocus={() => setHovered(link.id)}
                  onBlur={() => setHovered(null)}
                  aria-current={isActive ? 'true' : undefined}
                  className="relative z-10 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors duration-300"
                  style={{ color: pillTarget === link.id ? 'var(--fg)' : 'var(--fg-soft)' }}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={personal.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden px-3 py-2 text-[0.8125rem] font-medium text-[var(--fg-soft)] transition-colors duration-300 hover:text-[var(--fg)] lg:block"
            >
              Resume
            </a>

            <button
              type="button"
              onClick={onToggleTheme}
              className="rounded-md border p-2 text-[var(--fg-soft)] transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="hidden rounded-md px-4 py-2 text-[0.8125rem] font-semibold text-[var(--shell)] sm:block"
              style={{ background: 'var(--accent)' }}
            >
              Get in touch
            </button>

            <button
              type="button"
              className="rounded-md border p-2 text-[var(--fg)] md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} active={active} />
    </>
  );
}
