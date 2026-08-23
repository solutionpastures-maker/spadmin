'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  ArrowLeft,
  Tag,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useDevotionals, useDeleteDevotional } from '@/lib/hooks/useDevotionals';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { Button } from '@/components/ui/button';

interface Devotional {
  id: string;
  title: string;
  content: string;
  verse?: string;
  author?: string;
  publishedAt: Date;
  imageUrl?: string;
}

export default function DevotionalsPage() {
  const { data: devotionals = [], isLoading, refetch, isRefetching } = useDevotionals();
  const deleteMutation = useDeleteDevotional();

  const handleRefresh = () => {
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this devotional?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting devotional:', error);
        alert('Failed to delete devotional');
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

  if (isLoading) {
    return <LoadingScreen message="Loading devotionals..." />;
  }

  return (
    <>
      <PageHeader
        title="Devotionals"
        description="Manage daily devotionals"
        icon={BookOpen}
        action={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
              <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="gold" asChild>
              <Link href="/devotionals/new">
                <Plus size={16} />
                New Devotional
              </Link>
            </Button>
          </div>
        }
      />

        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold text-foreground">{devotionals.length}</p>
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
                    {devotionals.filter(d => {
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return d.publishedAt > monthAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">With Author</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {devotionals.filter(d => d.author).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Devotionals List */}
        <div className="bg-card shadow-sm border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">All Devotionals</h2>
          </div>
          
          {devotionals.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No devotionals yet</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first devotional.</p>
              <Link
                href="/devotionals/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-accent text-primary font-semibold hover:bg-accent/90"
              >
                <Plus size={16} className="mr-2" />
                Create Devotional
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {devotionals.map((devotional) => (
                <div key={devotional.id} className="px-6 py-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-foreground truncate">
                          {devotional.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {devotional.content}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        {devotional.verse && (
                          <div className="flex items-center">
                            <BookOpen size={14} className="mr-1" />
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {devotional.verse}
                            </span>
                          </div>
                        )}
                        {devotional.author && (
                          <div className="flex items-center">
                            <User size={14} className="mr-1" />
                            {devotional.author}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(devotional.publishedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/devotionals/${devotional.id}/edit`}
                        className="inline-flex items-center p-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(devotional.id)}
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
