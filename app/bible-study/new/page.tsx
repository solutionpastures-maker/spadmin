'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateBibleStudyTopic } from '@/lib/hooks/useBibleStudy';
import {
  AddItemButton,
  FormField,
  FormSection,
  ItemCard,
  inputClass,
  slugify,
  textareaClass,
} from '@/components/cms/form-section';
import type { BibleStudyLesson } from '@/lib/types';

function emptyLesson(): BibleStudyLesson {
  return { id: crypto.randomUUID(), title: '', content: '', readTime: '', scriptureRefs: [] };
}

export default function NewBibleStudyTopicPage() {
  const router = useRouter();
  const createMutation = useCreateBibleStudyTopic();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    verseReference: '',
    description: '',
  });
  const [lessons, setLessons] = useState<BibleStudyLesson[]>([emptyLesson()]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedLessons = lessons
      .filter((l) => l.title.trim())
      .map((l) => ({
        id: l.id,
        title: l.title.trim(),
        content: l.content?.trim() || undefined,
        readTime: l.readTime?.trim() || undefined,
        scriptureRefs: l.scriptureRefs?.filter((r) => r.trim()) || undefined,
      }));

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        slug: formData.slug || slugify(formData.title),
        category: formData.category || undefined,
        verse_reference: formData.verseReference || undefined,
        description: formData.description || undefined,
        lessons: cleanedLessons,
      });
      router.push('/bible-study');
    } catch (error) {
      console.error('Error creating bible study topic:', error);
      alert('Failed to create bible study topic');
    }
  };

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/bible-study" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">New Bible Study Topic</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Topic overview" description="The main study topic shown on the Bible Study page.">
            <FormField label="Topic title *">
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
                placeholder="Faith Foundations"
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
                  placeholder="Faith, Prayer, Salvation"
                />
              </FormField>
            </div>
            <FormField label="Key verse">
              <input
                className={inputClass}
                value={formData.verseReference}
                onChange={(e) => setFormData((prev) => ({ ...prev, verseReference: e.target.value }))}
                placeholder="Hebrews 11:1"
              />
            </FormField>
            <FormField label="Description">
              <textarea
                rows={4}
                className={textareaClass}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </FormField>
          </FormSection>

          <FormSection title="Lessons" description="Add each lesson in this study series.">
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <ItemCard
                  key={lesson.id}
                  title={lesson.title.trim() || `Lesson ${index + 1}`}
                  onRemove={() => setLessons(lessons.filter((_, i) => i !== index))}
                >
                  <FormField label="Lesson title *">
                    <input
                      className={inputClass}
                      value={lesson.title}
                      onChange={(e) => {
                        const next = [...lessons];
                        next[index] = { ...lesson, title: e.target.value };
                        setLessons(next);
                      }}
                      placeholder="Lesson 1: What is Faith?"
                    />
                  </FormField>
                  <FormField label="Estimated read time">
                    <input
                      className={inputClass}
                      value={lesson.readTime || ''}
                      onChange={(e) => {
                        const next = [...lessons];
                        next[index] = { ...lesson, readTime: e.target.value };
                        setLessons(next);
                      }}
                      placeholder="10 min read"
                    />
                  </FormField>
                  <FormField label="Scripture references" hint="Comma-separated, e.g. Hebrews 11:1, Romans 10:17">
                    <input
                      className={inputClass}
                      value={(lesson.scriptureRefs || []).join(', ')}
                      onChange={(e) => {
                        const next = [...lessons];
                        next[index] = {
                          ...lesson,
                          scriptureRefs: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        };
                        setLessons(next);
                      }}
                    />
                  </FormField>
                  <FormField label="Lesson content">
                    <textarea
                      rows={5}
                      className={textareaClass}
                      value={lesson.content || ''}
                      onChange={(e) => {
                        const next = [...lessons];
                        next[index] = { ...lesson, content: e.target.value };
                        setLessons(next);
                      }}
                    />
                  </FormField>
                </ItemCard>
              ))}
            </div>
            <AddItemButton label="Add lesson" onClick={() => setLessons([...lessons, emptyLesson()])} />
          </FormSection>

          <div className="flex justify-end gap-3">
            <Link href="/bible-study" className="px-4 py-2.5 border border-input rounded-lg text-sm font-medium hover:bg-muted/50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-primary font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              <Save size={16} />
              {createMutation.isPending ? 'Creating…' : 'Create Topic'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
