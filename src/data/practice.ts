/**
 * Practice work: a learning site and two debugging laboratories, built to
 * learn with rather than as client or product work.
 *
 * Every figure below comes from the project's own README or live site — nothing
 * is estimated. If a project changes, update the numbers here from the source.
 */
export interface PracticeItem {
  id: string;
  /** Short caption above the title. */
  kind: string;
  title: string;
  summary: string;
  /** Two or three headline facts, shown as a row of figures. */
  stats: { value: string; label: string }[];
  tags: string[];
  /** Repository, when there is one. */
  github?: string;
  /** Deployed site, when there is one. */
  live?: string;
}

export const practice: PracticeItem[] = [
  {
    id: 'java-trail',
    kind: 'Learning platform',
    title: 'JavaTrail',
    summary:
      'A structured path from fresher to working Java developer: the language and JVM, Spring, databases, microservices, system design and interviews, in order, with chapters, practice questions and SQL you can run in the browser.',
    stats: [
      { value: '104', label: 'steps' },
      { value: '710', label: 'chapters' },
      { value: '11', label: 'stages' },
    ],
    tags: ['Built with AI', 'Learning paths', 'Practice questions', 'SQL in the browser'],
    live: 'https://java-trail.vercel.app/',
  },
  {
    id: 'java-debugging-playground',
    kind: 'Debugging laboratory',
    title: 'Java Backend Debugging Laboratory',
    summary:
      'Twenty standalone Spring Boot projects that each misbehave on purpose. Read the spec, reproduce the failure, form a theory and find the root cause, with graded hints and a sealed answer key.',
    stats: [
      { value: '20', label: 'projects' },
      { value: 'Graded', label: 'hints' },
    ],
    tags: ['Built with AI', 'Spring Boot', 'JPA', 'Spring Security', 'JWT', 'Docker'],
    github: 'https://github.com/maruthi-sreeram-p/java-debugging-playground',
  },
  {
    id: 'spring-boot-debugging-laboratory',
    kind: 'Debugging laboratory',
    title: 'Spring Boot Debugging Laboratory',
    summary:
      'Fifteen backend applications that look and behave like real company code, subtly broken the way production code is. Databases, caching, messaging, security and concurrency, rising from easy to enterprise scale.',
    stats: [
      { value: '15', label: 'applications' },
      { value: '2 → 10', label: 'difficulty' },
    ],
    tags: ['Built with AI', 'Spring Boot', 'PostgreSQL', 'Redis', 'Kafka', 'RabbitMQ'],
    github: 'https://github.com/maruthi-sreeram-p/spring-boot-debugging-laboratory',
  },
];
