import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Backdrop from './components/fx/Backdrop';
import AmbientField from './components/fx/AmbientField';
import CursorLayer from './components/fx/CursorLayer';
import BootSequence from './components/fx/BootSequence';
import Marquee from './components/fx/Marquee';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Contact from './components/sections/Contact';
import { initSmoothScroll } from './lib/scroll';
import { ScrollTrigger } from './lib/gsap';
import { useDeviceTier } from './hooks/useDeviceTier';

type Theme = 'light' | 'dark';

/** The stack, as one long scrolling line. */
const MARQUEE_ITEMS = [
  'Java', 'Spring Boot', 'REST APIs', 'MySQL', 'Apache Kafka', 'Redis',
  'React', 'Docker', 'Distributed Systems',
];

export default function App() {
  const { isTouch, prefersReducedMotion } = useDeviceTier();
  const [ready, setReady] = useState(false);

  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      /* private mode — the theme simply resets next visit */
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  );

  // Stable identity: BootSequence's effect owns the scroll lock, so a new
  // callback on every App render would tear that effect down and rebuild it
  // mid-boot.
  const handleBootComplete = useCallback(() => setReady(true), []);

  /* -- Smooth scroll ------------------------------------------------------ */
  useEffect(() => {
    // Touch devices keep native scrolling (hijacking it costs frames and
    // breaks platform overscroll), and reduced-motion opts out entirely.
    const enabled = !isTouch && !prefersReducedMotion;
    const teardown = initSmoothScroll(enabled);
    return teardown;
  }, [isTouch, prefersReducedMotion]);

  /* -- Keep ScrollTrigger honest ------------------------------------------ */
  useEffect(() => {
    // Web fonts and the lazily-loaded WebGL chunk both land after first paint
    // and can shift section offsets. Without a refresh, every scrubbed
    // animation on the page would be measuring stale positions.
    const refresh = () => ScrollTrigger.refresh();

    const timer = window.setTimeout(refresh, 300);
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener('load', refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    // The CSS reduced-motion block only reaches CSS animations and transitions;
    // Framer Motion drives its own values in JS and would keep animating right
    // through it. `reducedMotion="user"` makes it drop transform and layout
    // animations for those visitors while still allowing opacity, so content
    // arrives softly instead of either sliding or snapping.
    <MotionConfig reducedMotion="user">
      <Backdrop />
      {/* Mounted once, above the CSS backdrop and behind all content, so the
          whole document scrolls past a single rotating 3D field. */}
      <AmbientField />
      <CursorLayer />
      <BootSequence onComplete={handleBootComplete} />

      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main id="main">
        <Hero ready={ready} />

        {/* A scrolling headline band between the hero and the first section —
            it carries the stack at display size and doubles as the seam
            between the two. */}
        <div className="border-y py-8 md:py-10" style={{ borderColor: 'var(--rule)' }}>
          <Marquee items={MARQUEE_ITEMS} />
        </div>

        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>

      <Footer />
    </MotionConfig>
  );
}
