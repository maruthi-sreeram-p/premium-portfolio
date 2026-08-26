import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { systemFlow, type FlowTier } from '../../data/systemFlow';
import { EASE_OUT_EXPO } from '../../lib/motion';
import { useDeviceTier } from '../../hooks/useDeviceTier';

/**
 * The request path, laid out from data.
 *
 * This component knows how to *draw* a flow; it knows nothing about what the
 * flow contains. Node labels, notes, ranks and grid positions all live in
 * `data/systemFlow.ts`, and every box rectangle, every line and every anchor
 * point below is derived from them.
 *
 * The layout engine is deliberately tiny: nodes sit on a grid, and an edge
 * between two nodes picks its anchors from their relative position — bottom-to-
 * top for a vertical step, side-to-side for a horizontal one. Adding a node or
 * moving one to another column needs no change in this file.
 */

const VB_W = 240;
const VB_H = 300;
const NODE_W = 70;
const NODE_H = 30;

/** Per-tier styling. One accent family, used to rank rather than to decorate. */
const TIER: Record<FlowTier, { stroke: string; fill: string; text: string }> = {
  plain: {
    stroke: 'var(--rule-strong)',
    fill: 'var(--card-solid)',
    text: 'var(--fg-soft)',
  },
  guard: {
    stroke: 'color-mix(in srgb, var(--accent-3) 45%, transparent)',
    fill: 'var(--card-solid)',
    text: 'var(--accent-3)',
  },
  accent: {
    stroke: 'color-mix(in srgb, var(--accent) 62%, transparent)',
    fill: 'color-mix(in srgb, var(--accent) 12%, var(--card-solid))',
    text: 'var(--accent)',
  },
  store: {
    stroke: 'color-mix(in srgb, var(--accent-2) 42%, transparent)',
    fill: 'var(--card-solid)',
    text: 'var(--accent-2)',
  },
};

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Grid cell → pixel box, centred in its cell. */
function boxOf(col: number, row: number, cols: number, rows: number): Box {
  const cellW = VB_W / cols;
  const cellH = VB_H / rows;
  return {
    x: col * cellW + (cellW - NODE_W) / 2,
    y: row * cellH + (cellH - NODE_H) / 2,
    w: NODE_W,
    h: NODE_H,
  };
}

/**
 * Anchor an edge on the two box edges that actually face each other.
 *
 * Comparing the row first means a step down the stack always leaves the bottom
 * and enters the top, and a sideways step always leaves a side — which is what
 * keeps the lines from cutting across the boxes when the data changes.
 */
function edgePath(a: Box, b: Box): string {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };

  if (Math.abs(bc.y - ac.y) > Math.abs(bc.x - ac.x)) {
    const down = bc.y > ac.y;
    return `M ${ac.x} ${down ? a.y + a.h : a.y} L ${bc.x} ${down ? b.y : b.y + b.h}`;
  }
  const right = bc.x > ac.x;
  return `M ${right ? a.x + a.w : a.x} ${ac.y} L ${right ? b.x : b.x + b.w} ${bc.y}`;
}

interface SystemDiagramProps {
  /** Held false until the boot overlay finishes. */
  ready: boolean;
}

export default function SystemDiagram({ ready }: SystemDiagramProps) {
  const { prefersReducedMotion } = useDeviceTier();

  const { nodes, edges } = useMemo(() => {
    const { cols, rows } = systemFlow;
    const boxes = new Map(
      systemFlow.nodes.map((n) => [n.id, boxOf(n.col, n.row, cols, rows)]),
    );
    return {
      nodes: systemFlow.nodes.map((n, i) => ({
        ...n,
        box: boxes.get(n.id)!,
        delay: i * 0.09,
      })),
      edges: systemFlow.edges
        .map((e, i) => {
          const a = boxes.get(e.from);
          const b = boxes.get(e.to);
          // A typo in an edge's `from`/`to` should drop that one line, not
          // take the whole diagram down.
          if (!a || !b) return null;
          return { d: edgePath(a, b), delay: i * 0.6 };
        })
        .filter((e): e is { d: string; delay: number } => e !== null),
    };
  }, []);

  return (
    <div className="relative h-full w-full min-h-[320px] lg:min-h-[400px]" aria-hidden="true">
      {/* Drafting grid, faded at the edges so the diagram is not sitting in a
          hard-edged box. */}
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(closest-side, #000 55%, transparent)',
          WebkitMaskImage: 'radial-gradient(closest-side, #000 55%, transparent)',
        }}
      />

      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="relative z-10 h-full w-full">
        {edges.map((edge, i) => (
          <motion.path
            key={i}
            d={edge.d}
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.36"
            strokeWidth="1"
            strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={ready ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.7 + i * 0.1, ease: EASE_OUT_EXPO }}
          />
        ))}

        {/* A request travelling the path. `offset-path` moves each dot along the
            exact edge geometry, so it is one compositor-friendly property per
            pulse and the dot can never drift off its line. */}
        {!prefersReducedMotion &&
          edges.map((edge, i) => (
            <circle
              key={`pulse-${i}`}
              r="2.6"
              fill="var(--accent-2)"
              style={{
                offsetPath: `path("${edge.d}")`,
                offsetRotate: '0deg',
                animation: `edge-pulse 3.4s linear ${edge.delay}s infinite`,
                filter: 'drop-shadow(0 0 5px var(--accent-2))',
                opacity: 0,
              }}
            />
          ))}

        {nodes.map((node) => {
          const t = TIER[node.tier ?? 'plain'];
          const { box } = node;
          const cx = box.x + box.w / 2;
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, y: 12 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: node.delay + 0.45, ease: EASE_OUT_EXPO }}
            >
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={7}
                fill={t.fill}
                stroke={t.stroke}
                strokeWidth="1.25"
              />
              <text
                x={cx}
                y={node.note ? box.y + box.h / 2 - 3.5 : box.y + box.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={t.text}
                fontSize="9.5"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
                letterSpacing="0.9"
              >
                {node.label.toUpperCase()}
              </text>
              {node.note && (
                <text
                  x={cx}
                  y={box.y + box.h / 2 + 7.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--fg-faint)"
                  fontSize="6.5"
                  fontFamily="Inter, sans-serif"
                  letterSpacing="0.5"
                >
                  {node.note}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
