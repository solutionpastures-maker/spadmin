'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Trash2, RefreshCw, Pencil } from 'lucide-react';
import { useDeleteSmallGroup, useSmallGroups } from '@/lib/hooks/useSmallGroups';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';

export default function SmallGroupsPage() {
  const { data: groups = [], isLoading, refetch, isRefetching } = useSmallGroups();
  const deleteMutation = useDeleteSmallGroup();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(
    () =>
      groups.filter(
        (group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (group.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (group.leader || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (group.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [groups, searchTerm]
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this small group?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting small group:', error);
      alert('Failed to delete small group');
    }
  };

  if (isLoading) return <LoadingScreen message="Loading small groups..." />;

  return (
    <>
      <PageHeader
        title="Small Groups"
        description="Manage small groups shown on the website"
        icon={Users}
        backHref="/web"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/small-groups/new">
                <Plus size={16} />
                New Group
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search small groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Groups ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No small groups yet</h3>
            <p className="text-muted-foreground mb-6">Add groups to power the website small groups page.</p>
            <Button variant="gold" asChild>
              <Link href="/small-groups/new">
                <Plus size={16} />
                Create Group
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((group) => (
              <div key={group.id} className="px-6 py-4 hover:bg-muted/40">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.category || 'General'}
                      {group.leader ? ` • Led by ${group.leader}` : ''}
                    </p>
                    {(group.meetingDay || group.meetingTime) && (
                      <p className="text-sm text-muted-foreground">
                        {[group.meetingDay, group.meetingTime].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    {group.location && (
                      <p className="text-sm text-muted-foreground">{group.location}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/small-groups/${group.id}/edit`}
                      className="inline-flex items-center p-2 border border-input rounded-md bg-card hover:bg-muted/50"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(group.id)}
                      className="inline-flex items-center p-2 border border-input rounded-md bg-card hover:bg-muted/50"
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
