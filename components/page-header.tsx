'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: ReactNode;
  backHref?: string;
}

export function PageHeader({ title, description, icon: Icon, action, backHref }: PageHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          ← Back
        </Link>
      ) : null}
      <div className="admin-page-header !mb-0">
        <div className="flex items-start gap-4 min-w-0">
          <div className="admin-icon-tile">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-primary sm:text-[28px]">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
