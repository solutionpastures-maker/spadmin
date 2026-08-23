'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useColumnArticleById, useUpdateColumnArticle } from '@/lib/hooks/useColumns';
import { FormField, FormSection, inputClass, slugify, textareaClass } from '@/components/cms/form-section';
import { ImagePicker } from '@/components/image-picker';
import { LoadingScreen } from '@/components/loading-screen';

function toDateInputValue(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function EditColumnArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: article, isLoading } = useColumnArticleById(id);
  const updateMutation = useUpdateColumnArticle();
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    authorBio: '',
    authorImage: '',
    publishDate: '',
    readTime: '5 min read',
    category: 'General',
    excerpt: '',
    content: '',
    imageUrl: '',
    featured: false,
  });

  useEffect(() => {
    if (article && !initialized) {
      setFormData({
        title: article.title,
        slug: article.slug,
        author: article.author,
        authorBio: article.authorBio || '',
        authorImage: article.authorImage || '',
        publishDate: toDateInputValue(article.date),
        readTime: article.readTime || '5 min read',
        category: article.category || 'General',
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.image || '',
        featured: article.featured,
      });
      setInitialized(true);
    }
  }, [article, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        updates: {
          title: formData.title,
          slug: formData.slug || slugify(formData.title),
          author: formData.author,
          author_bio: formData.authorBio || undefined,
          author_image: formData.authorImage || undefined,
          published_at: new Date(formData.publishDate || new Date().toISOString()).toISOString(),
          read_time: formData.readTime || '5 min read',
          category: formData.category || 'General',
          excerpt: formData.excerpt,
          content: formData.content,
          image_url: formData.imageUrl || undefined,
          featured: formData.featured,
        },
      });
      router.push('/columns');
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Failed to update article');
    }
  };

  if (isLoading || !initialized) {
    return <LoadingScreen message="Loading article..." />;
  }

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/columns" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Edit Column Article</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Article" description="Title, category, and main content.">
            <FormField label="Title *">
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
              <FormField label="Category *">
                <input
                  required
                  className={inputClass}
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Christian Living"
                />
              </FormField>
            </div>
            <FormField label="Summary *" hint="Short preview shown on the article list.">
              <textarea
                required
                rows={3}
                className={textareaClass}
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              />
            </FormField>
            <FormField label="Article body *">
              <textarea
                required
                rows={12}
                className={textareaClass}
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              />
            </FormField>
            <ImagePicker
              label="Featured image"
              value={formData.imageUrl}
              onChange={(imageUrl) => setFormData((prev) => ({ ...prev, imageUrl }))}
              uploadPathPrefix="website/columns"
            />
          </FormSection>

          <FormSection title="Author" description="Who wrote this article?">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Author name *">
                <input
                  required
                  className={inputClass}
                  value={formData.author}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                />
              </FormField>
              <FormField label="Read time *">
                <input
                  required
                  className={inputClass}
                  value={formData.readTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, readTime: e.target.value }))}
                  placeholder="6 min read"
                />
              </FormField>
            </div>
            <FormField label="Author bio">
              <textarea
                rows={3}
                className={textareaClass}
                value={formData.authorBio}
                onChange={(e) => setFormData((prev) => ({ ...prev, authorBio: e.target.value }))}
              />
            </FormField>
            <ImagePicker
              label="Author photo"
              value={formData.authorImage}
              onChange={(authorImage) => setFormData((prev) => ({ ...prev, authorImage }))}
              uploadPathPrefix="website/columns/authors"
            />
          </FormSection>

          <FormSection title="Publishing">
            <FormField label="Publish date *">
              <input
                type="date"
                required
                className={inputClass}
                value={formData.publishDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, publishDate: e.target.value }))}
              />
            </FormField>
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-input"
              />
              Feature this article on the column page
            </label>
          </FormSection>

          <div className="flex justify-end gap-3">
            <Link href="/columns" className="px-4 py-2.5 border border-input rounded-lg text-sm font-medium hover:bg-muted/50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-primary font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              <Save size={16} />
              {updateMutation.isPending ? 'Saving…' : 'Save Article'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
