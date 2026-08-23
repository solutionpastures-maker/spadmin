'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  BookOpen,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { useCreateDevotional } from '../../../lib/hooks/useDevotionals';
import { uploadAdminImage } from '../../../lib/admin-api';

export default function NewDevotionalPage() {
  const router = useRouter();
  const createMutation = useCreateDevotional();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    verse: '',
    author: '',
    publishedAt: '',
    imageFile: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload image if provided
      let imageUrl = '';
      if (formData.imageFile) {
        const path = `devotionals/${Date.now()}_${formData.imageFile.name}`;
        imageUrl = await uploadAdminImage(formData.imageFile, 'series', path);
      }

      const publishedDate = formData.publishedAt 
        ? new Date(formData.publishedAt) 
        : new Date();

      await createMutation.mutateAsync({
        title: formData.title,
        content: formData.content,
        verse: formData.verse || undefined,
        author: formData.author || undefined,
        published_at: publishedDate.toISOString(),
        image_url: imageUrl || undefined,
      });
      
      router.push('/devotionals');
    } catch (error) {
      console.error('Error creating devotional:', error);
      alert('Failed to create devotional');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/devotionals"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Devotionals</span>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Create New Devotional</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Devotional Information</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter devotional title"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter devotional content..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="verse" className="block text-sm font-medium text-foreground mb-2">
                    Scripture Reference
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      id="verse"
                      value={formData.verse}
                      onChange={(e) => setFormData(prev => ({ ...prev, verse: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                      placeholder="e.g., John 3:16"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-foreground mb-2">
                    Author
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                      placeholder="Enter author name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Devotional Image (Optional)</h2>
            
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

          {/* Publishing Settings */}
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Publishing Settings</h2>
            
            <div className="space-y-6">
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
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/devotionals"
              className="px-6 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center space-x-2 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-accent text-primary font-semibold hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Create Devotional</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
