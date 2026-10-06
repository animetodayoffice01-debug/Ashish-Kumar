import {
  PublicHubData,
  AdminHubData,
  LinkItem,
  Category,
  Tag,
  Profile,
  Appearance,
  Settings,
} from '../types';

const STORAGE_KEY = 'biolink_persistent_db';
const AUTH_TOKEN_KEY = 'biolink_admin_token';
const AUTH_EXPIRY_KEY = 'biolink_admin_expiry';
const LOCKOUT_KEY = 'biolink_lockout_until';
const FAILED_ATTEMPTS_KEY = 'biolink_failed_attempts';

// Password hashing using simple SHA-256 via Web Crypto
async function hashPasswordWeb(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_biolink_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const defaultInitialDb = {
  admin: {
    hasPassword: true,
    passwordHash: 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec', // 'admin123'
    isDefaultPassword: true,
    autoLogoutMinutes: 60,
  },
  profile: {
    nickname: 'Alex Vance',
    username: 'alexvance.creative',
    displayName: 'Alex Vance ✨ Digital Creator',
    bio: '📸 Visual Storyteller & Tech Creator | 🚀 Sharing curated tools, presets, tutorials & creative resources. New video every Thursday!',
    shortDescription: 'Curated links, resources & creative toolkit',
    location: 'San Francisco, CA',
    websiteTitle: 'Alex Vance | Official Bio Hub',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    photoShape: 'circle' as const,
    photoBorder: true,
    photoShadow: true,
    photoSize: 108,
    verificationBadge: true,
    creatorBadge: true,
    onlineStatus: true,
    customStatus: 'Creating new YouTube series 🎬',
    bioCharLimit: 250,
    nicknameCharLimit: 40,
    socialLinks: [
      { id: 'soc_1', platform: 'instagram', url: 'https://instagram.com', label: 'Instagram', enabled: true, order: 1 },
      { id: 'soc_2', platform: 'youtube', url: 'https://youtube.com', label: 'YouTube', enabled: true, order: 2 },
      { id: 'soc_3', platform: 'telegram', url: 'https://telegram.org', label: 'Telegram Channel', enabled: true, order: 3 },
      { id: 'soc_4', platform: 'whatsapp', url: 'https://whatsapp.com', label: 'WhatsApp Community', enabled: true, order: 4 },
      { id: 'soc_5', platform: 'x', url: 'https://x.com', label: 'X (Twitter)', enabled: true, order: 5 },
      { id: 'soc_6', platform: 'github', url: 'https://github.com', label: 'GitHub', enabled: true, order: 6 },
      { id: 'soc_7', platform: 'discord', url: 'https://discord.com', label: 'Discord Server', enabled: true, order: 7 },
      { id: 'soc_8', platform: 'email', url: 'mailto:contact@alexvance.studio', label: 'Email Me', enabled: true, order: 8 },
    ],
  },
  appearance: {
    preset: 'creator' as const,
    themeMode: 'dark' as const,
    bgType: 'gradient' as const,
    bgColor: '#09090b',
    bgGradient: 'radial-gradient(ellipse at top, #1e112a 0%, #09090b 100%)',
    bgImageUrl: '',
    primaryColor: '#8b5cf6',
    textColor: '#f4f4f5',
    accentColor: '#ec4899',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 16,
    cardShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
    spacing: 'normal' as const,
    animationsEnabled: true,
    profileLayout: 'center' as const,
    linkLayout: 'list' as const,
    defaultButtonStyle: 'glass' as const,
    customCss: '',
    showPublicStats: true,
    maxFeaturedCount: 3,
  },
  categories: [
    { id: 'cat_all', name: 'All Links', icon: 'Sparkles', color: '#8b5cf6', order: 0, hidden: false },
    { id: 'cat_featured', name: 'Featured & Hot', icon: 'Flame', color: '#f43f5e', order: 1, hidden: false },
    { id: 'cat_youtube', name: 'YouTube & Videos', icon: 'Youtube', color: '#ef4444', order: 2, hidden: false },
    { id: 'cat_tools', name: 'Tools & AI Apps', icon: 'Wrench', color: '#3b82f6', order: 3, hidden: false },
    { id: 'cat_presets', name: 'Presets & Downloads', icon: 'Download', color: '#10b981', order: 4, hidden: false },
    { id: 'cat_business', name: 'Business & Contact', icon: 'Briefcase', color: '#f59e0b', order: 5, hidden: false },
  ],
  tags: [
    { id: 'tag_1', name: 'Featured', color: '#ec4899' },
    { id: 'tag_2', name: 'Free', color: '#10b981' },
    { id: 'tag_3', name: 'AI', color: '#8b5cf6' },
    { id: 'tag_4', name: 'YouTube', color: '#ef4444' },
    { id: 'tag_5', name: 'Editing', color: '#06b6d4' },
    { id: 'tag_6', name: 'Popular', color: '#f59e0b' },
  ],
  links: [
    {
      id: 'link_1',
      title: 'Watch Latest Masterclass: 2026 Video Editing Workflow',
      nickname: 'Latest Video',
      url: 'https://youtube.com/watch?v=sample',
      description: 'Full 45-minute breakdown of colour grading, pacing, and dynamic audio design.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
      icon: 'PlayCircle',
      emoji: '🎬',
      categoryId: 'cat_youtube',
      buttonColor: '#ef4444',
      textColor: '#ffffff',
      buttonStyle: 'glass' as const,
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'HOT VIDEO',
      featured: true,
      newBadge: true,
      sponsoredLabel: false,
      pinned: true,
      status: 'active' as const,
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 10,
      order: 1,
      tags: ['Featured', 'YouTube', 'Editing'],
      specialType: 'youtube' as const,
      clicks: 1420,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-05T14:20:00.000Z',
      deletedAt: null,
    },
    {
      id: 'link_2',
      title: 'Free Cinematic LUTs & Lightroom Preset Pack 2026',
      nickname: 'LUT Pack',
      url: 'https://gumroad.com/l/sample-luts',
      description: '12 handcrafted tone profiles for Sony, Canon, iPhone 16 Pro, and Fuji.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
      icon: 'Download',
      emoji: '🎨',
      categoryId: 'cat_presets',
      buttonColor: '#10b981',
      textColor: '#ffffff',
      buttonStyle: 'neon' as const,
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'FREE DOWNLOAD',
      featured: true,
      newBadge: false,
      sponsoredLabel: false,
      pinned: true,
      status: 'active' as const,
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 9,
      order: 2,
      tags: ['Free', 'Featured', 'Editing'],
      specialType: 'download' as const,
      clicks: 2890,
      createdAt: '2026-09-28T09:00:00.000Z',
      updatedAt: '2026-10-04T12:00:00.000Z',
      deletedAt: null,
    },
    {
      id: 'link_3',
      title: 'Join the VIP Telegram Creator Circle & Drops',
      nickname: 'Telegram VIP',
      url: 'https://t.me/samplecreators',
      description: 'Daily prompt engineering tips, gear deals, secret discount codes and live Q&A.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=400&q=80',
      icon: 'Send',
      emoji: '⚡',
      categoryId: 'cat_featured',
      buttonColor: '#0ea5e9',
      textColor: '#ffffff',
      buttonStyle: 'gradient' as const,
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'JOIN COMMUNITY',
      featured: true,
      newBadge: false,
      sponsoredLabel: false,
      pinned: false,
      status: 'active' as const,
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 8,
      order: 3,
      tags: ['Popular'],
      specialType: 'telegram' as const,
      clicks: 980,
      createdAt: '2026-09-20T11:00:00.000Z',
      updatedAt: '2026-10-02T08:00:00.000Z',
      deletedAt: null,
    },
    {
      id: 'link_4',
      title: 'My Top 10 Recommended AI Productivity Tools',
      nickname: 'AI Toolkit',
      url: 'https://notion.so/sample-ai-toolkit',
      description: 'Complete interactive Notion table with live reviews, pricing benchmarks & test results.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      icon: 'Cpu',
      emoji: '🤖',
      categoryId: 'cat_tools',
      buttonColor: '#8b5cf6',
      textColor: '#ffffff',
      buttonStyle: 'glass' as const,
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'UPDATED',
      featured: false,
      newBadge: true,
      sponsoredLabel: false,
      pinned: false,
      status: 'active' as const,
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 7,
      order: 4,
      tags: ['AI', 'Tools'],
      specialType: 'url' as const,
      clicks: 1640,
      createdAt: '2026-09-15T15:00:00.000Z',
      updatedAt: '2026-10-01T17:00:00.000Z',
      deletedAt: null,
    },
    {
      id: 'link_5',
      title: 'Book a 1:1 Creative Strategy & Channel Audit Session',
      nickname: 'Consulting Call',
      url: 'https://cal.com/sample',
      description: 'Direct 45-minute video consultation to accelerate your creator brand and content distribution.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
      icon: 'Calendar',
      emoji: '💼',
      categoryId: 'cat_business',
      buttonColor: '#f59e0b',
      textColor: '#ffffff',
      buttonStyle: 'card' as const,
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'BOOK NOW',
      featured: false,
      newBadge: false,
      sponsoredLabel: false,
      pinned: false,
      status: 'active' as const,
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 6,
      order: 5,
      tags: ['Popular'],
      specialType: 'url' as const,
      clicks: 430,
      createdAt: '2026-09-10T12:00:00.000Z',
      updatedAt: '2026-09-30T10:00:00.000Z',
      deletedAt: null,
    },
    {
      id: 'link_6',
      title: 'Camera & Studio Gear List (Everything I Use in 2026)',
      nickname: 'Studio Gear',
      url: 'https://kit.co/sample-gear',
      description: 'Every lens, microphone, lighting softbox, and sound baffle in my filming setup.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
      icon: 'Camera',
      emoji: '🎙️',
      categoryId: 'cat_tools',
      buttonColor: '#3b82f6',
      textColor: '#ffffff',
      buttonStyle: 'outline' as const,
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: false,
      badgeText: '',
      featured: false,
      newBadge: false,
      sponsoredLabel: true,
      pinned: false,
      status: 'active' as const,
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 5,
      order: 6,
      tags: ['Tools'],
      specialType: 'url' as const,
      clicks: 710,
      createdAt: '2026-09-05T09:00:00.000Z',
      updatedAt: '2026-09-25T14:00:00.000Z',
      deletedAt: null,
    },
    {
      id: 'link_7',
      title: 'WhatsApp Business Broadcast & Brand Enquiries',
      nickname: 'Direct WhatsApp',
      url: 'https://wa.me/14155552671',
      description: 'For sponsor integrations, press inquiries and exclusive collabs.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=400&q=80',
      icon: 'MessageSquare',
      emoji: '💬',
      categoryId: 'cat_business',
      buttonColor: '#22c55e',
      textColor: '#ffffff',
      buttonStyle: 'glass' as const,
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'FAST RESPONSE',
      featured: false,
      newBadge: false,
      sponsoredLabel: false,
      pinned: false,
      status: 'active' as const,
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 4,
      order: 7,
      tags: ['Popular'],
      specialType: 'whatsapp' as const,
      clicks: 390,
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-20T10:00:00.000Z',
      deletedAt: null,
    },
  ],
  analytics: {
    visitors: [
      { id: 'v_1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), referrer: 'https://instagram.com/', utmSource: 'instagram', utmMedium: 'bio', utmCampaign: 'profile_launch', isInstagram: true, isDirect: false, isOther: false, browser: 'Mobile Safari', device: 'Mobile', country: 'US' },
      { id: 'v_2', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), referrer: 'https://instagram.com/', utmSource: 'instagram', utmMedium: 'bio', utmCampaign: 'story_swipe', isInstagram: true, isDirect: false, isOther: false, browser: 'Chrome Mobile', device: 'Mobile', country: 'US' },
      { id: 'v_3', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), referrer: '', utmSource: '', utmMedium: '', utmCampaign: '', isInstagram: false, isDirect: true, isOther: false, browser: 'Chrome', device: 'Desktop', country: 'UK' },
      { id: 'v_4', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), referrer: 'https://l.instagram.com/', utmSource: 'instagram', utmMedium: 'profile', utmCampaign: '', isInstagram: true, isDirect: false, isOther: false, browser: 'Mobile Safari', device: 'Mobile', country: 'CA' },
      { id: 'v_5', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), referrer: 'https://youtube.com/', utmSource: 'youtube', utmMedium: 'desc', utmCampaign: '', isInstagram: false, isDirect: false, isOther: true, browser: 'Safari', device: 'Tablet', country: 'AU' },
    ],
    clicks: [
      { id: 'c_1', linkId: 'link_1', linkTitle: 'Watch Latest Masterclass: 2026 Video Editing Workflow', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), referrer: 'https://instagram.com/', isInstagram: true, device: 'Mobile' },
      { id: 'c_2', linkId: 'link_2', linkTitle: 'Free Cinematic LUTs & Lightroom Preset Pack 2026', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), referrer: 'https://instagram.com/', isInstagram: true, device: 'Mobile' },
      { id: 'c_3', linkId: 'link_2', linkTitle: 'Free Cinematic LUTs & Lightroom Preset Pack 2026', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), referrer: '', isInstagram: false, device: 'Desktop' },
    ],
    statsSummary: {
      totalVisitorsEstimate: 4120,
      instagramVisitorsEstimate: 2980,
      directVisitorsEstimate: 830,
      otherVisitorsEstimate: 310,
      totalClicksEstimate: 8460,
    },
  },
  settings: {
    autoLogoutMinutes: 60,
    siteTitle: 'Alex Vance | Official Bio Hub',
    allowSearch: true,
    allowSharing: true,
    allowQrCode: true,
    trashAutoPurgeDays: 30,
  },
};

export function getLocalDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInitialDb));
      return defaultInitialDb;
    }
    return JSON.parse(raw);
  } catch {
    return defaultInitialDb;
  }
}

export function saveLocalDb(db: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Storage quota or error', e);
  }
}

export const localStore = {
  async getPublicData(): Promise<PublicHubData> {
    const db = getLocalDb();
    const now = new Date();
    const activeLinks = (db.links || [])
      .filter((link: any) => {
        if (link.deletedAt || link.status !== 'active') return false;
        if (link.scheduleStart && new Date(link.scheduleStart) > now) return false;
        if (link.scheduleEnd && new Date(link.scheduleEnd) < now) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (b.linkPriority !== a.linkPriority) return (b.linkPriority || 0) - (a.linkPriority || 0);
        return (a.order || 0) - (b.order || 0);
      });

    return {
      profile: db.profile,
      appearance: db.appearance,
      categories: (db.categories || []).filter((c: any) => !c.hidden),
      tags: db.tags || [],
      links: activeLinks,
      settings: db.settings,
      publicStats: db.appearance?.showPublicStats ? {
        totalLinks: activeLinks.length,
        totalClicks: (db.links || []).reduce((acc: number, l: any) => acc + (l.clicks || 0), 0) + (db.analytics?.statsSummary?.totalClicksEstimate || 0),
        totalVisitors: (db.analytics?.visitors?.length || 0) + (db.analytics?.statsSummary?.totalVisitorsEstimate || 0),
      } : null,
    };
  },

  async trackVisit(data: { referrer: string; utmSource: string; utmMedium: string; utmCampaign: string }) {
    const db = getLocalDb();
    if (!db.analytics) db.analytics = { visitors: [], clicks: [] };
    const refLower = (data.referrer || '').toLowerCase();
    const utmLower = (data.utmSource || '').toLowerCase();
    const isInstagram = utmLower === 'instagram' || refLower.includes('instagram.com') || refLower.includes('ig.me');
    const isDirect = !data.referrer && !data.utmSource;

    db.analytics.visitors.unshift({
      id: 'v_' + Date.now(),
      timestamp: new Date().toISOString(),
      referrer: data.referrer,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      isInstagram,
      isDirect,
      isOther: !isInstagram && !isDirect,
      browser: 'Web Browser',
      device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
      country: 'Global',
    });
    if (db.analytics.visitors.length > 500) db.analytics.visitors = db.analytics.visitors.slice(0, 500);
    saveLocalDb(db);
  },

  async trackClick(linkId: string, referrer: string, utmSource: string) {
    const db = getLocalDb();
    const link = (db.links || []).find((l: any) => l.id === linkId);
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      if (!db.analytics) db.analytics = { visitors: [], clicks: [] };
      db.analytics.clicks.unshift({
        id: 'c_' + Date.now(),
        linkId,
        linkTitle: link.title,
        timestamp: new Date().toISOString(),
        referrer,
        isInstagram: utmSource === 'instagram' || referrer.includes('instagram'),
        device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
      });
      if (db.analytics.clicks.length > 500) db.analytics.clicks = db.analytics.clicks.slice(0, 500);
      saveLocalDb(db);
    }
  },

  async getAuthStatus() {
    const db = getLocalDb();
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
    const now = Date.now();
    const isLocked = lockoutUntil > now;
    return {
      hasPassword: !!db.admin?.hasPassword,
      isDefaultPassword: !!db.admin?.isDefaultPassword,
      isLocked,
      lockRemainingSeconds: isLocked ? Math.ceil((lockoutUntil - now) / 1000) : 0,
    };
  },

  async setupPassword(password: string) {
    const db = getLocalDb();
    const hash = await hashPasswordWeb(password);
    db.admin = {
      hasPassword: true,
      passwordHash: hash,
      isDefaultPassword: false,
      autoLogoutMinutes: 60,
    };
    saveLocalDb(db);
    const token = 'token_' + Math.random().toString(36).substring(2);
    const expiresAt = Date.now() + 60 * 60 * 1000;
    return { token, expiresAt };
  },

  async login(password: string) {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      throw new Error(`Rate limit exceeded. Locked for ${Math.ceil((lockoutUntil - now) / 1000)} seconds.`);
    }

    const db = getLocalDb();
    const hash = await hashPasswordWeb(password);

    // Also support default admin123
    const isDefaultMatch = (password === 'admin123' && db.admin?.isDefaultPassword);
    const isHashMatch = (hash === db.admin?.passwordHash);

    if (!isDefaultMatch && !isHashMatch) {
      const attempts = parseInt(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
      if (attempts >= 5) {
        localStorage.setItem(LOCKOUT_KEY, (now + 5 * 60 * 1000).toString());
        localStorage.removeItem(FAILED_ATTEMPTS_KEY);
        throw new Error('Too many failed attempts. Rate limit: locked for 5 minutes.');
      } else {
        localStorage.setItem(FAILED_ATTEMPTS_KEY, attempts.toString());
        throw new Error(`Invalid password. (${5 - attempts} attempt(s) remaining)`);
      }
    }

    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    const token = 'token_' + Math.random().toString(36).substring(2);
    const expiresAt = Date.now() + (db.admin?.autoLogoutMinutes || 60) * 60 * 1000;
    return { token, expiresAt, isDefaultPassword: !!db.admin?.isDefaultPassword };
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const db = getLocalDb();
    if (!db.admin?.isDefaultPassword) {
      const currentHash = await hashPasswordWeb(currentPassword);
      if (currentHash !== db.admin?.passwordHash) {
        throw new Error('Current password is incorrect.');
      }
    }
    const newHash = await hashPasswordWeb(newPassword);
    db.admin.passwordHash = newHash;
    db.admin.isDefaultPassword = false;
    saveLocalDb(db);
  },

  async verifyPassword(password: string) {
    const db = getLocalDb();
    const hash = await hashPasswordWeb(password);
    return hash === db.admin?.passwordHash || (password === 'admin123' && db.admin?.isDefaultPassword);
  },

  async getAdminData(): Promise<AdminHubData> {
    const db = getLocalDb();
    const allLinks = db.links || [];
    return {
      profile: db.profile,
      appearance: db.appearance,
      categories: db.categories || [],
      tags: db.tags || [],
      links: allLinks,
      trashCount: allLinks.filter((l: any) => !!l.deletedAt).length,
      activeCount: allLinks.filter((l: any) => !l.deletedAt).length,
      settings: db.settings,
      adminMeta: {
        isDefaultPassword: !!db.admin?.isDefaultPassword,
        autoLogoutMinutes: db.admin?.autoLogoutMinutes || 60,
      },
      analytics: db.analytics || { visitors: [], clicks: [] },
    };
  },

  async addLink(link: Partial<LinkItem>): Promise<LinkItem> {
    const db = getLocalDb();
    let url = (link.url || '').trim();
    if (!/^https?:\/\//i.test(url) && !/^(mailto:|tel:|wa\.me|t\.me)/i.test(url)) {
      url = 'https://' + url;
    }
    const fullLink: LinkItem = {
      id: link.id || 'link_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: link.title || '',
      nickname: link.nickname || '',
      url,
      description: link.description || '',
      thumbnailUrl: link.thumbnailUrl || '',
      icon: link.icon || 'Link',
      emoji: link.emoji || '',
      categoryId: link.categoryId || db.categories?.[0]?.id || 'cat_all',
      buttonColor: link.buttonColor || '#ec4899',
      textColor: link.textColor || '#ffffff',
      buttonStyle: link.buttonStyle || 'glass',
      borderRadius: link.borderRadius ?? 16,
      border: link.border ?? true,
      shadow: link.shadow ?? true,
      badge: link.badge ?? false,
      badgeText: link.badgeText || '',
      featured: link.featured ?? false,
      newBadge: link.newBadge ?? false,
      sponsoredLabel: link.sponsoredLabel ?? false,
      pinned: link.pinned ?? false,
      status: link.status || 'active',
      scheduleStart: link.scheduleStart || null,
      scheduleEnd: link.scheduleEnd || null,
      openNewTab: link.openNewTab !== false,
      confirmBeforeOpening: link.confirmBeforeOpening ?? false,
      linkPriority: link.linkPriority ?? 5,
      order: (db.links?.length || 0) + 1,
      tags: link.tags || [],
      specialType: link.specialType || 'url',
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    if (!db.links) db.links = [];
    db.links.push(fullLink);
    saveLocalDb(db);
    return fullLink;
  },

  async updateLink(id: string, updates: Partial<LinkItem>): Promise<LinkItem> {
    const db = getLocalDb();
    const idx = (db.links || []).findIndex((l: any) => l.id === id);
    if (idx === -1) throw new Error('Link not found');
    db.links[idx] = {
      ...db.links[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    saveLocalDb(db);
    return db.links[idx];
  },

  async deleteLink(id: string, permanent: boolean) {
    const db = getLocalDb();
    if (permanent) {
      db.links = (db.links || []).filter((l: any) => l.id !== id);
    } else {
      const link = (db.links || []).find((l: any) => l.id === id);
      if (link) {
        link.deletedAt = new Date().toISOString();
        link.status = 'trash';
      }
    }
    saveLocalDb(db);
  },

  async restoreLink(id: string) {
    const db = getLocalDb();
    const link = (db.links || []).find((l: any) => l.id === id);
    if (link) {
      link.deletedAt = null;
      link.status = 'active';
      link.updatedAt = new Date().toISOString();
      saveLocalDb(db);
      return link;
    }
    throw new Error('Link not found');
  },

  async bulkOperation(action: string, linkIds: string[], payload?: any) {
    const db = getLocalDb();
    const set = new Set(linkIds);
    if (action === 'delete') {
      db.links.forEach((l: any) => {
        if (set.has(l.id)) {
          l.deletedAt = new Date().toISOString();
          l.status = 'trash';
        }
      });
    } else if (action === 'permanent-delete') {
      db.links = db.links.filter((l: any) => !set.has(l.id));
    } else if (action === 'restore') {
      db.links.forEach((l: any) => {
        if (set.has(l.id)) {
          l.deletedAt = null;
          l.status = 'active';
        }
      });
    } else if (action === 'enable') {
      db.links.forEach((l: any) => {
        if (set.has(l.id)) l.status = 'active';
      });
    } else if (action === 'disable') {
      db.links.forEach((l: any) => {
        if (set.has(l.id)) l.status = 'hidden';
      });
    } else if (action === 'change-category') {
      if (payload?.categoryId) {
        db.links.forEach((l: any) => {
          if (set.has(l.id)) l.categoryId = payload.categoryId;
        });
      }
    } else if (action === 'duplicate') {
      const items = db.links.filter((l: any) => set.has(l.id));
      items.forEach((item: any) => {
        db.links.push({
          ...item,
          id: 'link_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title: `${item.title} (Copy)`,
          clicks: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
    }
    saveLocalDb(db);
  },

  async reorderLinks(orders: { id: string; order: number }[]) {
    const db = getLocalDb();
    const map = new Map(orders.map((o) => [o.id, o.order]));
    db.links.forEach((l: any) => {
      if (map.has(l.id)) l.order = map.get(l.id);
    });
    saveLocalDb(db);
  },

  async updateCategories(categories: Category[]) {
    const db = getLocalDb();
    db.categories = categories;
    saveLocalDb(db);
    return categories;
  },

  async updateTags(tags: Tag[]) {
    const db = getLocalDb();
    db.tags = tags;
    saveLocalDb(db);
    return tags;
  },

  async updateProfile(profile: Profile) {
    const db = getLocalDb();
    db.profile = profile;
    saveLocalDb(db);
    return profile;
  },

  async updateAppearance(appearance: Appearance) {
    const db = getLocalDb();
    db.appearance = appearance;
    saveLocalDb(db);
    return appearance;
  },

  async updateSettings(settings: Settings) {
    const db = getLocalDb();
    db.settings = settings;
    saveLocalDb(db);
    return settings;
  },

  async exportBackup() {
    const db = getLocalDb();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: db.profile,
      appearance: db.appearance,
      categories: db.categories,
      tags: db.tags,
      links: db.links,
      settings: db.settings,
      analytics: db.analytics,
    };
  },

  async restoreBackup(backup: any) {
    const currentDb = getLocalDb();
    const newDb = {
      admin: currentDb.admin,
      profile: backup.profile || currentDb.profile,
      appearance: backup.appearance || currentDb.appearance,
      categories: backup.categories || currentDb.categories,
      tags: backup.tags || currentDb.tags,
      links: backup.links || currentDb.links,
      settings: backup.settings || currentDb.settings,
      analytics: backup.analytics || currentDb.analytics,
    };
    saveLocalDb(newDb);
  },

  async resetData(type: 'all' | 'appearance' | 'remove-demo') {
    const currentDb = getLocalDb();
    if (type === 'appearance') {
      currentDb.appearance = defaultInitialDb.appearance;
    } else if (type === 'remove-demo') {
      currentDb.links = [];
      currentDb.analytics = { visitors: [], clicks: [], statsSummary: { totalVisitorsEstimate: 0, instagramVisitorsEstimate: 0, directVisitorsEstimate: 0, otherVisitorsEstimate: 0, totalClicksEstimate: 0 } };
    } else if (type === 'all') {
      const admin = currentDb.admin;
      const fresh = JSON.parse(JSON.stringify(defaultInitialDb));
      fresh.admin = admin;
      saveLocalDb(fresh);
      return;
    }
    saveLocalDb(currentDb);
  },

  async checkLinkHealth() {
    const db = getLocalDb();
    const active = (db.links || []).filter((l: any) => !l.deletedAt);
    const issues: any[] = [];
    const urlMap = new Map<string, string[]>();

    active.forEach((l: any) => {
      const clean = (l.url || '').trim().toLowerCase().replace(/\/$/, '');
      if (!urlMap.has(clean)) {
        urlMap.set(clean, [l.title]);
      } else {
        urlMap.get(clean)!.push(l.title);
      }

      if (!/^https?:\/\//i.test(l.url) && !/^(mailto:|tel:|wa\.me|t\.me)/i.test(l.url)) {
        issues.push({ id: l.id, title: l.title, url: l.url, type: 'protocol', message: 'Missing https:// protocol.' });
      }
      if (!l.title?.trim()) {
        issues.push({ id: l.id, title: 'Untitled', url: l.url, type: 'title', message: 'Missing link title.' });
      }
    });

    urlMap.forEach((titles, url) => {
      if (titles.length > 1) {
        issues.push({ type: 'duplicate', url, message: `URL is repeated across ${titles.length} links: "${titles.join('", "')}"` });
      }
    });

    return { totalChecked: active.length, issuesFound: issues.length, issues };
  },

  async emptyTrash() {
    const db = getLocalDb();
    const initial = (db.links || []).length;
    db.links = (db.links || []).filter((l: any) => !l.deletedAt);
    saveLocalDb(db);
    return initial - db.links.length;
  },
};
