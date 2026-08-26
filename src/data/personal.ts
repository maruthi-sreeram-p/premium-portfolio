export const personal = {
  name: 'P. Maruthi Sreeram',
  /** Name as set above the hero headline. */
  displayName: 'P. Maruthi Sreeram',
  initials: 'PMS',
  title: 'Java Backend & Full-Stack Developer',
  email: 'maruthisreeram864@gmail.com',
  linkedin: 'https://www.linkedin.com/in/maruthi-sreeram-b57680331/',
  github: 'https://github.com/maruthi-sreeram-p',
  /** Public URL the site is deployed at — used for canonical + Open Graph tags. */
  siteUrl: 'https://maruthi-sreeram-p.github.io/client-portfolio/',
  /** Drop your CV at public/resume.pdf and every "Resume" link below works. */
  resumeUrl: '/resume.pdf',

  tagline: 'I build software that gets the job done.',
  /** Hero headline, split so each line can reveal on its own beat. */
  headline: ['I build software', 'that gets the', 'job done'],
  description:
    'I turn practical requirements into working software — from backend systems and APIs to complete web applications and workflow automation.',
  disciplines: ['Java Backend', 'Full-Stack Applications', 'APIs', 'Automation'],

  about: `A B.Tech CSE student focused on Java backend development, building practical software with Spring Boot, databases, APIs, and full-stack applications. Continuously improving through projects and engineering practice.`,
  aboutExpanded: `I care about the parts of a system most people never see: how a service is layered, where the boundaries sit, what happens when a node drops out, and whether the next person can read the code. Most of what I have built started as a question about how something actually works — a key-value store to understand replication, an event pipeline to understand Kafka — and turned into something that runs.`,

  principles: [
    {
      title: 'Design before code',
      body: 'Architecture, API contracts and schema first. Implementation is the easy part once the shape is right.',
    },
    {
      title: 'Boundaries matter',
      body: 'Controllers, services and repositories stay in their lanes. Separation of concerns is what keeps a codebase changeable.',
    },
    {
      title: 'Build for failure',
      body: 'Things go down. Replication, retries, caching and graceful degradation are part of the design, not a later patch.',
    },
    {
      title: 'Finish the work',
      body: 'Documentation, tests and a deployable build. Software that only runs on my machine is not delivered.',
    },
  ],

  footerNote: 'Built with Java, curiosity and a lot of debugging.',
  currentFocus: ['Java Backend', 'Spring Boot', 'Distributed Systems', 'Practical Automation'],
};
