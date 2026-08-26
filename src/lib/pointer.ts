import { damp } from './motion';

/**
 * Global pointer state.
 *
 * Mouse-reactive effects are everywhere on this page (aura, hero field, cursor,
 * card tilt). Giving each one its own listener + rAF loop would mean a dozen
 * loops fighting for the same frame. Instead there is exactly one listener and
 * one rAF loop here, writing into a shared mutable record that consumers read
 * during their own render/animation step. Nothing in this module touches React
 * state, so pointer movement never triggers a re-render.
 */
export interface PointerState {
  /** Viewport pixels. */
  x: number;
  y: number;
  /** Normalised to -1..1, origin at viewport centre. */
  nx: number;
  ny: number;
  /** Smoothed (`n*` eased over time) — use these for anything visible. */
  sx: number;
  sy: number;
  /** Smoothed pointer speed, 0..1-ish. Drives "energy" intensity. */
  speed: number;
  /** False until the user actually moves a pointer. */
  active: boolean;
}

export const pointer: PointerState = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  sx: 0,
  sy: 0,
  speed: 0,
  active: false,
};

type Subscriber = (state: PointerState, dt: number) => void;

const subscribers = new Set<Subscriber>();
let rafId = 0;
let lastTime = 0;
let lastX = 0;
let lastY = 0;
let rawSpeed = 0;

function onPointerMove(event: PointerEvent) {
  const { innerWidth: w, innerHeight: h } = window;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.nx = (event.clientX / w) * 2 - 1;
  pointer.ny = (event.clientY / h) * 2 - 1;
  pointer.active = true;

  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;
  // Normalised against a 60px/frame "fast flick" ceiling.
  rawSpeed = Math.min(1, Math.hypot(dx, dy) / 60);
}

function onPointerLeave() {
  pointer.active = false;
  pointer.nx = 0;
  pointer.ny = 0;
  rawSpeed = 0;
}

function frame(time: number) {
  const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
  lastTime = time;

  pointer.sx = damp(pointer.sx, pointer.nx, 5, dt);
  pointer.sy = damp(pointer.sy, pointer.ny, 5, dt);
  pointer.speed = damp(pointer.speed, rawSpeed, 6, dt);
  // Speed decays on its own; pointermove re-arms it every time it fires.
  rawSpeed *= 0.9;

  for (const fn of subscribers) fn(pointer, dt);

  rafId = requestAnimationFrame(frame);
}

function start() {
  if (rafId) return;
  lastTime = 0;
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  rafId = requestAnimationFrame(frame);
}

function stop() {
  if (!rafId) return;
  cancelAnimationFrame(rafId);
  rafId = 0;
  window.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerleave', onPointerLeave);
}

/**
 * Subscribe to the shared pointer loop. The loop only runs while at least one
 * subscriber is attached, so a page with no pointer effects costs nothing.
 *
 * @returns an unsubscribe function.
 */
export function subscribePointer(fn: Subscriber): () => void {
  subscribers.add(fn);
  start();
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) stop();
  };
}
