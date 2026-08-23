'use client';

import { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Filter,
  Eye,
  EyeOff,
  Flag,
  Trash2,
  Search,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useComments, useUpdateCommentStatus, useDeleteComment } from '@/lib/hooks/useComments';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { useEpisodes } from '@/lib/hooks/useEpisodes';
import type { Comment } from '@/lib/types';

type StatusFilter = 'all' | 'visible' | 'flagged' | 'removed';

export default function CommentsPage() {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all episodes for filter dropdown
  const { data: episodes = [] } = useEpisodes();
  
  // Fetch comments
  const { data: comments = [], isLoading, refetch, isRefetching } = useComments(selectedEpisodeId);
  const updateStatusMutation = useUpdateCommentStatus();
  const deleteMutation = useDeleteComment();

  // Filter comments
  const filteredComments = useMemo(() => {
    let filtered = comments;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.text.toLowerCase().includes(term) ||
        c.user_profiles?.name?.toLowerCase().includes(term) ||
        c.user_profiles?.email?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [comments, statusFilter, searchTerm]);

  const handleStatusChange = async (commentId: string, newStatus: 'visible' | 'flagged' | 'removed') => {
    try {
      await updateStatusMutation.mutateAsync({ id: commentId, status: newStatus });
    } catch (error) {
      console.error('Error updating comment status:', error);
      alert('Failed to update comment status');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Failed to delete comment');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visible':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Visible
        </span>;
      case 'flagged':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Flag size={12} className="mr-1" />
          Flagged
        </span>;
      case 'removed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={12} className="mr-1" />
          Removed
        </span>;
      default:
        return null;
    }
  };

  const stats = {
    total: comments.length,
    visible: comments.filter(c => c.status === 'visible').length,
    flagged: comments.filter(c => c.status === 'flagged').length,
    removed: comments.filter(c => c.status === 'removed').length,
  };

  if (isLoading) {
    return <LoadingScreen message="Loading comments..." />;
  }

  return (
    <>
      <PageHeader
        title="Comments"
        description="Moderate user comments"
        icon={MessageSquare}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/prayer-line">Prayer Line</Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        }
      />

        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Visible</p>
                  <p className="text-2xl font-semibold text-foreground">{stats.visible}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Flag className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Flagged</p>
                  <p className="text-2xl font-semibold text-foreground">{stats.flagged}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Removed</p>
                  <p className="text-2xl font-semibold text-foreground">{stats.removed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Episode Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Filter by Episode
              </label>
              <select
                value={selectedEpisodeId || ''}
                onChange={(e) => setSelectedEpisodeId(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
              >
                <option value="">All Episodes</option>
                {episodes.map(episode => (
                  <option key={episode.id} value={episode.id}>
                    {episode.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
              >
                <option value="all">All Status</option>
                <option value="visible">Visible</option>
                <option value="flagged">Flagged</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search comments..."
                  className="w-full pl-10 pr-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-card shadow-sm border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">
              Comments ({filteredComments.length})
            </h2>
          </div>
          
          {filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No comments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedEpisodeId || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No comments have been posted yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredComments.map((comment: Comment) => {
                const user = comment.user_profiles || { name: 'Anonymous', email: '' };
                const episode = episodes.find(e => e.id === comment.episode_id);
                
                return (
                  <div key={comment.id} className="px-6 py-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">
                                {user.name?.[0]?.toUpperCase() || 'A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{user.name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          {getStatusBadge(comment.status)}
                        </div>
                        
                        {episode && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Episode: <span className="font-medium">{episode.title}</span>
                          </p>
                        )}
                        
                        <p className="text-sm text-foreground mb-2">{comment.text}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{formatDate(new Date(comment.created_at))}</span>
                          {(comment.likes_count ?? 0) > 0 && (
                            <span>{comment.likes_count} likes</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {comment.status !== 'visible' && (
                          <button
                            onClick={() => handleStatusChange(comment.id, 'visible')}
                            className="inline-flex items-center px-3 py-1.5 border border-input rounded-md shadow-sm text-xs font-medium text-foreground bg-card hover:bg-muted/50"
                            title="Approve"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </button>
                        )}
                        {comment.status !== 'flagged' && (
                          <button
                            onClick={() => handleStatusChange(comment.id, 'flagged')}
                            className="inline-flex items-center px-3 py-1.5 border border-yellow-300 rounded-md shadow-sm text-xs font-medium text-yellow-700 bg-card hover:bg-yellow-50"
                            title="Flag"
                          >
                            <Flag size={14} className="mr-1" />
                            Flag
                          </button>
                        )}
                        {comment.status !== 'removed' && (
                          <button
                            onClick={() => handleStatusChange(comment.id, 'removed')}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-card hover:bg-red-50"
                            title="Remove"
                          >
                            <EyeOff size={14} className="mr-1" />
                            Remove
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-card hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </>
  );
}

