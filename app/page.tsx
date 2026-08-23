'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Megaphone,
  FileAudio,
  MessageSquare,
  Activity,
  Database,
  CheckCircle,
  XCircle,
  Loader,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  Globe,
  HandHeart,
  Inbox,
  Radio,
  BookHeart,
} from 'lucide-react';
import { useSeries } from '@/lib/hooks/useSeries';
import { useAnnouncements } from '@/lib/hooks/useAnnouncements';
import { useDevotionals } from '@/lib/hooks/useDevotionals';
import { supabase } from '@/lib/supabase';
import { adminJson } from '@/lib/admin-api';
import { StatCard } from '@/components/stat-card';
import { ActionCard } from '@/components/action-card';
import { LoadingScreen } from '@/components/loading-screen';

const EMPTY_LIST: never[] = [];

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
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

  const quickActions = [
    {
      title: 'Live Teaching',
      description: 'Go live and answer questions from members who cannot attend',
      icon: Radio,
      href: '/live',
      color: 'accent' as const,
    },
    {
      title: 'Manage Series',
      description: 'Create and manage sermon series',
      icon: FileAudio,
      href: '/series',
      color: 'primary' as const,
    },
    {
      title: 'Create Announcement',
      description: 'Post a new announcement for the church',
      icon: Megaphone,
      href: '/announcements/new',
      color: 'accent' as const,
    },
    {
      title: 'Manage Announcements',
      description: 'View and manage announcements',
      icon: Megaphone,
      href: '/announcements',
      color: 'primary' as const,
    },
    {
      title: 'Manage Devotionals',
      description: 'Create and manage daily devotionals',
      icon: BookOpen,
      href: '/devotionals',
      color: 'accent' as const,
    },
    {
      title: 'Website Content',
      description: 'Manage footer, about, gallery, stories, and columns',
      icon: Globe,
      href: '/web',
      color: 'primary' as const,
    },
    {
      title: 'Moderate Comments',
      description: 'Review and moderate user comments',
      icon: MessageSquare,
      href: '/comments',
      color: 'secondary' as const,
    },
    {
      title: 'Prayer Line',
      description: 'Manage prayer sessions, requests, and comments',
      icon: HandHeart,
      href: '/prayer-line',
      color: 'accent' as const,
    },
    {
      title: 'Website Inbox',
      description: 'Contact messages, newsletter, and visit requests',
      icon: Inbox,
      href: '/inbox',
      color: 'primary' as const,
    },
    {
      title: 'Devotion engagement',
      description: 'Moderate devotion comments and prayer requests',
      icon: BookHeart,
      href: '/devotion-engagement',
      color: 'secondary' as const,
    },
    {
      title: 'Test Supabase',
      description: 'Test connection to Supabase',
      icon: Database,
      onClick: testSupabaseConnection,
      color: 'primary' as const,
    },
  ];

  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-2">
          Manage your church app content with premium tools and insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Users" value={memberCount} icon={Users} color="primary" />
        <StatCard label="Series" value={seriesList.length} icon={FileAudio} color="accent" />
        <StatCard label="Announcements" value={announcementsList.length} icon={Megaphone} color="primary" />
        <StatCard label="Devotionals" value={devotionalsList.length} icon={BookOpen} color="accent" />
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </div>
      </div>

      {supabaseStatus.message && (
        <div
          className={`mb-10 rounded-xl border p-6 ${
            supabaseStatus.isConnected === true
              ? 'border-green-200 bg-green-50'
              : supabaseStatus.isConnected === false
                ? 'border-red-200 bg-red-50'
                : 'border-border bg-card'
          }`}
        >
          <div className="flex items-center gap-3">
            {supabaseStatus.isLoading ? (
              <Loader className="w-6 h-6 text-primary animate-spin" />
            ) : supabaseStatus.isConnected === true ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : supabaseStatus.isConnected === false ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <Database className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <h4 className="text-lg font-semibold text-foreground">Supabase Connection</h4>
              <p className="text-sm text-muted-foreground mt-1">{supabaseStatus.message}</p>
              {supabaseStatus.buckets.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Buckets: {supabaseStatus.buckets.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={24} className="text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border/50"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <activity.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 text-right">
                  {activity.timestamp.toLocaleDateString()}{' '}
                  {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity to display</p>
            <p className="text-sm text-muted-foreground/80 mt-1">Start creating content to see activity here</p>
          </div>
        )}
      </div>
    </>
  );
}
