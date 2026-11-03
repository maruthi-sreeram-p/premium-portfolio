export type ProjectCategory =
  | 'AI & Intelligent Systems'
  | 'Backend & Full-Stack'
  | 'Distributed & Event-Driven';

export type ProjectPriority = 'flagship' | 'engineering' | 'product';

export interface ArchitectureNode { id: string; label: string; x: number; y: number; color?: string; }
export interface ArchitectureConnection { from: string; to: string; }

/** Which accent token the card lights up with on hover. */
export type ProjectAccent = 'accent' | 'accent-2' | 'accent-3' | 'ember';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  priority: ProjectPriority;
  tech: string[];
  role: string;
  problem: string;
  approach: string;
  features: string[];
  architecture: { nodes: ArchitectureNode[]; connections: ArchitectureConnection[] };
  contribution: string;
  /**
   * Repo URL, or '' when there is no public repository. The card keeps its
   * footer slot either way, so every card stays the same shape.
   *
   * All of these were checked against the live GitHub account. The values this
   * file previously carried — distributed-kv-store, ipl-dashboard,
   * medication-tracker, swagruha-foods, finance-data-processing, devradar —
   * every single one pointed at a repo that does not exist. "Nexus AI" has no
   * public repo yet.
   *
   * Only finished projects belong in this list. Ideas that are not built yet
   * (CyberGuard Intelligence, IPL Live Cricket Dashboard, DevRadar) were
   * removed rather than shown as work.
   */
  github: string;
  /** Deployed demo, when one exists. Cards render the link only if set. */
  live?: string;
  accent: ProjectAccent;
}

const flow = (labels: string[]) => ({
  nodes: labels.map((label, i) => ({ id: `node-${i}`, label, x: 100, y: i * 80 })),
  connections: labels.slice(0, -1).map((_, i) => ({ from: `node-${i}`, to: `node-${i + 1}` })),
});

export const projects: Project[] = [
  {
    id: 'careerflux', title: 'CareerFlux', subtitle: 'Career intelligence platform', category: 'Backend & Full-Stack', priority: 'flagship',
    tech: ['Java 21', 'Spring Boot', 'React', 'Spring AI', 'PostgreSQL', 'Kafka', 'Flyway', 'JWT'], role: 'Full-Stack Developer',
    problem: 'Job boards list postings without saying where they came from or whether collecting them was appropriate, and rank them with scores nobody can explain.',
    approach: 'A career intelligence platform that finds relevant employers, checks each source may be read, tracks postings for change and explains every match.',
    features: [
      'Policy-gated source access: robots.txt and reviewed terms must clear before anything is read',
      'Job normalization, cross-source deduplication and change monitoring',
      'Deterministic, explainable matching with the strengths and gaps behind each score',
      'Resume onboarding, with optional Gemini-assisted parsing and match explanations',
      'Match alerts, saved / dismissed / applied tracking and an append-only audit record',
      'Greenhouse, Lever and Ashby source adapters; in-process or Kafka event transport',
    ],
    architecture: flow(['Source Policy', 'Ingestion', 'Job Intelligence', 'Matching', 'Alerts']),
    contribution: 'Designed and built the platform end to end — the Spring Boot backend modules, the ingestion pipeline and the React front end.', github: 'https://github.com/maruthi-sreeram-p/careerFlux', accent: 'accent-2',
  },
  {
    id: 'nexus-ai', title: 'Nexus AI', subtitle: 'Practical intelligent systems', category: 'AI & Intelligent Systems', priority: 'flagship',
    tech: ['AI', 'Knowledge', 'Intelligent Systems'], role: 'Engineering Project',
    problem: 'Knowledge, reasoning and application workflows often need to work together in one practical system.',
    approach: 'An intelligent AI-focused system designed around practical knowledge, reasoning and application workflows.',
    features: ['Knowledge-centered workflows', 'Reasoning-oriented interaction', 'Practical application focus'], architecture: flow(['Knowledge', 'Reasoning', 'Workflow']),
    contribution: 'Designed and developed the project as an exploration of practical intelligent software.', github: '', accent: 'accent-3',
  },
  {
    id: 'enterprise-ai-knowledge-model', title: 'Enterprise AI Knowledge Model', subtitle: 'Structured organizational knowledge system', category: 'AI & Intelligent Systems', priority: 'flagship',
    tech: ['Enterprise', 'Knowledge Systems', 'AI'], role: 'Engineering Project',
    problem: 'Organizations need structured ways to organize and work with their knowledge.',
    approach: 'An enterprise-oriented knowledge system focused on organizing and working with structured organizational knowledge.',
    features: ['Structured knowledge organization', 'Enterprise-oriented workflows', 'Knowledge model exploration'], architecture: flow(['Organization', 'Knowledge Model', 'AI Workflow']),
    contribution: 'Developed the project as an enterprise engineering study of structured knowledge systems.', github: 'https://github.com/maruthi-sreeram-p/enterprise-ai-knowledge-model', accent: 'accent-3',
  },
  {
    id: 'distributed-kv-store', title: 'Distributed Key-Value Store', subtitle: 'Replication and fault-tolerant systems', category: 'Distributed & Event-Driven', priority: 'engineering',
    tech: ['Java', 'Distributed Systems', 'Raft/KRaft'], role: 'Engineering Project',
    problem: 'Distributed storage requires careful handling of replication, leadership, logs and consistency.',
    approach: 'A distributed key-value storage project exploring replication, leader and follower behavior, logs, consistency and fault-tolerant system design.',
    features: ['Replication concepts', 'Leader/follower behavior', 'Log-oriented design', 'Consistency exploration', 'Fault-tolerant system design'], architecture: flow(['Client', 'Leader', 'Replication', 'Followers', 'Commit / Log']),
    contribution: 'Explored core distributed-systems patterns through a practical key-value storage project.', github: 'https://github.com/maruthi-sreeram-p/distributed-key-value-Store-using-kraft', accent: 'accent',
  },
  {
    id: 'medicare', title: 'MediCare — Online Medication & Prescription Tracker', subtitle: 'Full-stack prescription management platform', category: 'Backend & Full-Stack', priority: 'engineering',
    tech: ['Java', 'Spring Boot', 'React', 'MySQL', 'JWT', 'REST API'], role: 'Backend Lead Developer',
    problem: 'Medication and prescription workflows need secure access, persistent data and an accessible application interface.',
    approach: 'A full-stack prescription management platform with secure authentication, REST APIs, database integration and medication management workflows.',
    features: ['Spring Boot backend', 'REST APIs', 'JWT authentication', 'MySQL', 'React integration', 'Role-based access'], architecture: flow(['React', 'REST API', 'Spring Boot', 'Service Layer', 'JPA / Hibernate', 'MySQL']),
    contribution: 'Led backend development and connected the application services, APIs and data layer.', github: 'https://github.com/maruthi-sreeram-p/online-medication-and-prescription-tracker', accent: 'accent',
  },
  {
    id: 'swagruha-food', title: 'Swagruha Food — E-Commerce Platform', subtitle: 'Food ordering and product workflows', category: 'Backend & Full-Stack', priority: 'product',
    tech: ['React', 'Spring Boot', 'REST API', 'Database'], role: 'Full-Stack Developer',
    problem: 'A food business needs product management and application workflows connected through a reliable frontend and backend.',
    approach: 'A full-stack food/e-commerce application focused on product management, application workflows and frontend-backend integration.',
    features: ['E-commerce workflows', 'Product management', 'REST APIs', 'Database integration', 'Frontend/backend integration'], architecture: flow(['React Storefront', 'REST APIs', 'Spring Boot', 'Database']),
    contribution: 'Worked across the frontend and backend integration for the application workflows.', github: 'https://github.com/maruthi-sreeram-p/E-Commerce-Swagruha-food-s-', accent: 'ember',
  },
  {
    id: 'finance-data', title: 'Finance Data Processing & Access Control', subtitle: 'Backend data and controlled access', category: 'Backend & Full-Stack', priority: 'product',
    tech: ['Spring Boot', 'Access Control', 'Database', 'REST API'], role: 'Backend Developer',
    problem: 'Financial data needs processing and controlled access to application resources.',
    approach: 'A backend-oriented system focused on financial data processing and controlled access to application resources.',
    features: ['Data processing', 'Access control', 'Backend architecture', 'Database integration'], architecture: flow(['Client', 'Access Control', 'Data Processing', 'Database']),
    contribution: 'Worked on backend processing and controlled resource access patterns.', github: 'https://github.com/maruthi-sreeram-p/Finance-Data-Processing-and-Access-Control', accent: 'accent',
  },
];
