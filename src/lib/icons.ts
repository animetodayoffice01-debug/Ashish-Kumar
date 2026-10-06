import React from 'react';
import * as Icons from 'lucide-react';

export function getIconComponent(name: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  if (!name) return Icons.Link;
  const Component = (Icons as Record<string, any>)[name];
  if (Component && typeof Component === 'function') {
    return Component;
  }
  return Icons.ExternalLink;
}

export const POPULAR_ICONS = [
  'Link', 'Sparkles', 'Flame', 'Youtube', 'Instagram', 'Twitter', 'Send', 'MessageSquare',
  'Download', 'Wrench', 'Briefcase', 'Camera', 'Video', 'PlayCircle', 'Calendar', 'Heart',
  'ShoppingBag', 'Folder', 'Code', 'Cpu', 'Music', 'Headphones', 'BookOpen', 'Mail',
  'Phone', 'Globe', 'Compass', 'Star', 'Coffee', 'Gift', 'Bookmark', 'CheckCircle2'
];
