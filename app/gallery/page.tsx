'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Plus, Search, Trash2, RefreshCw, Pencil } from 'lucide-react';
import { useDeleteGalleryAlbum, useGalleryAlbums } from '@/lib/hooks/useGallery';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  const { data: albums = [], isLoading, refetch, isRefetching } = useGalleryAlbums();
  const deleteMutation = useDeleteGalleryAlbum();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(
    () =>
      albums.filter(
        (album) =>
          album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          album.slug.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [albums, searchTerm]
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery album?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting album:', error);
      alert('Failed to delete album');
    }
  };

  if (isLoading) return <LoadingScreen message="Loading gallery..." />;

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Manage web gallery albums"
        icon={ImageIcon}
        backHref="/web"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/gallery/new">
                <Plus size={16} />
                New Album
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
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Albums ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No gallery albums</h3>
            <p className="text-muted-foreground mb-6">Create albums for website gallery pages.</p>
            <Button variant="gold" asChild>
              <Link href="/gallery/new">
                <Plus size={16} />
                Create Album
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((album) => (
              <div key={album.id} className="px-6 py-4 hover:bg-muted/40">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{album.title}</p>
                    <p className="text-sm text-muted-foreground">Slug: {album.slug}</p>
                    <p className="text-sm text-muted-foreground">
                      {album.imageCount} image(s) • {new Date(album.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/gallery/${album.id}/edit`}
                      className="inline-flex items-center p-2 border border-input rounded-md bg-card hover:bg-muted/50"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(album.id)}
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
