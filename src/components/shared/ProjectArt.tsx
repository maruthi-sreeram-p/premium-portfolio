/**
 * The artwork behind each project card's floating cards.
 *
 * There are no project screenshots in this repository, so each project gets a
 * small drawn scene that says what the project is about — documents, chunks
 * and a cited answer for the knowledge base, a pulse line and a capsule for the
 * medication tracker, a ring of replicas for the key-value store. They are line drawings in the theme's
 * own greys with the card's accent on the one element worth noticing, so they
 * recolour with the theme and never compete with the cards floating over them.
 *
 * Authored on a 360×208 canvas and scaled with `slice`, so the stage is always
 * filled; the part that matters is kept toward the middle, because a narrow
 * card crops the sides and a wide one crops the top and bottom.
 */

const LINE = 'color-mix(in srgb, var(--fg) 36%, transparent)';
const SOFT = 'color-mix(in srgb, var(--fg) 18%, transparent)';
const FILL = 'color-mix(in srgb, var(--fg) 8%, transparent)';
const ACCENT = 'var(--card-accent, var(--accent))';

type Pt = [number, number];

/** A node: a filled disc with a ring, optionally lit in the accent. */
function Node({ at, r = 5, lit = false }: { at: Pt; r?: number; lit?: boolean }) {
  return (
    <g>
      <circle cx={at[0]} cy={at[1]} r={r + 4} stroke={lit ? ACCENT : SOFT} strokeOpacity={lit ? 0.5 : 1} />
      <circle cx={at[0]} cy={at[1]} r={r} fill={lit ? ACCENT : FILL} stroke={lit ? ACCENT : LINE} />
    </g>
  );
}

/** Replication: a ring of nodes, one of them the leader. */
function ReplicaRing() {
  const c: Pt = [180, 104];
  const ring: Pt[] = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [c[0] + Math.cos(a) * 100, c[1] + Math.sin(a) * 68] as Pt;
  });
  return (
    <>
      <ellipse cx={c[0]} cy={c[1]} rx={100} ry={68} stroke={SOFT} strokeDasharray="3 5" />
      {ring.slice(1).map((p, i) => (
        <line
          key={i}
          x1={ring[0][0]}
          y1={ring[0][1]}
          x2={p[0]}
          y2={p[1]}
          stroke={LINE}
          strokeDasharray="3 5"
        />
      ))}
      {ring.slice(1).map((p, i) => (
        <Node key={i} at={p} r={6} />
      ))}
      <Node at={ring[0]} r={9} lit />
    </>
  );
}

/** Retrieval: documents are cut into chunks, the relevant ones are found, and
    an answer comes back citing them. */
function RagPipeline() {
  const chunks: Pt[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) chunks.push([140 + c * 22, 70 + r * 22]);
  const hit = new Set([1, 6, 10]);
  return (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${26 + i * 9} ${54 + i * 9})`}>
          <rect width="52" height="68" rx="8" fill={FILL} stroke={LINE} />
          <path d="M 12 20 H 40 M 12 32 H 40 M 12 44 H 28" stroke={SOFT} />
        </g>
      ))}
      <path d="M 96 100 C 112 100, 116 98, 132 98" stroke={LINE} strokeDasharray="3 5" />
      {chunks.map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="16"
          height="16"
          rx="4"
          fill={hit.has(i) ? ACCENT : FILL}
          fillOpacity={hit.has(i) ? 0.35 : 1}
          stroke={hit.has(i) ? ACCENT : LINE}
        />
      ))}
      <path d="M 232 98 C 246 98, 250 100, 262 100" stroke={ACCENT} strokeOpacity="0.7" strokeDasharray="3 5" />
      <g transform="translate(262 62)">
        <rect width="84" height="80" rx="12" fill={FILL} stroke={LINE} />
        <path d="M 14 22 H 70 M 14 36 H 70 M 14 50 H 48" stroke={SOFT} />
        <circle cx="22" cy="66" r="7" stroke={ACCENT} fill={ACCENT} fillOpacity="0.3" />
        <circle cx="42" cy="66" r="7" stroke={ACCENT} fill={ACCENT} fillOpacity="0.3" />
      </g>
    </>
  );
}

/** A copilot: a question, an answer, and a spark of intelligence. */
function AiCopilot() {
  return (
    <>
      <g transform="translate(26 40)">
        <rect width="132" height="48" rx="14" fill={FILL} stroke={LINE} />
        <path d="M 16 18 H 100 M 16 32 H 70" stroke={SOFT} />
      </g>
      <g transform="translate(170 104)">
        <rect width="150" height="56" rx="14" fill={FILL} stroke={ACCENT} />
        <path d="M 16 20 H 120 M 16 34 H 96" stroke={SOFT} />
        <path d="M 16 46 H 52" stroke={ACCENT} strokeOpacity="0.7" />
      </g>
      <path
        d="M 306 34 L 311 48 L 325 53 L 311 58 L 306 72 L 301 58 L 287 53 L 301 48 Z"
        fill={ACCENT}
        fillOpacity="0.3"
        stroke={ACCENT}
      />
      <g transform="translate(44 134)">
        <circle cx="8" cy="8" r="8" stroke={LINE} fill={FILL} />
        <circle cx="34" cy="8" r="8" stroke={LINE} fill={FILL} />
        <circle cx="60" cy="8" r="8" stroke={ACCENT} fill={ACCENT} fillOpacity="0.3" />
      </g>
    </>
  );
}

/** A capsule, a cross and a heartbeat line. */
function Medication() {
  return (
    <>
      <path
        d="M 0 116 H 112 L 128 84 L 148 150 L 166 98 L 178 116 H 360"
        stroke={LINE}
        strokeWidth="1.5"
      />
      <g transform="rotate(-32 262 66)">
        <rect x="222" y="48" width="80" height="36" rx="18" fill={FILL} stroke={LINE} />
        <path d="M 262 48 H 284 a 18 18 0 0 1 0 36 H 262 Z" fill={ACCENT} fillOpacity="0.35" stroke={ACCENT} />
      </g>
      <g stroke={LINE}>
        <path d="M 70 40 v 36 M 52 58 h 36" />
        <rect x="42" y="30" width="56" height="56" rx="14" fill={FILL} />
      </g>
      <g transform="translate(36 150)">
        <circle cx="8" cy="8" r="8" stroke={LINE} fill={FILL} />
        <circle cx="34" cy="8" r="8" stroke={LINE} fill={FILL} />
        <circle cx="60" cy="8" r="8" stroke={ACCENT} fill={ACCENT} fillOpacity="0.3" />
      </g>
    </>
  );
}

/** A bowl with steam, and the items of an order ticking in. */
function FoodBowl() {
  return (
    <>
      <path d="M 96 120 H 264 a 84 78 0 0 1 -168 0 Z" fill={FILL} stroke={LINE} />
      <path d="M 120 168 H 240" stroke={SOFT} />
      <path d="M 150 94 q -10 -14 0 -28 q 10 -14 0 -28" stroke={LINE} />
      <path d="M 180 98 q -10 -16 0 -32 q 10 -16 0 -32" stroke={ACCENT} strokeOpacity="0.7" />
      <path d="M 210 94 q -10 -14 0 -28 q 10 -14 0 -28" stroke={LINE} />
      <g transform="translate(278 40)">
        <rect width="64" height="44" rx="10" fill={FILL} stroke={LINE} />
        <path d="M 12 16 H 40 M 12 28 H 28" stroke={SOFT} />
        <circle cx="50" cy="28" r="5" stroke={ACCENT} fill={ACCENT} fillOpacity="0.3" />
      </g>
      <g transform="translate(22 52)">
        <path d="M 0 14 H 10 L 18 40 H 52 L 58 18 H 14" stroke={LINE} />
        <circle cx="24" cy="50" r="3.5" stroke={LINE} />
        <circle cx="46" cy="50" r="3.5" stroke={LINE} />
      </g>
    </>
  );
}

/** Bars, a trend line over them, and a padlock. */
function FinanceLock() {
  const bars = [44, 70, 54, 96, 78, 124];
  return (
    <>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={34 + i * 34}
          y={176 - h}
          width="20"
          height={h}
          rx="4"
          fill={FILL}
          stroke={i === bars.length - 1 ? ACCENT : LINE}
        />
      ))}
      <path d="M 44 118 L 78 96 L 112 110 L 146 70 L 180 84 L 214 40" stroke={ACCENT} strokeOpacity="0.8" strokeWidth="1.5" />
      <g transform="translate(262 62)">
        <rect x="0" y="30" width="56" height="44" rx="10" fill={FILL} stroke={LINE} />
        <path d="M 12 30 v -12 a 16 16 0 0 1 32 0 v 12" stroke={ACCENT} />
        <circle cx="28" cy="50" r="5" fill={ACCENT} fillOpacity="0.4" stroke={ACCENT} />
        <path d="M 28 55 v 8" stroke={ACCENT} />
      </g>
    </>
  );
}

/** Sources feeding a matcher that scores postings. */
function CareerMatch() {
  const sources: Pt[] = [[44, 54], [44, 104], [44, 154]];
  const hub: Pt = [150, 104];
  return (
    <>
      {sources.map((s, i) => (
        <path key={i} d={`M ${s[0]} ${s[1]} C 96 ${s[1]}, 100 104, ${hub[0]} ${hub[1]}`} stroke={LINE} strokeDasharray="3 5" />
      ))}
      {sources.map((s, i) => (
        <Node key={i} at={s} r={5} />
      ))}
      <Node at={hub} r={9} lit />
      <path d="M 145 104 l 4 4 l 8 -9" stroke="var(--shell)" strokeWidth="1.6" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${220 + i * 18} ${40 + i * 38})`}>
          <rect width="104" height="44" rx="10" fill={FILL} stroke={i === 0 ? ACCENT : LINE} />
          <path d="M 12 16 H 62 M 12 28 H 42" stroke={SOFT} />
          <circle cx="86" cy="22" r="9" stroke={i === 0 ? ACCENT : LINE} />
        </g>
      ))}
      <path d="M 159 104 H 214" stroke={LINE} strokeDasharray="3 5" />
    </>
  );
}

/** A faint grid of rounded blocks — the fallback ground. */
function Blocks() {
  const cells: Pt[] = [];
  for (let y = 0; y < 5; y++) for (let x = 0; x < 9; x++) cells.push([x * 44 - 6, y * 44 - 6]);
  return (
    <>
      {cells.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="34" height="34" rx="8" fill={FILL} />
      ))}
    </>
  );
}

const SCENES: Record<string, () => React.JSX.Element> = {
  careerflux: CareerMatch,
  'nexus-ai': AiCopilot,
  'enterprise-ai-knowledge-model': RagPipeline,
  'distributed-kv-store': ReplicaRing,
  medicare: Medication,
  'swagruha-food': FoodBowl,
  'finance-data': FinanceLock,
};

export default function ProjectArt({ projectId }: { projectId: string }) {
  const Scene = SCENES[projectId] ?? Blocks;
  return (
    <svg
      viewBox="0 0 360 208"
      preserveAspectRatio="xMidYMid slice"
      className="project-art absolute inset-0 h-full w-full"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <Scene />
    </svg>
  );
}
