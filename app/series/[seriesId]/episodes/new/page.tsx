'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Trash2,
  Calendar,
  User,
  Clock,
  Link as LinkIcon,
  BookOpen,
  Image as ImageIcon,
  Upload,
  Music,
} from 'lucide-react';
import { createEpisode, getSeriesById } from '@/lib/supabase-client';
import { adminFetch, uploadAdminImage } from '@/lib/admin-api';
import { extractDriveFileId, isValidDriveUrl } from '@/lib/drive-utils';
import {
  getAudioDurationFromFile,
  formatDuration,
  assertAudioFileWithinLimit,
  isAudioFileTooLarge,
  formatFileSize,
  SERMON_AUDIO_MAX_MB,
} from '@/lib/playback-utils';
import { EpisodePart, Chapter } from '@/lib/types';

export default function NewEpisodePage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    publishedAt: '',
    scriptures: [] as string[],
    transcriptUrl: '',
    imageFile: null as File | null,
  });
  const [newScripture, setNewScripture] = useState('');
  const [parts, setParts] = useState<EpisodePart[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [uploadSessionId] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const [partInputMode, setPartInputMode] = useState<'upload' | 'drive'>('upload');
  const [isUploadingPart, setIsUploadingPart] = useState(false);
  const [newPart, setNewPart] = useState({
    title: '',
    driveUrl: '',
    duration: '',
    audioFile: null as File | null,
  });
  const [newChapter, setNewChapter] = useState({ title: '', start: '' });
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const hasPendingUpload =
    partInputMode === 'upload' &&
    !!newPart.audioFile &&
    !isAudioFileTooLarge(newPart.audioFile);
  const canCreateEpisode = parts.length > 0 || hasPendingUpload;

  const switchPartInputMode = (mode: 'upload' | 'drive') => {
    setPartInputMode(mode);
    if (mode === 'upload') {
      setNewPart((prev) => ({ ...prev, driveUrl: '', duration: '' }));
    } else {
      setNewPart((prev) => ({ ...prev, audioFile: null }));
      if (audioFileInputRef.current) audioFileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    loadSeries();
  }, [seriesId]);

  const loadSeries = async () => {
    try {
      const series = await getSeriesById(seriesId);
      if (series) {
        setSeriesTitle(series.title);
      }
    } catch (error) {
      console.error('Error loading series:', error);
    }
  };

  const uploadAudioPart = async (
    file: File,
    title: string,
    partIndex: number
  ): Promise<EpisodePart> => {
    assertAudioFileWithinLimit(file);
    const duration = await getAudioDurationFromFile(file);
    const body = new FormData();
    body.append('file', file);
    body.append('seriesId', seriesId);
    body.append('uploadSessionId', uploadSessionId);
    body.append('partIndex', String(partIndex));

    const res = await adminFetch('/api/upload/audio', { method: 'POST', body });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return {
      title,
      duration,
      source: 'supabase',
      storagePath: data.storagePath,
    };
  };

  const buildDrivePart = (): EpisodePart | null => {
    if (!newPart.driveUrl || !isValidDriveUrl(newPart.driveUrl)) {
      alert('Please enter a valid Google Drive URL');
      return null;
    }
    const fileId = extractDriveFileId(newPart.driveUrl);
    if (!fileId) {
      alert('Could not extract file ID from Google Drive URL');
      return null;
    }
    const duration = parseInt(newPart.duration, 10) || 0;
    if (duration <= 0) {
      alert('Please enter a valid duration in seconds');
      return null;
    }
    return {
      title: newPart.title || `Part ${parts.length + 1}`,
      fileId,
      duration,
      source: 'drive',
    };
  };

  const resolvePartsForSubmit = async (): Promise<EpisodePart[] | null> => {
    if (parts.length > 0) {
      return parts;
    }
    if (partInputMode === 'upload' && newPart.audioFile) {
      setIsUploadingPart(true);
      try {
        const part = await uploadAudioPart(
          newPart.audioFile,
          newPart.title || 'Part 1',
          1
        );
        return [part];
      } finally {
        setIsUploadingPart(false);
      }
    }
    if (partInputMode === 'drive') {
      const part = buildDrivePart();
      return part ? [part] : null;
    }
    alert('Add at least one audio part: upload a file or add a Drive link.');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const episodeParts = await resolvePartsForSubmit();
      if (!episodeParts || episodeParts.length === 0) {
        setIsLoading(false);
        return;
      }

      // Upload image if provided
      let imageUrl = '';
      if (formData.imageFile) {
        const path = `episodes/${Date.now()}_${formData.imageFile.name}`;
        imageUrl = await uploadAdminImage(formData.imageFile, 'series', path);
      }

      await createEpisode({
        series_id: seriesId,
        title: formData.title,
        description: formData.description || undefined,
        speaker: formData.speaker,
        published_at: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : new Date().toISOString(),
        parts: episodeParts,
        chapters: chapters.length > 0 ? chapters : undefined,
        image_url: imageUrl || undefined,
        scripture: formData.scriptures.length > 0 ? formData.scriptures : undefined,
        transcript_url: formData.transcriptUrl || undefined,
      });
      
      router.push(`/series/${seriesId}/episodes`);
    } catch (error) {
      console.error('Error creating episode:', error);
      alert('Failed to create episode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleAddScripture = () => {
    if (newScripture.trim()) {
      setFormData(prev => ({
        ...prev,
        scriptures: [...prev.scriptures, newScripture.trim()]
      }));
      setNewScripture('');
    }
  };

  const handleRemoveScripture = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scriptures: prev.scriptures.filter((_, i) => i !== index)
    }));
  };

  const resetNewPart = () => {
    setNewPart({ title: '', driveUrl: '', duration: '', audioFile: null });
    if (audioFileInputRef.current) audioFileInputRef.current.value = '';
  };

  const handleAddPart = async (mode: 'upload' | 'drive') => {
    const partTitle = newPart.title || `Part ${parts.length + 1}`;

    if (mode === 'upload') {
      if (!newPart.audioFile) {
        alert('Please select an audio file');
        return;
      }

      setIsUploadingPart(true);
      try {
        const part = await uploadAudioPart(
          newPart.audioFile,
          partTitle,
          parts.length + 1
        );
        setParts([...parts, part]);
        resetNewPart();
      } catch (error) {
        console.error('Audio upload error:', error);
        alert(error instanceof Error ? error.message : 'Failed to upload audio');
      } finally {
        setIsUploadingPart(false);
      }
      return;
    }

    const part = buildDrivePart();
    if (!part) return;
    setParts([...parts, { ...part, title: partTitle }]);
    resetNewPart();
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleAddChapter = () => {
    const start = parseInt(newChapter.start) || 0;
    if (start < 0) {
      alert('Please enter a valid start time in seconds');
      return;
    }

    setChapters([...chapters, {
      title: newChapter.title,
      start,
    }].sort((a, b) => a.start - b.start));

    setNewChapter({ title: '', start: '' });
  };

  const handleRemoveChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/series/${seriesId}/episodes`}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Episodes</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">New Episode</h1>
                {seriesTitle && (
                  <p className="text-sm text-muted-foreground">Series: {seriesTitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Basic Information */}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter episode title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter episode description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="speaker" className="block text-sm font-medium text-foreground mb-2">
                    Speaker *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      id="speaker"
                      required
                      value={formData.speaker}
                      onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                      placeholder="Enter speaker name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="publishedAt" className="block text-sm font-medium text-foreground mb-2">
                    Publish Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="datetime-local"
                      id="publishedAt"
                      required
                      value={formData.publishedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Scripture References
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        value={newScripture}
                        onChange={(e) => setNewScripture(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddScripture();
                          }
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                        placeholder="e.g., John 3:16"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddScripture}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-accent text-primary font-semibold hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  {formData.scriptures.length > 0 && (
                    <div className="space-y-2">
                      {formData.scriptures.map((scripture, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{scripture}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveScripture(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Add multiple scripture references for this episode (shown as thumbnail text)</p>
              </div>

              <div>
                <label htmlFor="transcriptUrl" className="block text-sm font-medium text-foreground mb-2">
                  Transcript URL (Optional)
                </label>
                <input
                  type="url"
                  id="transcriptUrl"
                  value={formData.transcriptUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, transcriptUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Episode Image */}
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Episode Image (Optional)</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              {formData.imageFile && (
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <img
                    src={URL.createObjectURL(formData.imageFile)}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{formData.imageFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageFile: null }))}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Parts */}
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-2">Audio Parts *</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose <strong>one</strong> source per part — upload a file <em>or</em> a Drive link, not both.
              You can click <strong>Create Episode</strong> after selecting a file; adding to the list first is optional.
            </p>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => switchPartInputMode('upload')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    partInputMode === 'upload'
                      ? 'bg-accent text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Upload size={16} />
                    Upload
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => switchPartInputMode('drive')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    partInputMode === 'drive'
                      ? 'bg-accent text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <LinkIcon size={16} />
                    Drive
                  </span>
                </button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Part Title
                  </label>
                  <input
                    type="text"
                    value={newPart.title}
                    onChange={(e) => setNewPart((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                    placeholder="Part 1"
                  />
                </div>

                {partInputMode === 'upload' ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Audio file *
                    </label>
                    <input
                      ref={audioFileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
                      className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-primary file:font-semibold"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (isAudioFileTooLarge(file)) {
                          alert(
                            `This file is ${formatFileSize(file.size)}. Maximum upload is ${SERMON_AUDIO_MAX_MB}MB on your Supabase plan. Use a smaller MP3, split into parts, or use Google Drive.`
                          );
                          e.target.value = '';
                          return;
                        }
                        setNewPart((prev) => ({ ...prev, audioFile: file }));
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Max {SERMON_AUDIO_MAX_MB}MB per file (Supabase Free tier). Long sermons: split into parts or use Drive.
                    </p>
                    {newPart.audioFile && (
                      <p
                        className={`text-sm flex items-center gap-2 ${
                          isAudioFileTooLarge(newPart.audioFile)
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Music className="h-4 w-4 shrink-0" />
                        {newPart.audioFile.name} ({formatFileSize(newPart.audioFile.size)})
                        {!isAudioFileTooLarge(newPart.audioFile) && ' — ready to upload'}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddPart('upload')}
                      disabled={
                        isUploadingPart ||
                        !newPart.audioFile ||
                        isAudioFileTooLarge(newPart.audioFile)
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-accent text-primary font-semibold rounded-md hover:bg-accent/90 disabled:opacity-50"
                    >
                      {isUploadingPart ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          <span>Uploading…</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Add Part to List</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Google Drive URL *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                          type="url"
                          value={newPart.driveUrl}
                          onChange={(e) =>
                            setNewPart((prev) => ({ ...prev, driveUrl: e.target.value }))
                          }
                          className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                          placeholder="https://drive.google.com/..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Duration (seconds) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={newPart.duration}
                          onChange={(e) =>
                            setNewPart((prev) => ({ ...prev, duration: e.target.value }))
                          }
                          className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                          placeholder="3600"
                        />
                      </div>
                    </div>
                  </div>
                    <button
                      type="button"
                      onClick={() => handleAddPart('drive')}
                      className="flex items-center space-x-2 px-4 py-2 bg-accent text-primary font-semibold rounded-md hover:bg-accent/90"
                    >
                      <Plus size={16} />
                      <span>Add Part to List</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Parts List */}
              {parts.length > 0 && (
                <div className="space-y-2">
                  {parts.map((part, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{part.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {part.source === 'supabase' ? 'Supabase' : 'Google Drive'}
                          {part.storagePath && ` · ${part.storagePath}`}
                          {part.fileId && ` · ${part.fileId.slice(0, 12)}…`}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDuration(part.duration)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chapters */}
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Chapters (Optional)</h2>
            
            <div className="space-y-4">
              {/* Add Chapter Form */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Chapter Title *
                    </label>
                    <input
                      type="text"
                      value={newChapter.title}
                      onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                      placeholder="Introduction"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Time (seconds) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newChapter.start}
                      onChange={(e) => setNewChapter(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                      placeholder="0"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Add Chapter</span>
                </button>
              </div>

              {/* Chapters List */}
              {chapters.length > 0 && (
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{chapter.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(chapter.start / 60)}:{(chapter.start % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChapter(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href={`/series/${seriesId}/episodes`}
              className="px-6 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || isUploadingPart || !canCreateEpisode}
              className="flex items-center space-x-2 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-accent text-primary font-semibold hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Create Episode</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

