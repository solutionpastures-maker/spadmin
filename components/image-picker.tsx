'use client';

import { useId, useRef, useState } from 'react';
import { ImageIcon, Link2, Loader2, Upload, X } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

interface ImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  uploadPathPrefix?: string;
  hint?: string;
  className?: string;
}

export function ImagePicker({
  label,
  value,
  onChange,
  bucket = 'series',
  uploadPathPrefix = 'website/about',
  hint = 'PNG or JPG, up to 10MB. You can upload a file or paste a link.',
  className,
}: ImagePickerProps) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be 10MB or smaller.');
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${uploadPathPrefix}/${Date.now()}_${safeName}`;
      const form = new FormData();
      form.append('file', file);
      form.append('bucket', bucket);
      form.append('path', path);
      const res = await adminFetch('/api/upload/image', { method: 'POST', body: form });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        throw new Error(body.error || 'Upload failed');
      }
      onChange(body.url);
    } catch (uploadError) {
      console.error(uploadError);
      setError('Upload failed. Try again or paste an image link below.');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
      </label>

      {value ? (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/30">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm font-medium text-foreground">Current image</p>
            <p className="text-xs text-muted-foreground break-all line-clamp-2">{value}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            'flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed rounded-xl cursor-pointer transition-colors',
            isUploading
              ? 'border-primary/40 bg-primary/5'
              : 'border-input bg-muted/20 hover:bg-muted/40 hover:border-primary/30'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 px-4 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-foreground font-medium">
                Tap to upload an image
              </p>
              <p className="text-xs text-muted-foreground mt-1">{hint}</p>
            </div>
          )}
        </label>
      )}

      <input
        id={inputId}
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isUploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => setShowUrlField((prev) => !prev)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Link2 className="h-4 w-4" />
        {showUrlField ? 'Hide link field' : 'Or paste an image link'}
      </button>

      {showUrlField && (
        <input
          type="url"
          value={value}
          onChange={(e) => {
            setError(null);
            onChange(e.target.value);
          }}
          placeholder="https://example.com/photo.jpg"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
