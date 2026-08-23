'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Inbox,
  Mail,
  Users,
  MapPin,
  RefreshCw,
  CheckCircle,
  Archive,
  CalendarDays,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { adminFetch, adminJson } from '@/lib/admin-api';
import type {
  ContactMessageRow,
  NewsletterSubscriberRow,
  VisitRequestRow,
  EventRegistrationRow,
  InboxStatus,
} from '@/lib/types';

type Tab = 'contact' | 'newsletter' | 'visits' | 'registrations';

async function fetchJson<T>(url: string): Promise<T> {
  return adminJson<T>(url);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function StatusBadge({ status }: { status: InboxStatus }) {
  const styles =
    status === 'new'
      ? 'bg-blue-100 text-blue-800'
      : status === 'read'
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

export default function InboxPage() {
  const [tab, setTab] = useState<Tab>('contact');
  const queryClient = useQueryClient();

  const { data: contact = [], isLoading: contactLoading, refetch: refetchContact, isRefetching } =
    useQuery({
      queryKey: ['inbox', 'contact'],
      queryFn: () => fetchJson<ContactMessageRow[]>('/api/inbox/contact'),
      enabled: tab === 'contact',
    });

  const { data: newsletter = [], isLoading: newsletterLoading, refetch: refetchNewsletter } =
    useQuery({
      queryKey: ['inbox', 'newsletter'],
      queryFn: () => fetchJson<NewsletterSubscriberRow[]>('/api/inbox/newsletter'),
      enabled: tab === 'newsletter',
    });

  const { data: visits = [], isLoading: visitsLoading, refetch: refetchVisits } = useQuery({
    queryKey: ['inbox', 'visits'],
    queryFn: () => fetchJson<VisitRequestRow[]>('/api/inbox/visits'),
    enabled: tab === 'visits',
  });

  const {
    data: registrations = [],
    isLoading: registrationsLoading,
    refetch: refetchRegistrations,
  } = useQuery({
    queryKey: ['inbox', 'registrations'],
    queryFn: () => fetchJson<EventRegistrationRow[]>('/api/inbox/registrations'),
    enabled: tab === 'registrations',
  });

  const updateContact = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InboxStatus }) =>
      adminFetch('/api/inbox/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox', 'contact'] }),
  });

  const updateVisit = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InboxStatus }) =>
      adminFetch('/api/inbox/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox', 'visits'] }),
  });

  const updateRegistration = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InboxStatus }) =>
      adminFetch('/api/inbox/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox', 'registrations'] }),
  });

  const isLoading =
    (tab === 'contact' && contactLoading) ||
    (tab === 'newsletter' && newsletterLoading) ||
    (tab === 'visits' && visitsLoading) ||
    (tab === 'registrations' && registrationsLoading);

  const refetch = () => {
    if (tab === 'contact') refetchContact();
    if (tab === 'newsletter') refetchNewsletter();
    if (tab === 'visits') refetchVisits();
    if (tab === 'registrations') refetchRegistrations();
  };

  const tabs: { id: Tab; label: string; icon: typeof Mail }[] = [
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'newsletter', label: 'Newsletter', icon: Users },
    { id: 'visits', label: 'Visit Requests', icon: MapPin },
    { id: 'registrations', label: 'Event RSVPs', icon: CalendarDays },
  ];

  return (
    <>
      <PageHeader
        title="Website Inbox"
        description="Contact messages, newsletter subscribers, visit requests, and event RSVPs from the public website"
        icon={Inbox}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={tab === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(id)}
          >
            <Icon size={16} className="mr-2" />
            {label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
        </Button>
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : tab === 'contact' ? (
        <div className="space-y-4">
          {contact.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No contact messages yet.</p>
          ) : (
            contact.map((item) => (
              <div key={item.id} className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {[item.first_name, item.last_name].filter(Boolean).join(' ') || item.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.subject && <p className="text-sm font-medium">{item.subject}</p>}
                <p className="text-sm whitespace-pre-wrap">{item.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                  {item.source ? ` · ${item.source}` : ''}
                </p>
                <div className="flex gap-2 pt-1">
                  {item.status !== 'read' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateContact.mutate({ id: item.id, status: 'read' })}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Mark read
                    </Button>
                  )}
                  {item.status !== 'archived' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateContact.mutate({ id: item.id, status: 'archived' })}
                    >
                      <Archive size={14} className="mr-1" />
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : tab === 'newsletter' ? (
        <div className="bg-card border rounded-lg overflow-hidden">
          {newsletter.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No subscribers yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Source</th>
                  <th className="text-left p-3 font-medium">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {newsletter.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">{item.email}</td>
                    <td className="p-3 text-muted-foreground">{item.source || '—'}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(item.subscribed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : tab === 'visits' ? (
        <div className="space-y-4">
          {visits.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No visit requests yet.</p>
          ) : (
            visits.map((item) => (
              <div key={item.id} className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {item.first_name} {item.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm">
                  <span className="font-medium">Service:</span> {item.service}
                  {item.group_size ? ` · Group: ${item.group_size}` : ''}
                </p>
                {item.phone && (
                  <p className="text-sm text-muted-foreground">Phone: {item.phone}</p>
                )}
                {item.children_ages && (
                  <p className="text-sm text-muted-foreground">Children ages: {item.children_ages}</p>
                )}
                {item.message && <p className="text-sm whitespace-pre-wrap">{item.message}</p>}
                <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                <div className="flex gap-2 pt-1">
                  {item.status !== 'read' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateVisit.mutate({ id: item.id, status: 'read' })}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Mark read
                    </Button>
                  )}
                  {item.status !== 'archived' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateVisit.mutate({ id: item.id, status: 'archived' })}
                    >
                      <Archive size={14} className="mr-1" />
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No event registrations yet.</p>
          ) : (
            registrations.map((item) => (
              <div key={item.id} className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {item.first_name} {item.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.event_title && (
                  <p className="text-sm font-medium">{item.event_title}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Guests: {item.guests_count}
                  {item.phone ? ` · Phone: ${item.phone}` : ''}
                </p>
                {item.notes && <p className="text-sm whitespace-pre-wrap">{item.notes}</p>}
                <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                <div className="flex gap-2 pt-1">
                  {item.status !== 'read' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateRegistration.mutate({ id: item.id, status: 'read' })}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Mark read
                    </Button>
                  )}
                  {item.status !== 'archived' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateRegistration.mutate({ id: item.id, status: 'archived' })}
                    >
                      <Archive size={14} className="mr-1" />
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
