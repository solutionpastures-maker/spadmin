'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useTestimonyById, useUpdateTestimony } from '@/lib/hooks/useTestimonies';
import { FormField, FormSection, inputClass, slugify, textareaClass } from '@/components/cms/form-section';
import { ImagePicker } from '@/components/image-picker';
import { LoadingScreen } from '@/components/loading-screen';

function toDateInputValue(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function EditTestimonyPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: testimony, isLoading } = useTestimonyById(id);
  const updateMutation = useUpdateTestimony();
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    excerpt: '',
    story: '',
    imageUrl: '',
    videoUrl: '',
    testimonyDate: '',
    featured: false,
  });

  useEffect(() => {
    if (testimony && !initialized) {
      setFormData({
        name: testimony.name,
        slug: testimony.slug,
        category: testimony.category || '',
        excerpt: testimony.excerpt || '',
        story: testimony.story,
        imageUrl: testimony.image || '',
        videoUrl: testimony.videoUrl || '',
        testimonyDate: toDateInputValue(testimony.date),
        featured: testimony.featured,
      });
      setInitialized(true);
    }
  }, [testimony, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        updates: {
          name: formData.name,
          slug: formData.slug || slugify(formData.name),
          category: formData.category || undefined,
          excerpt: formData.excerpt || undefined,
          story: formData.story,
          image_url: formData.imageUrl || undefined,
          video_url: formData.videoUrl || undefined,
          testimony_date: new Date(formData.testimonyDate || new Date().toISOString()).toISOString(),
          featured: formData.featured,
        },
      });
      router.push('/testimonies');
    } catch (error) {
      console.error('Error updating testimony:', error);
      alert('Failed to update testimony');
    }
  };

  if (isLoading || !initialized) {
    return <LoadingScreen message="Loading testimony..." />;
  }

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/testimonies" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Edit Testimony</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Person & story" description="Who shared this testimony and what did they say?">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Full name *">
                <input
                  required
                  className={inputClass}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: prev.slug || slugify(e.target.value),
                    }))
                  }
                />
              </FormField>
              <FormField label="Web link slug *">
                <input
                  required
                  className={inputClass}
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                />
              </FormField>
            </div>
            <FormField label="Category" hint="e.g. Healing, Salvation, Provision">
              <input
                className={inputClass}
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              />
            </FormField>
            <FormField label="Short quote" hint="A brief excerpt shown on cards before the full story.">
              <textarea
                rows={2}
                className={textareaClass}
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              />
            </FormField>
            <FormField label="Full story *">
              <textarea
                required
                rows={8}
                className={textareaClass}
                value={formData.story}
                onChange={(e) => setFormData((prev) => ({ ...prev, story: e.target.value }))}
              />
            </FormField>
          </FormSection>

          <FormSection title="Media & settings">
            <ImagePicker
              label="Photo"
              value={formData.imageUrl}
              onChange={(imageUrl) => setFormData((prev) => ({ ...prev, imageUrl }))}
              uploadPathPrefix="website/testimonies"
            />
            <FormField label="Video link (optional)" hint="YouTube or other video URL">
              <input
                className={inputClass}
                value={formData.videoUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
              />
            </FormField>
            <FormField label="Date shared *">
              <input
                type="date"
                required
                className={inputClass}
                value={formData.testimonyDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, testimonyDate: e.target.value }))}
              />
            </FormField>
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-input"
              />
              Feature this testimony on the homepage
            </label>
          </FormSection>

          <div className="flex justify-end gap-3">
            <Link href="/testimonies" className="px-4 py-2.5 border border-input rounded-lg text-sm font-medium hover:bg-muted/50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-primary font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              <Save size={16} />
              {updateMutation.isPending ? 'Saving…' : 'Save Testimony'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
