import {
  Atom,
  Boxes,
  Braces,
  Code2,
  Coffee,
  Container,
  Database,
  FileJson,
  GitBranch,
  Layers,
  Leaf,
  Package,
  Palette,
  Rabbit,
  Radio,
  Send,
  ShieldCheck,
  Webhook,
  Zap,
} from 'lucide-react';
import type { SkillIcon as SkillIconKey } from '../../data/skills';
import { GithubIcon } from './SocialIcons';

/**
 * Maps a skill's icon key to a mark.
 *
 * These are semantic rather than official brand logos — a coffee cup for Java,
 * a shield for Spring Security, a rabbit for RabbitMQ. Two reasons: redrawing
 * brand marks from memory reliably gets them subtly wrong, and a set drawn on
 * one consistent grid holds together visually in a way that twenty logos from
 * twenty different design systems never will.
 *
 * To use real brand marks instead, swap this map for an icon set such as
 * simple-icons; nothing else in the section needs to change.
 */
const ICONS: Record<SkillIconKey, React.ComponentType<{ className?: string }>> = {
  java: Coffee,
  spring: Leaf,
  security: ShieldCheck,
  orm: Layers,
  repository: Boxes,
  api: Webhook,
  database: Database,
  document: FileJson,
  cache: Zap,
  stream: Radio,
  queue: Rabbit,
  react: Atom,
  javascript: Braces,
  markup: Code2,
  styles: Palette,
  git: GitBranch,
  github: GithubIcon,
  container: Container,
  request: Send,
  build: Package,
};

interface SkillIconProps {
  name: SkillIconKey;
  className?: string;
}

export default function SkillIcon({ name, className = '' }: SkillIconProps) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
