/**
 * The page's ground.
 *
 * One fixed, `pointer-events: none` layer behind every section: a flat zinc
 * fill with a barely-there lift at the top. Nothing on it moves — no grid, no
 * pointer-following glow — so the content is the only thing that draws the eye.
 */
export default function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 60% at 50% -10%, color-mix(in srgb, var(--fg) 5%, transparent) 0%, transparent 60%), var(--shell)',
        }}
      />
    </div>
  );
}
