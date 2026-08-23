'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Megaphone,
  BookMarked,
  Radio,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const webRoutes = ['/web', '/gallery', '/testimonies', '/columns', '/events', '/bible-study', '/small-groups', '/inbox'];

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard, match: (p: string) => p === '/' },
  { href: '/live', label: 'Live', icon: Radio, match: (p: string) => p.startsWith('/live') },
  { href: '/series', label: 'Series', icon: BookOpen, match: (p: string) => p.startsWith('/series') },
  { href: '/announcements', label: 'News', icon: Megaphone, match: (p: string) => p.startsWith('/announcements') },
  { href: '/devotionals', label: 'Devotion', icon: BookMarked, match: (p: string) => p.startsWith('/devotionals') || p.startsWith('/devotion-engagement') },
  { href: '/web', label: 'Web', icon: Globe, match: (p: string) => webRoutes.some((route) => p.startsWith(route)) },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-primary border-t border-primary-foreground/10 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 flex-1 min-w-0',
                isActive
                  ? 'text-accent'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
