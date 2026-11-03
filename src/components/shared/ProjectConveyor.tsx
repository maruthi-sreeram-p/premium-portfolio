import type { Project } from '../../data/projects';
import ProjectCard from './ProjectCard';

interface ProjectConveyorProps {
  projects: Project[];
  onOpen: (project: Project) => void;
}

/** Seconds each card adds to one full pass. Longer = calmer. */
const SECONDS_PER_CARD = 9;

/**
 * The project cards as one continuous, looping band — the same mechanism as the
 * stack-name marquee (`.marquee` in index.css), carrying cards instead of words.
 *
 * The track holds the list twice and translates by exactly -50%, so when the
 * loop restarts the second copy sits where the first began and the seam cannot
 * be seen. Each item carries its own trailing gap (padding, not `gap`) so that
 * half the track is exactly one list long.
 *
 * The second copy is decoration: it is `inert`, which takes it out of the tab
 * order and the accessibility tree, and its cards do not take part in the
 * open-project morph (a layout id may only exist once).
 *
 * Pauses while hovered or focused so a card can be read and clicked.
 */
export default function ProjectConveyor({ projects, onOpen }: ProjectConveyorProps) {
  const row = (copy: 'primary' | 'echo') => (
    <ul
      className="marquee-row"
      // Cards are different heights below the `lg` breakpoint; stretch them so
      // the band reads as one even strip.
      style={{ alignItems: 'stretch' }}
      inert={copy === 'echo' || undefined}
      aria-hidden={copy === 'echo' || undefined}
    >
      {projects.map((project, i) => (
        <li
          key={project.id}
          className="flex w-[20.25rem] shrink-0 pr-5 sm:w-[23.25rem] md:w-[35.25rem]"
        >
          <ProjectCard
            project={project}
            onOpen={onOpen}
            index={i}
            instant
            primary={copy === 'primary'}
          />
        </li>
      ))}
    </ul>
  );

  return (
    // Full-bleed: break out of the page container so cards slide in from the
    // screen edge. The vertical padding is room for the hover lift and tilt,
    // which `.marquee`'s overflow clip would otherwise cut off.
    <div className="relative ml-[calc(50%-50vw)] w-screen">
      <div className="marquee py-10">
        <div
          className="marquee-track"
          style={{ animationDuration: `${Math.max(projects.length * SECONDS_PER_CARD, 30)}s` }}
        >
          {row('primary')}
          {row('echo')}
        </div>
      </div>
    </div>
  );
}
