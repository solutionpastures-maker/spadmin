'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Tag,
  Image as ImageIcon,
  BookOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { useSeriesById, useUpdateSeries } from '@/lib/hooks/useSeries';
import { uploadAdminImage } from '@/lib/admin-api';
import { LoadingScreen } from '@/components/loading-screen';

export default function EditSeriesPage() {
  const params = useParams();
  const seriesId = params.seriesId as string;
  const router = useRouter();
  const { data: series, isLoading } = useSeriesById(seriesId);
  const updateMutation = useUpdateSeries();
  const [initialized, setInitialized] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    scriptures: [] as string[],
    imageFile: null as File | null,
  });
  const [newScripture, setNewScripture] = useState('');

  useEffect(() => {
    if (series && !initialized) {
      setFormData({
        title: series.title,
        description: series.description || '',
        tags: (series.tags || []).join(', '),
        scriptures: series.scripture || [],
        imageFile: null,
      });
      setExistingImageUrl(series.imageUrl || '');
      setInitialized(true);
    }
  }, [series, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = existingImageUrl;
      if (formData.imageFile) {
        const path = `series/${Date.now()}_${formData.imageFile.name}`;
        imageUrl = await uploadAdminImage(formData.imageFile, 'series', path);
      }

      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      await updateMutation.mutateAsync({
        id: seriesId,
        updates: {
          title: formData.title,
          description: formData.description || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          imageUrl: imageUrl || undefined,
          scripture: formData.scriptures.length > 0 ? formData.scriptures : undefined,
        },
      });

      router.push('/series');
    } catch (error) {
      console.error('Error updating series:', error);
      alert('Failed to update series');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleAddScripture = () => {
    if (newScripture.trim()) {
      setFormData((prev) => ({
        ...prev,
        scriptures: [...prev.scriptures, newScripture.trim()],
      }));
      setNewScripture('');
    }
  };

  const handleRemoveScripture = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scriptures: prev.scriptures.filter((_, i) => i !== index),
    }));
  };

  if (isLoading || !initialized) {
    return <LoadingScreen message="Loading series..." />;
  }

  return (
    <>
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
              <h1 className="text-2xl font-bold text-foreground">Edit Series</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Series Information</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Series Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter series title"
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter series description..."
                />
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
                <p className="mt-1 text-sm text-muted-foreground">Add multiple scripture references for this series (shown as thumbnail text)</p>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
                  Tags
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                    placeholder="Enter tags separated by commas (e.g., faith, hope, love)"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Separate multiple tags with commas</p>
              </div>
            </div>
          </div>

          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Series Image (Optional)</h2>

            <div className="space-y-4">
              {existingImageUrl && !formData.imageFile && (
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <img
                    src={existingImageUrl}
                    alt="Current series"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Current image</p>
                    <p className="text-xs text-muted-foreground truncate">{existingImageUrl}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center w-full">
                <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> a new image
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
                    onClick={() => setFormData((prev) => ({ ...prev, imageFile: null }))}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/series"
              className="px-6 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center space-x-2 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-accent text-primary font-semibold hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Series</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
