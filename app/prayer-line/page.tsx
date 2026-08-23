'use client';

import { useMemo, useState } from 'react';
import {
  HandHeart,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Flag,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '@/components/image-picker';
import { FormField, FormSection, inputClass, textareaClass } from '@/components/cms/form-section';
import {
  useCreatePrayerLineConfig,
  useDeletePrayerLineConfig,
  usePrayerLineComments,
  usePrayerLineConfigs,
  usePrayerRequests,
  useUpdatePrayerLineCommentStatus,
  useUpdatePrayerLineConfig,
  useUpdatePrayerRequestStatus,
  useDeletePrayerLineComment,
  useDeletePrayerRequest,
} from '@/lib/hooks/usePrayerLine';
import type { ModerationStatus } from '@/lib/types';

type Tab = 'session' | 'requests' | 'comments';

function toLocalDatetimeValue(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'visible':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Visible
        </span>
      );
    case 'flagged':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Flag size={12} className="mr-1" />
          Flagged
        </span>
      );
    case 'removed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={12} className="mr-1" />
          Removed
        </span>
      );
    default:
      return null;
  }
}

export default function PrayerLinePage() {
  const [tab, setTab] = useState<Tab>('session');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ModerationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: 'Night Prayer Line',
    description: '',
    googleMeetUrl: '',
    sessionStartsAt: '',
    designImageUrl: '',
    isActive: true,
  });

  const { data: configs = [], isLoading: configsLoading, refetch: refetchConfigs, isRefetching } =
    usePrayerLineConfigs();
  const { data: requests = [], isLoading: requestsLoading, refetch: refetchRequests } =
    usePrayerRequests();
  const { data: comments = [], isLoading: commentsLoading, refetch: refetchComments } =
    usePrayerLineComments();

  const createMutation = useCreatePrayerLineConfig();
  const updateMutation = useUpdatePrayerLineConfig();
  const deleteConfigMutation = useDeletePrayerLineConfig();
  const updateRequestMutation = useUpdatePrayerRequestStatus();
  const deleteRequestMutation = useDeletePrayerRequest();
  const updateCommentMutation = useUpdatePrayerLineCommentStatus();
  const deleteCommentMutation = useDeletePrayerLineComment();

  const activeConfig = configs.find((c) => c.isActive);

  const resetForm = () => {
    setFormData({
      title: 'Night Prayer Line',
      description: '',
      googleMeetUrl: '',
      sessionStartsAt: '',
      designImageUrl: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (id: string) => {
    const config = configs.find((c) => c.id === id);
    if (!config) return;
    setEditingId(id);
    setFormData({
      title: config.title,
      description: config.description || '',
      googleMeetUrl: config.googleMeetUrl,
      sessionStartsAt: toLocalDatetimeValue(config.sessionStartsAt),
      designImageUrl: config.designImageUrl || '',
      isActive: config.isActive,
    });
    setShowForm(true);
    setTab('session');
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      google_meet_url: formData.googleMeetUrl,
      session_starts_at: new Date(formData.sessionStartsAt).toISOString(),
      design_image_url: formData.designImageUrl || undefined,
      is_active: formData.isActive,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, updates: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving prayer line config:', error);
      alert('Failed to save session config');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { is_active: true } });
    } catch (error) {
      console.error(error);
      alert('Failed to activate session');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Delete this session config?')) return;
    try {
      await deleteConfigMutation.mutateAsync(id);
    } catch (error) {
      console.error(error);
      alert('Failed to delete config');
    }
  };

  const handleStatusChange = async (
    type: 'request' | 'comment',
    id: string,
    status: ModerationStatus
  ) => {
    try {
      if (type === 'request') {
        await updateRequestMutation.mutateAsync({ id, status });
      } else {
        await updateCommentMutation.mutateAsync({ id, status });
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  const handleDeleteItem = async (type: 'request' | 'comment', id: string) => {
    if (!confirm('Delete permanently?')) return;
    try {
      if (type === 'request') {
        await deleteRequestMutation.mutateAsync(id);
      } else {
        await deleteCommentMutation.mutateAsync(id);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete');
    }
  };

  const filteredRequests = useMemo(() => {
    let items = requests;
    if (statusFilter !== 'all') items = items.filter((r) => r.status === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (r) =>
          r.text.toLowerCase().includes(term) ||
          r.userProfile?.name?.toLowerCase().includes(term)
      );
    }
    return items;
  }, [requests, statusFilter, searchTerm]);

  const filteredComments = useMemo(() => {
    let items = comments;
    if (statusFilter !== 'all') items = items.filter((c) => c.status === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (c) =>
          c.text.toLowerCase().includes(term) ||
          c.userProfile?.name?.toLowerCase().includes(term)
      );
    }
    return items;
  }, [comments, statusFilter, searchTerm]);

  if (configsLoading && tab === 'session') {
    return <LoadingScreen message="Loading prayer line..." />;
  }

  return (
    <>
      <PageHeader
        title="Prayer Line"
        description="Manage mobile prayer line sessions, requests, and comments"
        icon={HandHeart}
        backHref="/"
        action={
          <Button variant="outline" size="sm" onClick={() => refetchConfigs()} disabled={isRefetching}>
            <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
            Refresh
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {(['session', 'requests', 'comments'] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-accent text-primary'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {key === 'session' ? 'Session' : key === 'requests' ? 'Prayer Requests' : 'Comments'}
          </button>
        ))}
      </div>

      {tab === 'session' && (
        <div className="space-y-6">
          {activeConfig && !showForm && (
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-2">Active session</p>
              <h2 className="text-xl font-bold text-foreground">{activeConfig.title}</h2>
              {activeConfig.description && (
                <p className="text-muted-foreground mt-2">{activeConfig.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-3">
                Starts: {new Date(activeConfig.sessionStartsAt).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground break-all mt-1">
                Meet: {activeConfig.googleMeetUrl}
              </p>
            </div>
          )}

          {!showForm ? (
            <div className="flex gap-3">
              <Button variant="gold" onClick={() => setShowForm(true)}>
                <Plus size={16} />
                New Session
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSaveConfig} className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? 'Edit Session' : 'New Session'}
              </h2>
              <FormSection title="Session details" description="Shown on the Prayer Line tab in the mobile app.">
                <FormField label="Title *">
                  <input
                    required
                    className={inputClass}
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  />
                </FormField>
                <FormField label="Description">
                  <textarea
                    rows={3}
                    className={textareaClass}
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  />
                </FormField>
                <FormField label="Google Meet URL *">
                  <input
                    required
                    type="url"
                    className={inputClass}
                    value={formData.googleMeetUrl}
                    onChange={(e) => setFormData((p) => ({ ...p, googleMeetUrl: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </FormField>
                <FormField label="Session start *">
                  <input
                    required
                    type="datetime-local"
                    className={inputClass}
                    value={formData.sessionStartsAt}
                    onChange={(e) => setFormData((p) => ({ ...p, sessionStartsAt: e.target.value }))}
                  />
                </FormField>
                <ImagePicker
                  label="Design image"
                  value={formData.designImageUrl}
                  onChange={(designImageUrl) => setFormData((p) => ({ ...p, designImageUrl }))}
                  uploadPathPrefix="prayer-line"
                />
                <label className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                  Set as active session (deactivates other sessions)
                </label>
              </FormSection>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save size={16} />
                  {editingId ? 'Save Changes' : 'Create Session'}
                </Button>
              </div>
            </form>
          )}

          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            <div className="px-6 py-4">
              <h3 className="font-medium text-foreground">All sessions ({configs.length})</h3>
            </div>
            {configs.length === 0 ? (
              <p className="px-6 py-8 text-muted-foreground text-center">No sessions yet.</p>
            ) : (
              configs.map((config) => (
                <div key={config.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{config.title}</p>
                      {config.isActive && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(config.sessionStartsAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!config.isActive && (
                      <Button size="sm" variant="outline" onClick={() => handleActivate(config.id)}>
                        Activate
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => startEdit(config.id)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteConfig(config.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {(tab === 'requests' || tab === 'comments') && (
        <>
          <div className="bg-card rounded-xl border border-border p-4 mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'visible', 'flagged', 'removed'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-sm capitalize ${
                    statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {(tab === 'requests' ? requestsLoading : commentsLoading) ? (
            <LoadingScreen message="Loading..." />
          ) : (
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {(tab === 'requests' ? filteredRequests : filteredComments).length === 0 ? (
                <p className="px-6 py-12 text-center text-muted-foreground">No items found.</p>
              ) : tab === 'requests' ? (
                filteredRequests.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge status={item.status} />
                          {item.isAnonymous && (
                            <span className="text-xs text-muted-foreground">Anonymous</span>
                          )}
                        </div>
                        <p className="text-foreground">{item.text}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {item.userProfile?.name || 'Unknown user'} •{' '}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {item.status !== 'visible' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange('request', item.id, 'visible')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted/50"
                          >
                            <Eye size={14} />
                            Show
                          </button>
                        )}
                        {item.status !== 'flagged' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange('request', item.id, 'flagged')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted/50"
                          >
                            <Flag size={14} />
                            Flag
                          </button>
                        )}
                        {item.status !== 'removed' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange('request', item.id, 'removed')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted/50"
                          >
                            <EyeOff size={14} />
                            Hide
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('request', item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-700 rounded-md hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                filteredComments.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="text-foreground">{item.text}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {item.userProfile?.name || 'Unknown user'} •{' '}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {item.status !== 'visible' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange('comment', item.id, 'visible')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted/50"
                          >
                            <Eye size={14} />
                            Show
                          </button>
                        )}
                        {item.status !== 'flagged' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange('comment', item.id, 'flagged')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted/50"
                          >
                            <Flag size={14} />
                            Flag
                          </button>
                        )}
                        {item.status !== 'removed' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange('comment', item.id, 'removed')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted/50"
                          >
                            <EyeOff size={14} />
                            Hide
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('comment', item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-red-200 text-red-700 rounded-md hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (tab === 'requests' ? refetchRequests() : refetchComments())}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </>
      )}
    </>
  );
}
