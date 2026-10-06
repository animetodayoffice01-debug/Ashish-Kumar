import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// In-memory rate limiting and sessions
interface Session {
  token: string;
  expiresAt: number;
}
const activeSessions = new Map<string, Session>();

interface LoginAttempt {
  count: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, LoginAttempt>();

// Helper to hash password
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Initial DB template
const defaultDb = {
  admin: {
    hasPassword: true,
    salt: 'salt_biolink_2026',
    passwordHash: hashPassword('admin123', 'salt_biolink_2026'), // Default password
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
    photoShape: 'circle',
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
    preset: 'creator',
    themeMode: 'dark',
    bgType: 'gradient',
    bgColor: '#09090b',
    bgGradient: 'radial-gradient(ellipse at top, #18181b 0%, #09090b 100%)',
    bgImageUrl: '',
    primaryColor: '#8b5cf6',
    textColor: '#f4f4f5',
    accentColor: '#ec4899',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 16,
    cardShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
    spacing: 'normal',
    animationsEnabled: true,
    profileLayout: 'center',
    linkLayout: 'list',
    defaultButtonStyle: 'glass',
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
      buttonStyle: 'glass',
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'HOT VIDEO',
      featured: true,
      newBadge: true,
      sponsoredLabel: false,
      pinned: true,
      status: 'active',
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 10,
      order: 1,
      tags: ['Featured', 'YouTube', 'Editing'],
      specialType: 'youtube',
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
      buttonStyle: 'neon',
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'FREE DOWNLOAD',
      featured: true,
      newBadge: false,
      sponsoredLabel: false,
      pinned: true,
      status: 'active',
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 9,
      order: 2,
      tags: ['Free', 'Featured', 'Editing'],
      specialType: 'download',
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
      buttonStyle: 'gradient',
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'JOIN COMMUNITY',
      featured: true,
      newBadge: false,
      sponsoredLabel: false,
      pinned: false,
      status: 'active',
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 8,
      order: 3,
      tags: ['Popular'],
      specialType: 'telegram',
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
      buttonStyle: 'glass',
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'UPDATED',
      featured: false,
      newBadge: true,
      sponsoredLabel: false,
      pinned: false,
      status: 'active',
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 7,
      order: 4,
      tags: ['AI', 'Tools'],
      specialType: 'url',
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
      buttonStyle: 'card',
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'BOOK NOW',
      featured: false,
      newBadge: false,
      sponsoredLabel: false,
      pinned: false,
      status: 'active',
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 6,
      order: 5,
      tags: ['Popular'],
      specialType: 'url',
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
      buttonStyle: 'outline',
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: false,
      badgeText: '',
      featured: false,
      newBadge: false,
      sponsoredLabel: true,
      pinned: false,
      status: 'active',
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 5,
      order: 6,
      tags: ['Tools'],
      specialType: 'url',
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
      buttonStyle: 'glass',
      borderRadius: 16,
      border: true,
      shadow: true,
      badge: true,
      badgeText: 'FAST RESPONSE',
      featured: false,
      newBadge: false,
      sponsoredLabel: false,
      pinned: false,
      status: 'active',
      scheduleStart: null,
      scheduleEnd: null,
      openNewTab: true,
      confirmBeforeOpening: false,
      linkPriority: 4,
      order: 7,
      tags: ['Popular'],
      specialType: 'whatsapp',
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

// DB load and save
function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf8');
  }
}

function readDb() {
  try {
    initDb();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return defaultDb;
  }
}

// SSE Sync Clients map for Real-Time Multi-Device Sync
interface SyncClient {
  id: string;
  res: express.Response;
  role: 'admin' | 'public';
  connectedAt: number;
}
const syncClients = new Map<string, SyncClient>();

function broadcastSync(event: {
  type: string;
  version: number;
  lastUpdated: string;
  action?: string;
  entityId?: string;
}) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const [id, client] of syncClients.entries()) {
    try {
      client.res.write(payload);
    } catch {
      syncClients.delete(id);
    }
  }
}

function writeDb(data: any, actionName?: string, entityId?: string) {
  try {
    initDb();
    data.version = (data.version || 0) + 1;
    data.lastUpdated = new Date().toISOString();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    broadcastSync({
      type: 'mutation',
      version: data.version,
      lastUpdated: data.lastUpdated,
      action: actionName || 'update',
      entityId,
    });
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// GET /api/sync/stream (Real-Time Server-Sent Events stream for all devices)
app.get('/api/sync/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const role = req.query.role === 'admin' ? 'admin' : 'public';
  syncClients.set(clientId, { id: clientId, res, role, connectedAt: Date.now() });

  const db = readDb();
  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      version: db.version || 1,
      lastUpdated: db.lastUpdated || new Date().toISOString(),
      clientId,
    })}\n\n`
  );

  const pingInterval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(pingInterval);
      syncClients.delete(clientId);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(pingInterval);
    syncClients.delete(clientId);
  });
});

// GET /api/sync/status (Lightweight health and version poll)
app.get('/api/sync/status', (req, res) => {
  const db = readDb();
  res.json({
    version: db.version || 1,
    lastUpdated: db.lastUpdated || new Date().toISOString(),
    connectedClients: syncClients.size,
    serverTime: new Date().toISOString(),
  });
});

// Authentication middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin session required.' });
  }
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired due to inactivity. Please log in again.' });
  }
  // Sliding session extension
  const db = readDb();
  const timeoutMs = (db.admin?.autoLogoutMinutes || 60) * 60 * 1000;
  session.expiresAt = Date.now() + timeoutMs;
  next();
}

// ================= PUBLIC API ROUTES =================

// GET /api/public/data
app.get('/api/public/data', (req, res) => {
  const db = readDb();
  const now = new Date();

  // Filter links: active, not deleted, within schedule
  const activeLinks = (db.links || [])
    .filter((link: any) => {
      if (link.deletedAt || link.status !== 'active') return false;
      if (link.scheduleStart && new Date(link.scheduleStart) > now) return false;
      if (link.scheduleEnd && new Date(link.scheduleEnd) < now) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      // Pinned first, then priority desc, then order asc
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (b.linkPriority !== a.linkPriority) return (b.linkPriority || 0) - (a.linkPriority || 0);
      return (a.order || 0) - (b.order || 0);
    });

  // Only public categories
  const publicCategories = (db.categories || []).filter((c: any) => !c.hidden);

  res.json({
    profile: db.profile,
    appearance: db.appearance,
    categories: publicCategories,
    tags: db.tags || [],
    links: activeLinks,
    settings: {
      siteTitle: db.settings?.siteTitle || db.profile?.websiteTitle,
      allowSearch: db.settings?.allowSearch ?? true,
      allowSharing: db.settings?.allowSharing ?? true,
      allowQrCode: db.settings?.allowQrCode ?? true,
    },
    publicStats: db.appearance?.showPublicStats ? {
      totalLinks: activeLinks.length,
      totalClicks: (db.links || []).reduce((acc: number, l: any) => acc + (l.clicks || 0), 0) + (db.analytics?.statsSummary?.totalClicksEstimate || 0),
      totalVisitors: (db.analytics?.visitors?.length || 0) + (db.analytics?.statsSummary?.totalVisitorsEstimate || 0),
    } : null,
  });
});

// POST /api/public/track-visit
app.post('/api/public/track-visit', (req, res) => {
  const { referrer = '', utmSource = '', utmMedium = '', utmCampaign = '' } = req.body || {};
  const userAgent = req.headers['user-agent'] || '';
  
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  const isTablet = /ipad|tablet/i.test(userAgent);
  const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
  
  let browser = 'Unknown';
  if (/chrome|crios/i.test(userAgent)) browser = 'Chrome';
  else if (/safari/i.test(userAgent)) browser = 'Safari';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/edg/i.test(userAgent)) browser = 'Edge';

  const refLower = referrer.toLowerCase();
  const utmSrcLower = utmSource.toLowerCase();
  const isInstagram = utmSrcLower === 'instagram' || refLower.includes('instagram.com') || refLower.includes('ig.me');
  const isDirect = !referrer && !utmSource;
  const isOther = !isInstagram && !isDirect;

  const db = readDb();
  if (!db.analytics) db.analytics = { visitors: [], clicks: [] };
  if (!db.analytics.visitors) db.analytics.visitors = [];

  const visitRecord = {
    id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    referrer: referrer.substring(0, 200),
    utmSource: utmSource.substring(0, 50),
    utmMedium: utmMedium.substring(0, 50),
    utmCampaign: utmCampaign.substring(0, 50),
    isInstagram,
    isDirect,
    isOther,
    browser,
    device,
    country: 'Global',
  };

  db.analytics.visitors.unshift(visitRecord);
  // Keep analytics log within reasonable bounded storage (last 1000 detailed visits)
  if (db.analytics.visitors.length > 1000) {
    db.analytics.visitors = db.analytics.visitors.slice(0, 1000);
  }
  writeDb(db);

  res.json({ success: true });
});

// POST /api/public/track-click
app.post('/api/public/track-click', (req, res) => {
  const { linkId, referrer = '', utmSource = '' } = req.body || {};
  if (!linkId) return res.status(400).json({ error: 'linkId required' });

  const db = readDb();
  const link = (db.links || []).find((l: any) => l.id === linkId);
  if (!link) return res.status(404).json({ error: 'Link not found' });

  link.clicks = (link.clicks || 0) + 1;

  if (!db.analytics) db.analytics = { visitors: [], clicks: [] };
  if (!db.analytics.clicks) db.analytics.clicks = [];

  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  const device = isMobile ? 'Mobile' : 'Desktop';
  const isInstagram = (utmSource && utmSource.toLowerCase() === 'instagram') || referrer.toLowerCase().includes('instagram.com');

  const clickRecord = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    linkId,
    linkTitle: link.title,
    timestamp: new Date().toISOString(),
    referrer: referrer.substring(0, 200),
    isInstagram,
    device,
  };

  db.analytics.clicks.unshift(clickRecord);
  if (db.analytics.clicks.length > 2000) {
    db.analytics.clicks = db.analytics.clicks.slice(0, 2000);
  }

  writeDb(db);
  res.json({ success: true, clicks: link.clicks });
});

// ================= AUTHENTICATION ROUTES =================

// GET /api/admin/auth-status
app.get('/api/admin/auth-status', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'ip_default';
  const attempt = loginAttempts.get(ip);
  const now = Date.now();
  const isLocked = !!(attempt && attempt.lockedUntil > now);
  const lockRemainingSeconds = isLocked ? Math.ceil((attempt!.lockedUntil - now) / 1000) : 0;

  const db = readDb();
  res.json({
    hasPassword: !!db.admin?.hasPassword,
    isDefaultPassword: !!db.admin?.isDefaultPassword,
    isLocked,
    lockRemainingSeconds,
  });
});

// POST /api/admin/setup-password
app.post('/api/admin/setup-password', (req, res) => {
  const { password } = req.body || {};
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const db = readDb();
  if (db.admin?.hasPassword && !db.admin?.isDefaultPassword) {
    return res.status(400).json({ error: 'Password already configured. Use change password instead.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  db.admin = {
    hasPassword: true,
    salt,
    passwordHash,
    isDefaultPassword: false,
    autoLogoutMinutes: db.admin?.autoLogoutMinutes || 60,
  };
  writeDb(db);

  // Issue session token
  const token = crypto.randomUUID();
  const timeoutMs = (db.admin.autoLogoutMinutes || 60) * 60 * 1000;
  activeSessions.set(token, {
    token,
    expiresAt: Date.now() + timeoutMs,
  });

  res.json({ success: true, token, expiresAt: Date.now() + timeoutMs });
});

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'ip_default';
  const now = Date.now();
  let attempt = loginAttempts.get(ip);

  if (attempt && attempt.lockedUntil > now) {
    const remainingSec = Math.ceil((attempt.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Too many failed attempts. Locked out for security. Try again in ${remainingSec} seconds.`,
      lockRemainingSeconds: remainingSec,
    });
  }

  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const db = readDb();
  if (!db.admin || !db.admin.passwordHash) {
    return res.status(500).json({ error: 'Admin account not initialized' });
  }

  const computedHash = hashPassword(password, db.admin.salt);
  if (computedHash !== db.admin.passwordHash) {
    if (!attempt) {
      attempt = { count: 1, lockedUntil: 0 };
    } else {
      attempt.count += 1;
    }

    if (attempt.count >= 5) {
      attempt.lockedUntil = now + 5 * 60 * 1000; // 5 minute lock
      loginAttempts.set(ip, attempt);
      return res.status(429).json({
        error: 'Too many incorrect attempts. Rate limit exceeded: locked for 5 minutes.',
        lockRemainingSeconds: 300,
      });
    }

    loginAttempts.set(ip, attempt);
    return res.status(401).json({
      error: `Invalid password. (${5 - attempt.count} attempt(s) remaining before temporary lockout)`,
      attemptsRemaining: 5 - attempt.count,
    });
  }

  // Clear failed attempts on success
  loginAttempts.delete(ip);

  // Issue session token
  const token = crypto.randomUUID();
  const timeoutMs = (db.admin.autoLogoutMinutes || 60) * 60 * 1000;
  activeSessions.set(token, {
    token,
    expiresAt: Date.now() + timeoutMs,
  });

  res.json({
    success: true,
    token,
    expiresAt: Date.now() + timeoutMs,
    isDefaultPassword: !!db.admin.isDefaultPassword,
  });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// POST /api/admin/change-password
app.post('/api/admin/change-password', requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const db = readDb();
  if (!db.admin?.isDefaultPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required.' });
    }
    const currentHash = hashPassword(currentPassword, db.admin.salt);
    if (currentHash !== db.admin.passwordHash) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  db.admin.salt = newSalt;
  db.admin.passwordHash = hashPassword(newPassword, newSalt);
  db.admin.isDefaultPassword = false;
  writeDb(db);

  res.json({ success: true, message: 'Password updated successfully' });
});

// POST /api/admin/verify-password (for destructive confirmations)
app.post('/api/admin/verify-password', requireAdminAuth, (req, res) => {
  const { password } = req.body || {};
  const db = readDb();
  if (!password || hashPassword(password, db.admin.salt) !== db.admin.passwordHash) {
    return res.status(401).json({ error: 'Password verification failed. Incorrect password.' });
  }
  res.json({ success: true });
});

// ================= ADMIN DATA & CRUD ROUTES =================

// GET /api/admin/data
app.get('/api/admin/data', requireAdminAuth, (req, res) => {
  const db = readDb();
  const allLinks = db.links || [];
  const trashLinks = allLinks.filter((l: any) => !!l.deletedAt);
  const activeLinks = allLinks.filter((l: any) => !l.deletedAt);

  res.json({
    profile: db.profile,
    appearance: db.appearance,
    categories: db.categories || [],
    tags: db.tags || [],
    links: allLinks,
    trashCount: trashLinks.length,
    activeCount: activeLinks.length,
    settings: db.settings,
    adminMeta: {
      isDefaultPassword: !!db.admin?.isDefaultPassword,
      autoLogoutMinutes: db.admin?.autoLogoutMinutes || 60,
    },
    analytics: db.analytics || { visitors: [], clicks: [] },
  });
});

// POST /api/admin/links (Add Link)
app.post('/api/admin/links', requireAdminAuth, (req, res) => {
  const newLink = req.body;
  if (!newLink.title || !newLink.url) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }

  // URL normalization
  let normalizedUrl = newLink.url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl) && !/^(mailto:|tel:|wa\.me|t\.me)/i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  newLink.url = normalizedUrl;

  const db = readDb();
  newLink.id = newLink.id || 'link_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  newLink.clicks = newLink.clicks || 0;
  newLink.createdAt = newLink.createdAt || new Date().toISOString();
  newLink.updatedAt = new Date().toISOString();
  newLink.deletedAt = null;
  newLink.order = db.links?.length ? Math.max(...db.links.map((l: any) => l.order || 0)) + 1 : 1;

  if (!db.links) db.links = [];
  db.links.push(newLink);
  writeDb(db);

  res.json({ success: true, link: newLink });
});

// PUT /api/admin/links/:id (Update Link)
app.put('/api/admin/links/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const db = readDb();
  const index = (db.links || []).findIndex((l: any) => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Link not found' });

  if (updates.url) {
    let normalizedUrl = updates.url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl) && !/^(mailto:|tel:|wa\.me|t\.me)/i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    updates.url = normalizedUrl;
  }

  db.links[index] = {
    ...db.links[index],
    ...updates,
    id, // preserve id
    updatedAt: new Date().toISOString(),
  };

  writeDb(db);
  res.json({ success: true, link: db.links[index] });
});

// DELETE /api/admin/links/:id (Soft delete to trash or permanent)
app.delete('/api/admin/links/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const permanent = req.query.permanent === 'true';

  const db = readDb();
  const index = (db.links || []).findIndex((l: any) => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Link not found' });

  if (permanent) {
    db.links.splice(index, 1);
  } else {
    db.links[index].deletedAt = new Date().toISOString();
    db.links[index].status = 'trash';
  }

  writeDb(db);
  res.json({ success: true, permanent });
});

// POST /api/admin/links/:id/restore (Restore from trash)
app.post('/api/admin/links/:id/restore', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const link = (db.links || []).find((l: any) => l.id === id);
  if (!link) return res.status(404).json({ error: 'Link not found' });

  link.deletedAt = null;
  link.status = 'active';
  link.updatedAt = new Date().toISOString();
  writeDb(db);

  res.json({ success: true, link });
});

// POST /api/admin/links/bulk (Bulk operations)
app.post('/api/admin/links/bulk', requireAdminAuth, (req, res) => {
  const { action, linkIds, payload } = req.body || {};
  if (!action || !Array.isArray(linkIds) || linkIds.length === 0) {
    return res.status(400).json({ error: 'action and linkIds array required' });
  }

  const db = readDb();
  const idSet = new Set(linkIds);

  if (action === 'delete') {
    db.links.forEach((l: any) => {
      if (idSet.has(l.id)) {
        l.deletedAt = new Date().toISOString();
        l.status = 'trash';
      }
    });
  } else if (action === 'permanent-delete') {
    db.links = db.links.filter((l: any) => !idSet.has(l.id));
  } else if (action === 'restore') {
    db.links.forEach((l: any) => {
      if (idSet.has(l.id)) {
        l.deletedAt = null;
        l.status = 'active';
      }
    });
  } else if (action === 'enable') {
    db.links.forEach((l: any) => {
      if (idSet.has(l.id)) l.status = 'active';
    });
  } else if (action === 'disable') {
    db.links.forEach((l: any) => {
      if (idSet.has(l.id)) l.status = 'hidden';
    });
  } else if (action === 'change-category') {
    const categoryId = payload?.categoryId;
    if (categoryId) {
      db.links.forEach((l: any) => {
        if (idSet.has(l.id)) l.categoryId = categoryId;
      });
    }
  } else if (action === 'add-tag') {
    const tag = payload?.tag;
    if (tag) {
      db.links.forEach((l: any) => {
        if (idSet.has(l.id)) {
          if (!l.tags) l.tags = [];
          if (!l.tags.includes(tag)) l.tags.push(tag);
        }
      });
    }
  } else if (action === 'remove-tag') {
    const tag = payload?.tag;
    if (tag) {
      db.links.forEach((l: any) => {
        if (idSet.has(l.id) && l.tags) {
          l.tags = l.tags.filter((t: string) => t !== tag);
        }
      });
    }
  } else if (action === 'duplicate') {
    const toDuplicate = db.links.filter((l: any) => idSet.has(l.id));
    toDuplicate.forEach((item: any) => {
      const copy = {
        ...item,
        id: 'link_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: `${item.title} (Copy)`,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: (item.order || 0) + 1,
      };
      db.links.push(copy);
    });
  }

  writeDb(db);
  res.json({ success: true, modifiedCount: linkIds.length });
});

// POST /api/admin/links/reorder (Save full link ordering)
app.post('/api/admin/links/reorder', requireAdminAuth, (req, res) => {
  const { orders } = req.body || {}; // array of { id, order }
  if (!Array.isArray(orders)) return res.status(400).json({ error: 'orders array required' });

  const orderMap = new Map(orders.map((o: any) => [o.id, o.order]));
  const db = readDb();
  db.links.forEach((l: any) => {
    if (orderMap.has(l.id)) {
      l.order = orderMap.get(l.id);
    }
  });

  writeDb(db);
  res.json({ success: true });
});

// POST /api/admin/categories (Update categories)
app.post('/api/admin/categories', requireAdminAuth, (req, res) => {
  const { categories } = req.body || {};
  if (!Array.isArray(categories)) return res.status(400).json({ error: 'categories array required' });

  const db = readDb();
  db.categories = categories;
  writeDb(db);
  res.json({ success: true, categories: db.categories });
});

// POST /api/admin/tags (Update tags)
app.post('/api/admin/tags', requireAdminAuth, (req, res) => {
  const { tags } = req.body || {};
  if (!Array.isArray(tags)) return res.status(400).json({ error: 'tags array required' });

  const db = readDb();
  db.tags = tags;
  writeDb(db);
  res.json({ success: true, tags: db.tags });
});

// POST /api/admin/profile (Update profile)
app.post('/api/admin/profile', requireAdminAuth, (req, res) => {
  const profileUpdates = req.body;
  const db = readDb();
  db.profile = { ...db.profile, ...profileUpdates };
  writeDb(db);
  res.json({ success: true, profile: db.profile });
});

// POST /api/admin/appearance (Update appearance)
app.post('/api/admin/appearance', requireAdminAuth, (req, res) => {
  const appearanceUpdates = req.body;
  const db = readDb();
  db.appearance = { ...db.appearance, ...appearanceUpdates };
  writeDb(db);
  res.json({ success: true, appearance: db.appearance });
});

// POST /api/admin/settings (Update global settings)
app.post('/api/admin/settings', requireAdminAuth, (req, res) => {
  const settingsUpdates = req.body;
  const db = readDb();
  db.settings = { ...db.settings, ...settingsUpdates };
  if (settingsUpdates.autoLogoutMinutes && db.admin) {
    db.admin.autoLogoutMinutes = settingsUpdates.autoLogoutMinutes;
  }
  writeDb(db);
  res.json({ success: true, settings: db.settings });
});

// POST /api/admin/backup/export
app.post('/api/admin/backup/export', requireAdminAuth, (req, res) => {
  const db = readDb();
  // Strip password hashes from backup export for security
  const backup = {
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
  res.json(backup);
});

// POST /api/admin/backup/restore
app.post('/api/admin/backup/restore', requireAdminAuth, (req, res) => {
  const { backupData, confirmPassword } = req.body || {};
  if (!backupData || !backupData.links || !backupData.profile) {
    return res.status(400).json({ error: 'Invalid backup file structure' });
  }

  const db = readDb();
  if (confirmPassword) {
    if (hashPassword(confirmPassword, db.admin.salt) !== db.admin.passwordHash) {
      return res.status(401).json({ error: 'Incorrect confirmation password.' });
    }
  }

  // Preserve admin authentication credentials
  const currentAdmin = db.admin;
  const newDb = {
    admin: currentAdmin,
    profile: backupData.profile || db.profile,
    appearance: backupData.appearance || db.appearance,
    categories: backupData.categories || db.categories,
    tags: backupData.tags || db.tags,
    links: backupData.links || db.links,
    settings: backupData.settings || db.settings,
    analytics: backupData.analytics || db.analytics,
  };

  writeDb(newDb);
  res.json({ success: true, message: 'Backup restored successfully' });
});

// POST /api/admin/reset
app.post('/api/admin/reset', requireAdminAuth, (req, res) => {
  const { resetType, confirmPassword } = req.body || {};
  const db = readDb();

  if (confirmPassword) {
    if (hashPassword(confirmPassword, db.admin.salt) !== db.admin.passwordHash) {
      return res.status(401).json({ error: 'Incorrect confirmation password.' });
    }
  }

  if (resetType === 'appearance') {
    db.appearance = defaultDb.appearance;
  } else if (resetType === 'remove-demo') {
    // Keep only user-created links or empty
    db.links = [];
    db.analytics = { visitors: [], clicks: [], statsSummary: { totalVisitorsEstimate: 0, instagramVisitorsEstimate: 0, directVisitorsEstimate: 0, otherVisitorsEstimate: 0, totalClicksEstimate: 0 } };
  } else if (resetType === 'all') {
    const currentAdmin = db.admin;
    const freshDb = JSON.parse(JSON.stringify(defaultDb));
    freshDb.admin = currentAdmin;
    writeDb(freshDb);
    return res.json({ success: true, message: 'All data reset to initial defaults.' });
  }

  writeDb(db);
  res.json({ success: true, message: `Reset ${resetType} completed successfully` });
});

// POST /api/admin/link-health (Validate URLs)
app.post('/api/admin/link-health', requireAdminAuth, (req, res) => {
  const db = readDb();
  const allLinks = (db.links || []).filter((l: any) => !l.deletedAt);
  const issues: any[] = [];
  const urlMap = new Map<string, string[]>();

  allLinks.forEach((link: any) => {
    // Duplicate URL detection
    const cleanUrl = link.url.trim().toLowerCase().replace(/\/$/, '');
    if (!urlMap.has(cleanUrl)) {
      urlMap.set(cleanUrl, [link.title]);
    } else {
      urlMap.get(cleanUrl)!.push(link.title);
    }

    // Protocol check
    if (!/^https?:\/\//i.test(link.url) && !/^(mailto:|tel:|wa\.me|t\.me)/i.test(link.url)) {
      issues.push({
        id: link.id,
        title: link.title,
        url: link.url,
        type: 'missing_protocol',
        message: 'Missing http:// or https:// protocol.',
      });
    }

    // Empty title
    if (!link.title || link.title.trim().length === 0) {
      issues.push({
        id: link.id,
        title: 'Untitled',
        url: link.url,
        type: 'empty_title',
        message: 'Link is missing a title.',
      });
    }
  });

  // Check duplicates
  urlMap.forEach((titles, url) => {
    if (titles.length > 1) {
      issues.push({
        type: 'duplicate_url',
        url,
        message: `URL is used across ${titles.length} links: "${titles.join('", "')}"`,
      });
    }
  });

  res.json({
    totalChecked: allLinks.length,
    issuesFound: issues.length,
    issues,
  });
});

// POST /api/admin/empty-trash
app.post('/api/admin/empty-trash', requireAdminAuth, (req, res) => {
  const db = readDb();
  const countBefore = (db.links || []).length;
  db.links = (db.links || []).filter((l: any) => !l.deletedAt);
  const removedCount = countBefore - db.links.length;
  writeDb(db);
  res.json({ success: true, removedCount });
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  initDb();

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
