'use client';

import { useState } from 'react';
import { BookHeart, Flag, Eye, EyeOff, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import {
  useDeleteDevotionComment,
  useDeleteDevotionPrayer,
  useDevotionCommentsAdmin,
  useDevotionPrayersAdmin,
  useUpdateDevotionCommentStatus,
  useUpdateDevotionPrayerStatus,
} from '@/lib/hooks/useDevotionEngagement';
import type { ModerationStatus } from '@/lib/devotion-engagement-store';

type Tab = 'prayers' | 'comments';

export default function DevotionEngagementPage() {
  const [tab, setTab] = useState<Tab>('prayers');
  const commentsQuery = useDevotionCommentsAdmin();
  const prayersQuery = useDevotionPrayersAdmin();
  const updateComment = useUpdateDevotionCommentStatus();
  const deleteComment = useDeleteDevotionComment();
  const updatePrayer = useUpdateDevotionPrayerStatus();
  const deletePrayer = useDeleteDevotionPrayer();

  if (commentsQuery.isLoading || prayersQuery.isLoading) {
    return <LoadingScreen message="Loading devotion engagement..." />;
  }

  const comments = commentsQuery.data || [];
  const prayers = prayersQuery.data || [];

  return (
    <>
      <PageHeader
        title="Devotion engagement"
        description="Moderate prayer requests and comments posted on daily devotionals."
        icon={BookHeart}
      />

      <div className="flex gap-2 mb-6">
        <Button variant={tab === 'prayers' ? 'default' : 'outline'} onClick={() => setTab('prayers')}>
          Prayer requests ({prayers.length})
        </Button>
        <Button variant={tab === 'comments' ? 'default' : 'outline'} onClick={() => setTab('comments')}>
          Comments ({comments.length})
        </Button>
      </div>

      {tab === 'prayers' && (
        <div className="space-y-3">
          {prayers.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">
                {item.isAnonymous ? 'Anonymous' : item.authorName || 'Member'}
                {item.isAnonymous && item.authorName ? (
                  <span className="ml-2 text-xs text-muted-foreground">(staff: {item.authorName})</span>
                ) : null}
              </p>
              <p className="mt-1">{item.text}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {item.status} · {new Date(item.createdAt).toLocaleString()}
              </p>
              <ModerationActions
                status={item.status}
                onStatus={(status) => updatePrayer.mutate({ id: item.id, status })}
                onDelete={() => {
                  if (confirm('Delete this prayer request?')) deletePrayer.mutate(item.id);
                }}
              />
            </article>
          ))}
          {prayers.length === 0 && (
            <p className="text-sm text-muted-foreground">No devotion prayer requests yet.</p>
          )}
        </div>
      )}

      {tab === 'comments' && (
        <div className="space-y-3">
          {comments.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">{item.authorName || 'Member'}</p>
              <p className="mt-1">{item.text}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {item.status} · {new Date(item.createdAt).toLocaleString()}
              </p>
              <ModerationActions
                status={item.status}
                onStatus={(status) => updateComment.mutate({ id: item.id, status })}
                onDelete={() => {
                  if (confirm('Delete this comment?')) deleteComment.mutate(item.id);
                }}
              />
            </article>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground">No devotion comments yet.</p>
          )}
        </div>
      )}
    </>
  );
}

function ModerationActions({
  status,
  onStatus,
  onDelete,
}: {
  status: ModerationStatus;
  onStatus: (status: ModerationStatus) => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {status !== 'visible' && (
        <Button size="sm" variant="outline" onClick={() => onStatus('visible')}>
          <Eye size={14} className="mr-1" />
          Visible
        </Button>
      )}
      {status !== 'flagged' && (
        <Button size="sm" variant="outline" onClick={() => onStatus('flagged')}>
          <Flag size={14} className="mr-1" />
          Flag
        </Button>
      )}
      {status !== 'removed' && (
        <Button size="sm" variant="outline" onClick={() => onStatus('removed')}>
          <EyeOff size={14} className="mr-1" />
          Hide
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={onDelete}>
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
