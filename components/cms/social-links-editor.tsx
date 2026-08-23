'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { FooterSocialLink } from '@/lib/types';
import { selectClass, inputClass } from './form-section';

const PLATFORMS: { value: FooterSocialLink['platform']; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
];

export function SocialLinksEditor({
  links,
  onChange,
}: {
  links: FooterSocialLink[];
  onChange: (links: FooterSocialLink[]) => void;
}) {
  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={index} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {link.label.trim() || `Social link ${index + 1}`}
            </p>
            <button
              type="button"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Platform</label>
              <select
                className={selectClass}
                value={link.platform}
                onChange={(e) => {
                  const next = [...links];
                  next[index] = {
                    ...link,
                    platform: e.target.value as FooterSocialLink['platform'],
                  };
                  onChange(next);
                }}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Label</label>
              <input
                className={inputClass}
                value={link.label}
                onChange={(e) => {
                  const next = [...links];
                  next[index] = { ...link, label: e.target.value };
                  onChange(next);
                }}
                placeholder="Facebook"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Profile URL</label>
              <input
                className={inputClass}
                value={link.href}
                onChange={(e) => {
                  const next = [...links];
                  next[index] = { ...link, href: e.target.value };
                  onChange(next);
                }}
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...links, { href: '', label: '', platform: 'facebook' }])
        }
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Plus className="h-4 w-4" />
        Add social link
      </button>
    </div>
  );
}
