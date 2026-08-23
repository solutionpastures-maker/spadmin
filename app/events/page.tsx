'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Plus, Search, Trash2, RefreshCw, Pencil } from 'lucide-react';
import { useDeleteEvent, useEvents } from '@/lib/hooks/useEvents';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const { data: events = [], isLoading, refetch, isRefetching } = useEvents();
  const deleteMutation = useDeleteEvent();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(
    () =>
      events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [events, searchTerm]
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  if (isLoading) return <LoadingScreen message="Loading events..." />;

  return (
    <>
      <PageHeader
        title="Events"
        description="Manage church events for the website"
        icon={CalendarDays}
        backHref="/web"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/events/new">
                <Plus size={16} />
                New Event
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
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Events ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-6">Add events to power the website events page.</p>
            <Button variant="gold" asChild>
              <Link href="/events/new">
                <Plus size={16} />
                Create Event
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((event) => (
              <div key={event.id} className="px-6 py-4 hover:bg-muted/40">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.category || 'General'} • {new Date(event.eventDate).toLocaleDateString()}
                      {event.timeText ? ` • ${event.timeText}` : ''}
                    </p>
                    {event.location && (
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    )}
                    {event.registrationRequired && (
                      <p className="text-xs text-accent mt-1">Registration required</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href="/inbox"
                      className="inline-flex items-center p-2 border border-input rounded-md bg-card hover:bg-muted/50 text-sm"
                    >
                      RSVPs
                    </Link>
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="inline-flex items-center p-2 border border-input rounded-md bg-card hover:bg-muted/50"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
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
