export interface NavLink {
  label: string;
  /** Matches the corresponding section's `id`, used for scroll and scroll-spy. */
  id: string;
}

/**
 * The site's section index.
 *
 * Kept in its own module rather than exported from Header so that both the
 * header and the mobile menu can import it without either file exporting a
 * non-component (which disables Fast Refresh for that file).
 */
export const navLinks: NavLink[] = [
  { label: 'About', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Contact', id: 'contact' },
];
