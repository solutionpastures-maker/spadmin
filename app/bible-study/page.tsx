'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Search, Trash2, RefreshCw, Pencil } from 'lucide-react';
import { useBibleStudyTopics, useDeleteBibleStudyTopic } from '@/lib/hooks/useBibleStudy';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';

export default function BibleStudyPage() {
  const { data: topics = [], isLoading, refetch, isRefetching } = useBibleStudyTopics();
  const deleteMutation = useDeleteBibleStudyTopic();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(
    () =>
      topics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (topic.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (topic.verseReference || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [topics, searchTerm]
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bible study topic?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting bible study topic:', error);
      alert('Failed to delete bible study topic');
    }
  };

  if (isLoading) return <LoadingScreen message="Loading bible study topics..." />;

  return (
    <>
      <PageHeader
        title="Bible Study"
        description="Manage bible study topics and lessons for the website"
        icon={BookOpen}
        backHref="/web"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/bible-study/new">
                <Plus size={16} />
                New Topic
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Topics ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No bible study topics yet</h3>
            <p className="text-muted-foreground mb-6">Add topics to power the website bible study page.</p>
            <Button variant="gold" asChild>
              <Link href="/bible-study/new">
                <Plus size={16} />
                Create Topic
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((topic) => (
              <div key={topic.id} className="px-6 py-4 hover:bg-muted/40">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{topic.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {topic.category || 'General'} • {topic.lessons.length} lesson(s)
                    </p>
                    {topic.verseReference && (
                      <p className="text-sm text-muted-foreground">{topic.verseReference}</p>
                    )}
                    {topic.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/bible-study/${topic.id}/edit`}
                      className="inline-flex items-center p-2 border border-input rounded-md bg-card hover:bg-muted/50"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(topic.id)}
                      className="inline-flex items-center p-2 border border-input rounded-md bg-card hover:bg-muted/50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
