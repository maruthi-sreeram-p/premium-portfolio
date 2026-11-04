import { useEffect, useRef } from 'react';
import { useDeviceTier } from './useDeviceTier';

/**
 * Writes the pointer's position inside an element to `--mx` / `--my` (as
 * percentages) so CSS can place a light under it — see `.dot-reveal` in
 * index.css. The properties are never written on touch devices, where the CSS
 * defaults to the centre and the hover state never fires anyway.
 */
export function usePointerGlow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { allowCursor } = useDeviceTier();

  useEffect(() => {
    const el = ref.current;
    if (!el || !allowCursor) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, [allowCursor]);

  return ref;
}
