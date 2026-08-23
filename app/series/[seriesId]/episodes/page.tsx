'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  ArrowLeft,
  Play,
  Calendar,
  User,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import { getSeriesById } from '../../../../lib/supabase-client';
import { getEpisodes, deleteEpisode } from '../../../../lib/supabase-client';
import { EpisodePlayer } from '@/components/episode-player';
import { EpisodePart, Series } from '@/lib/types';

interface Episode {
  id: string;
  series_id: string;
  title: string;
  description?: string;
  speaker: string;
  published_at: string;
  image_url?: string;
  transcript_url?: string;
  parts: EpisodePart[];
  chapters?: Array<{ title: string; start: number }>;
}

export default function EpisodesPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.seriesId as string;
  
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [seriesId]);

  const loadData = async () => {
    try {
      const [seriesData, episodesData] = await Promise.all([
        getSeriesById(seriesId),
        getEpisodes(seriesId)
      ]);
      setSeries(seriesData);
      setEpisodes(episodesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (confirm('Are you sure you want to delete this episode?')) {
      try {
        await deleteEpisode(episodeId);
        setEpisodes(prev => prev.filter(e => e.id !== episodeId));
      } catch (error) {
        console.error('Error deleting episode:', error);
        alert('Failed to delete episode');
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/series"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Series</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {series?.title || 'Episodes'}
                </h1>
                {series?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{series.description}</p>
                )}
              </div>
            </div>
            <Link
              href={`/series/${seriesId}/episodes/new`}
              className="flex items-center space-x-2 px-4 py-2 bg-accent text-primary font-semibold rounded-md hover:bg-accent/90 transition-all duration-200"
            >
              <Plus size={16} />
              <span>Add Episode</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Episodes List */}
        {episodes.length > 0 ? (
          <div className="space-y-4">
            {episodes.map((episode) => {
              const totalDuration = episode.parts.reduce((sum, part) => sum + part.duration, 0);
              
              return (
                <div key={episode.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {episode.title}
                          </h3>
                          {episode.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {episode.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleDeleteEpisode(episode.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete episode"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User size={14} className="mr-2" />
                          <span>{episode.speaker}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar size={14} className="mr-2" />
                          <span>{new Date(episode.published_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock size={14} className="mr-2" />
                          <span>{formatDuration(totalDuration)}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Play size={14} className="mr-2" />
                          <span>{episode.parts.length} part{episode.parts.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {episode.parts.length > 0 && (
                        <div className="mb-4">
                          <EpisodePlayer
                            parts={episode.parts}
                            episodeTitle={episode.title}
                          />
                        </div>
                      )}

                      {/* Chapters Preview */}
                      {episode.chapters && episode.chapters.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2">CHAPTERS:</p>
                          <div className="flex flex-wrap gap-2">
                            {episode.chapters.map((chapter, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary/10 text-blue-700"
                              >
                                {chapter.title} ({formatDuration(chapter.start)})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-4 mt-4 pt-4 border-t border-border">
                    <Link
                      href={`/series/${seriesId}/episodes/${episode.id}/edit`}
                      className="flex items-center text-primary hover:text-primary text-sm"
                    >
                      <Edit size={14} className="mr-1" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No episodes yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first episode to this series
            </p>
            <Link
              href={`/series/${seriesId}/episodes/new`}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-accent text-primary font-semibold rounded-md hover:bg-accent/90 transition-all duration-200"
            >
              <Plus size={16} />
              <span>Add First Episode</span>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

