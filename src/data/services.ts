/** Which accent token the card lights up with. */
export type ServiceAccent = 'accent' | 'accent-2' | 'accent-3' | 'ember';

export interface Service {
  id: string;
  title: string;
  summary: string;
  /** What the client actually receives. */
  deliverables: string[];
  /**
   * Ids from `projects.ts` that back the claim. Resolved in the component, so
   * the title and repo link always come from the one source and cannot drift.
   */
  proof: string[];
  /** Shown in place of the proof row when no shipped project backs the service. */
  note?: string;
  accent: ServiceAccent;
}

export interface EngagementStep {
  title: string;
  body: string;
}

/** Shown beside the section heading. Change it when the calendar fills up. */
export const availability = 'Open to freelance projects';

export const services: Service[] = [
  {
    id: 'backend-apis',
    title: 'Backend & REST APIs',
    summary:
      'Spring Boot services your front end, mobile app or partners can build on — designed against a written API contract before any code is written.',
    deliverables: [
      'REST endpoints with validation and clear error responses',
      'JWT login with role-based access control',
      'MySQL or PostgreSQL schema design',
      'Postman collection covering every endpoint',
      'Docker setup for local and deployed runs',
    ],
    proof: ['medicare', 'finance-data'],
    accent: 'accent',
  },
  {
    id: 'fullstack-apps',
    title: 'Full-stack web apps',
    summary:
      'A React front end wired to a Spring Boot backend — storefronts, admin dashboards and booking-style workflows, delivered as one working product.',
    deliverables: [
      'React interface connected to your API',
      'Sign-in and role-based screens',
      'Admin dashboard for managing your data',
      'Deployable build with setup notes',
    ],
    proof: ['swagruha-food', 'medicare'],
    accent: 'accent-2',
  },
  {
    id: 'fix-and-finish',
    title: 'Fix & finish a Java project',
    summary:
      'Pick up a half-built or buggy Spring Boot application, find what is actually wrong, and bring it to a state you can ship.',
    deliverables: [
      'Written diagnosis of what is broken and why',
      'Fixes, with the reason for each change',
      'Auth, validation and error-handling gaps closed',
      'Handover notes for the next developer',
    ],
    proof: [],
    note: 'Send me the repository and a short description of what is going wrong.',
    accent: 'ember',
  },
];

export const engagementSteps: EngagementStep[] = [
  {
    title: 'Brief',
    body: 'Tell me what you are building. I reply with questions and a fixed-price quote, not an open-ended hourly guess.',
  },
  {
    title: 'Agree the shape',
    body: 'We settle the API and data model in writing before I build, so scope is clear and changes are still cheap.',
  },
  {
    title: 'Build in short cycles',
    body: 'You get something running to open and click through at each step, not just a status message.',
  },
  {
    title: 'Deliver',
    body: 'A deployable build, documentation and a handover. Software that only runs on my machine is not delivered.',
  },
];

export const bestFit = [
  'New MVPs for startups',
  'Small-business web apps',
  'An API for an existing front end',
  'Unfinished or buggy Spring Boot projects',
];

export const alsoBuilds = [
  'Kafka event pipelines',
  'Redis caching',
  'Workflow automation',
  'Docker deployment',
];
