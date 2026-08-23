'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { FooterLink } from '@/lib/types';
import { inputClass } from './form-section';

type FooterContentLinkGroups = {
  watch: FooterLink[];
  grow: FooterLink[];
  church: FooterLink[];
  connect: FooterLink[];
  give: FooterLink[];
};

export function LinkListEditor({
  links,
  onChange,
  addLabel = 'Add link',
}: {
  links: FooterLink[];
  onChange: (links: FooterLink[]) => void;
  addLabel?: string;
}) {
  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2">
          <input
            className={inputClass}
            value={link.label}
            onChange={(e) => {
              const next = [...links];
              next[index] = { ...link, label: e.target.value };
              onChange(next);
            }}
            placeholder="Link text (e.g. About Us)"
          />
          <div className="flex gap-2 flex-1">
            <input
              className={inputClass}
              value={link.href}
              onChange={(e) => {
                const next = [...links];
                next[index] = { ...link, href: e.target.value };
                onChange(next);
              }}
              placeholder="/about"
            />
            <button
              type="button"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
              className="shrink-0 p-2.5 rounded-lg border border-input hover:bg-muted/50 text-muted-foreground"
              aria-label="Remove link"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, { label: '', href: '' }])}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

export function FooterLinkGroupsEditor({
  linkGroups,
  onChange,
}: {
  linkGroups: FooterContentLinkGroups;
  onChange: (linkGroups: FooterContentLinkGroups) => void;
}) {
  const groups: { key: keyof FooterContentLinkGroups; title: string }[] = [
    { key: 'watch', title: 'Watch' },
    { key: 'grow', title: 'Grow' },
    { key: 'church', title: 'Church' },
    { key: 'connect', title: 'Connect' },
    { key: 'give', title: 'Give' },
  ];

  return (
    <div className="space-y-6">
      {groups.map(({ key, title }) => (
        <div key={key} className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-semibold text-foreground mb-3">{title} column</p>
          <LinkListEditor
            links={linkGroups[key]}
            onChange={(links) => onChange({ ...linkGroups, [key]: links })}
            addLabel={`Add ${title.toLowerCase()} link`}
          />
        </div>
      ))}
    </div>
  );
}
