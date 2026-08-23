'use client';

import { useMemo, useState } from 'react';
import { Radio, Plus, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { FormField, FormSection, inputClass, textareaClass } from '@/components/cms/form-section';
import {
  useCreateLiveService,
  useDeleteLiveQuestion,
  useDeleteLiveService,
  useLiveQuestions,
  useLiveServices,
  useUpdateLiveQuestion,
  useUpdateLiveService,
} from '@/lib/hooks/useLive';
import type { LiveQuestion, LiveService } from '@/lib/live-store';

function toLocalDatetimeValue(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nextTuesdayAt(hour: number, minute: number) {
  const date = new Date();
  const day = date.getDay();
  const daysUntil = (2 - day + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntil);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export default function LiveAdminPage() {
  const { data: services = [], isLoading, refetch, isRefetching } = useLiveServices();
  const createMutation = useCreateLiveService();
  const updateMutation = useUpdateLiveService();
  const deleteMutation = useDeleteLiveService();
  const updateQuestion = useUpdateLiveQuestion();
  const deleteQuestion = useDeleteLiveQuestion();

  const liveService = services.find((item) => item.isLive);
  const activeId = liveService?.id || services[0]?.id;
  const { data: questions = [], refetch: refetchQuestions } = useLiveQuestions(activeId);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Tuesday Teaching',
    speaker: '',
    description: '',
    scheduled_start: toLocalDatetimeValue(nextTuesdayAt(18, 0)),
    scheduled_end: toLocalDatetimeValue(nextTuesdayAt(20, 0)),
    stream_key: 'teaching',
    whep_url: '',
    hls_url: '',
  });

  const pending = useMemo(
    () => questions.filter((item) => item.status === 'pending'),
    [questions]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        scheduled_start: formData.scheduled_start
          ? new Date(formData.scheduled_start).toISOString()
          : null,
        scheduled_end: formData.scheduled_end ? new Date(formData.scheduled_end).toISOString() : null,
      });
      setShowForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create service');
    }
  };

  const goLive = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { is_live: true } });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to go live');
    }
  };

  const endLive = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { is_live: false } });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to end stream');
    }
  };

  if (isLoading) return <LoadingScreen message="Loading live teaching..." />;

  return (
    <>
      <PageHeader
        title="Live Teaching"
        description="Go live for Tuesday Teaching. Questions from the app and website appear here for the pastor to answer on air."
        icon={Radio}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { refetch(); refetchQuestions(); }} disabled={isRefetching}>
              <RefreshCw size={16} className={`mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowForm((open) => !open)}>
              <Plus size={16} className="mr-2" />
              Schedule
            </Button>
          </div>
        }
      />

      {liveService ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 font-medium">
          LIVE NOW — {liveService.title}
          {liveService.speaker ? ` · ${liveService.speaker}` : ''}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-muted/40 px-4 py-3 text-muted-foreground">
          Not live. Create a teaching service, then press Go Live when the Soundcraft mix is reaching MediaMTX.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8">
          <FormSection title="Schedule a teaching">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Title">
                <input
                  className={inputClass}
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </FormField>
              <FormField label="Speaker">
                <input
                  className={inputClass}
                  value={formData.speaker}
                  onChange={(e) => setFormData((prev) => ({ ...prev, speaker: e.target.value }))}
                />
              </FormField>
              <FormField label="Starts">
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_start: e.target.value }))}
                />
              </FormField>
              <FormField label="Ends">
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={formData.scheduled_end}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_end: e.target.value }))}
                />
              </FormField>
              <FormField label="WHEP URL (web / low latency)">
                <input
                  className={inputClass}
                  placeholder="https://stream.yourchurch.org:8889/teaching/whep"
                  value={formData.whep_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whep_url: e.target.value }))}
                />
              </FormField>
              <FormField label="HLS URL (mobile)">
                <input
                  className={inputClass}
                  placeholder="https://stream.yourchurch.org:8888/teaching/index.m3u8"
                  value={formData.hls_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hls_url: e.target.value }))}
                />
              </FormField>
            </div>
            <FormField label="Description">
              <textarea
                className={textareaClass}
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </FormField>
            <p className="text-sm text-muted-foreground">
              Church PC: Soundcraft Si Impact → REAPER stereo streaming bus → FFmpeg → MediaMTX. Publish path
              should match stream key <code>teaching</code>. Phones off church Wi-Fi need a public host (or Cloudflare
              Tunnel) plus TURN later.
            </p>
            <Button type="submit" disabled={createMutation.isPending}>
              Save service
            </Button>
          </FormSection>
        </form>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">Services</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                busy={updateMutation.isPending || deleteMutation.isPending}
                onLive={() => goLive(service.id)}
                onEnd={() => endLive(service.id)}
                onDelete={async () => {
                  if (!confirm('Delete this service?')) return;
                  await deleteMutation.mutateAsync(service.id);
                }}
              />
            ))}
            {services.length === 0 && (
              <p className="text-sm text-muted-foreground">No teaching services yet. Schedule one for Tuesday.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">
            Live questions {pending.length > 0 ? `(${pending.length} waiting)` : ''}
          </h2>
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onStatus={async (status) => {
                  await updateQuestion.mutateAsync({ id: question.id, status });
                }}
                onDelete={async () => {
                  if (!confirm('Remove this question?')) return;
                  await deleteQuestion.mutateAsync(question.id);
                }}
              />
            ))}
            {questions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Questions from the website and app will land here while you are live.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function ServiceCard({
  service,
  busy,
  onLive,
  onEnd,
  onDelete,
}: {
  service: LiveService;
  busy: boolean;
  onLive: () => void;
  onEnd: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{service.title}</p>
          <p className="text-sm text-muted-foreground">
            {service.speaker || 'Speaker TBC'}
            {service.scheduledStart
              ? ` · ${new Date(service.scheduledStart).toLocaleString()}`
              : ''}
          </p>
        </div>
        {service.isLive ? (
          <span className="text-xs font-bold text-red-600">LIVE</span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {service.isLive ? (
          <Button size="sm" variant="outline" disabled={busy} onClick={onEnd}>
            End
          </Button>
        ) : (
          <Button size="sm" disabled={busy} onClick={onLive}>
            Go Live
          </Button>
        )}
        <Button size="sm" variant="ghost" disabled={busy} onClick={onDelete}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  onStatus,
  onDelete,
}: {
  question: LiveQuestion;
  onStatus: (status: 'pending' | 'answered' | 'dismissed') => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium mb-1">
        {question.isAnonymous ? 'Anonymous' : question.displayName || 'Member'}
        {question.isAnonymous && question.displayName ? (
          <span className="ml-2 text-xs text-muted-foreground">(staff: {question.displayName})</span>
        ) : null}
      </p>
      <p className="text-foreground">{question.text}</p>
      <p className="text-xs text-muted-foreground mt-2 uppercase">{question.status}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {question.status !== 'answered' && (
          <Button size="sm" onClick={() => onStatus('answered')}>
            <CheckCircle size={14} className="mr-1" />
            Answered on air
          </Button>
        )}
        {question.status !== 'dismissed' && (
          <Button size="sm" variant="outline" onClick={() => onStatus('dismissed')}>
            <XCircle size={14} className="mr-1" />
            Dismiss
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
