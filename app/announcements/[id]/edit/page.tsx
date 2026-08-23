'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useAnnouncementById, useUpdateAnnouncement } from '@/lib/hooks/useAnnouncements';
import { LoadingScreen } from '@/components/loading-screen';

function toDatetimeLocalValue(date: Date | string): string {
  const d = new Date(date);
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
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    pinned: false,
    scheduledAt: '',
  });

  useEffect(() => {
    if (announcement && !initialized) {
      setFormData({
        title: announcement.title,
        body: announcement.body,
        pinned: announcement.pinned,
        scheduledAt: toDatetimeLocalValue(announcement.scheduledAt),
      });
      setInitialized(true);
    }
  }, [announcement, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const scheduledDate = formData.scheduledAt
        ? new Date(formData.scheduledAt)
        : new Date();

      await updateMutation.mutateAsync({
        id,
        updates: {
          title: formData.title,
          body: formData.body,
          pinned: formData.pinned,
          scheduled_at: scheduledDate.toISOString(),
        },
      });

      router.push('/announcements');
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Failed to update announcement');
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
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-foreground mb-2">
                  Body *
                </label>
                <textarea
                  id="body"
                  required
                  rows={6}
                  value={formData.body}
                  onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter announcement body..."
                />
              </div>
            </div>
          </div>

          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Publishing Settings</h2>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={formData.pinned}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pinned: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
                />
                <label htmlFor="pinned" className="text-sm font-medium text-foreground">
                  Pin this announcement
                </label>
              </div>

              <div>
                <label htmlFor="scheduledAt" className="block text-sm font-medium text-foreground mb-2">
                  Schedule Date *
                </label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  required
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/announcements"
              className="px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-accent text-primary font-semibold hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
