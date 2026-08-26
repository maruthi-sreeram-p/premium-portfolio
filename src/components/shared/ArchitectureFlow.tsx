import type { Project } from '../../data/projects';

interface ArchitectureFlowProps {
  /** Only the nodes are drawn, so callers may pass a trimmed list. */
  architecture: { nodes: Project['architecture']['nodes'] };
  accent: string;
  /** `card` is the compact form used inside a project card. */
  size?: 'card' | 'detail';
}

/**
 * A project's request path, rendered from its real node data.
 *
 * This exists because there are no project screenshots in this repository, and
 * a row of stock placeholder images would say nothing. For a backend portfolio
 * the request path *is* the artwork: "Client → Leader → Replication →
 * Followers → Commit" tells a senior reader more about the work in one line
 * than a screenshot of a dashboard would.
 *
 * Layout note: an earlier version gave each node `flex-1`, which made every
 * node claim an equal share of the row. On the five- and six-node projects
 * that compressed the labels to ~51px while `whitespace-nowrap` kept the text
 * at full width, so the text spilled across the connectors. Nodes are now
 * `shrink-0` at their natural width and the row simply wraps — a path can grow
 * to any length and stay legible.
 */
export default function ArchitectureFlow({
  architecture,
  accent,
  size = 'card',
}: ArchitectureFlowProps) {
  const nodes = architecture.nodes;
  const compact = size === 'card';

  return (
    <ol
      className="flex flex-wrap items-center gap-x-1.5 gap-y-2"
      style={{ ['--flow-accent' as string]: accent }}
    >
      {nodes.map((node, i) => (
        <li key={node.id} className="flex shrink-0 items-center gap-1.5">
          {i > 0 && (
            <span
              aria-hidden="true"
              className={`select-none leading-none transition-colors duration-500 ${
                compact ? 'text-[0.7rem]' : 'text-xs'
              }`}
              style={{ color: 'var(--fg-faint)' }}
            >
              ›
            </span>
          )}
          <span
            className={`whitespace-nowrap rounded-md border tracking-[0.02em] transition-[color,border-color,background-color,box-shadow] duration-500 ${
              compact ? 'px-2 py-1 text-[0.6875rem]' : 'px-3 py-1.5 text-xs'
            }`}
            style={{
              borderColor: 'var(--rule-strong)',
              background: 'color-mix(in srgb, var(--fg) 4%, transparent)',
              color: 'var(--fg-soft)',
              // Staggered delay turns the card's single hover into a pulse
              // travelling down the chain, one node after another. Cheaper and
              // far more robust than animating a gradient along each connector,
              // which cannot survive the row wrapping.
              transitionDelay: `${i * 70}ms`,
            }}
            data-flow-node
          >
            {node.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
