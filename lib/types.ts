// Types matching the mobile app data model and Supabase schema

export interface User {
  id?: string;
  firebaseUid?: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';
  prefs?: {
    notifications: boolean;
    downloadQuality: 'low' | 'medium' | 'high';
  };
  createdAt?: Date;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  scripture?: string[]; // e.g., ["John 3:16", "Romans 8:28"] - displayed as thumbnail text
  tags: string[];
  createdAt: Date;
}

export type EpisodePartSource = 'supabase' | 'drive';

export interface EpisodePart {
  title: string;
  duration: number; // in seconds
  source?: EpisodePartSource;
  /** Path inside sermon-audio bucket, e.g. seriesId/sessionId/part-01.mp3 */
  storagePath?: string;
  /** Legacy Google Drive file ID or share URL */
  fileId?: string;
}

export interface Chapter {
  title: string;
  start: number; // start time in seconds
}

export interface Episode {
  id: string;
  seriesId: string;
  title: string;
  description: string;
  speaker: string;
  publishedAt: Date;
  parts: EpisodePart[];
  chapters: Chapter[];
  imageUrl?: string;
  scripture?: string[]; // e.g., ["Romans 8:28", "Philippians 4:13"] - displayed as thumbnail text
  transcriptUrl?: string;
}

export interface Comment {
  id: string;
  episode_id: string;
  user_id: string;
  firebase_uid?: string;
  parent_id?: string; // for threaded replies
  text: string;
  created_at: string;
  status: 'visible' | 'flagged' | 'removed';
  likes_count?: number;
  user_profiles?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  scheduledAt: Date;
  pinned: boolean;
  createdAt?: Date;
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  verse?: string; // e.g., "John 3:16"
  author?: string;
  publishedAt: Date;
  imageUrl?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export interface GalleryAlbum {
  id: string;
  slug: string;
  title: string;
  date: Date;
  coverImage: string;
  imageCount: number;
  images: GalleryImage[];
}

export interface Testimony {
  id: string;
  slug: string;
  name: string;
  story: string;
  excerpt?: string;
  image?: string;
  videoUrl?: string;
  category?: string;
  date: Date;
  featured: boolean;
}

export interface ColumnArticle {
  id: string;
  slug: string;
  title: string;
  author: string;
  authorBio: string;
  authorImage: string;
  date: Date;
  readTime: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  featured: boolean;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  eventDate: Date;
  timeText?: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  registrationRequired: boolean;
  category?: string;
}

export interface BibleStudyLesson {
  id: string;
  title: string;
  content?: string;
  readTime?: string;
  scriptureRefs?: string[];
}

export type ModerationStatus = 'visible' | 'flagged' | 'removed';

export interface PrayerLineConfig {
  id: string;
  title: string;
  description?: string;
  googleMeetUrl: string;
  sessionStartsAt: Date | string;
  designImageUrl?: string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PrayerRequest {
  id: string;
  userId?: string;
  firebaseUid: string;
  text: string;
  isAnonymous: boolean;
  status: ModerationStatus;
  createdAt: Date | string;
  userProfile?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
}

export interface PrayerLineComment {
  id: string;
  userId?: string;
  firebaseUid: string;
  text: string;
  status: ModerationStatus;
  createdAt: Date | string;
  userProfile?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
}

export interface BibleStudyTopic {
  id: string;
  slug: string;
  title: string;
  description?: string;
  verseReference?: string;
  category?: string;
  lessons: BibleStudyLesson[];
}

export interface SmallGroup {
  id: string;
  name: string;
  description?: string;
  leader?: string;
  category?: string;
  meetingDay?: string;
  meetingTime?: string;
  location?: string;
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterSocialLink {
  href: string;
  label: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'youtube';
}

export interface FooterContent {
  brandName: string;
  brandSubtitle: string;
  address: string;
  addressLine2?: string;
  serviceTimes: string[];
  email: string;
  linkGroups: {
    watch: FooterLink[];
    grow: FooterLink[];
    church: FooterLink[];
    connect: FooterLink[];
    give: FooterLink[];
  };
  socialLinks: FooterSocialLink[];
  appStoreUrl?: string;
  googlePlayUrl?: string;
  copyrightText?: string;
}

export interface AboutCoreValue {
  icon: string;
  title: string;
  description: string;
}

export interface AboutPastor {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface AboutMinistry {
  id: string;
  slug: string;
  name: string;
  description: string;
  leader: string;
  image: string;
  meetingTime: string;
}

export interface AboutServiceTime {
  title: string;
  times: string[];
}

export interface AboutContent {
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  vision: string;
  mission: string;
  coreValues: AboutCoreValue[];
  pastors: AboutPastor[];
  ministries: AboutMinistry[];
  serviceTimes: AboutServiceTime[];
  location: {
    name: string;
    address: string;
    city: string;
    mapEmbedUrl: string;
  };
  cta: {
    title: string;
    description: string;
    primaryButtonText: string;
    primaryButtonHref: string;
    secondaryButtonText: string;
    secondaryButtonHref: string;
  };
}

export interface WebsiteContentRow {
  id: string;
  slug: string;
  content: FooterContent | AboutContent;
  created_at: string;
  updated_at: string;
}

// Legacy types (for backward compatibility)
export interface Sermon {
  id: string;
  title: string;
  description: string;
  speaker: string;
  date: Date;
  duration: number;
  audioURL: string;
  audioStorageProvider: 'firebase' | 'supabase' | 'drive';
  thumbnailURL?: string;
  thumbnailStorageProvider?: 'firebase' | 'supabase';
  likes: number;
  plays: number;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
  authorId?: string;
  authorName?: string;
}

// Supabase database types (snake_case - matching database columns)
export interface SeriesRow {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface EpisodeRow {
  id: string;
  series_id: string;
  title: string;
  description: string | null;
  speaker: string;
  published_at: string;
  parts: EpisodePart[];
  chapters: Chapter[] | null;
  image_url: string | null;
  transcript_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  scheduled_at: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DevotionalRow {
  id: string;
  title: string;
  content: string;
  verse: string | null;
  author: string | null;
  published_at: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRow {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'admin';
  prefs: {
    notifications: boolean;
    downloadQuality: 'low' | 'medium' | 'high';
  } | null;
  created_at: string;
  updated_at: string;
}

export type InboxStatus = 'new' | 'read' | 'archived';

export interface ContactMessageRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  source: string | null;
  status: InboxStatus;
  created_at: string;
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
}

export interface VisitRequestRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  service: string;
  group_size: string | null;
  children_ages: string | null;
  message: string | null;
  source: string | null;
  status: InboxStatus;
  created_at: string;
}

export interface EventRegistrationRow {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  guests_count: number;
  notes: string | null;
  status: InboxStatus;
  created_at: string;
  event_title?: string;
  event_slug?: string;
}
