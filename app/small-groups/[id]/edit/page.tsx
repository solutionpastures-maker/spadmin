'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useSmallGroupById, useUpdateSmallGroup } from '@/lib/hooks/useSmallGroups';
import { LoadingScreen } from '@/components/loading-screen';

export default function EditSmallGroupPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: group, isLoading } = useSmallGroupById(id);
  const updateMutation = useUpdateSmallGroup();
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader: '',
    category: '',
    meetingDay: '',
    meetingTime: '',
    location: '',
  });

  useEffect(() => {
    if (group && !initialized) {
      setFormData({
        name: group.name,
        description: group.description || '',
        leader: group.leader || '',
        category: group.category || '',
        meetingDay: group.meetingDay || '',
        meetingTime: group.meetingTime || '',
        location: group.location || '',
      });
      setInitialized(true);
    }
  }, [group, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        updates: {
          name: formData.name,
          description: formData.description || undefined,
          leader: formData.leader || undefined,
          category: formData.category || undefined,
          meeting_day: formData.meetingDay || undefined,
          meeting_time: formData.meetingTime || undefined,
          location: formData.location || undefined,
        },
      });
      router.push('/small-groups');
    } catch (error) {
      console.error('Error updating small group:', error);
      alert('Failed to update small group');
    }
  };

  if (isLoading || !initialized) {
    return <LoadingScreen message="Loading small group..." />;
  }

  return (
    <>
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/small-groups"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Small Groups</span>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Edit Small Group</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card shadow-sm border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium text-foreground mb-6">Group Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Young Adults Connect"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Youth, Couples, Men, Women..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Leader</label>
                <input
                  value={formData.leader}
                  onChange={(e) => setFormData((prev) => ({ ...prev, leader: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Pastor John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Meeting Day</label>
                <input
                  value={formData.meetingDay}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meetingDay: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Every Wednesday"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Meeting Time</label>
                <input
                  value={formData.meetingTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, meetingTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="7:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <input
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Fellowship Hall"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/small-groups"
              className="px-4 py-2 border border-input rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted/50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm bg-accent text-primary font-semibold hover:bg-accent/90 disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Group'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
