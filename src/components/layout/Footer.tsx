import { FileText, Mail } from 'lucide-react';
import { personal } from '../../data/personal';
import Container from './Container';
import DotText from '../fx/DotText';
import { GithubIcon, LinkedInIcon } from '../shared/SocialIcons';
import { scrollToTop } from '../../lib/scroll';

const links = [
  { icon: GithubIcon, href: personal.github, label: 'GitHub' },
  { icon: LinkedInIcon, href: personal.linkedin, label: 'LinkedIn' },
  { icon: Mail, href: `mailto:${personal.email}`, label: `Email ${personal.email}` },
  { icon: FileText, href: personal.resumeUrl, label: 'Resume (PDF)' },
];

export default function Footer() {
  return (
    <footer className="relative border-t pb-4 pt-12 md:pt-16">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-[var(--fg)]">{personal.name}</p>
            <p className="label mt-2">{personal.title}</p>
            <a
              href={`mailto:${personal.email}`}
              className="mt-3 inline-block text-sm text-[var(--fg-soft)] transition-colors duration-300 hover:text-[var(--accent)]"
            >
              {personal.email}
            </a>
          </div>

          {/* gap-7 keeps the expanded 40px hit areas from sitting edge-to-edge */}
          <div className="flex items-center gap-7">
            {links.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="-m-2.5 p-2.5 text-[var(--fg-faint)] transition-colors duration-300 hover:text-[var(--accent)]"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div
          className="mt-10 flex flex-col gap-3 border-t pt-8 md:flex-row md:items-center md:justify-between"
        >
          <p className="label">{personal.footerNote}</p>
          <div className="flex items-center gap-6">
            <p className="label">
              © {new Date().getFullYear()} {personal.name}
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className="label trail-host transition-colors duration-300 hover:text-[var(--accent)]"
            >
              Back to top <span className="trail-glyph">↑</span>
            </button>
          </div>
        </div>
      </Container>

      {/* The sign-off: the name as a signature, the role beneath it. */}
      <div className="mt-12 flex flex-col items-center px-6 text-center">
        {/* The signature is drawn in dots; the real text is for screen readers. */}
        <p className="sr-only">Maruthi Sreeram</p>
        <div
          className="w-full max-w-[40rem]"
          style={{
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)',
            maskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)',
          }}
        >
          <DotText text="Maruthi Sreeram" />
        </div>
        <p className="mt-1 text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-[var(--fg-soft)]">
          Java Fullstack Developer
        </p>
      </div>
    </footer>
  );
}
