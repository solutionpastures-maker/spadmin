'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Megaphone,
  FileAudio,
  MessageSquare,
  Database,
  CheckCircle,
  XCircle,
  Loader,
  BookOpen,
  Calendar,
  Globe,
  HandHeart,
  Inbox,
  Radio,
  BookHeart,
  LayoutDashboard,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useSeries } from '@/lib/hooks/useSeries';
import { useAnnouncements } from '@/lib/hooks/useAnnouncements';
import { useDevotionals } from '@/lib/hooks/useDevotionals';
import { supabase } from '@/lib/supabase';
import { adminJson } from '@/lib/admin-api';
import { StatCard } from '@/components/stat-card';
import { ActionCard } from '@/components/action-card';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';
import { coerceDate } from '@/lib/devotional-payload';

const EMPTY_LIST: never[] = [];

function toDate(value: Date | string | null | undefined): Date {
  return coerceDate(value);
}

export default function AdminDashboard() {
  const [memberCount, setMemberCount] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConnected: boolean | null;
    isLoading: boolean;
    message: string;
    buckets: string[];
  }>({
    isConnected: null,
    isLoading: false,
    message: '',
    buckets: [],
  });

  const { data: seriesData, isLoading: seriesLoading } = useSeries();
  const { data: announcementsData, isLoading: announcementsLoading } = useAnnouncements();
  const { data: devotionalsData, isLoading: devotionalsLoading } = useDevotionals();

  const seriesList = seriesData ?? EMPTY_LIST;
  const announcementsList = announcementsData ?? EMPTY_LIST;
  const devotionalsList = devotionalsData ?? EMPTY_LIST;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await adminJson<unknown[]>('/api/users').catch(() => []);
        setMemberCount(usersData.length);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const recentActivity = useMemo(() => {
    const activity: Array<{
      title: string;
      description: string;
      timestamp: Date;
      icon: typeof Megaphone;
    }> = [];

    announcementsList.slice(0, 3).forEach((announcement) => {
      activity.push({
        title: 'New announcement',
        description: announcement.title,
        timestamp: toDate(announcement.scheduledAt),
        icon: Megaphone,
      });
    });

    devotionalsList.slice(0, 3).forEach((devotional) => {
      activity.push({
        title: 'New devotional',
        description: devotional.title,
        timestamp: toDate(devotional.publishedAt),
        icon: BookOpen,
      });
    });

    seriesList.slice(0, 3).forEach((series) => {
      activity.push({
        title: 'New series',
        description: series.title,
        timestamp: toDate(series.createdAt),
        icon: FileAudio,
      });
    });

    activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activity.slice(0, 10);
  }, [seriesList, announcementsList, devotionalsList]);

  const testSupabaseConnection = async () => {
    setSupabaseStatus((prev) => ({ ...prev, isLoading: true, message: 'Testing connection...' }));

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check environment variables.');
      }

      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;

      const bucketNames = buckets.map((b) => b.name);
      const seriesBucket = buckets.find((b) => b.name === 'series');

      let message = `Connected successfully! Found ${buckets.length} bucket(s).`;
      if (seriesBucket) {
        message += ` Series bucket: OK (${seriesBucket.public ? 'Public' : 'Private'})`;
      } else {
        message += ' Series bucket: missing';
      }

      try {
        const { count, error: countError } = await supabase
          .from('series')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          message += ` | Database: error (${countError.message})`;
        } else {
          message += ` | Database: OK (${count} series)`;
        }
      } catch (error) {
        message += ` | Database: error (${(error as Error).message})`;
      }

      setSupabaseStatus({
        isConnected: true,
        isLoading: false,
        message,
        buckets: bucketNames,
      });
    } catch (error) {
      setSupabaseStatus({
        isConnected: false,
        isLoading: false,
        message: `Connection failed: ${(error as Error).message}`,
        buckets: [],
      });
    }
  };

  const dataLoading = seriesLoading || announcementsLoading || devotionalsLoading || isStatsLoading;

  if (dataLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const featuredActions = [
    { title: 'New announcement', icon: Megaphone, href: '/announcements/new' },
    { title: 'Start live teaching', icon: Radio, href: '/live' },
    { title: 'Add devotional', icon: Flame, href: '/devotionals/new' },
    { title: 'Manage website', icon: Globe, href: '/web' },
  ];

  const moreActions = [
    { title: 'Manage Series', description: 'Sermon library', icon: FileAudio, href: '/series' },
    { title: 'Announcements', description: 'Weekly & special', icon: Megaphone, href: '/announcements' },
    { title: 'Devotionals', description: 'Daily words', icon: BookOpen, href: '/devotionals' },
    { title: 'Moderate Comments', description: 'Episode comments', icon: MessageSquare, href: '/comments' },
    { title: 'Prayer Line', description: 'Sessions & requests', icon: HandHeart, href: '/prayer-line' },
    { title: 'Website Inbox', description: 'Contact & visits', icon: Inbox, href: '/inbox' },
    { title: 'Devotion engagement', description: 'Prayers & replies', icon: BookHeart, href: '/devotion-engagement' },
    { title: 'Test Supabase', description: 'Connection health', icon: Database, onClick: testSupabaseConnection },
  ];

  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title={greeting}
        description="Here’s what’s happening across Solution Pastures today."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="App users" value={memberCount} icon={Users} color="navy" detail="Registered members" />
        <StatCard label="Series" value={seriesList.length} icon={BookOpen} color="gold" detail="In the sermon library" />
        <StatCard
          label="Announcements"
          value={announcementsList.length}
          icon={Megaphone}
          color="blue"
          detail="News & weekly packs"
        />
        <StatCard
          label="Devotionals"
          value={devotionalsList.length}
          icon={Flame}
          color="green"
          detail="Daily content"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="admin-surface">
          <div className="admin-section-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Common tasks for your day</p>
            </div>
            <Zap size={18} className="text-[var(--gold)]" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featuredActions.map((action) => (
              <ActionCard key={action.title} {...action} />
            ))}
          </div>
        </section>

        <section className="admin-surface">
          <div className="admin-section-heading">
            <div>
              <h2>Connection health</h2>
              <p>
                {supabaseStatus.isConnected === true
                  ? 'All systems operational'
                  : supabaseStatus.isConnected === false
                    ? 'Needs attention'
                    : 'Run a quick check'}
              </p>
            </div>
            <ShieldCheck
              size={18}
              className={supabaseStatus.isConnected === false ? 'text-destructive' : 'text-[var(--green)]'}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Website</span>
              <span className="admin-status admin-status-green">
                <span className="admin-status-dot" />
                Live
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mobile app</span>
              <span className="admin-status admin-status-green">
                <span className="admin-status-dot" />
                Live
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Supabase</span>
              <span
                className={`admin-status ${
                  supabaseStatus.isConnected === true
                    ? 'admin-status-green'
                    : supabaseStatus.isConnected === false
                      ? 'admin-status-red'
                      : 'admin-status-gold'
                }`}
              >
                <span className="admin-status-dot" />
                {supabaseStatus.isLoading
                  ? 'Checking…'
                  : supabaseStatus.isConnected === true
                    ? 'Ready'
                    : supabaseStatus.isConnected === false
                      ? 'Error'
                      : 'Untested'}
              </span>
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full mt-1" onClick={testSupabaseConnection}>
              {supabaseStatus.isLoading ? <Loader className="animate-spin" size={14} /> : <Database size={14} />}
              Test connection
            </Button>
          </div>
        </section>
      </div>

      {supabaseStatus.message ? (
        <div
          className={`mt-5 rounded-[var(--radius)] border p-4 ${
            supabaseStatus.isConnected === true
              ? 'border-green-200 bg-green-50'
              : supabaseStatus.isConnected === false
                ? 'border-red-200 bg-red-50'
                : 'border-border bg-card'
          }`}
        >
          <div className="flex items-start gap-3">
            {supabaseStatus.isLoading ? (
              <Loader className="w-5 h-5 text-primary animate-spin shrink-0 mt-0.5" />
            ) : supabaseStatus.isConnected === true ? (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : supabaseStatus.isConnected === false ? (
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Database className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-primary">Supabase details</h4>
              <p className="text-sm text-muted-foreground mt-1">{supabaseStatus.message}</p>
              {supabaseStatus.buckets.length > 0 ? (
                <p className="text-xs text-muted-foreground mt-2">Buckets: {supabaseStatus.buckets.join(', ')}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <section className="admin-surface mt-5">
        <div className="admin-section-heading">
          <div>
            <h2>More tools</h2>
            <p>Everything else at a glance</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {moreActions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      <section className="admin-surface mt-5">
        <div className="admin-section-heading">
          <div>
            <h2>Recent activity</h2>
            <p>A pulse on your content</p>
          </div>
        </div>
        {recentActivity.length > 0 ? (
          <div>
            {recentActivity.map((activity, index) => (
              <div key={`${activity.title}-${index}`} className="admin-activity-row">
                <div className="admin-activity-icon">
                  <activity.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-primary">{activity.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{activity.description}</div>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block shrink-0">
                  {activity.timestamp.toLocaleDateString()}{' '}
                  {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No recent activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create content to see it here</p>
          </div>
        )}
      </section>
    </>
  );
}
