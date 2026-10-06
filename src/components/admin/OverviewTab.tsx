import React from 'react';
import { AdminHubData } from '../../types';
import {
  Link as LinkIcon,
  MousePointerClick,
  Users,
  Instagram,
  Flame,
  PlusCircle,
  Upload,
  Download,
  Palette,
  User,
  Shield,
  Trash2,
  FolderTree,
  Calendar,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface Props {
  data: AdminHubData;
  onNavigateTab: (tab: string) => void;
  onOpenAddLink: () => void;
}

export const OverviewTab: React.FC<Props> = ({ data, onNavigateTab, onOpenAddLink }) => {
  const { links, categories, trashCount, analytics } = data;
  const activeLinks = links.filter((l) => !l.deletedAt && l.status === 'active');
  const hiddenLinks = links.filter((l) => !l.deletedAt && l.status === 'hidden');
  const scheduledLinks = links.filter((l) => !l.deletedAt && l.status === 'scheduled');

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0) + (analytics.statsSummary?.totalClicksEstimate || 0);
  const totalVisitors = analytics.visitors.length + (analytics.statsSummary?.totalVisitorsEstimate || 0);

  const instagramVisitorsCount =
    analytics.visitors.filter((v) => v.isInstagram).length + (analytics.statsSummary?.instagramVisitorsEstimate || 0);
  const directVisitorsCount =
    analytics.visitors.filter((v) => v.isDirect).length + (analytics.statsSummary?.directVisitorsEstimate || 0);
  const otherVisitorsCount =
    analytics.visitors.filter((v) => v.isOther).length + (analytics.statsSummary?.otherVisitorsEstimate || 0);

  const instagramPercentage = totalVisitors > 0 ? Math.round((instagramVisitorsCount / totalVisitors) * 100) : 0;
  const directPercentage = totalVisitors > 0 ? Math.round((directVisitorsCount / totalVisitors) * 100) : 0;
  const otherPercentage = Math.max(0, 100 - instagramPercentage - directPercentage);

  // Top 5 links
  const topLinks = [...links]
    .filter((l) => !l.deletedAt)
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  const maxClick = topLinks[0]?.clicks || 1;

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Overview Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-rose-950/40 via-zinc-900 to-violet-950/40 border border-zinc-800 shadow-xl">
        <div>
          <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">Live Hub Overview</span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            {data.profile.nickname || data.profile.displayName}&apos;s Bio Hub
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Instagram traffic optimization and resource distribution active.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Link</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Links */}
        <div
          onClick={() => onNavigateTab('links')}
          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Active Links</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <LinkIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{activeLinks.length}</div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {hiddenLinks.length} hidden • {scheduledLinks.length} scheduled
          </p>
        </div>

        {/* Total Clicks */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Clicks</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalClicks.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>High conversion rate</span>
          </p>
        </div>

        {/* Visitors */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Visitors</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalVisitors.toLocaleString()}</div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Across mobile & desktop
          </p>
        </div>

        {/* Instagram Bio Traffic */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Instagram Bio %</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
              <Instagram className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{instagramPercentage}%</div>
          <p className="text-[11px] text-pink-300 mt-1">
            {instagramVisitorsCount.toLocaleString()} IG visitors detected
          </p>
        </div>
      </div>

      {/* Traffic Attribution Breakdown Bar */}
      <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Traffic Source Attribution (Instagram vs Direct vs Others)
          </h3>
          <span className="text-[11px] text-zinc-500">Based on UTM & referrers</span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden flex mb-3">
          <div
            style={{ width: `${instagramPercentage}%` }}
            className="bg-gradient-to-r from-pink-500 to-rose-500 h-full"
            title={`Instagram Traffic: ${instagramPercentage}%`}
          />
          <div
            style={{ width: `${directPercentage}%` }}
            className="bg-blue-500 h-full"
            title={`Direct Traffic: ${directPercentage}%`}
          />
          <div
            style={{ width: `${otherPercentage}%` }}
            className="bg-zinc-700 h-full"
            title={`Other Traffic: ${otherPercentage}%`}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/40">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500 mr-1.5" />
            <span className="text-zinc-400 font-medium">Instagram: </span>
            <strong className="text-white">{instagramPercentage}%</strong>
          </div>
          <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/40">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
            <span className="text-zinc-400 font-medium">Direct: </span>
            <strong className="text-white">{directPercentage}%</strong>
          </div>
          <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/40">
            <span className="inline-block w-2 h-2 rounded-full bg-zinc-600 mr-1.5" />
            <span className="text-zinc-400 font-medium">Other: </span>
            <strong className="text-white">{otherPercentage}%</strong>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={onOpenAddLink}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">+ Add Link</p>
              <p className="text-[10px] text-zinc-500">Create new resource</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('categories')}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">+ Category</p>
              <p className="text-[10px] text-zinc-500">{categories.length} organized</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Edit Profile</p>
              <p className="text-[10px] text-zinc-500">Bio & social accounts</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('appearance')}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Appearance</p>
              <p className="text-[10px] text-zinc-500">Themes & styling</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('seo-preview')}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">SEO & Social</p>
              <p className="text-[10px] text-zinc-500">Twitter & IG preview</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('import-export')}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Import CSV/JSON</p>
              <p className="text-[10px] text-zinc-500">Bulk upload links</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('backup')}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Backup Data</p>
              <p className="text-[10px] text-zinc-500">Instant export</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('security')}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Security</p>
              <p className="text-[10px] text-zinc-500">Password & timeouts</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('trash')}
            className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-3 text-left transition group cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-zinc-700/40 text-zinc-400 group-hover:scale-110 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Recycle Bin</p>
              <p className="text-[10px] text-zinc-500">{trashCount} in trash</p>
            </div>
          </button>
        </div>
      </div>

      {/* Top Performing Links Table */}
      <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Performing Links</h3>
          </div>
          <button
            onClick={() => onNavigateTab('links')}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            Manage All Links →
          </button>
        </div>

        <div className="space-y-3">
          {topLinks.map((link, idx) => {
            const percentage = Math.round(((link.clicks || 0) / maxClick) * 100);
            return (
              <div
                key={link.id}
                className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-5 text-center text-xs font-bold text-zinc-500">#{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-200 truncate">{link.title}</p>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">{link.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:w-48 shrink-0">
                  <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="bg-rose-500 h-full rounded-full"
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-14 text-right">
                    {(link.clicks || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
