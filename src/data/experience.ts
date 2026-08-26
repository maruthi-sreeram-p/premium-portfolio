export interface JourneyEntry {
  id: string;
  /**
   * Timeline marker shown beside the node.
   *
   * These are deliberately *stage* labels rather than invented dates. Replace
   * them with real periods ("2023 — 2024", "Jun 2025") as they become
   * applicable; the layout is sized for both.
   */
  period: string;
  title: string;
  context: string;
  description: string;
  /** Highlights rendered as small technical chips under the entry. */
  highlights: string[];
  /** Marks the entry that is happening now — it gets a live pulse. */
  current?: boolean;
}

export const journey: JourneyEntry[] = [
  {
    id: 'foundations',
    period: 'Foundation',
    title: 'Computer Science Fundamentals',
    context: 'B.Tech — Computer Science & Engineering',
    description:
      'Data structures, algorithms, operating systems and databases — the layer everything else is built on. Java became the language I chose to go deep in rather than broad across many.',
    highlights: ['Java', 'Data Structures', 'DBMS', 'Operating Systems'],
  },
  {
    id: 'backend',
    period: 'Core',
    title: 'Backend Engineering',
    context: 'Spring Boot, REST and persistence',
    description:
      'Moved from writing code to designing services: layered architecture, REST contracts, JWT authentication and role-based access, with Hibernate and JPA over MySQL. This is where the habits formed — separation of concerns, testable services, and APIs designed before they are implemented.',
    highlights: ['Spring Boot', 'Spring Security', 'Hibernate', 'MySQL'],
  },
  {
    id: 'fullstack',
    period: 'Applied',
    title: 'Full-Stack Delivery',
    context: 'MediCare · Swagruha Food',
    description:
      'Took backends all the way to shipped products. Led backend development on a prescription-tracking platform and built the storefront and services for an e-commerce application — connecting React front-ends to Spring Boot APIs and owning the integration between them.',
    highlights: ['React', 'REST APIs', 'JWT', 'Integration'],
  },
  {
    id: 'distributed',
    period: 'Depth',
    title: 'Distributed & Event-Driven Systems',
    context: 'IPL Dashboard · Distributed KV Store',
    description:
      'Went after the harder problems: Kafka-based event processing with Redis caching behind a live data dashboard, and a key-value store exploring replication, leader and follower behaviour, log-oriented design and fault tolerance from first principles.',
    highlights: ['Apache Kafka', 'Redis', 'Replication', 'Consensus'],
  },
  {
    id: 'ai',
    period: 'Current focus',
    title: 'Intelligent Systems',
    context: 'Nexus AI · Enterprise Knowledge Model · CyberGuard',
    description:
      'Building systems where knowledge, reasoning and application workflows work together — enterprise knowledge modelling and AI-assisted security assessment, applied to real workflows rather than as demos.',
    highlights: ['AI Systems', 'Knowledge Modelling', 'Security Intelligence'],
    current: true,
  },
];
