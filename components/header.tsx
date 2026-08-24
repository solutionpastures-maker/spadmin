'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, RefreshCw, User, BookOpen, Megaphone, Radio, LayoutDashboard, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onRefresh?: () => void;
  onSignOut?: () => void;
  isRefreshing?: boolean;
}

const desktopNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/' },
  { href: '/live', label: 'Live', icon: Radio, match: (p: string) => p.startsWith('/live') },
  { href: '/series', label: 'Series', icon: BookOpen, match: (p: string) => p.startsWith('/series') },
  { href: '/announcements', label: 'News', icon: Megaphone, match: (p: string) => p.startsWith('/announcements') },
  { href: '/devotionals', label: 'Devotion', icon: Flame, match: (p: string) => p.startsWith('/devotionals') || p.startsWith('/devotion-engagement') },
];

export function Header({
  userName = 'Admin',
  userEmail = '',
  onRefresh,
  onSignOut,
  isRefreshing,
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="admin-header">
      <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
            <Image
              src="/logo.png"
              alt="Solution Pastures"
              width={31}
              height={31}
              className="h-[31px] w-[31px] object-contain"
              priority
            />
            <div className="min-w-0">
              <div className="font-serif text-[17px] font-bold tracking-tight text-primary leading-tight">
                Solution Pastures
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Admin
              </div>
            </div>
          </Link>

          <nav className="admin-desktop-nav">
            {desktopNav.map(({ href, label, icon: Icon, match }) => (
              <Link key={href} href={href} className={cn(match(pathname) && 'active')}>
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onRefresh ? (
            <button
              type="button"
              className="admin-header-icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          ) : null}

          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold text-primary truncate max-w-[140px]">{userName}</div>
            <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">{userEmail}</div>
          </div>

          <div className="admin-avatar" aria-hidden>
            <User size={16} />
          </div>

          {onSignOut ? (
            <button type="button" className="admin-header-icon" onClick={onSignOut} aria-label="Sign out">
              <LogOut size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
