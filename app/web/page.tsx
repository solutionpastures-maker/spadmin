'use client';

import {
  Globe,
  LayoutTemplate,
  Church,
  MessageSquareQuote,
  Image as ImageIcon,
  Newspaper,
  CalendarDays,
  BookOpen,
  Users,
  Inbox,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ActionCard } from '@/components/action-card';

const webSections = [
  {
    title: 'Footer',
    description: 'Brand info, contact details, links, and social media',
    icon: LayoutTemplate,
    href: '/web/footer',
    color: 'primary' as const,
  },
  {
    title: 'Church / About',
    description: 'About page hero, vision, mission, leadership, and ministries',
    icon: Church,
    href: '/web/about',
    color: 'accent' as const,
  },
  {
    title: 'Stories / Testimonies',
    description: 'Manage testimonies shown on /stories',
    icon: MessageSquareQuote,
    href: '/testimonies',
    color: 'primary' as const,
  },
  {
    title: 'Gallery',
    description: 'Manage photo albums for the website gallery',
    icon: ImageIcon,
    href: '/gallery',
    color: 'accent' as const,
  },
  {
    title: 'Column / Blog',
    description: 'Manage evangelical column articles',
    icon: Newspaper,
    href: '/columns',
    color: 'secondary' as const,
  },
  {
    title: 'Events',
    description: 'Manage church events and registrations',
    icon: CalendarDays,
    href: '/events',
    color: 'primary' as const,
  },
  {
    title: 'Bible Study',
    description: 'Manage bible study topics and lessons',
    icon: BookOpen,
    href: '/bible-study',
    color: 'accent' as const,
  },
  {
    title: 'Small Groups',
    description: 'Manage small groups and meeting details',
    icon: Users,
    href: '/small-groups',
    color: 'secondary' as const,
  },
  {
    title: 'Website Inbox',
    description: 'Contact messages, newsletter subscribers, and visit requests',
    icon: Inbox,
    href: '/inbox',
    color: 'primary' as const,
  },
];

export default function WebHubPage() {
  return (
    <>
      <PageHeader
        title="Website Content"
        description="Manage static pages and content for solutionpasturesweb"
        icon={Globe}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {webSections.map((section) => (
          <ActionCard key={section.href} {...section} />
        ))}
      </div>
    </>
  );
}
