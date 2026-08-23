'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Newspaper, Plus, Search, Trash2, RefreshCw, Star, Pencil } from 'lucide-react';
import { useColumnArticles, useDeleteColumnArticle } from '@/lib/hooks/useColumns';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';

export default function ColumnsPage() {
  const { data: articles = [], isLoading, refetch, isRefetching } = useColumnArticles();
  const deleteMutation = useDeleteColumnArticle();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(
    () =>
      articles.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [articles, searchTerm]
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  if (isLoading) return <LoadingScreen message="Loading columns..." />;

  return (
    <>
      <PageHeader
        title="Columns"
        description="Manage blog/column articles"
        icon={Newspaper}
        backHref="/web"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/columns/new">
                <Plus size={16} />
                New Article
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
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Articles ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No articles yet</h3>
            <p className="text-muted-foreground mb-6">Create articles for the Column pages.</p>
            <Button variant="gold" asChild>
              <Link href="/columns/new">
                <Plus size={16} />
                Create Article
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-muted/40">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      {item.title}
                      {item.featured && <Star size={14} className="text-yellow-500" />}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.author} • {item.category} • {new Date(item.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/columns/${item.id}/edit`}
                      className="inline-flex items-center p-2 border border-input rounded-md bg-card hover:bg-muted/50"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
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
