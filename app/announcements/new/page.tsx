'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { useCreateAnnouncement } from '@/lib/hooks/useAnnouncements';
import { coerceDate } from '@/lib/devotional-payload';
import {
  WEEK_DAYS,
  type AnnouncementType,
  type WeekDayKey,
  emptyWeekDays,
  mondayOf,
  toDateInputValue,
  collectFilledDays,
  buildWeeklyBody,
} from '@/lib/announcement-days';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const createMutation = useCreateAnnouncement();
  const [type, setType] = useState<AnnouncementType>('weekly');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [weekStart, setWeekStart] = useState(toDateInputValue(mondayOf(new Date())));
  const [week, setWeek] = useState(emptyWeekDays());
  const [error, setError] = useState('');

  const updateDay = (
    day: WeekDayKey,
    field: 'text' | 'startsAt' | 'location',
    value: string
  ) => {
    setWeek((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (type === 'weekly') {
        const days = collectFilledDays(week);
        if (!days.length) {
          setError('Add at least one day with activity text. Empty days are skipped.');
          return;
        }
        const monday = mondayOf(coerceDate(weekStart));
        const weekTitle =
          title.trim() ||
          `Week of ${monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

        await createMutation.mutateAsync({
          title: weekTitle,
          body: buildWeeklyBody(days),
          pinned,
          scheduled_at: monday.toISOString(),
          type: 'weekly',
          week_start: toDateInputValue(monday),
          days,
        });
      } else {
        if (!body.trim()) {
          setError('Special announcements need a body.');
          return;
        }
        await createMutation.mutateAsync({
          title: title.trim(),
          body: body.trim(),
          pinned,
          scheduled_at: coerceDate(scheduledAt || undefined).toISOString(),
          type: 'special',
          week_start: null,
          days: [],
        });
      }

      router.push('/announcements');
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
    }
  };

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/announcements"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Announcements</span>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Create Announcement</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">Announcement type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('weekly')}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  type === 'weekly'
                    ? 'border-accent bg-accent/20'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <p className="font-semibold text-foreground">Weekly activities</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Separate Monday–Sunday slots. Leave a day blank to skip it.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setType('special')}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  type === 'special'
                    ? 'border-accent bg-accent/20'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <p className="font-semibold text-foreground">Special announcement</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  One-off church news with a publish schedule.
                </p>
              </button>
            </div>
          </div>

          <div className="bg-card shadow-sm border border-border rounded-lg p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title {type === 'weekly' ? '(optional)' : '*'}
              </label>
              <input
                id="title"
                required={type === 'special'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={
                  type === 'weekly' ? 'Week of March 24 — or leave blank to auto-name' : 'Announcement title'
                }
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="pinned"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
              />
              <label htmlFor="pinned" className="text-sm font-medium text-foreground">
                Pin this announcement
              </label>
            </div>

            {type === 'special' ? (
              <>
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <textarea
                    id="body"
                    required
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Write the special announcement…"
                  />
                </div>
                <div>
                  <label htmlFor="scheduledAt" className="block text-sm font-medium text-foreground mb-2">
                    Schedule date *
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledAt"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="weekStart" className="block text-sm font-medium text-foreground mb-2">
                    Week of (any day — we snap to Monday)
                  </label>
                  <input
                    type="date"
                    id="weekStart"
                    required
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={16} />
                    Only days with text are saved. Optional time becomes an upcoming event + reminder.
                  </div>
                  {WEEK_DAYS.map(({ key, label }) => (
                    <div key={key} className="rounded-lg border border-border p-4 space-y-3">
                      <p className="font-semibold text-foreground">{label}</p>
                      <textarea
                        rows={2}
                        value={week[key].text}
                        onChange={(e) => updateDay(key, 'text', e.target.value)}
                        placeholder={`What is happening on ${label}? Leave blank to skip.`}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Event date & time (optional)
                          </label>
                          <input
                            type="datetime-local"
                            value={week[key].startsAt}
                            onChange={(e) => updateDay(key, 'startsAt', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Location (optional)
                          </label>
                          <input
                            type="text"
                            value={week[key].location}
                            onChange={(e) => updateDay(key, 'location', e.target.value)}
                            placeholder="Sanctuary, Online…"
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/announcements"
              className="px-4 py-2 border border-input rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted/50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center px-4 py-2 rounded-md bg-accent text-primary font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                'Creating…'
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Create Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
