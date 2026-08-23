'use client';

import { LogOut, RefreshCw, Church, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onRefresh?: () => void;
  onSignOut?: () => void;
  isRefreshing?: boolean;
}

export function Header({
  userName = 'Admin',
  userEmail = '',
  onRefresh,
  onSignOut,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shrink-0">
            <Church size={20} className="text-primary" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-bold text-foreground leading-tight">Solution Pastures</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {onRefresh && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

          <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-border">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">{userName}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">{userEmail}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
              <User size={16} className="text-primary" />
            </div>
            {onSignOut && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
