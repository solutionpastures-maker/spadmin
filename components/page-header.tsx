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
    <div className="mb-8">
      {backHref && (
        <Link href={backHref} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          ← Back
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
