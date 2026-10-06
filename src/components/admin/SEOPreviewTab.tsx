import React, { useState } from 'react';
import { Settings, Profile } from '../../types';
import {
  Globe,
  Share2,
  Twitter,
  Instagram,
  Search,
  Check,
  Copy,
  ExternalLink,
  Info,
  Sparkles,
  Smartphone,
  Laptop,
  Image as ImageIcon,
  MessageCircle,
} from 'lucide-react';

interface Props {
  settings: Settings;
  profile: Profile;
  onUpdateSettings: (settings: Settings) => Promise<void>;
}

export const SEOPreviewTab: React.FC<Props> = ({
  settings,
  profile,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<Settings>({
    ...settings,
    metaTitle: settings.metaTitle || profile.websiteTitle || `${profile.displayName} | Official Bio Link`,
    metaDescription:
      settings.metaDescription ||
      profile.shortDescription ||
      profile.bio ||
      `Explore links, videos, presets, and creative resources curated by ${profile.nickname || profile.displayName}.`,
    ogImageUrl: settings.ogImageUrl || profile.photoUrl || '',
    twitterCardType: settings.twitterCardType || 'summary_large_image',
    canonicalUrl:
      settings.canonicalUrl ||
      (typeof window !== 'undefined' ? window.location.origin : 'https://biolink.app'),
  });

  const [activePlatform, setActivePlatform] = useState<
    'twitter' | 'instagram' | 'google' | 'whatsapp'
  >('twitter');
  const [googleDevice, setGoogleDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [copiedMeta, setCopiedMeta] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const displayTitle = formData.metaTitle || `${profile.displayName} | Official Bio Link`;
  const displayDescription =
    formData.metaDescription ||
    profile.shortDescription ||
    profile.bio ||
    `Explore links, videos, presets, and creative resources curated by ${profile.nickname || profile.displayName}.`;
  const displayImage = formData.ogImageUrl || profile.photoUrl;
  const currentDomain =
    typeof window !== 'undefined'
      ? window.location.hostname
      : 'biolink.app';
  const fullUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/@${profile.username || 'creator'}`
      : `https://biolink.app/@${profile.username || 'creator'}`;

  // Character limit assessments
  const titleLen = displayTitle.length;
  const isTitleOptimal = titleLen >= 30 && titleLen <= 60;
  const descLen = displayDescription.length;
  const isDescOptimal = descLen >= 120 && descLen <= 160;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const generatedHtmlSnippet = `<!-- Primary Meta Tags -->
<title>${displayTitle}</title>
<meta name="title" content="${displayTitle}" />
<meta name="description" content="${displayDescription}" />

<!-- Open Graph / Facebook / Instagram / WhatsApp -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${fullUrl}" />
<meta property="og:title" content="${displayTitle}" />
<meta property="og:description" content="${displayDescription}" />
<meta property="og:image" content="${displayImage}" />
<meta property="og:site_name" content="${profile.nickname || profile.displayName}" />

<!-- Twitter / X -->
<meta property="twitter:card" content="${formData.twitterCardType || 'summary_large_image'}" />
<meta property="twitter:url" content="${fullUrl}" />
<meta property="twitter:title" content="${displayTitle}" />
<meta property="twitter:description" content="${displayDescription}" />
<meta property="twitter:image" content="${displayImage}" />`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(generatedHtmlSnippet);
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-rose-500" />
            <span>SEO & Social Share Preview</span>
          </h2>
          <p className="text-xs text-zinc-400">
            See exactly how your Instagram bio link card looks when shared on Twitter/X, Instagram, WhatsApp, and Google search.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save SEO Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Platform Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActivePlatform('twitter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activePlatform === 'twitter'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Twitter className="w-4 h-4 text-sky-400" />
          <span>Twitter / X Card</span>
        </button>

        <button
          onClick={() => setActivePlatform('instagram')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activePlatform === 'instagram'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Instagram className="w-4 h-4 text-pink-400" />
          <span>Instagram DM & Stories</span>
        </button>

        <button
          onClick={() => setActivePlatform('whatsapp')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activePlatform === 'whatsapp'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp / iMessage</span>
        </button>

        <button
          onClick={() => setActivePlatform('google')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
            activePlatform === 'google'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Search className="w-4 h-4 text-amber-400" />
          <span>Google Search Snippet</span>
        </button>
      </div>

      {/* PREVIEW CANVAS */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800/80 shadow-xl flex flex-col items-center justify-center min-h-[320px]">
        {/* ================= 1. TWITTER / X CARD PREVIEW ================= */}
        {activePlatform === 'twitter' && (
          <div className="w-full max-w-md rounded-2xl bg-[#000000] border border-zinc-800 overflow-hidden shadow-2xl font-sans text-left transition-all">
            {/* Tweet Header Sim */}
            <div className="p-3.5 flex items-center gap-2.5 border-b border-zinc-900">
              <img
                src={profile.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="text-xs font-bold text-white truncate">
                    {profile.nickname || profile.displayName}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono truncate">
                    @{profile.username || 'creator'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Check out my new links & resources hub 👇
                </p>
              </div>
            </div>

            {/* Large Card Media */}
            <div className="relative aspect-[1.91/1] w-full bg-zinc-900 overflow-hidden">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">No Share Image Defined</span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/75 text-[10px] text-white font-mono">
                {currentDomain}
              </span>
            </div>

            {/* Card Content */}
            <div className="p-3.5 bg-zinc-950 space-y-1">
              <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider truncate">
                {currentDomain}
              </p>
              <h4 className="text-sm font-bold text-white line-clamp-1 leading-snug">
                {displayTitle}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {displayDescription}
              </p>
            </div>
          </div>
        )}

        {/* ================= 2. INSTAGRAM DIRECT PREVIEW ================= */}
        {activePlatform === 'instagram' && (
          <div className="w-full max-w-sm rounded-3xl bg-[#121212] border border-zinc-800 p-4 shadow-2xl text-left">
            <div className="flex items-center gap-2 mb-3 px-1 text-zinc-400 text-xs">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span className="font-semibold">Instagram Direct Message Preview</span>
            </div>

            {/* Instagram Link Bubble */}
            <div className="rounded-2xl bg-zinc-800/90 border border-zinc-700/60 overflow-hidden shadow-lg">
              <div className="aspect-[1.91/1] w-full bg-zinc-900 relative">
                {displayImage ? (
                  <img src={displayImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                    Link Image
                  </div>
                )}
              </div>
              <div className="p-3 bg-zinc-900/90">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block mb-0.5">
                  {currentDomain}
                </span>
                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {displayTitle}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {displayDescription}
                </p>
              </div>
            </div>

            {/* Send link input bar */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="truncate">{fullUrl}</span>
              <span className="text-pink-400 font-semibold shrink-0 ml-2">Sent</span>
            </div>
          </div>
        )}

        {/* ================= 3. WHATSAPP / IMESSAGE PREVIEW ================= */}
        {activePlatform === 'whatsapp' && (
          <div className="w-full max-w-md rounded-2xl bg-[#0b141a] border border-zinc-800 p-4 shadow-2xl text-left">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-semibold">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp / iMessage Link Card</span>
            </div>

            <div className="rounded-xl bg-[#202c33] border border-zinc-700/40 p-2.5 max-w-sm ml-auto space-y-2">
              <div className="rounded-lg overflow-hidden aspect-[1.91/1] bg-black/40">
                {displayImage ? (
                  <img src={displayImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                    Image Banner
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{displayTitle}</h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                  {displayDescription}
                </p>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  {currentDomain}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono text-right pt-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. GOOGLE SEARCH RESULT SNIPPET ================= */}
        {activePlatform === 'google' && (
          <div className="w-full max-w-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                Google SERP Snippet Preview
              </span>
              <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 text-xs">
                <button
                  onClick={() => setGoogleDevice('mobile')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                    googleDevice === 'mobile'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
                <button
                  onClick={() => setGoogleDevice('desktop')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                    googleDevice === 'desktop'
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Laptop className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#202124] border border-zinc-700/60 text-left font-sans shadow-lg">
              {/* Site source header */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {profile.nickname ? profile.nickname.charAt(0) : 'B'}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] text-[#bdc1c6] leading-none truncate font-normal">
                    {profile.nickname || profile.displayName}
                  </p>
                  <p className="text-[11px] text-[#9aa0a6] leading-none truncate font-mono mt-0.5">
                    https://{currentDomain} › @{profile.username || 'creator'}
                  </p>
                </div>
              </div>

              {/* Title link */}
              <h3 className="text-[#8ab4f8] hover:underline cursor-pointer text-base sm:text-lg font-medium leading-snug line-clamp-2">
                {displayTitle}
              </h3>

              {/* Snippet Description */}
              <p className="text-[13px] text-[#bdc1c6] mt-1 line-clamp-2 leading-relaxed">
                {displayDescription}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EDITABLE SEO FIELDS FORM */}
      <form onSubmit={handleSave} className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Customize Social & Search Metadata</span>
          </h3>
          <span className="text-[11px] text-zinc-500">Live synchronized</span>
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">
              Meta Title / Social Share Title
            </label>
            <span
              className={`text-[10px] font-mono ${
                isTitleOptimal
                  ? 'text-emerald-400'
                  : titleLen > 60
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {titleLen}/60 chars ({isTitleOptimal ? 'Optimal' : titleLen < 30 ? 'Short' : 'Long'})
            </span>
          </div>
          <input
            type="text"
            value={formData.metaTitle || ''}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            placeholder="e.g. Alex Vance | Visual Storyteller & Bio Link"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white outline-none focus:border-rose-500"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">
              Meta Description / Summary
            </label>
            <span
              className={`text-[10px] font-mono ${
                isDescOptimal
                  ? 'text-emerald-400'
                  : descLen > 160
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {descLen}/160 chars ({isDescOptimal ? 'Optimal' : descLen < 120 ? 'Short' : 'Long'})
            </span>
          </div>
          <textarea
            rows={3}
            value={formData.metaDescription || ''}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            placeholder="Summarize your brand, key resources, and what visitors will find when they tap your link."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-white outline-none focus:border-rose-500 leading-relaxed"
          />
        </div>

        {/* Social Image (OG Image) & Twitter Card Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Social Share Image URL (OG Image)
            </label>
            <input
              type="url"
              value={formData.ogImageUrl || ''}
              onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
              placeholder="https://... (1200x630px recommended)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Twitter Card Type
            </label>
            <select
              value={formData.twitterCardType || 'summary_large_image'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  twitterCardType: e.target.value as 'summary' | 'summary_large_image',
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            >
              <option value="summary_large_image">Large Image Card</option>
              <option value="summary">Compact Summary Card</option>
            </select>
          </div>
        </div>

        {/* Canonical URL */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Canonical Website URL
          </label>
          <input
            type="url"
            value={formData.canonicalUrl || ''}
            onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
            placeholder="https://mywebsite.com"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500 font-mono"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Apply & Save Metadata'}
          </button>
        </div>
      </form>

      {/* HTML Tag Exporter */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-400" />
            <span>Generated HTML &lt;head&gt; Meta Tags</span>
          </h3>
          <button
            type="button"
            onClick={handleCopySnippet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
          >
            {copiedMeta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedMeta ? 'Copied' : 'Copy HTML Tags'}</span>
          </button>
        </div>
        <pre className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-mono overflow-x-auto leading-relaxed">
          {generatedHtmlSnippet}
        </pre>
      </div>
    </div>
  );
};
