/**
 * The hero's request-path diagram, as data.
 *
 * Nothing here is coupled to the drawing. Nodes declare a **grid position**,
 * not pixel coordinates, and edges reference nodes by **id**, not by a
 * hand-written SVG path. SystemDiagram derives every box position, every line
 * and every anchor point from this file.
 *
 * That means renaming a node, adding a step, or moving something to a
 * different column is a one-line edit here — no geometry to recalculate and no
 * path strings to keep in sync. An earlier version hard-coded both the labels
 * and literal paths like `M 120 38 L 120 74`, so changing a single label meant
 * re-deriving five coordinates by hand.
 */

/** Visual rank. `accent` is for the one node worth drawing the eye to. */
export type FlowTier = 'plain' | 'guard' | 'accent' | 'store';

export interface FlowNode {
  id: string;
  label: string;
  /** Small caption under the label — what the box is *for*. Optional. */
  note?: string;
  tier?: FlowTier;
  /** Zero-based grid position. The component maps these onto the canvas. */
  col: number;
  row: number;
}

export interface FlowEdge {
  from: string;
  to: string;
}

export interface SystemFlow {
  /** Grid size the positions above are expressed in. */
  cols: number;
  rows: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export const systemFlow: SystemFlow = {
  cols: 3,
  rows: 4,
  nodes: [
    { id: 'client', label: 'Client', col: 1, row: 0 },
    { id: 'api', label: 'API', note: 'REST', col: 1, row: 1 },
    { id: 'auth', label: 'Auth', note: 'JWT', tier: 'guard', col: 2, row: 1 },
    { id: 'service', label: 'Service', tier: 'accent', col: 1, row: 2 },
    { id: 'cache', label: 'Cache', note: 'Redis', tier: 'store', col: 0, row: 2 },
    { id: 'database', label: 'Database', note: 'MySQL', tier: 'store', col: 1, row: 3 },
  ],
  edges: [
    { from: 'client', to: 'api' },
    { from: 'api', to: 'auth' },
    { from: 'api', to: 'service' },
    { from: 'service', to: 'cache' },
    { from: 'service', to: 'database' },
  ],
};
