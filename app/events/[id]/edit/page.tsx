'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useEventById, useUpdateEvent } from '@/lib/hooks/useEvents';
import { FormField, FormSection, inputClass, slugify, textareaClass } from '@/components/cms/form-section';
import { ImagePicker } from '@/components/image-picker';
import { LoadingScreen } from '@/components/loading-screen';

function toDateInputValue(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: event, isLoading } = useEventById(id);
  const updateMutation = useUpdateEvent();
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    eventDate: '',
    timeText: '',
    location: '',
    description: '',
    imageUrl: '',
    category: '',
    registrationRequired: false,
  });

  useEffect(() => {
    if (event && !initialized) {
      setFormData({
        title: event.title,
        slug: event.slug,
        eventDate: toDateInputValue(event.eventDate),
        timeText: event.timeText || '',
        location: event.location || '',
        description: event.description || '',
        imageUrl: event.imageUrl || '',
        category: event.category || '',
        registrationRequired: event.registrationRequired,
      });
      setInitialized(true);
    }
  }, [event, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        updates: {
          title: formData.title,
          slug: formData.slug || slugify(formData.title),
          event_date: new Date(formData.eventDate || new Date().toISOString()).toISOString(),
          time_text: formData.timeText || undefined,
          location: formData.location || undefined,
          description: formData.description || undefined,
          image_url: formData.imageUrl || undefined,
          category: formData.category || undefined,
          registration_required: formData.registrationRequired,
        },
      });
      router.push('/events');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    }
  };

  if (isLoading || !initialized) {
    return <LoadingScreen message="Loading event..." />;
  }

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/events" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Edit Event</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Event details" description="What is happening and when?">
            <FormField label="Event title *">
              <input
                required
                className={inputClass}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                    slug: prev.slug || slugify(e.target.value),
                  }))
                }
                placeholder="Youth Conference 2026"
              />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Web link slug *">
                <input
                  required
                  className={inputClass}
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                />
              </FormField>
              <FormField label="Category">
                <input
                  className={inputClass}
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Conference, Outreach, Service"
                />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Event date *">
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={formData.eventDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, eventDate: e.target.value }))}
                />
              </FormField>
              <FormField label="Time" hint="e.g. 9:00 AM - 2:00 PM">
                <input
                  className={inputClass}
                  value={formData.timeText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, timeText: e.target.value }))}
                />
              </FormField>
            </div>
            <FormField label="Location">
              <input
                className={inputClass}
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Main Auditorium"
              />
            </FormField>
            <FormField label="Description">
              <textarea
                rows={6}
                className={textareaClass}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </FormField>
            <ImagePicker
              label="Event photo"
              value={formData.imageUrl}
              onChange={(imageUrl) => setFormData((prev) => ({ ...prev, imageUrl }))}
              uploadPathPrefix="website/events"
            />
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={formData.registrationRequired}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, registrationRequired: e.target.checked }))
                }
                className="h-4 w-4 rounded border-input"
              />
              Registration required for this event
            </label>
          </FormSection>

          <div className="flex justify-end gap-3">
            <Link href="/events" className="px-4 py-2.5 border border-input rounded-lg text-sm font-medium hover:bg-muted/50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-primary font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              <Save size={16} />
              {updateMutation.isPending ? 'Saving…' : 'Save Event'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
