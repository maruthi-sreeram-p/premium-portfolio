import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single registration point for GSAP plugins.
 *
 * Registering inside a component body would re-run on every hot reload and
 * quietly stack duplicate plugin instances; doing it once at module scope means
 * any file can `import { gsap, ScrollTrigger } from '../lib/gsap'` and trust
 * that the plugin is live.
 */
gsap.registerPlugin(ScrollTrigger);

// lagSmoothing(0) keeps GSAP's clock locked to Lenis' rAF instead of GSAP
// silently "catching up" after a dropped frame, which would desync the two.
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger };
