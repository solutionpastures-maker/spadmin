'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('bg-card border border-border rounded-xl p-6 space-y-5 shadow-sm', className)}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function FormField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const inputClass =
  'w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring';

export const textareaClass =
  'w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-y min-h-[100px]';

export const selectClass =
  'w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring';

export function ItemCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm font-medium text-red-600 hover:text-red-700 shrink-0"
        >
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

export function AddItemButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
    >
      + {label}
    </button>
  );
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export { slugify };
