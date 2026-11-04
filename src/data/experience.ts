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
      'Took backends toward shipped products. Led backend development in a four-person team on a prescription-tracking platform, and built the Spring Boot, Spring Security and MySQL foundation of a food-ordering backend.',
    highlights: ['Spring Boot', 'Spring Security', 'JWT', 'MySQL'],
  },
  {
    id: 'distributed',
    period: 'Depth',
    title: 'Distributed & Event-Driven Systems',
    context: 'Raft Key-Value Store · CareerFlux',
    description:
      'Went after the harder problems: a key-value store built on the Raft consensus algorithm, with leader election, log replication, durable storage and linearizable reads, and an ingestion pipeline that runs on an in-process bus or on Kafka with the same topics and handlers.',
    highlights: ['Raft consensus', 'Log replication', 'Apache Kafka', 'Event-driven design'],
  },
  {
    id: 'ai',
    period: 'Current focus',
    title: 'Intelligent Systems',
    context: 'Medicare Nexus AI · Enterprise AI Knowledge Base · CareerFlux',
    description:
      'Building systems where the AI is wrapped in code that can be checked — answers that cite the passages they came from, a medication assistant with safety guardrails, and career matching that explains every score.',
    highlights: ['Retrieval-augmented answers', 'Spring AI', 'Explainable matching'],
    current: true,
  },
];
