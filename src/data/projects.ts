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
   * Every project here was checked against its repository's own README and
   * file list. Where the repo did not support something this file used to
   * claim, the claim was removed rather than kept:
   *   • the distributed key-value store's GitHub repository holds only a
   *     LICENSE file. The real code is a local Raft implementation (checked
   *     there: election, replication, durable storage, linearizable reads), so
   *     the card describes that, and has no repo link until it is pushed;
   *   • the Swagruha repository is a Spring Boot / MySQL backend only, with no
   *     React front end and no controllers yet;
   *   • MediCare's README lists the owner as "Backend Developer"; the owner
   *     confirms the role was Backend Lead Developer, so that is what is shown.
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
    id: 'nexus-ai', title: 'Medicare Nexus AI', subtitle: 'Intelligent medication copilot', category: 'AI & Intelligent Systems', priority: 'flagship',
    tech: ['Java 21', 'Spring Boot', 'React', 'TypeScript', 'Gemini', 'JWT'], role: 'Engineering Project',
    problem: 'Medication management, adherence tracking and pharmacy stock are usually handled in separate tools, with no help for the patient in understanding their own prescription.',
    approach: 'An AI-assisted medication platform with portals for physicians, patients, pharmacy staff and administrators, and a Gemini-backed assistant that explains prescriptions within safety guardrails.',
    features: [
      'Physician portal with regimen evaluation, drug-interaction and duplicate-therapy checks',
      'Patient portal with a daily schedule, one-click Taken / Missed logging and adherence streaks',
      'Prescription Q&A in six languages, with a non-diagnostic safety constraint',
      'Pharmacy stock management with depletion forecasting and batch-expiry alerts',
      'Administrator view of activity, adherence-risk watchlists and user permissions',
      'JWT-secured Spring Boot API with OpenAPI documentation',
    ],
    architecture: flow(['React', 'Spring Boot', 'Gemini AI', 'Safety Guardrails']),
    contribution: 'Built the application as an AI-assisted extension of the MediCare idea, with role-based portals over a Spring Boot and React stack.', github: 'https://github.com/maruthi-sreeram-p/medcare-nexus-ai', accent: 'accent-3',
  },
  {
    id: 'enterprise-ai-knowledge-model', title: 'Enterprise AI Knowledge Base', subtitle: 'Cited answers from your own documents', category: 'AI & Intelligent Systems', priority: 'flagship',
    tech: ['Java 21', 'Spring AI', 'Gemini', 'pgvector', 'Redis', 'Next.js'], role: 'Engineering Project',
    problem: 'Company knowledge is scattered across documents, and a general chatbot makes things up and has no idea who is allowed to read what.',
    approach: 'A multi-tenant knowledge base where an organization uploads its documents and people ask questions in plain language. Retrieval is restricted to the asker\'s organization and role first, and every answer cites the passages it came from.',
    features: [
      'Upload PDF, DOCX and TXT; extraction, per-page chunking and embedding into pgvector',
      'Answers grounded in retrieved passages, with citations and real page numbers',
      'Tenant and role filtering applied inside the vector search, before the model sees anything',
      'JWT sessions, ADMIN / MANAGER / EMPLOYEE roles and an audit log',
      'Per-user rate limiting in Redis; in-process or Kafka ingestion',
    ],
    architecture: flow(['Upload', 'Chunk & Embed', 'Filtered Retrieval', 'Cited Answer']),
    contribution: 'Built the Spring Boot application, its retrieval pipeline and the web client.', github: 'https://github.com/maruthi-sreeram-p/enterprise-ai-knowledge-model', accent: 'accent-3',
  },
  {
    id: 'distributed-kv-store', title: 'Distributed Key-Value Store', subtitle: 'A Raft-replicated store, built from scratch', category: 'Distributed & Event-Driven', priority: 'engineering',
    tech: ['Java 21', 'Spring Boot', 'Raft', 'Distributed Systems', 'JUnit'], role: 'Engineering Project',
    problem: 'A store that must keep working when a node dies has to agree on what was written, in what order, and who is in charge, without losing an acknowledged write.',
    approach: 'A key-value store replicated across three nodes with the Raft consensus algorithm, written from the paper: leader election, log replication, durable storage and reads that are either linearizable or deliberately stale.',
    features: [
      'Leader election with randomized timeouts and RequestVote, plus heartbeats and automatic failover',
      'Log replication with follower repair; an entry commits once a majority has it',
      'Durable state: fsync before every acknowledgement, CRC32 per record, torn-write recovery and an OS file lock',
      'Any node answers any request over HTTP; followers forward to the leader',
      'Linearizable reads confirmed with a majority, stale reads that never block, and check-quorum on the leader',
      '109 source files with 40 test classes; the Raft rules are kept free of clocks and sockets so they can be tested directly',
    ],
    architecture: flow(['Client', 'Leader', 'Replication', 'Followers', 'Commit / Log']),
    contribution: 'Designed and implemented the cluster end to end, layer by layer: the Raft domain model, election, replication, persistence and the client API.', github: '', accent: 'accent',
  },
  {
    id: 'medicare', title: 'MediCare — Online Medication & Prescription Tracker', subtitle: 'Prescription and adherence platform', category: 'Backend & Full-Stack', priority: 'engineering',
    tech: ['Java', 'Spring Boot', 'React', 'MySQL', 'JWT', 'FastAPI', 'Groq'], role: 'Backend Lead Developer',
    problem: 'Patients forget doses, doctors cannot see adherence, and hospital staff track medication by hand with no central system.',
    approach: 'A role-based platform for doctors, patients, staff and admins: digital prescriptions with per-slot time windows, automatic On time / Late / Missed classification, live dashboards and an AI assistant that reads the patient\'s real prescriptions.',
    features: [
      'Digital prescriptions with morning, afternoon and night slots',
      'Doses classified automatically from the backend clock',
      'Live dashboards for admin, doctor, patient and staff',
      'JWT authentication with BCrypt and role-based access',
      'AI medication assistant (Groq, Llama 3.1) that answers from the patient\'s own prescription data',
    ],
    architecture: flow(['React', 'REST API', 'Spring Boot', 'Service Layer', 'JPA / Hibernate', 'MySQL']),
    contribution: 'Led backend development in a four-person internship team — the Spring Boot services, JWT security and the data layer.', github: 'https://github.com/maruthi-sreeram-p/online-medication-and-prescription-tracker', accent: 'accent',
  },
  {
    id: 'swagruha-food', title: 'Swagruha Food — E-Commerce Backend', subtitle: 'Food ordering backend', category: 'Backend & Full-Stack', priority: 'product',
    tech: ['Java 17', 'Spring Boot', 'Spring Security', 'MySQL', 'JPA'], role: 'Backend Developer',
    problem: 'A food business needs products, carts and orders held together behind secured access.',
    approach: 'A Spring Boot backend for a food e-commerce application, with data models for users, products, carts and orders, secured with Spring Security and persisted to MySQL through JPA.',
    features: ['User, product, cart and order models', 'Spring Security roles and account status', 'JPA persistence on MySQL', 'Maven build on Java 17'],
    architecture: flow(['Spring Security', 'Spring Boot', 'JPA', 'MySQL']),
    contribution: 'Built the data model and security foundation of the ordering backend.', github: 'https://github.com/maruthi-sreeram-p/E-Commerce-Swagruha-food-s-', accent: 'ember',
  },
  {
    id: 'finance-data', title: 'Finance Data Processing & Access Control', subtitle: 'Backend data and controlled access', category: 'Backend & Full-Stack', priority: 'product',
    tech: ['Java 21', 'Spring Boot', 'JWT', 'MySQL', 'Flyway', 'Docker'], role: 'Backend Developer',
    problem: 'Financial data leaks most often through an endpoint that checks who you are but not whose record you asked for.',
    approach: 'A backend-focused finance platform (FinTrack) where ownership is enforced in the service layer, so a record that belongs to someone else is indistinguishable from one that does not exist.',
    features: [
      'JWT authentication with three roles and service-level resource ownership',
      'Transactions with filtering, pagination and BigDecimal money handling',
      'Dashboard totals and monthly trends from database aggregate queries',
      'Flyway migrations, OpenAPI documentation and 209 backend tests',
    ],
    architecture: flow(['Client', 'Access Control', 'Data Processing', 'Database']),
    contribution: 'Worked on backend processing and controlled resource access patterns.', github: 'https://github.com/maruthi-sreeram-p/Finance-Data-Processing-and-Access-Control', accent: 'accent',
  },
];
