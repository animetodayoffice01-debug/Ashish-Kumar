import React, { useState, useEffect } from 'react';
import { LinkItem, Category, Tag, ButtonStyle, SpecialType } from '../../types';
import { POPULAR_ICONS, getIconComponent } from '../../lib/icons';
import { getButtonStyleClasses } from '../../lib/theme';
import { X, Check, Eye, AlertCircle, Sparkles, Star, Tag as TagIcon, ExternalLink, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  link: Partial<LinkItem> | null;
  categories: Category[];
  tags: Tag[];
  existingLinks: LinkItem[];
  defaultButtonStyle: ButtonStyle;
  onClose: () => void;
  onSave: (link: Partial<LinkItem>) => Promise<void>;
}

export const LinkEditModal: React.FC<Props> = ({
  isOpen,
  link,
  categories,
  tags,
  existingLinks,
  defaultButtonStyle,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<LinkItem>>({});
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title || '',
        nickname: link.nickname || '',
        url: link.url || '',
        description: link.description || '',
        thumbnailUrl: link.thumbnailUrl || '',
        icon: link.icon || 'Link',
        emoji: link.emoji || '',
        categoryId: link.categoryId || (categories[0]?.id || 'cat_all'),
        buttonColor: link.buttonColor || '#ec4899',
        textColor: link.textColor || '#ffffff',
        buttonStyle: link.buttonStyle || defaultButtonStyle,
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
        openNewTab: link.openNewTab ?? true,
        confirmBeforeOpening: link.confirmBeforeOpening ?? false,
        linkPriority: link.linkPriority ?? 5,
        tags: link.tags ? [...link.tags] : [],
        specialType: link.specialType || 'url',
        ...link,
      });
    }
  }, [link, categories, defaultButtonStyle]);

  if (!isOpen) return null;

  // Check duplicate URL on change
  const handleUrlChange = (newUrl: string) => {
    setFormData((prev) => ({ ...prev, url: newUrl }));
    const clean = newUrl.trim().toLowerCase().replace(/\/$/, '');
    if (clean) {
      const match = existingLinks.find(
        (l) => l.id !== formData.id && l.url.trim().toLowerCase().replace(/\/$/, '') === clean
      );
      if (match) {
        setDuplicateWarning(`This URL is already used by "${match.title}".`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleToggleTag = (tagName: string) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tagName)) {
      setFormData({ ...formData, tags: currentTags.filter((t) => t !== tagName) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tagName] });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.url?.trim()) {
      setError('URL is required');
      return;
    }

    // Auto-normalize URL
    let cleanUrl = formData.url.trim();
    if (
      !/^https?:\/\//i.test(cleanUrl) &&
      !/^(mailto:|tel:|wa\.me|t\.me)/i.test(cleanUrl)
    ) {
      cleanUrl = 'https://' + cleanUrl;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        url: cleanUrl,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save link');
    } finally {
      setIsSaving(false);
    }
  };

  const IconComp = getIconComponent(formData.icon || 'Link');
  const styleClasses = getButtonStyleClasses(formData.buttonStyle || defaultButtonStyle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">
              {formData.id ? 'Edit Link' : 'Add New Link'}
            </h3>
            <div className="flex rounded-lg bg-zinc-950 p-0.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setPreviewTab('edit')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  previewTab === 'edit'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Configuration
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition ${
                  previewTab === 'preview'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{duplicateWarning} (You can still proceed if intentional).</span>
            </div>
          )}

          {previewTab === 'preview' ? (
            /* Live Card Preview */
            <div className="space-y-4 py-4">
              <p className="text-xs text-zinc-400">
                This is how the link button will look to visitors on your public page:
              </p>
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <div
                  style={{
                    borderRadius: formData.borderRadius ? `${formData.borderRadius}px` : undefined,
                  }}
                  className={`flex items-center gap-3.5 p-3.5 w-full text-left relative overflow-hidden transition-all ${styleClasses}`}
                >
                  {formData.buttonColor && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full"
                      style={{ backgroundColor: formData.buttonColor }}
                    />
                  )}

                  <div className="shrink-0 flex items-center justify-center">
                    {formData.thumbnailUrl ? (
                      <img
                        src={formData.thumbnailUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-sm"
                      />
                    ) : formData.emoji ? (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-white/10"
                        style={{
                          backgroundColor: formData.buttonColor
                            ? `${formData.buttonColor}20`
                            : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <span>{formData.emoji}</span>
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white/90 shadow-sm border border-white/10"
                        style={{
                          backgroundColor: formData.buttonColor
                            ? `${formData.buttonColor}25`
                            : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      {formData.featured && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <Star className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                          FEATURED
                        </span>
                      )}
                      {formData.newBadge && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                          NEW
                        </span>
                      )}
                      {formData.badge && formData.badgeText && (
                        <span
                          className="px-2 py-0.5 text-[10px] font-bold rounded shadow-xs border"
                          style={{
                            backgroundColor: formData.buttonColor
                              ? `${formData.buttonColor}25`
                              : 'rgba(236,72,153,0.2)',
                            borderColor: formData.buttonColor
                              ? `${formData.buttonColor}40`
                              : 'rgba(236,72,153,0.3)',
                            color: formData.buttonColor || '#ec4899',
                          }}
                        >
                          {formData.badgeText}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-100 truncate">
                      {formData.title || 'Untitled Link'}
                    </h4>
                    {formData.description && (
                      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                        {formData.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 p-1 text-zinc-500">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form Fields */
            <form id="link-form" onSubmit={handleSave} className="space-y-4">
              {/* Title & Nickname */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Link Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Watch My 2026 Editing Masterclass"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Short Nickname
                  </label>
                  <input
                    type="text"
                    value={formData.nickname || ''}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="e.g. Masterclass"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* URL & Special Type */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Destination URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.url || ''}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or wa.me/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono placeholder:text-zinc-600 outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Type</label>
                  <select
                    value={formData.specialType || 'url'}
                    onChange={(e) =>
                      setFormData({ ...formData, specialType: e.target.value as SpecialType })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    <option value="url">Standard URL</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="download">Download / File</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short supporting text or details..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Category, Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Status</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="hidden">Hidden</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Priority (Higher shows first)
                  </label>
                  <input
                    type="number"
                    value={formData.linkPriority ?? 5}
                    onChange={(e) =>
                      setFormData({ ...formData, linkPriority: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Thumbnail URL, Emoji & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={formData.emoji || ''}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    placeholder="🎬, 🎨, ⚡..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Icon</label>
                  <select
                    value={formData.icon || 'Link'}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    {POPULAR_ICONS.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Styling: Button Style, Accent Color, Custom Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Button Style Override
                  </label>
                  <select
                    value={formData.buttonStyle || defaultButtonStyle}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonStyle: e.target.value as ButtonStyle })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                  >
                    <option value="classic">Classic</option>
                    <option value="rounded">Rounded</option>
                    <option value="glass">Glass</option>
                    <option value="outline">Outline</option>
                    <option value="neon">Neon</option>
                    <option value="gradient">Gradient</option>
                    <option value="minimal">Minimal</option>
                    <option value="card">Card</option>
                    <option value="floating">Floating</option>
                    <option value="pill">Pill</option>
                    <option value="3d">3D</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.buttonColor || '#ec4899'}
                      onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={formData.buttonColor || '#ec4899'}
                      onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Custom Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        badgeText: e.target.value,
                        badge: !!e.target.value.trim(),
                      })
                    }
                    placeholder="e.g. VIP, SALE, 50% OFF"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Toggles: Featured, Pinned, New, Sponsored, Open New Tab, Confirm */}
              <div className="pt-2 border-t border-zinc-800/80">
                <p className="text-xs font-semibold text-zinc-300 mb-2">Display & Behavior Toggles</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800/60 cursor-pointer hover:bg-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={!!formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded accent-rose-500"
                    />
                    <span className="text-zinc-200">Featured (Top)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800/60 cursor-pointer hover:bg-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={!!formData.pinned}
                      onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                      className="rounded accent-rose-500"
                    />
                    <span className="text-zinc-200">Pinned Link</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800/60 cursor-pointer hover:bg-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={!!formData.newBadge}
                      onChange={(e) => setFormData({ ...formData, newBadge: e.target.checked })}
                      className="rounded accent-rose-500"
                    />
                    <span className="text-zinc-200">New Badge</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800/60 cursor-pointer hover:bg-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={!!formData.sponsoredLabel}
                      onChange={(e) =>
                        setFormData({ ...formData, sponsoredLabel: e.target.checked })
                      }
                      className="rounded accent-rose-500"
                    />
                    <span className="text-zinc-200">Sponsored Label</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800/60 cursor-pointer hover:bg-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={formData.openNewTab !== false}
                      onChange={(e) => setFormData({ ...formData, openNewTab: e.target.checked })}
                      className="rounded accent-rose-500"
                    />
                    <span className="text-zinc-200">Open in New Tab</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800/60 cursor-pointer hover:bg-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={!!formData.confirmBeforeOpening}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmBeforeOpening: e.target.checked })
                      }
                      className="rounded accent-rose-500"
                    />
                    <span className="text-zinc-200">Confirm Prompt</span>
                  </label>
                </div>
              </div>

              {/* Scheduling Start & End */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-zinc-300">Schedule Visibility (Optional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Start Date / Time (Auto Publish)
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        formData.scheduleStart
                          ? new Date(formData.scheduleStart).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduleStart: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      End Date / Time (Auto Expire)
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        formData.scheduleEnd
                          ? new Date(formData.scheduleEnd).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduleEnd: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tags Selector */}
              {tags.length > 0 && (
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TagIcon className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold text-zinc-300">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => {
                      const isSelected = formData.tags?.includes(t.name);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleTag(t.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                            isSelected
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                          }`}
                        >
                          #{t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="link-form"
            disabled={isSaving}
            onClick={previewTab === 'preview' ? () => setPreviewTab('edit') : undefined}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
