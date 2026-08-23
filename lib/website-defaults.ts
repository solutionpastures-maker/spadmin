import { AboutContent, FooterContent } from '@/lib/types';

export const defaultFooterContent: FooterContent = {
  brandName: 'Fountain Gate Chapel',
  brandSubtitle: 'Solution Pastures',
  address: '123 Faith Avenue',
  addressLine2: 'Accra, Ghana',
  serviceTimes: ['Sunday: 8:00 AM & 10:30 AM', 'Wednesday: 7:00 PM'],
  email: 'info@fgcsp.org',
  linkGroups: {
    watch: [
      { href: '/watch', label: 'Browse Messages' },
      { href: '/series', label: 'Series' },
      { href: '/devotionals', label: 'Devotionals' },
      { href: '/column', label: 'Evangelical Column' },
    ],
    grow: [
      { href: '/bible-study', label: 'Bible Study' },
      { href: '/devotionals', label: 'Daily Devotionals' },
      { href: '/ask', label: 'Faith Questions' },
      { href: '/newsletter', label: 'Newsletter' },
    ],
    church: [
      { href: '/about', label: 'About Us' },
      { href: '/beliefs', label: 'What We Believe' },
      { href: '/leadership', label: 'Leadership' },
      { href: '/events', label: 'Events' },
    ],
    connect: [
      { href: '/visit', label: 'Plan Your Visit' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/stories/share', label: 'Share Testimony' },
      { href: '/ask', label: 'Ask a Question' },
    ],
    give: [
      { href: '/give', label: 'Give Online' },
      { href: '/give#tithe', label: 'Tithe & Offering' },
      { href: '/give#missions', label: 'Missions' },
      { href: '/give#building', label: 'Building Fund' },
    ],
  },
  socialLinks: [
    { href: '#', label: 'Facebook', platform: 'facebook' },
    { href: '#', label: 'Twitter', platform: 'twitter' },
    { href: '#', label: 'Instagram', platform: 'instagram' },
    { href: '#', label: 'YouTube', platform: 'youtube' },
  ],
  appStoreUrl: '#',
  googlePlayUrl: '#',
  copyrightText: 'Fountain Gate Chapel — Solution Pastures. All rights reserved.',
};

export const defaultAboutContent: AboutContent = {
  hero: {
    title: 'About Fountain Gate Chapel',
    subtitle: 'A place where faith meets community',
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80',
  },
  vision:
    "To be a beacon of hope and transformation in our community, raising disciples who are deeply rooted in God's Word and actively engaged in spreading His love to every corner of the world.",
  mission:
    'To glorify God by making disciples of all nations through the preaching of the Gospel, teaching of the Word, fellowship of believers, and service to our community with excellence and integrity.',
  coreValues: [
    { icon: 'BookOpen', title: 'Biblical Foundation', description: "Grounded in the unchanging truth of God's Word" },
    { icon: 'Heart', title: 'Authentic Love', description: "Demonstrating Christ's love in all relationships" },
    { icon: 'Users', title: 'Community', description: 'Building meaningful connections that last' },
    { icon: 'Music', title: 'Vibrant Worship', description: 'Celebrating God through passionate praise' },
    { icon: 'MapPin', title: 'Local Impact', description: 'Serving and transforming our community' },
    { icon: 'Clock', title: 'Faithful Stewardship', description: "Managing God's resources with integrity" },
  ],
  pastors: [
    {
      id: '1',
      name: 'Pastor Emmanuel Adjei',
      role: 'Lead Pastor',
      bio: 'Leading FGC for over 15 years with a passion for expository preaching and discipleship.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
    {
      id: '2',
      name: 'Minister Grace Owusu',
      role: 'Associate Pastor',
      bio: 'Overseeing Family Ministries with 12 years of ministry experience.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    },
  ],
  ministries: [
    {
      id: '1',
      slug: 'worship',
      name: 'Worship Ministry',
      description: 'Leading the congregation in praise and worship through music, song, and creative arts.',
      leader: 'Minister Abena Asante',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      meetingTime: 'Saturdays at 4:00 PM',
    },
  ],
  serviceTimes: [
    { title: 'Sunday Services', times: ['First Service: 7:00 AM', 'Second Service: 9:30 AM'] },
    { title: 'Midweek Service', times: ['Wednesday: 6:00 PM'] },
    { title: 'Prayer Meeting', times: ['Friday: 6:00 PM'] },
  ],
  location: {
    name: 'Fountain Gate Chapel',
    address: '123 Faith Avenue',
    city: 'Accra, Ghana',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254013.29574585886!2d-0.2661788!3d5.6037168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0xbed14ed8650e2dd3!2sAccra%2C%20Ghana!5e0!3m2!1sen!2s!4v1',
  },
  cta: {
    title: 'Join Our Family',
    description:
      'We would love to welcome you to Fountain Gate Chapel. Come and experience the warmth of our community.',
    primaryButtonText: 'Plan Your Visit',
    primaryButtonHref: '/connect/visit',
    secondaryButtonText: 'Get Connected',
    secondaryButtonHref: '/connect',
  },
};
