/**
 * Icon key, resolved to a component in Skills.tsx.
 *
 * These are semantic marks (a coffee cup for Java, a shield for Spring
 * Security) rather than official brand logos. Redrawing brand marks from
 * memory reliably gets them subtly wrong, and a not-quite-right logo looks
 * worse than an honest symbol — swap in a brand icon set here if you want the
 * real marks.
 */
export type SkillIcon =
  | 'java' | 'spring' | 'security' | 'orm' | 'repository' | 'api'
  | 'database' | 'document' | 'cache'
  | 'stream' | 'queue'
  | 'react' | 'javascript' | 'markup' | 'styles'
  | 'git' | 'github' | 'container' | 'request' | 'build';

export interface Skill {
  name: string;
  icon: SkillIcon;
  /** One line explaining how it is actually used — shown on hover/focus. */
  note: string;
  /** Marks the technologies that are genuinely core, not just familiar. */
  core?: boolean;
}

export interface SkillGroup {
  id: string;
  label: string;
  /** Two-digit index rendered as a HUD marker. */
  index: string;
  /** Which accent token this group lights up with. */
  accent: 'accent' | 'accent-2' | 'accent-3' | 'ember';
  summary: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'backend',
    label: 'Backend',
    index: '01',
    accent: 'accent',
    summary: 'Where most of the work happens — services, contracts and business logic.',
    skills: [
      { name: 'Java', icon: 'java', note: 'Primary language across every backend project.', core: true },
      { name: 'Spring Boot', icon: 'spring', note: 'Services, REST controllers, dependency injection.', core: true },
      { name: 'Spring Security', icon: 'security', note: 'JWT auth and role-based access control.', core: true },
      { name: 'Hibernate', icon: 'orm', note: 'ORM mapping and entity lifecycle management.' },
      { name: 'Spring Data JPA', icon: 'repository', note: 'Repository abstractions over relational stores.' },
      { name: 'REST APIs', icon: 'api', note: 'Resource design, status codes, pagination, versioning.', core: true },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    index: '02',
    accent: 'accent-2',
    summary: 'Relational where structure matters, document where it does not, cache in front.',
    skills: [
      { name: 'MySQL', icon: 'database', note: 'Primary relational store — schema design and indexing.', core: true },
      { name: 'PostgreSQL', icon: 'database', note: 'Relational workloads needing richer types and constraints.' },
      { name: 'MongoDB', icon: 'document', note: 'Document storage for flexible, evolving shapes.' },
      { name: 'Redis', icon: 'cache', note: 'Cache-aside, TTL management and hot-path reads.', core: true },
    ],
  },
  {
    id: 'messaging',
    label: 'Messaging',
    index: '03',
    accent: 'accent-3',
    summary: 'Decoupling producers from consumers so systems scale independently.',
    skills: [
      { name: 'Apache Kafka', icon: 'stream', note: 'Event streaming behind the live cricket dashboard.', core: true },
      { name: 'RabbitMQ', icon: 'queue', note: 'Queue-based task distribution and retries.' },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    index: '04',
    accent: 'accent',
    summary: 'Enough front-end depth to ship the whole product, not just its API.',
    skills: [
      { name: 'React', icon: 'react', note: 'Component architecture and state for full-stack builds.', core: true },
      { name: 'JavaScript', icon: 'javascript', note: 'Application logic and browser APIs.' },
      { name: 'HTML', icon: 'markup', note: 'Semantic, accessible document structure.' },
      { name: 'CSS', icon: 'styles', note: 'Layout systems, responsive design and motion.' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    index: '05',
    accent: 'ember',
    summary: 'The everyday loop — version control, containers, builds and API testing.',
    skills: [
      { name: 'Git', icon: 'git', note: 'Branching, rebasing and history hygiene.', core: true },
      { name: 'GitHub', icon: 'github', note: 'Reviews, issues and CI workflows.' },
      { name: 'Docker', icon: 'container', note: 'Containerised services and reproducible environments.' },
      { name: 'Postman', icon: 'request', note: 'API contract testing and collection-driven checks.' },
      { name: 'Maven', icon: 'build', note: 'Dependency management and build lifecycle.' },
    ],
  },
];

/** Real count, derived — never a number typed by hand that can drift. */
export const totalSkills = skillGroups.reduce((sum, g) => sum + g.skills.length, 0);
