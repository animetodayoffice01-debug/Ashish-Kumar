import React, { useState, useMemo, useEffect } from 'react';
import { LinkItem, Category, Tag, ButtonStyle } from '../../types';
import { getIconComponent } from '../../lib/icons';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Copy,
  ExternalLink,
  Edit,
  Eye,
  EyeOff,
  MoreVertical,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Star,
  Sparkles,
  Tag as TagIcon,
  Check,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface Props {
  links: LinkItem[];
  categories: Category[];
  tags: Tag[];
  defaultButtonStyle: ButtonStyle;
  onAddLink: () => void;
  onEditLink: (link: LinkItem) => void;
  onDuplicateLink: (link: LinkItem) => void;
  onDeleteLink: (id: string) => void;
  onToggleStatus: (link: LinkItem) => void;
  onReorder: (orders: { id: string; order: number }[]) => void;
  onBulkAction: (action: string, linkIds: string[], payload?: any) => Promise<void>;
}

export const LinksTab: React.FC<Props> = ({
  links,
  categories,
  tags,
  defaultButtonStyle,
  onAddLink,
  onEditLink,
  onDuplicateLink,
  onDeleteLink,
  onToggleStatus,
  onReorder,
  onBulkAction,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState<
    'order' | 'newest' | 'oldest' | 'title' | 'clicks_desc' | 'clicks_asc'
  >('order');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkTag, setBulkTag] = useState('');
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Pagination for 1,000+ links
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Filter and sort links
  const filteredAndSorted = useMemo(() => {
    let list = links.filter((l) => !l.deletedAt);

    if (categoryFilter !== 'all') {
      list = list.filter((l) => l.categoryId === categoryFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'featured') {
        list = list.filter((l) => l.featured);
      } else if (statusFilter === 'pinned') {
        list = list.filter((l) => l.pinned);
      } else {
        list = list.filter((l) => l.status === statusFilter);
      }
    }

    if (tagFilter !== 'all') {
      list = list.filter((l) => l.tags && l.tags.includes(tagFilter));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((l) => {
        return (
          l.title?.toLowerCase().includes(q) ||
          l.url?.toLowerCase().includes(q) ||
          l.nickname?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.tags?.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'order') {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (b.linkPriority !== a.linkPriority) return (b.linkPriority || 0) - (a.linkPriority || 0);
        return (a.order || 0) - (b.order || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'clicks_desc') {
        return (b.clicks || 0) - (a.clicks || 0);
      }
      if (sortBy === 'clicks_asc') {
        return (a.clicks || 0) - (b.clicks || 0);
      }
      return 0;
    });

    return list;
  }, [links, categoryFilter, statusFilter, tagFilter, search, sortBy]);

  // Sliced page for rendering performance
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const currentPageLinks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, page, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, tagFilter, sortBy]);

  // Bulk selections
  const handleSelectAll = () => {
    if (selectedIds.length === filteredAndSorted.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSorted.map((l) => l.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopyUrl = (link: LinkItem) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reordering helpers
  const handleMove = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const items = [...filteredAndSorted];
    if (index < 0 || index >= items.length) return;

    const [moved] = items.splice(index, 1);
    if (direction === 'up' && index > 0) {
      items.splice(index - 1, 0, moved);
    } else if (direction === 'down' && index < items.length) {
      items.splice(index + 1, 0, moved);
    } else if (direction === 'top') {
      items.unshift(moved);
    } else if (direction === 'bottom') {
      items.push(moved);
    }

    const orders = items.map((item, idx) => ({ id: item.id, order: idx + 1 }));
    onReorder(orders);
  };

  const executeBulk = async (action: string, payload?: any) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete') {
      if (!window.confirm(`Move ${selectedIds.length} selected links to Recycle Bin?`)) return;
    }
    setIsBulkOperating(true);
    try {
      await onBulkAction(action, selectedIds, payload);
      if (action === 'delete') {
        setSelectedIds([]);
      }
    } finally {
      setIsBulkOperating(false);
    }
  };

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  return (
    <div className="space-y-4">
      {/* Top Controls: Add Button & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Link Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
              {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'link' : 'links'}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Drag, prioritize, schedule, and style your bio links.
          </p>
        </div>

        <button
          onClick={onAddLink}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Link</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search title, URL, description, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-rose-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-rose-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="hidden">Hidden Only</option>
              <option value="draft">Drafts Only</option>
              <option value="scheduled">Scheduled Only</option>
              <option value="featured">Featured Only</option>
              <option value="pinned">Pinned Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-rose-500"
            >
              <option value="order">Custom Order / Priority</option>
              <option value="clicks_desc">Most Clicked First</option>
              <option value="clicks_asc">Least Clicked First</option>
              <option value="newest">Newest Created</option>
              <option value="oldest">Oldest Created</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Tag pills filter */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-[11px] text-zinc-500 shrink-0">Tags:</span>
            <button
              onClick={() => setTagFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] border shrink-0 transition ${
                tagFilter === 'all'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => setTagFilter(tagFilter === t.name ? 'all' : t.name)}
                className={`px-2 py-0.5 rounded-md text-[11px] border shrink-0 transition ${
                  tagFilter === t.name
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                #{t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Operations Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex flex-wrap items-center justify-between gap-2.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-200">
            <CheckSquare className="w-4 h-4 text-rose-400" />
            <span>{selectedIds.length} selected</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] text-zinc-400 hover:text-white underline ml-1"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => executeBulk('enable')}
              disabled={isBulkOperating}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
            >
              Enable
            </button>
            <button
              onClick={() => executeBulk('disable')}
              disabled={isBulkOperating}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
            >
              Hide
            </button>
            <button
              onClick={() => executeBulk('duplicate')}
              disabled={isBulkOperating}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
            >
              Duplicate
            </button>

            {/* Change category */}
            <select
              value={bulkCategory}
              onChange={(e) => {
                const val = e.target.value;
                setBulkCategory(val);
                if (val) executeBulk('change-category', { categoryId: val });
              }}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-2 py-1 text-xs outline-none"
            >
              <option value="">Move Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => executeBulk('delete')}
              disabled={isBulkOperating}
              className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Select All Toggle Header */}
      <div className="flex items-center justify-between px-2 text-xs text-zinc-400">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 hover:text-white transition cursor-pointer"
        >
          {selectedIds.length === filteredAndSorted.length && filteredAndSorted.length > 0 ? (
            <CheckSquare className="w-4 h-4 text-rose-500" />
          ) : (
            <Square className="w-4 h-4 text-zinc-600" />
          )}
          <span>Select All on this Filter ({filteredAndSorted.length})</span>
        </button>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded bg-zinc-800 disabled:opacity-40 text-xs"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded bg-zinc-800 disabled:opacity-40 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Links List Cards */}
      <div className="space-y-2.5">
        {currentPageLinks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-zinc-500 text-xs">
            No links match the search or filter criteria.
          </div>
        ) : (
          currentPageLinks.map((link, idx) => {
            const isSelected = selectedIds.includes(link.id);
            const globalIndex = (page - 1) * pageSize + idx;
            const IconComp = getIconComponent(link.icon);

            return (
              <div
                key={link.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700/80'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                {/* Left Section: Checkbox, Thumbnail/Icon, Title & URL */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Select Checkbox */}
                  <button
                    onClick={() => handleToggleSelect(link.id)}
                    className="p-1 text-zinc-500 hover:text-white shrink-0 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600" />
                    )}
                  </button>

                  {/* Thumbnail / Icon */}
                  <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                    {link.thumbnailUrl ? (
                      <img src={link.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : link.emoji ? (
                      <span className="text-xl">{link.emoji}</span>
                    ) : (
                      <IconComp className="w-4 h-4 text-zinc-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {link.pinned && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          PINNED
                        </span>
                      )}
                      {link.featured && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          FEATURED
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                          link.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : link.status === 'hidden'
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {link.status}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {categoryMap.get(link.categoryId) || 'General'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate mt-0.5">
                      {link.title}
                    </h4>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 font-mono truncate">
                      <span className="truncate">{link.url}</span>
                      <span className="shrink-0 font-sans text-[10px] text-zinc-400">
                        • {link.clicks || 0} clicks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section: Ordering and Action buttons */}
                <div className="flex items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  {/* Reordering Controls */}
                  <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800/80 mr-1">
                    <button
                      onClick={() => handleMove(globalIndex, 'top')}
                      disabled={globalIndex === 0}
                      title="Move to Top"
                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
                    >
                      <ChevronsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(globalIndex, 'up')}
                      disabled={globalIndex === 0}
                      title="Move Up"
                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(globalIndex, 'down')}
                      disabled={globalIndex === filteredAndSorted.length - 1}
                      title="Move Down"
                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(globalIndex, 'bottom')}
                      disabled={globalIndex === filteredAndSorted.length - 1}
                      title="Move to Bottom"
                      className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
                    >
                      <ChevronsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Visibility */}
                  <button
                    onClick={() => onToggleStatus(link)}
                    title={link.status === 'active' ? 'Hide Link' : 'Show Link'}
                    className={`p-1.5 rounded-lg border text-xs transition ${
                      link.status === 'active'
                        ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                        : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {link.status === 'active' ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Copy URL */}
                  <button
                    onClick={() => handleCopyUrl(link)}
                    title="Copy URL"
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition"
                  >
                    {copiedId === link.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => onDuplicateLink(link)}
                    title="Duplicate Link"
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEditLink(link)}
                    title="Edit Link"
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-500 transition"
                  >
                    <Edit className="w-3.5 h-3.5 text-rose-400" />
                  </button>

                  {/* Move to Trash */}
                  <button
                    onClick={() => onDeleteLink(link.id)}
                    title="Move to Recycle Bin"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs text-zinc-400">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length} links
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
