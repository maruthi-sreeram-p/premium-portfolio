import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { personal } from '../../data/personal';
import SectionWrapper from '../layout/SectionWrapper';
import Reveal from '../shared/Reveal';
import Button from '../shared/Button';
import RevealText from '../fx/RevealText';

/**
 * Web3Forms access key. Get a free key at https://web3forms.com (no account
 * needed — they email you the key) and put it in a `.env` file at the project
 * root as:  VITE_WEB3FORMS_KEY=your-key-here
 *
 * If the key is absent the form falls back to opening the visitor's mail
 * client, so the page still works with no configuration at all.
 */
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Contact — deliberately the plainest section on the page.
 *
 * Earlier versions stacked a live clock, a reply-time panel, a card of direct
 * channels, a bordered form panel and a drawn sign-off. That is a lot of
 * furniture around one simple question, and it read as busier than the work it
 * was meant to close. What is left is a heading, three fields, an email
 * address and three links.
 *
 * The project-type chips are gone with the rest of it; enquiries now carry a
 * single subject line. If you want them back, restore the `selectedType` state
 * and add `project_type` to the payload below.
 */
export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please tell me your name.';
    if (!email.trim()) next.email = 'I need an email address to reply to.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "That email doesn't look right.";
    if (message.trim().length < 20) next.message = 'A little more detail helps — at least 20 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function openMailClient() {
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    // Assigning location.href is far more reliable than window.open() for
    // mailto: — popup blockers ignore it and it leaves no blank tab behind.
    window.location.href = `mailto:${personal.email}?subject=${encodeURIComponent('Portfolio enquiry')}&body=${encodeURIComponent(body)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (!WEB3FORMS_KEY) {
      openMailClient();
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'Portfolio enquiry',
          from_name: 'Portfolio contact form',
          name,
          email,
          message,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Request failed');

      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(personal.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the mailto link beside it still works */
    }
  }

  const fieldClass =
    'w-full border-0 border-b bg-transparent py-3 text-[var(--fg)] placeholder:text-[var(--fg-faint)] outline-none transition-colors duration-300 focus:border-[var(--accent)]';

  const links = [
    { label: 'LinkedIn', href: personal.linkedin },
    { label: 'GitHub', href: personal.github },
    { label: 'Resume', href: personal.resumeUrl },
  ];

  return (
    <SectionWrapper id="contact" ariaLabel="Contact">
      <Reveal>
        <p className="label eyebrow">05 — Contact</p>
      </Reveal>

      <h2
        aria-label="Let's build something."
        className="mt-6 text-[clamp(1.9rem,4.5vw,3.25rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-[var(--fg)]"
      >
        <RevealText as="span" text="Let's build something." className="block" />
      </h2>

      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-20">
        {/* Form — three fields, no panel, no chrome. */}
        <div className="lg:col-span-7">
          {status === 'sent' ? (
            <div role="status">
              <Check className="h-6 w-6" style={{ color: 'var(--accent-2)' }} />
              <p className="font-display mt-4 text-lg font-bold text-[var(--fg)]">
                Message sent.
              </p>
              <p className="mt-2 text-sm text-[var(--fg-soft)]">
                Thanks for reaching out — I&apos;ll get back to you shortly.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-5 text-sm text-[var(--accent)] underline-offset-4 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <Reveal>
                <label htmlFor="contact-name" className="label mb-1 block">
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  className={fieldClass}
                  style={{ borderColor: errors.name ? 'var(--ember)' : 'var(--rule-strong)' }}
                  placeholder="Jane Doe"
                />
                {errors.name && (
                  <p id="contact-name-error" className="mt-2 text-xs" style={{ color: 'var(--ember)' }}>
                    {errors.name}
                  </p>
                )}
              </Reveal>

              <Reveal delay={0.06}>
                <label htmlFor="contact-email" className="label mb-1 block">
                  Your email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  className={fieldClass}
                  style={{ borderColor: errors.email ? 'var(--ember)' : 'var(--rule-strong)' }}
                  placeholder="jane@company.com"
                />
                {errors.email && (
                  <p id="contact-email-error" className="mt-2 text-xs" style={{ color: 'var(--ember)' }}>
                    {errors.email}
                  </p>
                )}
              </Reveal>

              <Reveal delay={0.12}>
                <label htmlFor="project-details" className="label mb-1 block">
                  What are you building?
                </label>
                <textarea
                  id="project-details"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'project-details-error' : undefined}
                  className={`${fieldClass} resize-none`}
                  style={{ borderColor: errors.message ? 'var(--ember)' : 'var(--rule-strong)' }}
                  placeholder="A short description is plenty."
                />
                {errors.message && (
                  <p id="project-details-error" className="mt-2 text-xs" style={{ color: 'var(--ember)' }}>
                    {errors.message}
                  </p>
                )}
              </Reveal>

              <Reveal delay={0.18}>
                <Button type="submit" variant="primary" showArrow disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </Button>
                {status === 'error' && (
                  <p role="alert" className="mt-3 text-sm" style={{ color: 'var(--ember)' }}>
                    Something went wrong.{' '}
                    <button type="button" onClick={openMailClient} className="underline underline-offset-4">
                      Send it by email instead
                    </button>
                    .
                  </p>
                )}
              </Reveal>
            </form>
          )}
        </div>

        {/* Direct — an address and three links. */}
        <div className="lg:col-span-5">
          <Reveal delay={0.1}>
            <p className="label">Or email me</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${personal.email}`}
                className="text-[var(--fg)] transition-colors duration-300 [overflow-wrap:anywhere] hover:text-[var(--accent)]"
              >
                {personal.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="shrink-0 rounded-md border p-2 text-[var(--fg-faint)] transition-colors duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                aria-label={copied ? 'Email address copied' : 'Copy email address'}
              >
                {copied ? (
                  <Check className="h-4 w-4" style={{ color: 'var(--accent-2)' }} />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p aria-live="polite" className="label mt-2 h-4">
              {copied ? 'Copied' : ''}
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="trail-host inline-flex items-center gap-2 text-[var(--fg-soft)] transition-colors duration-300 hover:text-[var(--fg)]"
                  >
                    {label}
                    <span className="trail-glyph" aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </SectionWrapper>
  );
}
