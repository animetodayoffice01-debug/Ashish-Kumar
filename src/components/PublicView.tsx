import React, { useState, useMemo } from 'react';
import { PublicHubData, LinkItem } from '../types';
import { VirtualLinkList } from './VirtualLinkList';
import { PublicLinkCard } from './PublicLinkCard';
import { PWAInstallButton } from './PWAInstallButton';
import { QRCodeModal } from './QRCodeModal';
import { ShareModal } from './ShareModal';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { getIconComponent } from '../lib/icons';
import {
  Search,
  X,
  Share2,
  QrCode,
  MapPin,
  CheckCircle2,
  Sparkles,
  Lock,
  Star,
} from 'lucide-react';

interface Props {
  data: PublicHubData;
  onOpenAdminAuth: () => void;
  onTrackClick: (linkId: string) => void;
}

export const PublicView: React.FC<Props> = ({ data, onOpenAdminAuth, onTrackClick }) => {
  const { profile, appearance, categories, links, publicStats, settings } = data;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('biolink_search_history') || '[]');
    } catch {
      return [];
    }
  });

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://biolink.app';

  // Save search history
  const handleSearchSubmit = (q: string) => {
    if (!q.trim()) return;
    const trimmed = q.trim();
    const updated = [trimmed, ...searchHistory.filter((item) => item !== trimmed)].slice(0, 5);
    setSearchHistory(updated);
    try {
      localStorage.setItem('biolink_search_history', JSON.stringify(updated));
    } catch {}
  };

  // Categories with counts
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    links.forEach((l) => {
      map.set(l.categoryId, (map.get(l.categoryId) || 0) + 1);
    });
    return map;
  }, [links]);

  // Featured links separated if on 'all' view and no search
  const featuredLinks = useMemo(() => {
    if (searchQuery.trim() || selectedCategory !== 'all' || selectedTag) return [];
    return links.filter((l) => l.featured).slice(0, appearance.maxFeaturedCount || 3);
  }, [links, searchQuery, selectedCategory, selectedTag, appearance.maxFeaturedCount]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    let result = links;

    // Exclude top-featured from the main list if they are rendered in the Featured section above
    if (!searchQuery.trim() && selectedCategory === 'all' && !selectedTag && featuredLinks.length > 0) {
      const featuredIds = new Set(featuredLinks.map((f) => f.id));
      result = result.filter((l) => !featuredIds.has(l.id));
    }

    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.categoryId === selectedCategory);
    }

    if (selectedTag) {
      result = result.filter((l) => l.tags && l.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((l) => {
        const titleMatch = l.title?.toLowerCase().includes(q);
        const descMatch = l.description?.toLowerCase().includes(q);
        const nickMatch = l.nickname?.toLowerCase().includes(q);
        const urlMatch = l.url?.toLowerCase().includes(q);
        const tagMatch = l.tags?.some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || nickMatch || urlMatch || tagMatch;
      });
    }

    return result;
  }, [links, selectedCategory, selectedTag, searchQuery, featuredLinks]);

  // Photo shape style
  const getPhotoShapeClass = () => {
    switch (profile.photoShape) {
      case 'square':
        return 'rounded-2xl';
      case 'rounded':
        return 'rounded-3xl';
      case 'circle':
      default:
        return 'rounded-full';
    }
  };

  // Dynamic Background Style
  const getBgStyle = () => {
    if (appearance.bgType === 'image' && appearance.bgImageUrl) {
      return {
        backgroundImage: `url(${appearance.bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
    if (appearance.bgType === 'gradient' && appearance.bgGradient) {
      return { background: appearance.bgGradient };
    }
    return { backgroundColor: appearance.bgColor || '#09090b' };
  };

  return (
    <div
      style={getBgStyle()}
      className="min-h-screen text-zinc-100 flex flex-col items-center px-4 py-8 sm:py-12 transition-colors duration-300 relative selection:bg-rose-500 selection:text-white"
    >
      {/* Top Floating Action Bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <PWAInstallButton />
        </div>
        <div className="flex items-center gap-2">
          {settings.allowQrCode && (
            <button
              onClick={() => setShowQR(true)}
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 shadow-sm transition"
              title="QR Code"
              aria-label="View QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
          {settings.allowSharing && (
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: profile.websiteTitle || profile.displayName,
                      text: profile.shortDescription || profile.bio,
                      url: window.location.href,
                    })
                    .catch(() => setShowShare(true));
                } else {
                  setShowShare(true);
                }
              }}
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 shadow-sm transition"
              title="Share Profile"
              aria-label="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          {/* Direct Admin Entrance Icon */}
          <button
            onClick={onOpenAdminAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 shadow-sm text-xs font-semibold transition cursor-pointer"
            title="Manage Website (Admin)"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-lg flex flex-col items-center">
        {/* Profile Header */}
        <header className="w-full flex flex-col items-center text-center mb-6">
          {/* Profile Photo */}
          <div className="relative mb-3 group">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.displayName}
                style={{
                  width: `${profile.photoSize || 108}px`,
                  height: `${profile.photoSize || 108}px`,
                }}
                className={`object-cover ${getPhotoShapeClass()} ${
                  profile.photoBorder ? 'ring-4 ring-rose-500/30' : ''
                } ${profile.photoShadow ? 'shadow-2xl' : ''} transition-transform duration-300 group-hover:scale-105`}
              />
            ) : (
              <div
                style={{
                  width: `${profile.photoSize || 108}px`,
                  height: `${profile.photoSize || 108}px`,
                }}
                className={`bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white ${getPhotoShapeClass()} ${
                  profile.photoBorder ? 'ring-4 ring-rose-500/30' : ''
                }`}
              >
                {profile.nickname ? profile.nickname.charAt(0).toUpperCase() : 'B'}
              </div>
            )}

            {/* Online Status Dot */}
            {profile.onlineStatus && (
              <span
                className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full shadow-md"
                title="Active Now"
              />
            )}
          </div>

          {/* Nickname & Badges */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {profile.nickname || profile.displayName}
            </h1>
            {profile.verificationBadge && (
              <span title="Verified Creator">
                <CheckCircle2
                  className="w-5 h-5 text-sky-400 fill-sky-400/20"
                  aria-label="Verified"
                />
              </span>
            )}
            {profile.creatorBadge && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-rose-500/20 to-violet-500/20 text-rose-300 border border-rose-500/30">
                <Sparkles className="w-2.5 h-2.5 text-rose-400" />
                CREATOR
              </span>
            )}
          </div>

          {/* Username */}
          {profile.username && (
            <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-0.5">
              @{profile.username.replace(/^@/, '')}
            </p>
          )}

          {/* Custom Status */}
          {profile.customStatus && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{profile.customStatus}</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs sm:text-sm text-zinc-300 mt-3 max-w-md leading-relaxed whitespace-pre-line px-2 font-normal">
              {profile.bio}
            </p>
          )}

          {/* Location */}
          {profile.location && (
            <div className="flex items-center gap-1 text-xs text-zinc-400 mt-2.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Social Links Bar */}
          {profile.socialLinks && profile.socialLinks.filter((s) => s.enabled).length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-2.5 mt-4 pt-1">
              {profile.socialLinks
                .filter((s) => s.enabled)
                .sort((a, b) => a.order - b.order)
                .map((social) => {
                  const Icon = getIconComponent(
                    social.platform === 'x'
                      ? 'Twitter'
                      : social.platform === 'email'
                      ? 'Mail'
                      : social.platform === 'whatsapp'
                      ? 'MessageSquare'
                      : social.platform === 'telegram'
                      ? 'Send'
                      : social.platform.charAt(0).toUpperCase() + social.platform.slice(1)
                  );
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 shadow-md hover:scale-110 transition-all duration-200"
                      title={social.label || social.platform}
                      aria-label={social.label || social.platform}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
            </div>
          )}
        </header>

        {/* Search Bar (if enabled) */}
        {settings.allowSearch && (
          <div className="w-full mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search links, videos, presets, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                }}
                className="w-full bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 focus:border-rose-500/80 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 outline-none shadow-sm transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick search tags or history when empty */}
            {!searchQuery && searchHistory.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar text-[11px] text-zinc-400">
                <span className="text-[10px] text-zinc-500 shrink-0">Recent:</span>
                {searchHistory.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSearchQuery(q)}
                    className="px-2 py-0.5 rounded-md bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="w-full mb-5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800'
              }`}
            >
              <span>All ({links.length})</span>
            </button>
            {categories.map((cat) => {
              const count = categoryCounts.get(cat.id) || 0;
              const IconComp = getIconComponent(cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedCategory === cat.id ? 'bg-black/20 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Featured Section */}
        {featuredLinks.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center gap-1.5 mb-2.5 px-1 text-rose-400">
              <Star className="w-4 h-4 fill-rose-500 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">Featured Links</h3>
            </div>
            <div className="flex flex-col gap-3">
              {featuredLinks.map((link) => (
                <PublicLinkCard
                  key={link.id}
                  link={link}
                  defaultButtonStyle={appearance.defaultButtonStyle}
                  animationsEnabled={appearance.animationsEnabled}
                  onLinkClick={(l) => onTrackClick(l.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Virtualized Links List */}
        <section className="w-full">
          <VirtualLinkList
            links={filteredLinks}
            defaultButtonStyle={appearance.defaultButtonStyle}
            animationsEnabled={appearance.animationsEnabled}
            onLinkClick={(l) => onTrackClick(l.id)}
            layoutMode={appearance.linkLayout}
          />
        </section>

        {/* Public Stats (if enabled) */}
        {publicStats && (
          <div className="w-full mt-8 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs flex items-center justify-around text-center">
            <div>
              <p className="text-base font-bold text-white">{publicStats.totalLinks}</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Resources</p>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <p className="text-base font-bold text-white">{publicStats.totalClicks.toLocaleString()}+</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Clicks</p>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <p className="text-base font-bold text-white">{publicStats.totalVisitors.toLocaleString()}+</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Visitors</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="w-full mt-10 pt-6 pb-12 border-t border-zinc-800/60 flex flex-col items-center text-center gap-3">
          <p className="text-xs text-zinc-500 font-medium">
            © {new Date().getFullYear()} {profile.nickname || profile.displayName}. All rights reserved.
          </p>

          {/* CRITICAL ADMIN PANEL BUTTON INSIDE WEBSITE & REAL-TIME SYNC STATUS */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onOpenAdminAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 shadow-md transition-all text-xs font-semibold group cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Admin Panel • Manage Website</span>
            </button>
            <SyncStatusIndicator compact />
          </div>
        </footer>
      </main>

      {/* Modals */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={currentUrl}
        title={profile.displayName}
      />
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        url={currentUrl}
        title={profile.displayName}
        description={profile.bio}
      />
    </div>
  );
};
