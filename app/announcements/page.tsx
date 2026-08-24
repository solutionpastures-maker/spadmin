'use client';

import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useAnnouncements, useDeleteAnnouncement } from '@/lib/hooks/useAnnouncements';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { formatDateTime, coerceDate } from '@/lib/devotional-payload';

export default function AnnouncementsPage() {
  const { data: announcements = [], isLoading, refetch, isRefetching } = useAnnouncements();
  const deleteMutation = useDeleteAnnouncement();

  const handleRefresh = () => {
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement');
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading announcements..." />;
  }

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Manage church announcements"
        icon={Megaphone}
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/announcements/new">
                <Plus size={16} />
                New Announcement
              </Link>
            </Button>
          </div>
        }
      />

        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold text-foreground">{announcements.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pinned</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {announcements.filter(a => a.pinned).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {announcements.filter(a => {
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return coerceDate(a.scheduledAt) > monthAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="bg-card shadow-sm border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">All Announcements</h2>
          </div>
          
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No announcements yet</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first announcement.</p>
              <Link
                href="/announcements/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-accent text-primary font-semibold hover:bg-accent/90"
              >
                <Plus size={16} className="mr-2" />
                Create Announcement
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="px-6 py-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-foreground truncate">
                          {announcement.title}
                        </h3>
                        {announcement.pinned && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pinned
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                          {announcement.type === 'weekly' ? 'Weekly activities' : 'Special'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {announcement.body}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDateTime(announcement.scheduledAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/announcements/${announcement.id}/edit`}
                        className="inline-flex items-center p-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="inline-flex items-center p-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
}
