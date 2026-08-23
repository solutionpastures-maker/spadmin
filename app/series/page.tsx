'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Calendar, Tag, Image as ImageIcon, BookOpen } from 'lucide-react';
import { useSeries, useDeleteSeries } from '@/lib/hooks/useSeries';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';

export default function SeriesPage() {
  const { data: seriesData = [], isLoading } = useSeries();
  const deleteMutation = useDeleteSeries();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDeleteSeries = async (seriesId: string) => {
    if (confirm('Are you sure you want to delete this series? This will also delete all episodes in this series.')) {
      try {
        await deleteMutation.mutateAsync(seriesId);
      } catch (error) {
        console.error('Error deleting series:', error);
        alert('Failed to delete series');
      }
    }
  };

  const filteredSeries = useMemo(() => {
    return seriesData.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [seriesData, searchTerm]);

  if (isLoading) {
    return <LoadingScreen message="Loading series..." />;
  }

  return (
  <>
      <PageHeader
        title="Series"
        description={`${seriesData.length} total — manage sermon series`}
        icon={BookOpen}
        action={
          <Button variant="gold" asChild>
            <Link href="/series/new">
              <Plus size={16} />
              New Series
            </Link>
          </Button>
        }
      />

      <div className="mb-8">
        <div className="bg-card rounded-xl shadow-sm border border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {filteredSeries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeries.map((seriesItem) => (
            <div
              key={seriesItem.id}
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
            >
              <div className="aspect-video bg-muted relative">
                {seriesItem.imageUrl ? (
                  <img src={seriesItem.imageUrl} alt={seriesItem.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                    {seriesItem.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDeleteSeries(seriesItem.id)}
                    className="text-destructive hover:text-destructive/80 p-1"
                    title="Delete series"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{seriesItem.description}</p>
                {seriesItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {seriesItem.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar size={14} className="mr-2" />
                  {new Date(seriesItem.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center justify-between">
                  <Link href={`/series/${seriesItem.id}/episodes`} className="text-sm font-medium text-primary hover:underline">
                    View Episodes →
                  </Link>
                  <Link href={`/series/${seriesItem.id}/edit`} className="flex items-center text-sm text-primary hover:underline">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{searchTerm ? 'No series found' : 'No series yet'}</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first series'}
          </p>
          {!searchTerm && (
            <Button variant="gold" asChild>
              <Link href="/series/new">
                <Plus size={16} />
                Create First Series
              </Link>
            </Button>
          )}
        </div>
      )}
  </>
  );
}
