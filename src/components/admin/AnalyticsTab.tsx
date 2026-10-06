import React, { useState, useMemo } from 'react';
import { AnalyticsData, LinkItem } from '../../types';
import {
  MousePointerClick,
  Users,
  Instagram,
  Smartphone,
  Monitor,
  Globe,
  Clock,
  Flame,
  TrendingDown,
  BarChart3,
  Calendar,
} from 'lucide-react';

interface Props {
  analytics: AnalyticsData;
  links: LinkItem[];
}

export const AnalyticsTab: React.FC<Props> = ({ analytics, links }) => {
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d' | 'today'>('all');

  const now = Date.now();
  const timeThreshold = useMemo(() => {
    if (timeRange === 'today') return now - 24 * 3600 * 1000;
    if (timeRange === '7d') return now - 7 * 24 * 3600 * 1000;
    if (timeRange === '30d') return now - 30 * 24 * 3600 * 1000;
    return 0;
  }, [timeRange, now]);

  // Filter visitors & clicks by time range
  const filteredVisitors = useMemo(() => {
    if (timeRange === 'all') return analytics.visitors;
    return analytics.visitors.filter((v) => new Date(v.timestamp).getTime() >= timeThreshold);
  }, [analytics.visitors, timeRange, timeThreshold]);

  const filteredClicks = useMemo(() => {
    if (timeRange === 'all') return analytics.clicks;
    return analytics.clicks.filter((c) => new Date(c.timestamp).getTime() >= timeThreshold);
  }, [analytics.clicks, timeRange, timeThreshold]);

  // Aggregate totals
  const totalVisitorsCount =
    filteredVisitors.length +
    (timeRange === 'all' ? analytics.statsSummary?.totalVisitorsEstimate || 0 : 0);
  const totalClicksCount =
    links.reduce((acc, l) => acc + (l.clicks || 0), 0) +
    (timeRange === 'all' ? analytics.statsSummary?.totalClicksEstimate || 0 : 0);

  const ctrPercentage =
    totalVisitorsCount > 0
      ? Math.min(100, Math.round((totalClicksCount / totalVisitorsCount) * 100))
      : 0;

  // Instagram vs Direct vs Other
  const instagramVisitors =
    filteredVisitors.filter((v) => v.isInstagram).length +
    (timeRange === 'all' ? analytics.statsSummary?.instagramVisitorsEstimate || 0 : 0);
  const directVisitors =
    filteredVisitors.filter((v) => v.isDirect).length +
    (timeRange === 'all' ? analytics.statsSummary?.directVisitorsEstimate || 0 : 0);
  const otherVisitors =
    filteredVisitors.filter((v) => v.isOther).length +
    (timeRange === 'all' ? analytics.statsSummary?.otherVisitorsEstimate || 0 : 0);

  const instagramPercent =
    totalVisitorsCount > 0 ? Math.round((instagramVisitors / totalVisitorsCount) * 100) : 0;
  const directPercent =
    totalVisitorsCount > 0 ? Math.round((directVisitors / totalVisitorsCount) * 100) : 0;
  const otherPercent = Math.max(0, 100 - instagramPercent - directPercent);

  // Device breakdown
  const mobileCount = filteredVisitors.filter((v) => v.device === 'Mobile').length;
  const desktopCount = filteredVisitors.filter((v) => v.device === 'Desktop').length;
  const tabletCount = filteredVisitors.filter((v) => v.device === 'Tablet').length;
  const totalDeviceSample = Math.max(1, mobileCount + desktopCount + tabletCount);

  // Top clicked links
  const sortedLinks = useMemo(() => {
    return [...links]
      .filter((l) => !l.deletedAt)
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  }, [links]);

  const top10Links = sortedLinks.slice(0, 10);
  const leastClickedLinks = [...sortedLinks].reverse().slice(0, 5);
  const maxLinkClicks = top10Links[0]?.clicks || 1;

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Traffic & Conversion Analytics</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Real visitor tracking, Instagram bio attribution, device split, and click metrics.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1 self-start sm:self-auto">
          {(['all', '30d', '7d', 'today'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                timeRange === range
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {range === 'all'
                ? 'All Time'
                : range === '30d'
                ? 'Last 30 Days'
                : range === '7d'
                ? 'Last 7 Days'
                : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Visitors</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalVisitorsCount.toLocaleString()}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Unique page visits</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Total Link Clicks</span>
            <MousePointerClick className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalClicksCount.toLocaleString()}</div>
          <p className="text-[11px] text-zinc-500 mt-1">External link opens</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Click-Through Rate (CTR)</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{ctrPercentage}%</div>
          <p className="text-[11px] text-zinc-500 mt-1">Clicks per visitor ratio</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">Instagram Share</span>
            <Instagram className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-pink-400">{instagramPercent}%</div>
          <p className="text-[11px] text-zinc-500 mt-1">UTM & IG referrers</p>
        </div>
      </div>

      {/* Traffic Sources Attribution (Instagram vs Direct vs Others) */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            <span>Traffic Attribution (Instagram vs Direct vs Others)</span>
          </h3>
          <span className="text-[11px] text-zinc-500">Separated via referrers and UTM source</span>
        </div>

        <div className="w-full h-4 rounded-full bg-zinc-950 overflow-hidden flex">
          <div
            style={{ width: `${instagramPercent}%` }}
            className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all"
            title={`Instagram: ${instagramPercent}%`}
          />
          <div
            style={{ width: `${directPercent}%` }}
            className="bg-blue-500 h-full transition-all"
            title={`Direct: ${directPercent}%`}
          />
          <div
            style={{ width: `${otherPercent}%` }}
            className="bg-zinc-700 h-full transition-all"
            title={`Other: ${otherPercent}%`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs font-semibold text-zinc-200">Instagram Bio</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">{instagramVisitors.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500 ml-1.5 font-mono">({instagramPercent}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-zinc-200">Direct / Bookmarks</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">{directVisitors.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500 ml-1.5 font-mono">({directPercent}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zinc-600" />
              <span className="text-xs font-semibold text-zinc-200">Other Referrals</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">{otherVisitors.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500 ml-1.5 font-mono">({otherPercent}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device & Browser Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Device breakdown */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Device Breakdown</span>
          </h3>
          <div className="space-y-2.5 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300">Mobile Phones</span>
                <span className="font-bold text-white">
                  {Math.round((mobileCount / totalDeviceSample) * 100)}%
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(mobileCount / totalDeviceSample) * 100}%` }}
                  className="bg-rose-500 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300">Desktop Computers</span>
                <span className="font-bold text-white">
                  {Math.round((desktopCount / totalDeviceSample) * 100)}%
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(desktopCount / totalDeviceSample) * 100}%` }}
                  className="bg-blue-500 h-full rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300">Tablets</span>
                <span className="font-bold text-white">
                  {Math.round((tabletCount / totalDeviceSample) * 100)}%
                </span>
              </div>
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(tabletCount / totalDeviceSample) * 100}%` }}
                  className="bg-violet-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Least clicked links info */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            <span>Opportunities (Lowest Clicks)</span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            Consider pinning these links, updating their titles, or adding an emoji badge.
          </p>
          <div className="space-y-2 pt-1">
            {leastClickedLinks.map((link) => (
              <div
                key={link.id}
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <span className="truncate flex-1 pr-2 text-zinc-300">{link.title}</span>
                <span className="font-mono text-zinc-500 shrink-0">{link.clicks || 0} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Most Clicked Links Detailed Table */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <Flame className="w-4 h-4" />
          <span>Top 10 Most Clicked Links (All-Time Leaderboard)</span>
        </h3>

        <div className="space-y-3">
          {top10Links.map((link, idx) => {
            const barWidth = Math.round(((link.clicks || 0) / maxLinkClicks) * 100);
            return (
              <div
                key={link.id}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-xs font-bold text-zinc-500 w-5">#{idx + 1}</span>
                    <p className="text-xs font-bold text-white truncate">{link.title}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {(link.clicks || 0).toLocaleString()} clicks
                  </span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className="bg-gradient-to-r from-rose-500 to-violet-500 h-full rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Click Timestamps Activity Stream */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Recent Click Activity Logs</span>
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filteredClicks.slice(0, 15).map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="font-semibold text-zinc-200 truncate">{c.linkTitle}</p>
                <span className="text-[10px] text-zinc-500">
                  {c.isInstagram ? 'Instagram Bio' : c.referrer ? 'External Referrer' : 'Direct'}{' '}
                  • {c.device}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {filteredClicks.length === 0 && (
            <p className="text-xs text-zinc-500 text-center py-4">No recent clicks in this period.</p>
          )}
        </div>
      </div>
    </div>
  );
};
