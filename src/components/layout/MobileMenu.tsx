import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Mail, X } from 'lucide-react';
import { personal } from '../../data/personal';
import { navLinks } from '../../data/nav';
import { GithubIcon, LinkedInIcon } from '../shared/SocialIcons';
import { scrollToSection, setScrollLocked } from '../../lib/scroll';
import { EASE_OUT_EXPO, EASE_OUT_QUINT } from '../../lib/motion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** Currently visible section id, mirrored from the header's scroll spy. */
  active: string;
}

/**
 * Full-screen mobile navigation.
 *
 * Intentionally *not* a shrunken desktop nav: big touch targets, numbered
 * entries, no hover-dependent affordances, and none of the pointer-driven
 * effects used elsewhere — all of which either do not exist or cost frames on
 * a phone.
 */
export default function MobileMenu({ isOpen, onClose, active }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  /* -- Scroll lock -------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [isOpen]);

  /* -- Focus management --------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) {
      // Return focus to whatever opened the menu, so keyboard users are not
      // dumped back at the top of the document.
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
      return;
    }

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    // The panel mounts in this same commit, so the ref is already live and
    // focus can move immediately. Deliberately not deferred to rAF: frames do
    // not run in a background tab, which would leave a keyboard user tabbing
    // through the page *behind* an open menu.
    if (closeRef.current) {
      closeRef.current.focus();
      return;
    }
    const timer = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  /* -- Escape + focus trap ------------------------------------------------ */
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  function handleNav(id: string) {
    onClose();
    // Let the exit animation clear before scrolling, otherwise the target
    // arrives behind a still-fading overlay.
    window.setTimeout(() => scrollToSection(id), 260);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-[100] flex flex-col md:hidden"
          style={{ background: 'var(--shell)' }}
          initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
          exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
        >
          {/* Ambient grid so the overlay belongs to the same world as the page */}
          <div className="fx-grid pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="relative flex items-center justify-between px-6 py-5">
            <span className="font-display text-sm font-extrabold tracking-[0.28em] text-[var(--fg)]">
              {personal.initials}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="rounded-md border p-2 text-[var(--fg)]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="relative flex flex-1 flex-col justify-center px-6" aria-label="Sections">
            {navLinks.map((link, i) => (
              <motion.button
                key={link.id}
                type="button"
                onClick={() => handleNav(link.id)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: EASE_OUT_QUINT }}
                className="flex items-baseline gap-5 border-b py-5 text-left"
                aria-current={active === link.id ? 'true' : undefined}
              >
                <span
                  className="label"
                  style={{ color: active === link.id ? 'var(--accent)' : undefined }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="font-display text-3xl font-bold transition-colors"
                  style={{ color: active === link.id ? 'var(--accent)' : 'var(--fg)' }}
                >
                  {link.label}
                </span>
              </motion.button>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            className="relative px-6 pb-10 pt-6"
          >
            <p className="label">{personal.title}</p>
            <div className="mt-5 flex items-center gap-8">
              <a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                className="-m-2.5 p-2.5 text-[var(--fg-soft)]"
                aria-label="GitHub"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
              <a
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="-m-2.5 p-2.5 text-[var(--fg-soft)]"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${personal.email}`}
                className="-m-2.5 p-2.5 text-[var(--fg-soft)]"
                aria-label={`Email ${personal.email}`}
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={personal.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="-m-2.5 p-2.5 text-[var(--fg-soft)]"
                aria-label="Resume (PDF)"
              >
                <FileText className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
