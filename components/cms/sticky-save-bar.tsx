'use client';

import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StickySaveBar({
  message,
  isSaving,
  saveLabel = 'Save changes',
}: {
  message?: string | null;
  isSaving?: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-lg">
          {message ? (
            <p
              className={`text-sm ${
                message.toLowerCase().includes('success') || message.toLowerCase().includes('saved')
                  ? 'text-green-700'
                  : message.toLowerCase().includes('fail') || message.toLowerCase().includes('could not')
                    ? 'text-red-600'
                    : 'text-muted-foreground'
              }`}
            >
              {message}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Changes appear on the website after you save.</p>
          )}
          <Button type="submit" variant="gold" disabled={isSaving} className="sm:min-w-[160px]">
            <Save size={16} />
            {isSaving ? 'Saving…' : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
