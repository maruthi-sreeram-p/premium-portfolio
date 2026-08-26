import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useDeviceTier } from './useDeviceTier';

interface TiltOptions {
  /** Maximum rotation in degrees. Kept small on purpose. */
  max?: number;
  /** Pixels the card lifts toward the viewer on hover. */
  lift?: number;
  /**
   * When true the element also gets `--mx` / `--my` custom properties (0-100%)
   * tracking the cursor, so CSS can place a spotlight or glare without JS.
   */
  trackSpotlight?: boolean;
}

/**
 * A restrained 3D tilt for project cards.
 *
 * The brief asks for the tilt to be "extremely small" — 5° is enough to read as
 * depth when the card lifts and its border catches the light, and small enough
 * that text never visibly skews or blurs.
 */
export function useTilt<T extends HTMLElement>({
  max = 5,
  lift = 6,
  trackSpotlight = true,
}: TiltOptions = {}) {
  const ref = useRef<T>(null);
  const { allowCursor } = useDeviceTier();

  useEffect(() => {
    const el = ref.current;
    if (!el || !allowCursor) return;

    const rotX = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const rotY = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const moveZ = gsap.quickTo(el, 'z', { duration: 0.6, ease: 'power3.out' });

    function handleMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      // -0.5..0.5 relative to the card's own centre.
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      // Y-rotation follows horizontal travel, X-rotation is inverted so the
      // card tips *away* from the cursor like a physical panel being pressed.
      rotY(px * max * 2);
      rotX(-py * max * 2);
      moveZ(lift);

      if (trackSpotlight) {
        el!.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
        el!.style.setProperty('--my', `${(py + 0.5) * 100}%`);
      }
    }

    function handleLeave() {
      rotX(0);
      rotY(0);
      moveZ(0);
      if (trackSpotlight) {
        el!.style.setProperty('--mx', '50%');
        el!.style.setProperty('--my', '50%');
      }
    }

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerleave', handleLeave);
    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerleave', handleLeave);
      gsap.set(el, { rotationX: 0, rotationY: 0, z: 0 });
    };
  }, [allowCursor, max, lift, trackSpotlight]);

  return ref;
}
