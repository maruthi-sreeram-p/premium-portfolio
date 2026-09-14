# P. Maruthi Sreeram — Portfolio

A cinematic developer portfolio. React 19 + TypeScript + Vite 8 + Tailwind CSS 4,
with GSAP ScrollTrigger, Lenis, Framer Motion and a single React Three Fiber scene.

```bash
npm install
npm run dev      # local dev server
npm run build    # tsc -b && vite build  →  dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```

## Setup checklist

Three things need your input before this is fully live.

### 1. Resume

Drop your CV at `public/resume.pdf`. It is linked from the header, hero, contact
section, footer and mobile menu via `personal.resumeUrl`. **The file is not in
the repo yet, so those links currently 404.**

### 2. Contact form delivery

The form posts to [Web3Forms](https://web3forms.com) — free, no account, no server.
Enter your email on their site and they mail you an access key.

```bash
cp .env.example .env
# then paste the key into .env:
#   VITE_WEB3FORMS_KEY=your-key-here
```

Without a key the form still works, but falls back to opening the visitor's own
mail client — which loses submissions from anyone browsing without one.

`.env` is gitignored. Note that Vite inlines any `VITE_`-prefixed variable into
the client bundle, so this key is visible in the shipped JS. That's expected for
Web3Forms — lock the key to your domain in their dashboard.

If you deploy on Netlify, Vercel or GitHub Pages, add `VITE_WEB3FORMS_KEY` to
that host's environment variables too, or the deployed build won't have it.

### 3. Site URL

`personal.siteUrl` in `src/data/personal.ts` and the canonical / Open Graph tags
in `index.html` still point at the previous GitHub Pages URL. Update both.

If you deploy to a GitHub Pages **project** page (`user.github.io/repo-name/`),
also set the base path in `vite.config.ts`:

```ts
export default defineConfig({
  base: '/your-repo-name/',
  // ...keep the existing plugins and build config
})
```

Optionally add a `public/og-image.png` (1200×630) — `index.html` already
references it for link previews on LinkedIn, X and WhatsApp. It is also missing
today, so link previews will show no image.

## Where things live

```
src/
  data/                  all content — edits usually mean touching only this
    personal.ts          identity, headline, bio, principles, contact details
    projects.ts          nine projects: problem, approach, architecture, links
    skills.ts            five disciplines, each technology with a usage note
    experience.ts        the journey timeline
    nav.ts               section index, shared by header and mobile menu
    systemFlow.ts        the hero flow diagram — nodes, edges, grid positions
    engineeringNotes.ts  concept cards under the skills section
  lib/
    motion.ts            shared easings, durations, stagger and reveal variants
    gsap.ts              single GSAP plugin registration point
    scroll.ts            Lenis setup, scroll lock, scrollToSection helpers
    pointer.ts           one global pointer loop shared by every mouse effect
  hooks/
    useDeviceTier.ts     the capability gate every effect checks
    useMagnetic.ts       magnetic hover for buttons
    useTilt.ts           3D tilt + spotlight tracking for cards
    useCountUp.ts        viewport-triggered stat counters
    useCurvedScroll.ts   the concave scroll surface, shared by hero + sections
  components/
    fx/                  Backdrop, AmbientField (+ lazy Field3D WebGL),
                         CursorLayer, BootSequence, RevealText, TypeText,
                         CardReveal, Marquee, SystemDiagram
    layout/              Header, Footer, MobileMenu, Container, SectionWrapper
    sections/            Hero, About, Skills, Projects, Experience, Contact
    shared/              Button, Reveal, SectionHeading, ProjectCard,
                         ProjectDialog, ArchitectureFlow, SkillIcon, SocialIcons
```

## Design system

All colour, type and motion tokens live in `src/index.css`.

- **Surfaces** are near-black and deep navy; **accents** are electric blue
  (`--accent`), cyan (`--accent-2`), violet (`--accent-3`) and the original brand
  ember (`--ember`), kept for warm interaction states.
- **Type** is Sora (display) and Inter (body and the small `.label` captions).
  Headings are set in sentence case, not all-caps.
- Runtime values are plain CSS custom properties on `:root`, **deliberately not
  Tailwind `@theme` colour tokens**. Tailwind v4 generates a utility per
  `--color-*` entry, and a token named `--color-base` silently produced a
  *colour* utility called `text-base` that collided with the built-in font-size
  utility — every `text-base` element rendered near-black. Plain custom
  properties consumed as `text-[var(--fg)]` cannot collide. JavaScript and the
  WebGL shader read the same properties, so the 3D field recolours with the
  theme rather than hard-coding hexes.
- `--vfx` is a master dial for the cinematic layer. Light theme turns it down to
  `0.35`; `prefers-reduced-motion` sets it to `0`.

Every text colour clears WCAG AA (4.5:1) against its background in both themes.

## Motion system

One reveal primitive (`shared/Reveal`), one easing vocabulary (`lib/motion.ts`).
Scroll is driven by Lenis, bound to GSAP's ticker so Lenis, GSAP and ScrollTrigger
all share a single clock — otherwise pinned and scrubbed effects drift a frame
behind the content.

**Rotation is the site's shared motif.** One 3D field turns behind the entire
document, and every block hinges upright as it arrives, so the whole page moves
with one idea rather than a different trick per section.

| Effect | Where | Trigger |
| --- | --- | --- |
| Rotating particle field | Fixed behind every section | WebGL, pointer + scroll |
| Lit shards + haze | Same scene, behind everything | WebGL, orbiting lights |
| Camera moves | Six framed shots across the page | Scroll-driven |
| Boot sequence | First load | Once per session, skippable |
| Masked line reveal | Hero, section headings, contact | Mount or in-view |
| Depth tilt (blocks) | Cards, stats, skills, timeline, channels | In-view, once |
| Concave scroll | Hero and every section | Scroll-scrubbed, continuous |
| Card reveal + edge draw | Project cards | In-view, once, staggered |
| Scrolling headline | Band between hero and About | Continuous, pauses on hover |
| Flow pulse | Project architecture chains | Card hover, staggered |
| Electric ring | Buttons, primary links | Hover **and** focus |
| Ember trail | Arrow glyphs | Hover / focus |
| Magnetic pull + tilt | Buttons, project cards | Fine pointer only |
| Timeline rail | Experience | Scroll-scrubbed |

## Performance and capability tiering

`useDeviceTier` is the single gate. Everything expensive asks it first rather
than re-implementing its own breakpoint checks.

- **high** — desktop, fine pointer, capable hardware: full experience including
  the site-wide WebGL field (2400 particles) and the custom cursor.
- **mid** — tablets and coarse pointers: reduced particle count, no cursor.
- **low** — phones, weak hardware, or `prefers-reduced-motion`: no WebGL at all
  (a designed CSS/SVG constellation stands in), no cursor, no curved scroll, and
  native scrolling instead of Lenis.

Other deliberate choices:

- Three.js is behind `React.lazy`, so it is a separate ~228kB gzipped chunk that
  devices below `high` never download.
- There is exactly **one** WebGL context on the page. It is mounted once and
  never unmounted — repeatedly creating and destroying contexts is what exhausts
  the browser's limit and leaves a black canvas — and it switches to
  `frameloop="never"` whenever the tab is hidden.
- All mouse-reactive effects share one `pointermove` listener and one rAF loop
  (`lib/pointer.ts`) that writes to a mutable record — pointer movement never
  triggers a React render.
- Animations move `transform` and `opacity` only.
- Stat counters write directly to DOM nodes rather than through state, to avoid
  ~60 renders/second for text nothing else reads.
- The custom cursor's dot is written straight to `transform` on the raw pointer
  position with no tween — any easing at all is perceptible as cursor lag. Only
  the ring is allowed to trail, and only by ~160ms.

## Accessibility

- Semantic landmarks, one `h1`, no skipped heading levels, skip-to-content link.
- The skills section is a real tablist (arrow keys, Home/End, roving tabindex).
- Project details use the native `<dialog>` element, so focus trapping, Escape
  and top-layer stacking come from the platform. React state is the source of
  truth for open/closed, so the dialog and the scroll lock cannot drift apart.
- The mobile menu traps focus and restores it to the trigger on close.
- Focus-visible drives the same electric ring as hover — keyboard users get the
  identical affordance, not a lesser one.
- `MotionConfig reducedMotion="user"` is required: the CSS reduced-motion block
  only reaches CSS animations, and Framer Motion drives its values in JS.
- Icon-only controls carry ≥24px hit areas via padding/negative-margin pairs.

## Theming

Light/dark is driven by `data-theme` on `<html>`. The inline script in
`index.html` sets it before first paint (no flash), `App.tsx` persists the choice
to `localStorage`, and every colour resolves from the custom properties in
`src/index.css`.

Dark is the canonical, cinematic theme. Light is a genuine daylight variant with
the VFX dial turned down — restrained rather than a colour inversion.

## The concave scroll

`useCurvedScroll` maps the hero and every section onto the inside of a very
large cylinder, so the page reads as though printed on a dish:

    rotateX = -d * 13deg          (d = -1 below the viewport ... +1 above it)
    z       = -240px * (1 - |d|)  (middle furthest, edges nearest)

Two details are load-bearing. The negative-z form pushes the *middle* away
rather than pulling the edges toward the camera — translating toward the viewer
would scale content past its container and clip it. And `rotateX` is 0 at
d = 0, so a section is perfectly flat exactly where it is being read; the curve
never costs legibility.

The perspective is 1200px. A longer focal length made the effect almost
invisible — an earlier version at 1600px with a 6deg limit measured 2.6deg in
practice and simply read as nothing.

## Gotchas worth knowing

These look wrong until you know why:

- **No `--color-*` tokens in `@theme`.** Tailwind v4 generates a utility per
  colour token; `--color-base` produced a *colour* utility named `text-base`
  that collided with the font-size utility and painted half the page near-black.
- **`* { min-width: 0 }`** exists so long technology names cannot blow out grid
  tracks — but it also lets flex items collapse below their content, which is
  why `Button` carries `shrink-0`.
- **Tailwind preflight sets `svg { display: block }`**, so an icon inside a
  block wrapper stacks above its label. `Button` wraps its children in an
  `inline-flex` span for exactly this reason.
- **Architecture flow nodes are `shrink-0`, never `flex-1`.** Equal-share nodes
  compressed the five- and six-step paths until the labels spilled across the
  connectors; they wrap now instead.
- **Framer Motion's `ease` applies across the whole keyframe timeline**, not per
  segment. A very front-loaded curve (expo) squashes the `times` array badly —
  it once collapsed an "assembled" hold to a few frames. Passing an array of
  per-segment eases silently broke the opacity track entirely, so the fix was a
  gentler single curve.
- **`backdrop-filter` is banned on cards.** Nine of them, each inside a
  perspective-transformed section, meant nine live blurs re-sampling a moving
  WebGL backdrop every frame — the single biggest cause of scroll stutter. A
  slightly more opaque flat fill is visually near-identical over a dark ground.
- **Lenis uses `lerp`, not `duration`.** Duration-based smoothing runs a fixed
  tween per wheel event, so the page keeps gliding after the input stops —
  which is exactly what "smooth scrolling feels laggy" means. A lerp follows the
  target continuously and settles fast.
- **The curved sections must not carry `preserve-3d`.** They are flat planes
  being tilted, not 3D scenes; preserve-3d would rasterise their entire
  subtrees, on sections several thousand pixels tall.
- **Never pair `block` with `line-clamp-*`.** The clamp only works while the
  element is `display: -webkit-box`; a `block` class beside it overrides that
  and the "clamped" text wraps freely. That is how a long project title once
  painted straight over its own subtitle.

## Project cards are deliberately uniform

`ProjectCard` fixes the height of every region — meta row, title, subtitle,
description, flow, tech, footer — and caps the flow at four nodes and the tech
list at five chips, with a "+N" pill for the rest. The grid is two-up on
desktop and one-up below it; flagship work is marked with a pill rather than a
wider cell.

The caps and the fixed heights are coupled, and both are set against the real
measured card width. Three-up squeezed a card to ~380px, which forced the lists
down to three items each; two-up gives ~580px, where both fit on a single row.
The phone layout still needs two rows, which is why those heights are
responsive (`h-[4.25rem] md:h-[2.15rem]`). Changing the column count means
re-measuring both.

The title is the one region that is only fixed from `lg` up, where cards sit
side by side: there it gets a two-line box, bottom-aligned so the gap to the
subtitle is the same on every card. Below `lg` the cards stack, there is no
neighbour to line up with, and the longest title needs three lines on a phone —
so it takes its natural height rather than being truncated.

This is all load-bearing. The projects themselves vary (flows of three to six
steps, tech lists of three to six, some with a public repo and some without),
and without the fixed regions the nine cards rendered at three different
heights. The footer renders even when there is no repo link, with a spacer in
the icon's place, so the bottom edge lines up. Full detail lives in the dialog.

## The hero flow diagram is data, not drawing

`data/systemFlow.ts` declares the nodes and edges; `fx/SystemDiagram.tsx` knows
how to draw *a* flow and nothing about what this one contains.

Two things are deliberately decoupled:

- **Nodes declare a grid position** (`col`, `row`), never pixels. The component
  maps the grid onto the canvas, so moving a node to another column is a
  one-number edit.
- **Edges reference nodes by id** (`{ from: 'api', to: 'service' }`), never a
  path string. The component picks the two box edges that face each other —
  bottom-to-top for a vertical step, side-to-side for a horizontal one — so
  lines re-anchor themselves when anything moves.

An earlier version hard-coded both the labels and literal paths like
`M 120 38 L 120 74`, which meant renaming one node required re-deriving five
sets of coordinates by hand. A bad `from`/`to` id now drops that single edge
rather than throwing.

Verified after the rewrite: every edge endpoint lands exactly on a node border,
computed rather than authored.
