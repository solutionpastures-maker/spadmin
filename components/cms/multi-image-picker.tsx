'use client';

import { useRef, useState } from 'react';
import { ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react';
import { uploadAdminImage } from '@/lib/admin-api';
import { FormField, inputClass } from './form-section';

export type ImageItem = { id: string; url: string; caption?: string };

function newImageId() {
  return crypto.randomUUID();
}

export function MultiImagePicker({
  label,
  images,
  onChange,
  uploadPathPrefix = 'website/gallery',
  hint = 'Upload photos one at a time. Add a caption if you like.',
}: {
  label: string;
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  uploadPathPrefix?: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError(null);
    setIsUploading(true);

    try {
      const uploaded: ImageItem[] = [];
      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) {
          setError('Each image must be 10MB or smaller.');
          continue;
        }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${uploadPathPrefix}/${Date.now()}_${safeName}`;
        const url = await uploadAdminImage(file, 'series', path);
        uploaded.push({ id: newImageId(), url });
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } catch (uploadError) {
      console.error(uploadError);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <FormField label={label} hint={hint}>
        <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-input rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 px-4 text-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">Tap to add photos</p>
              <p className="text-xs text-muted-foreground mt-1">You can select multiple images</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={isUploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </FormField>

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((image, index) => (
            <div key={image.id} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="w-full h-full object-cover" />
              </div>
              <input
                className={inputClass}
                value={image.caption || ''}
                onChange={(e) => {
                  const next = [...images];
                  next[index] = { ...image, caption: e.target.value };
                  onChange(next);
                }}
                placeholder="Caption (optional)"
              />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
              >
                <Trash2 className="h-4 w-4" />
                Remove photo
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isUploading}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Add more photos
      </button>
    </div>
  );
}
