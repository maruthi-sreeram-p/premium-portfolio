import { Suspense, lazy, useEffect, useState } from 'react';
import { useDeviceTier } from '../../hooks/useDeviceTier';

// Three.js + R3F is ~228kB gzipped. Splitting it out keeps it off the critical
// path entirely — content, layout and the CSS ambience all paint first, and
// devices that never qualify for WebGL never download it at all.
const Field3D = lazy(() => import('./Field3D'));

/**
 * Lightweight stand-in for the WebGL field.
 *
 * Used on mobile, low-end hardware, under reduced-motion, and as the Suspense
 * fallback while the 3D chunk loads. It is a designed state rather than a blank
 * box, so the page never looks empty at any tier.
 */
function StaticField() {
  const nodes = [
    { cx: 26, cy: 30, r: 2.4 }, { cx: 62, cy: 18, r: 1.5 },
    { cx: 78, cy: 42, r: 2.8 }, { cx: 44, cy: 52, r: 1.8 },
    { cx: 15, cy: 62, r: 1.6 }, { cx: 68, cy: 74, r: 2.2 },
    { cx: 88, cy: 64, r: 1.4 }, { cx: 36, cy: 82, r: 1.9 },
    { cx: 54, cy: 34, r: 1.2 }, { cx: 8,  cy: 44, r: 1.3 },
  ];
  const edges = [[0, 3], [3, 8], [8, 1], [2, 5], [5, 7], [3, 4], [2, 6], [4, 9], [7, 5]];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in srgb, var(--accent) calc(16% * var(--vfx)), transparent), transparent 72%)',
          animation: 'aura-breathe 7s ease-in-out infinite',
        }}
      />
      {/*
        `slice` scales this 100×100 viewBox up to cover the viewport, which
        multiplies every stroke width and radius with it — at phone
        proportions the constellation was drawing thick lines straight across
        the headline. `vectorEffect` pins strokes to 1 device pixel whatever
        the scale, the radii are small, and the whole layer is held at low
        opacity: it is ambience, not content.
      */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-40"
        aria-hidden="true"
      >
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].cx} y1={nodes[a].cy}
            x2={nodes[b].cx} y2={nodes[b].cy}
            stroke="var(--accent)"
            strokeWidth="1"
            strokeOpacity="0.3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.cx} cy={n.cy} r={n.r * 0.16}
            fill="var(--accent)"
            style={{
              opacity: 0.6,
              animation: `node-pulse ${4 + (i % 4)}s ease-in-out ${i * 0.35}s infinite`,
              transformOrigin: `${n.cx}px ${n.cy}px`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * The site-wide 3D layer.
 *
 * Fixed behind every section rather than scoped to the hero, so the whole page
 * scrolls past one continuously rotating object. Mounted once and never
 * unmounted, which keeps the page to a single WebGL context for its entire
 * lifetime — repeatedly creating and destroying contexts is what exhausts the
 * browser's limit and produces a black canvas.
 */
export default function AmbientField() {
  const { allowWebGL, tier } = useDeviceTier();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!allowWebGL) return;
    // A hidden tab gets frameloop="never", so the GPU goes idle instead of
    // rendering a scene nobody is looking at.
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [allowWebGL]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
    >
      {allowWebGL ? (
        <Suspense fallback={<StaticField />}>
          <Field3D count={tier === 'high' ? 2400 : 1100} paused={hidden} />
        </Suspense>
      ) : (
        <StaticField />
      )}
    </div>
  );
}
