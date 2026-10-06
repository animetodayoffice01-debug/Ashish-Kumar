export type PhotoShape = 'circle' | 'rounded' | 'square';

export type ButtonStyle =
  | 'classic'
  | 'rounded'
  | 'glass'
  | 'outline'
  | 'neon'
  | 'gradient'
  | 'minimal'
  | 'card'
  | 'floating'
  | 'pill'
  | '3d'
  | 'compact';

export type ThemePreset =
  | 'minimal'
  | 'instagram'
  | 'glass'
  | 'neon'
  | 'dark'
  | 'light'
  | 'cyber'
  | 'creator'
  | 'professional'
  | 'gaming';

export type LinkStatus = 'active' | 'hidden' | 'scheduled' | 'expired' | 'draft' | 'trash';

export type SpecialType =
  | 'url'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'telegram'
  | 'youtube'
  | 'instagram'
  | 'download'
  | 'file'
  | 'anchor'
  | 'custom';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface Profile {
  photoUrl: string;
  photoShape: PhotoShape;
  photoBorder: boolean;
  photoShadow: boolean;
  photoSize: number;
  nickname: string;
  username: string;
  displayName: string;
  bio: string;
  shortDescription: string;
  location: string;
  websiteTitle: string;
  verificationBadge: boolean;
  creatorBadge: boolean;
  onlineStatus: boolean;
  customStatus: string;
  socialLinks: SocialLink[];
  bioCharLimit?: number;
  nicknameCharLimit?: number;
}

export interface LinkItem {
  id: string;
  title: string;
  nickname: string;
  url: string;
  description: string;
  thumbnailUrl: string;
  icon: string;
  emoji: string;
  categoryId: string;
  buttonColor: string;
  textColor: string;
  buttonStyle: ButtonStyle;
  borderRadius: number;
  border: boolean;
  shadow: boolean;
  badge: boolean;
  badgeText: string;
  featured: boolean;
  newBadge: boolean;
  sponsoredLabel: boolean;
  pinned: boolean;
  status: LinkStatus;
  scheduleStart: string | null;
  scheduleEnd: string | null;
  openNewTab: boolean;
  confirmBeforeOpening: boolean;
  linkPriority: number;
  order: number;
  tags: string[];
  specialType: SpecialType;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  hidden: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Appearance {
  preset: ThemePreset;
  themeMode: 'dark' | 'light' | 'system';
  bgType: 'color' | 'gradient' | 'image';
  bgColor: string;
  bgGradient: string;
  bgImageUrl: string;
  primaryColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: number;
  cardShadow: string;
  spacing: 'compact' | 'normal' | 'relaxed';
  animationsEnabled: boolean;
  profileLayout: 'center' | 'left' | 'card';
  linkLayout: 'list' | 'grid2';
  defaultButtonStyle: ButtonStyle;
  customCss: string;
  showPublicStats: boolean;
  maxFeaturedCount: number;
}

export interface VisitorRecord {
  id: string;
  timestamp: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  isInstagram: boolean;
  isDirect: boolean;
  isOther: boolean;
  browser: string;
  device: string;
  country: string;
}

export interface ClickRecord {
  id: string;
  linkId: string;
  linkTitle: string;
  timestamp: string;
  referrer: string;
  isInstagram: boolean;
  device: string;
}

export interface AnalyticsData {
  visitors: VisitorRecord[];
  clicks: ClickRecord[];
  statsSummary?: {
    totalVisitorsEstimate: number;
    instagramVisitorsEstimate: number;
    directVisitorsEstimate: number;
    otherVisitorsEstimate: number;
    totalClicksEstimate: number;
  };
}

export interface Settings {
  autoLogoutMinutes: number;
  siteTitle: string;
  allowSearch: boolean;
  allowSharing: boolean;
  allowQrCode: boolean;
  trashAutoPurgeDays: number;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  twitterCardType?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: Date | null;
  version: number;
  isOnline: boolean;
}

export interface PublicHubData {
  profile: Profile;
  appearance: Appearance;
  categories: Category[];
  tags: Tag[];
  links: LinkItem[];
  settings: Partial<Settings>;
  publicStats?: {
    totalLinks: number;
    totalClicks: number;
    totalVisitors: number;
  } | null;
}

export interface AdminHubData {
  profile: Profile;
  appearance: Appearance;
  categories: Category[];
  tags: Tag[];
  links: LinkItem[];
  trashCount: number;
  activeCount: number;
  settings: Settings;
  adminMeta: {
    isDefaultPassword: boolean;
    autoLogoutMinutes: number;
  };
  analytics: AnalyticsData;
}
