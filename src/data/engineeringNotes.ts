export interface EngineeringNote {
  id: string;
  title: string;
  description: string;
  icon: 'Globe' | 'Shield' | 'Network' | 'Zap' | 'Database' | 'Layers' | 'Box';
}

export const engineeringNotes: EngineeringNote[] = [
  {
    id: 'rest-api',
    title: 'REST API Design',
    description: 'Designing resource-oriented APIs with proper HTTP methods, status codes, pagination, error handling, and versioning. Good API design makes systems easier to consume, maintain, and extend.',
    icon: 'Globe'
  },
  {
    id: 'auth',
    title: 'Authentication & Authorization',
    description: 'Implementing JWT-based authentication, role-based access control, and secure session management. Security is not an afterthought — it\'s built into the architecture.',
    icon: 'Shield'
  },
  {
    id: 'distributed',
    title: 'Distributed Systems',
    description: 'Understanding consensus algorithms, leader election, log replication, and fault tolerance. Building systems that work correctly even when individual nodes fail.',
    icon: 'Network'
  },
  {
    id: 'event-driven',
    title: 'Event-Driven Architecture',
    description: 'Using message brokers like Kafka and RabbitMQ to build loosely coupled, scalable systems. Events decouple producers from consumers and enable real-time data processing.',
    icon: 'Zap'
  },
  {
    id: 'database',
    title: 'Database Design',
    description: 'Choosing between relational and document databases, designing schemas, indexing strategies, and managing data integrity. The database is the foundation of every backend system.',
    icon: 'Database'
  },
  {
    id: 'caching',
    title: 'Caching Strategies',
    description: 'Implementing Redis caching for performance optimization — cache invalidation, TTL management, and cache-aside patterns. The right caching strategy can dramatically reduce response times.',
    icon: 'Box'
  },
  {
    id: 'architecture',
    title: 'Backend Architecture',
    description: 'Layered architecture patterns — controllers, services, repositories. Separation of concerns makes code testable, maintainable, and extensible.',
    icon: 'Layers'
  }
];
