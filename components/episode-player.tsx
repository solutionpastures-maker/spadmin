'use client';

import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { EpisodePart } from '@/lib/types';
import {
  getPartPlaybackUrl,
  normalizeEpisodePart,
  formatDuration,
} from '@/lib/playback-utils';
import { cn } from '@/lib/utils';

interface EpisodePlayerProps {
  parts: EpisodePart[];
  episodeTitle?: string;
  className?: string;
}

export function EpisodePlayer({ parts, episodeTitle, className }: EpisodePlayerProps) {
  const normalizedParts = useMemo(
    () => parts.map((p) => normalizeEpisodePart(p)),
    [parts]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activePart = normalizedParts[activeIndex];
  const playbackUrl = activePart ? getPartPlaybackUrl(activePart) : null;

  if (normalizedParts.length === 0) {
    return null;
  }

  return (
    <div className={cn('rounded-xl border border-border bg-muted/30 p-4 space-y-3', className)}>
      {episodeTitle && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Preview — {episodeTitle}
        </p>
      )}

      {normalizedParts.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {normalizedParts.map((part, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-all duration-200',
                index === activeIndex
                  ? 'bg-accent text-primary'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {part.title || `Part ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      {playbackUrl ? (
        <div>
          <audio
            key={playbackUrl}
            controls
            preload="metadata"
            className="w-full h-10"
            src={playbackUrl}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>
              {activePart.title || `Part ${activeIndex + 1}`}
              <span className="ml-2 opacity-70">
                ({activePart.source === 'supabase' ? 'Supabase' : 'Google Drive'})
              </span>
            </span>
            <span>{formatDuration(activePart.duration)}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle size={16} />
          <span>No playable URL for this part</span>
        </div>
      )}
    </div>
  );
}
