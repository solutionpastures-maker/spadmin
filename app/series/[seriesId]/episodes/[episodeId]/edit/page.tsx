'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { useEpisodeById, useUpdateEpisode } from '@/lib/hooks/useEpisodes';
import { uploadAdminImage } from '@/lib/admin-api';
import { formatDuration } from '@/lib/playback-utils';
import { LoadingScreen } from '@/components/loading-screen';
import type { Chapter, EpisodePart } from '@/lib/types';

type EpisodeRow = {
  id: string;
  series_id: string;
  title: string;
  description?: string;
  speaker: string;
  published_at: string;
  image_url?: string;
  transcript_url?: string;
  parts?: EpisodePart[];
  chapters?: Chapter[];
};

function toDatetimeLocalValue(date: Date | string): string {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function EditEpisodePage() {
  const params = useParams();
  const seriesId = params.seriesId as string;
  const episodeId = params.episodeId as string;
  const router = useRouter();
  const { data: episodeData, isLoading } = useEpisodeById(episodeId);
  const updateMutation = useUpdateEpisode();
  const [initialized, setInitialized] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [parts, setParts] = useState<EpisodePart[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapter, setNewChapter] = useState({ title: '', start: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    publishedAt: '',
    transcriptUrl: '',
    imageFile: null as File | null,
  });

  useEffect(() => {
    if (episodeData && !initialized) {
      const episode = episodeData as EpisodeRow;
      setFormData({
        title: episode.title,
        description: episode.description || '',
        speaker: episode.speaker,
        publishedAt: toDatetimeLocalValue(episode.published_at),
        transcriptUrl: episode.transcript_url || '',
        imageFile: null,
      });
      setExistingImageUrl(episode.image_url || '');
      setParts(Array.isArray(episode.parts) ? episode.parts : []);
      setChapters(Array.isArray(episode.chapters) ? episode.chapters : []);
      setInitialized(true);
    }
  }, [episodeData, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = existingImageUrl;
      if (formData.imageFile) {
        const path = `episodes/${Date.now()}_${formData.imageFile.name}`;
        imageUrl = await uploadAdminImage(formData.imageFile, 'series', path);
      }

      await updateMutation.mutateAsync({
        id: episodeId,
        updates: {
          title: formData.title,
          description: formData.description || undefined,
          speaker: formData.speaker,
          published_at: formData.publishedAt
            ? new Date(formData.publishedAt).toISOString()
            : new Date().toISOString(),
          image_url: imageUrl || undefined,
          transcript_url: formData.transcriptUrl || undefined,
          parts,
          chapters: chapters.length > 0 ? chapters : undefined,
        },
      });

      router.push(`/series/${seriesId}/episodes`);
    } catch (error) {
      console.error('Error updating episode:', error);
      alert('Failed to update episode');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleAddChapter = () => {
    const start = parseInt(newChapter.start, 10) || 0;
    if (!newChapter.title.trim()) {
      alert('Please enter a chapter title');
      return;
    }
    if (start < 0) {
      alert('Please enter a valid start time in seconds');
      return;
    }

    setChapters(
      [...chapters, { title: newChapter.title.trim(), start }].sort((a, b) => a.start - b.start)
    );
    setNewChapter({ title: '', start: '' });
  };

  const handleRemoveChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  if (isLoading || !initialized) {
    return <LoadingScreen message="Loading episode..." />;
  }

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Link
              href={`/series/${seriesId}/episodes`}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Episodes</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Edit Episode</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Episode Information</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Episode Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-foreground"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="speaker" className="block text-sm font-medium text-foreground mb-2">
                    Speaker *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="speaker"
                      required
                      value={formData.speaker}
                      onChange={(e) => setFormData((prev) => ({ ...prev, speaker: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="publishedAt" className="block text-sm font-medium text-foreground mb-2">
                    Publish Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="datetime-local"
                      id="publishedAt"
                      required
                      value={formData.publishedAt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md text-foreground"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="transcriptUrl" className="block text-sm font-medium text-foreground mb-2">
                  Transcript URL (Optional)
                </label>
                <input
                  type="url"
                  id="transcriptUrl"
                  value={formData.transcriptUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, transcriptUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-foreground"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Episode Image (Optional)</h2>
            <div className="space-y-4">
              {existingImageUrl && !formData.imageFile && (
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <img src={existingImageUrl} alt="Current episode" className="w-16 h-16 object-cover rounded-lg" />
                  <p className="text-sm text-muted-foreground truncate flex-1">{existingImageUrl}</p>
                </div>
              )}
              <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload new image</span>
                <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {formData.imageFile && (
                <p className="text-sm text-muted-foreground">New file: {formData.imageFile.name}</p>
              )}
            </div>
          </div>

          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-2">Audio Parts</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Audio parts are read-only here. To replace audio, create a new episode or use the podcast admin tools.
            </p>
            {parts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No parts on this episode.</p>
            ) : (
              <div className="space-y-2">
                {parts.map((part, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-foreground">{part.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {part.source === 'supabase' ? 'Supabase' : 'Google Drive'} • {formatDuration(part.duration)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Chapters</h2>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newChapter.title}
                  onChange={(e) => setNewChapter((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-foreground"
                  placeholder="Chapter title"
                />
                <input
                  type="number"
                  min="0"
                  value={newChapter.start}
                  onChange={(e) => setNewChapter((prev) => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-foreground"
                  placeholder="Start (seconds)"
                />
              </div>
              <button
                type="button"
                onClick={handleAddChapter}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-primary font-semibold hover:bg-accent/90"
              >
                <Plus size={16} />
                Add Chapter
              </button>
              {chapters.length > 0 && (
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{chapter.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(chapter.start / 60)}:{(chapter.start % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <button type="button" onClick={() => handleRemoveChapter(index)} className="text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href={`/series/${seriesId}/episodes`}
              className="px-6 py-2 border border-input rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted/50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-accent text-primary font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              <Save size={16} />
              {updateMutation.isPending ? 'Saving...' : 'Save Episode'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
