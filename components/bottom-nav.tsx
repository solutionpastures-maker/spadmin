'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Megaphone,
  Flame,
  Radio,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const webRoutes = [
  '/web',
  '/gallery',
  '/testimonies',
  '/columns',
  '/events',
  '/bible-study',
  '/small-groups',
  '/inbox',
];

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard, match: (p: string) => p === '/' },
  { href: '/live', label: 'Live', icon: Radio, match: (p: string) => p.startsWith('/live') },
  { href: '/series', label: 'Series', icon: BookOpen, match: (p: string) => p.startsWith('/series') },
  { href: '/announcements', label: 'News', icon: Megaphone, match: (p: string) => p.startsWith('/announcements') },
  {
    href: '/devotionals',
    label: 'Devotion',
    icon: Flame,
    match: (p: string) => p.startsWith('/devotionals') || p.startsWith('/devotion-engagement'),
  },
  { href: '/web', label: 'Web', icon: Globe, match: (p: string) => webRoutes.some((route) => p.startsWith(route)) },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-bottom-nav safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.match(pathname);

        return (
          <Link key={item.href} href={item.href} className={cn(isActive && 'active')}>
            <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
