import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Moon, Sun } from 'lucide-react';
import Container from './Container';
import MobileMenu from './MobileMenu';
import { personal } from '../../data/personal';
import { navLinks } from '../../data/nav';
import { gsap } from '../../lib/gsap';
import { scrollToSection, scrollToTop } from '../../lib/scroll';
import { useDeviceTier } from '../../hooks/useDeviceTier';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const { prefersReducedMotion } = useDeviceTier();

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

  /* -- Reading progress --------------------------------------------------- */
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500"
        style={{
          background: scrolled
            ? 'color-mix(in srgb, var(--shell) 72%, transparent)'
            : 'transparent',
          borderBottom: `1px solid ${scrolled ? 'var(--rule)' : 'transparent'}`,
          backdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(140%)' : 'none',
        }}
      >
        <Container className="flex h-16 items-center justify-between gap-6 md:h-20">
          {/* Logo */}
          <button
            type="button"
            onClick={scrollToTop}
            className="font-display -mx-2 shrink-0 px-2 py-3 text-sm font-extrabold tracking-[0.28em] text-[var(--fg)] transition-colors duration-300 hover:text-[var(--accent)]"
            aria-label="Back to top"
          >
            {personal.initials}
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            {navLinks.map((link) => {
              const isActive = active === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="relative px-3 py-2 text-[0.8125rem] font-medium transition-colors duration-300"
                  style={{ color: isActive ? 'var(--fg)' : 'var(--fg-soft)' }}
                >
                  {link.label}
                  {isActive && (
                    // A shared layoutId means the indicator *travels* between
                    // items rather than fading out and in — the "controlled
                    // energy" cue for the active section.
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-2 -bottom-px h-px"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, var(--accent), transparent)',
                        boxShadow:
                          '0 0 10px color-mix(in srgb, var(--accent) calc(80% * var(--vfx)), transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
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
              className="energy-ring hidden rounded-md px-4 py-2 text-[0.8125rem] font-semibold text-[var(--shell)] sm:block"
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
        </Container>

        {/* Reading progress */}
        <span
          ref={progressRef}
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left"
          style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent-3), var(--accent-2))',
            transform: 'scaleX(0)',
          }}
        />
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} active={active} />
    </>
  );
}
