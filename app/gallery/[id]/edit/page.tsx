'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useGalleryAlbumById, useUpdateGalleryAlbum } from '@/lib/hooks/useGallery';
import { FormField, FormSection, inputClass, slugify } from '@/components/cms/form-section';
import { ImagePicker } from '@/components/image-picker';
import { MultiImagePicker, type ImageItem } from '@/components/cms/multi-image-picker';
import { LoadingScreen } from '@/components/loading-screen';

function toDateInputValue(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function EditGalleryAlbumPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: album, isLoading } = useGalleryAlbumById(id);
  const updateMutation = useUpdateGalleryAlbum();
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    eventDate: '',
    category: '',
    coverImage: '',
  });
  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (album && !initialized) {
      setFormData({
        title: album.title,
        slug: album.slug,
        eventDate: toDateInputValue(album.date),
        category: '',
        coverImage: album.coverImage || '',
      });
      setImages(
        album.images.map((img) => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
        }))
      );
      setInitialized(true);
    }
  }, [album, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert('Please add at least one photo to the album.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        updates: {
          title: formData.title,
          slug: formData.slug || slugify(formData.title),
          event_date: new Date(formData.eventDate || new Date().toISOString()).toISOString(),
          cover_image: formData.coverImage || images[0]?.url,
          category: formData.category || undefined,
          images: images.map((img) => ({
            id: img.id,
            url: img.url,
            caption: img.caption,
          })),
        },
      });
      router.push('/gallery');
    } catch (error) {
      console.error('Error updating gallery album:', error);
      alert('Failed to update gallery album');
    }
  };

  if (isLoading || !initialized) {
    return <LoadingScreen message="Loading gallery album..." />;
  }

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link
              href="/gallery"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Edit Gallery Album</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Album details" description="Basic information for this photo album.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Album title *">
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
                  placeholder="Church Anniversary 2026"
                />
              </FormField>
              <FormField label="Web link slug *" hint="Used in the album URL. Auto-filled from title.">
                <input
                  required
                  className={inputClass}
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                  placeholder="church-anniversary-2026"
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
              <FormField label="Category" hint="Optional — e.g. Worship, Youth, Events">
                <input
                  className={inputClass}
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Events"
                />
              </FormField>
            </div>
            <ImagePicker
              label="Cover photo (optional)"
              value={formData.coverImage}
              onChange={(coverImage) => setFormData((prev) => ({ ...prev, coverImage }))}
              uploadPathPrefix="website/gallery/covers"
              hint="If empty, the first album photo is used as the cover."
            />
          </FormSection>

          <FormSection title="Album photos *" description="Upload the photos for this gallery album.">
            <MultiImagePicker
              label="Photos"
              images={images}
              onChange={setImages}
              uploadPathPrefix="website/gallery"
            />
          </FormSection>

          <div className="flex justify-end gap-3">
            <Link
              href="/gallery"
              className="px-4 py-2.5 border border-input rounded-lg text-sm font-medium hover:bg-muted/50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-primary font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              <Save size={16} />
              {updateMutation.isPending ? 'Saving…' : 'Save Album'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
