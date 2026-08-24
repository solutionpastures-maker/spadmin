'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { useAnnouncementById, useUpdateAnnouncement } from '@/lib/hooks/useAnnouncements';
import { LoadingScreen } from '@/components/loading-screen';
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
  daysToWeekForm,
} from '@/lib/announcement-days';

function toDatetimeLocalValue(date: Date | string): string {
  const d = coerceDate(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function EditAnnouncementPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: announcement, isLoading } = useAnnouncementById(id);
  const updateMutation = useUpdateAnnouncement();
  const [initialized, setInitialized] = useState(false);
  const [type, setType] = useState<AnnouncementType>('special');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [weekStart, setWeekStart] = useState(toDateInputValue(mondayOf(new Date())));
  const [week, setWeek] = useState(emptyWeekDays());
  const [error, setError] = useState('');

  useEffect(() => {
    if (announcement && !initialized) {
      const nextType = announcement.type === 'weekly' ? 'weekly' : 'special';
      setType(nextType);
      setTitle(announcement.title);
      setBody(announcement.body);
      setPinned(announcement.pinned);
      setScheduledAt(toDatetimeLocalValue(announcement.scheduledAt));
      setWeekStart(
        announcement.weekStart ||
          toDateInputValue(mondayOf(coerceDate(announcement.scheduledAt)))
      );
      setWeek(daysToWeekForm(announcement.days || []));
      setInitialized(true);
    }
  }, [announcement, initialized]);

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

        await updateMutation.mutateAsync({
          id,
          updates: {
            title: weekTitle,
            body: buildWeeklyBody(days),
            pinned,
            scheduled_at: monday.toISOString(),
            type: 'weekly',
            week_start: toDateInputValue(monday),
            days,
          },
        });
      } else {
        if (!body.trim()) {
          setError('Special announcements need a body.');
          return;
        }
        await updateMutation.mutateAsync({
          id,
          updates: {
            title: title.trim(),
            body: body.trim(),
            pinned,
            scheduled_at: coerceDate(scheduledAt || undefined).toISOString(),
            type: 'special',
            week_start: null,
            days: [],
          },
        });
      }

      router.push('/announcements');
    } catch (err) {
      console.error('Error updating announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to update announcement');
    }
  };

  if (isLoading || !initialized) {
    return <LoadingScreen message="Loading announcement..." />;
  }

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
              <h1 className="text-2xl font-bold text-foreground">Edit Announcement</h1>
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
                className={`rounded-lg border p-4 text-left ${
                  type === 'weekly' ? 'border-accent bg-accent/20' : 'border-border'
                }`}
              >
                <p className="font-semibold">Weekly activities</p>
              </button>
              <button
                type="button"
                onClick={() => setType('special')}
                className={`rounded-lg border p-4 text-left ${
                  type === 'special' ? 'border-accent bg-accent/20' : 'border-border'
                }`}
              >
                <p className="font-semibold">Special announcement</p>
              </button>
            </div>
          </div>

          <div className="bg-card shadow-sm border border-border rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                required={type === 'special'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label className="text-sm font-medium">Pin this announcement</label>
            </div>

            {type === 'special' ? (
              <>
                <textarea
                  required
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </>
            ) : (
              <>
                <input
                  type="date"
                  required
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  Empty days are not saved.
                </div>
                {WEEK_DAYS.map(({ key, label }) => (
                  <div key={key} className="rounded-lg border border-border p-4 space-y-3">
                    <p className="font-semibold">{label}</p>
                    <textarea
                      rows={2}
                      value={week[key].text}
                      onChange={(e) => updateDay(key, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="datetime-local"
                        value={week[key].startsAt}
                        onChange={(e) => updateDay(key, 'startsAt', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                      <input
                        type="text"
                        value={week[key].location}
                        onChange={(e) => updateDay(key, 'location', e.target.value)}
                        placeholder="Location"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/announcements" className="px-4 py-2 border border-input rounded-md text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center px-4 py-2 rounded-md bg-accent text-primary font-semibold disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
