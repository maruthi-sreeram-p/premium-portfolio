import { useEffect, useRef, useState } from 'react';
import { subscribePointer } from '../../lib/pointer';
import { useDeviceTier } from '../../hooks/useDeviceTier';

/**
 * The backend as a stack of layers, in depth.
 *
 * Five translucent plates float one above another in real 3D (CSS transforms
 * under perspective). A single request falls through all of them along a
 * vertical beam; each plate lights up and sends out a ripple at the instant the
 * request crosses it. The whole stack turns a few degrees toward the pointer.
 *
 * It is deliberately generic — it describes how any layered service is shaped,
 * not one particular project — so it never has to be kept in step with the
 * project data.
 *
 * Geometry. The stage is tipped back 58° and spun -38°, which is what makes the
 * plates read as isometric slabs. Text cannot live on a tilted plane and stay
 * legible, so each label is "billboarded": it carries the exact inverse of the
 * stage's rotation and therefore faces the viewer, while still being anchored to
 * a point in the plate's plane.
 */

const TILT = 58;
const SPIN = 38;
/** Plate edge, px. */
const PLATE = 200;
const HALF = PLATE / 2;
/** Gap between plates along Z, px. */
const GAP = 72;
/*
  Timing of the falling request. `FALL` must match the `.ls-*` animations in
  index.css (a 4.6s loop; the fall takes 56.5% of it), and
  `Z_START` / `Z_END` match the packet's keyframes.
*/
const FALL = 2.6;
/** Entrance delay before the first request is released, seconds. */
const LEAD = 1.4;
/** Z the request starts and ends at, so it enters above and leaves below the stack. */
const Z_START = 170;
const Z_END = -150;

/** Scene size the geometry is authored in; scaled down to fit narrower columns. */
const SCENE_W = 470;
const SCENE_H = 440;
/** Stage centre inside the scene — left of centre, leaving room for the labels. */
const CX = 150;
const CY = 224;

/** Where the labels hang off the plate edge, along the screen-horizontal direction. */
const rad = (deg: number) => (deg * Math.PI) / 180;
const EDGE = HALF / Math.cos(rad(SPIN));
const LEAD_LINE = 34;
const LABEL_D = EDGE + LEAD_LINE + 6;

interface Layer {
  label: string;
  note: string;
  /** Small boxes drawn on the plate: [centre x, centre y, width, height] as fractions. */
  nodes: [number, number, number, number][];
  /** The layer the eye is drawn to. */
  focus?: boolean;
}

const LAYERS: Layer[] = [
  { label: 'Client', note: 'Browser · Mobile', nodes: [[0.5, 0.5, 0.26, 0.26]] },
  {
    label: 'API',
    note: 'REST · Validation',
    nodes: [[0.24, 0.5, 0.2, 0.2], [0.5, 0.5, 0.2, 0.2], [0.76, 0.5, 0.2, 0.2]],
  },
  {
    label: 'Service',
    note: 'Business logic',
    focus: true,
    nodes: [[0.3, 0.3, 0.22, 0.22], [0.7, 0.3, 0.22, 0.22], [0.3, 0.7, 0.22, 0.22], [0.7, 0.7, 0.22, 0.22]],
  },
  {
    label: 'Cache',
    note: 'Redis',
    nodes: [[0.25, 0.28, 0.14, 0.14], [0.6, 0.22, 0.14, 0.14], [0.8, 0.55, 0.14, 0.14], [0.4, 0.62, 0.14, 0.14], [0.2, 0.8, 0.14, 0.14]],
  },
  {
    label: 'Database',
    note: 'MySQL',
    nodes: [[0.5, 0.26, 0.64, 0.14], [0.5, 0.5, 0.64, 0.14], [0.5, 0.74, 0.64, 0.14]],
  },
];

/** Z of layer i: the first layer is the highest. */
const layerZ = (i: number) => ((LAYERS.length - 1) / 2 - i) * GAP;
/** Seconds into the fall at which the request reaches layer i. */
const arrival = (i: number) => (FALL * (Z_START - layerZ(i))) / (Z_START - Z_END);

interface LayerStackProps {
  /** Held false until the boot overlay finishes. */
  ready: boolean;
}

export default function LayerStack({ ready }: LayerStackProps) {
  const { prefersReducedMotion, allowCursor } = useDeviceTier();
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);

  /* -- Fit the fixed-size scene into whatever column it is given ------------ */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setFit(Math.min(1, frame.clientWidth / SCENE_W));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  /* -- Turn toward the pointer ---------------------------------------------- */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !allowCursor || prefersReducedMotion) return;
    return subscribePointer((p) => {
      // sx/sy are already eased by the shared pointer loop.
      stage.style.setProperty('--px', `${(p.sx * 9).toFixed(2)}deg`);
      stage.style.setProperty('--py', `${(p.sy * -5).toFixed(2)}deg`);
    });
  }, [allowCursor, prefersReducedMotion]);

  const animate = ready && !prefersReducedMotion;

  return (
    <div
      ref={frameRef}
      aria-hidden="true"
      className="relative w-full"
      style={{ height: SCENE_H * fit }}
    >
      <div
        className="absolute top-0"
        style={{
          left: '50%',
          width: SCENE_W,
          height: SCENE_H,
          transform: `translateX(-50%) scale(${fit})`,
          transformOrigin: 'top center',
          perspective: 1300,
          perspectiveOrigin: `${CX}px ${CY}px`,
        }}
      >
        <div
          ref={stageRef}
          className={`absolute ${animate ? 'ls-alive' : ''}`}
          style={{
            left: CX,
            top: CY,
            width: 0,
            height: 0,
            transformStyle: 'preserve-3d',
            transform: `rotateX(calc(${TILT}deg + var(--py, 0deg))) rotateZ(calc(${-SPIN}deg + var(--px, 0deg) + var(--sway, 0deg)))`,
          }}
        >
          {/* Corner posts — they make the plates read as a stack, not a pile. */}
          {([-1, 1] as const).flatMap((sx) =>
            ([-1, 1] as const).map((sy) => (
              <span
                key={`${sx}${sy}`}
                className="ls-post absolute"
                style={{
                  left: sx * HALF - 0.5,
                  top: sy * HALF - (GAP * (LAYERS.length - 1)) / 2,
                  height: GAP * (LAYERS.length - 1),
                  transform: 'rotateX(90deg)',
                }}
              />
            )),
          )}

          {/* The beam the request falls along. */}
          <span
            className="ls-beam absolute"
            style={{
              left: -1,
              top: -(GAP * (LAYERS.length - 1)) / 2 - 24,
              height: GAP * (LAYERS.length - 1) + 48,
              transform: 'rotateX(90deg)',
            }}
          />

          {LAYERS.map((layer, i) => {
            const enter = `${0.15 + i * 0.12}s`;
            const hit = `${LEAD + arrival(i) - 0.04}s`;
            return (
              <div
                key={layer.label}
                className={`absolute left-0 top-0 ${ready ? 'ls-layer-in' : ''}`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(calc(${layerZ(i)}px * (1 + var(--spread, 0))))`,
                  animationDelay: enter,
                }}
              >
                <div
                  className="ls-plate absolute"
                  data-focus={layer.focus || undefined}
                  style={{
                    left: -HALF,
                    top: -HALF,
                    width: PLATE,
                    height: PLATE,
                    animationDelay: enter,
                  }}
                >
                  {layer.nodes.map(([x, y, w, h], n) => (
                    <span
                      key={n}
                      className="ls-node absolute"
                      style={{
                        left: `${x * 100}%`,
                        top: `${y * 100}%`,
                        width: `${w * 100}%`,
                        height: `${h * 100}%`,
                      }}
                    />
                  ))}
                  {animate && (
                    <>
                      <span className="ls-lit absolute inset-0" style={{ animationDelay: hit }} />
                      <span className="ls-ripple absolute" style={{ animationDelay: hit }} />
                    </>
                  )}
                </div>

                {/* Leader line, in the plate's plane, running screen-horizontal. */}
                <span
                  className="ls-leader absolute"
                  style={{
                    left: EDGE * Math.cos(rad(SPIN)),
                    top: EDGE * Math.sin(rad(SPIN)),
                    width: LEAD_LINE,
                    transformOrigin: '0 0',
                    transform: `rotateZ(calc(${SPIN}deg - var(--px, 0deg) - var(--sway, 0deg)))`,
                    animationDelay: enter,
                  }}
                />

                {/* Label, billboarded to face the viewer. */}
                <div
                  className="ls-label absolute"
                  data-focus={layer.focus || undefined}
                  style={{
                    left: LABEL_D * Math.cos(rad(SPIN)),
                    top: LABEL_D * Math.sin(rad(SPIN)) - 17,
                    transformOrigin: '0 17px',
                    transform: `rotateZ(calc(${SPIN}deg - var(--px, 0deg) - var(--sway, 0deg))) rotateX(calc(${-TILT}deg - var(--py, 0deg)))`,
                    animationDelay: `${0.35 + i * 0.12}s`,
                  }}
                >
                  <span className="ls-label-name">{layer.label}</span>
                  <span className="ls-label-note">{layer.note}</span>
                </div>
              </div>
            );
          })}

          {/* The request itself. */}
          {animate && (
            <span
              className="ls-packet absolute"
              style={{ animationDelay: `${LEAD}s` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
