import React, { useState, useEffect, useCallback } from 'react';
import { AdminHubData, LinkItem, Category, Tag, Profile, Appearance, Settings } from '../types';
import { api } from '../lib/api';
import { OverviewTab } from './admin/OverviewTab';
import { LinksTab } from './admin/LinksTab';
import { CategoriesTab } from './admin/CategoriesTab';
import { TagsTab } from './admin/TagsTab';
import { ProfileTab } from './admin/ProfileTab';
import { AppearanceTab } from './admin/AppearanceTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { ImportExportTab } from './admin/ImportExportTab';
import { LinkHealthTab } from './admin/LinkHealthTab';
import { BackupTab } from './admin/BackupTab';
import { SecurityTab } from './admin/SecurityTab';
import { TrashTab } from './admin/TrashTab';
import { SEOPreviewTab } from './admin/SEOPreviewTab';
import { LinkEditModal } from './admin/LinkEditModal';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { syncEngine } from '../lib/syncEngine';
import {
  LayoutDashboard,
  Link as LinkIcon,
  FolderTree,
  Tag as TagIcon,
  User,
  Palette,
  BarChart3,
  UploadCloud,
  ShieldCheck,
  HardDriveDownload,
  Shield,
  Trash2,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Plus,
  Bell,
  Globe,
} from 'lucide-react';

interface Props {
  initialData: AdminHubData;
  onViewPublic: () => void;
  onLogout: () => void;
}

export const AdminDashboardView: React.FC<Props> = ({
  initialData,
  onViewPublic,
  onLogout,
}) => {
  const [data, setData] = useState<AdminHubData>(initialData);
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Link Edit / Add Modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [activeEditingLink, setActiveEditingLink] = useState<Partial<LinkItem> | null>(null);

  // Toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Reload data from backend
  const refreshData = useCallback(async () => {
    try {
      const fresh = await api.getAdminData();
      setData(fresh);
      syncEngine.recordSyncSuccess();
    } catch (err: any) {
      if (err.message?.includes('session') || err.message?.includes('Unauthorized')) {
        onLogout();
      }
    }
  }, [onLogout]);

  // Real-time multi-device synchronization listener
  useEffect(() => {
    syncEngine.init('admin');

    const unsubscribe = syncEngine.onRemoteUpdate(async () => {
      try {
        const fresh = await api.getAdminData();
        setData(fresh);
        syncEngine.recordSyncSuccess();
        showToast('⚡ Real-time update synced from another device');
      } catch (err) {
        console.error('Remote sync error in admin:', err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [showToast]);

  // Inactivity Auto Logout
  useEffect(() => {
    const timeoutMinutes = data.adminMeta?.autoLogoutMinutes || 60;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        showToast('Session expired due to inactivity.');
        setTimeout(onLogout, 1000);
      }, timeoutMs);
    };

    resetTimer();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));

    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [data.adminMeta?.autoLogoutMinutes, onLogout, showToast]);

  // Link Handlers
  const handleOpenAddLink = () => {
    setActiveEditingLink({
      categoryId: data.categories[0]?.id || 'cat_all',
      buttonStyle: data.appearance.defaultButtonStyle || 'glass',
      borderRadius: data.appearance.borderRadius || 16,
      buttonColor: data.appearance.primaryColor || '#ec4899',
    });
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: LinkItem) => {
    setActiveEditingLink(link);
    setIsLinkModalOpen(true);
  };

  const handleDuplicateLink = async (link: LinkItem) => {
    try {
      const copy = {
        ...link,
        id: undefined,
        title: `${link.title} (Copy)`,
        clicks: 0,
      };
      await api.addLink(copy);
      await refreshData();
      showToast('Link duplicated successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveLink = async (linkData: Partial<LinkItem>) => {
    if (linkData.id) {
      await api.updateLink(linkData.id, linkData);
      showToast('Link updated successfully');
    } else {
      await api.addLink(linkData);
      showToast('Link created successfully');
    }
    await refreshData();
  };

  const handleDeleteLink = async (id: string) => {
    await api.deleteLink(id, false);
    await refreshData();
    showToast('Link moved to Recycle Bin');
  };

  const handleToggleStatus = async (link: LinkItem) => {
    const newStatus = link.status === 'active' ? 'hidden' : 'active';
    await api.updateLink(link.id, { status: newStatus });
    await refreshData();
    showToast(`Link ${newStatus === 'active' ? 'activated' : 'hidden'}`);
  };

  const handleReorderLinks = async (orders: { id: string; order: number }[]) => {
    await api.reorderLinks(orders);
    await refreshData();
  };

  const handleBulkAction = async (action: string, linkIds: string[], payload?: any) => {
    await api.bulkOperation(action, linkIds, payload);
    await refreshData();
    showToast(`Bulk action "${action}" completed`);
  };

  // Category & Tag Handlers
  const handleUpdateCategories = async (newCats: Category[]) => {
    await api.updateCategories(newCats);
    await refreshData();
    showToast('Categories updated');
  };

  const handleUpdateTags = async (newTags: Tag[]) => {
    await api.updateTags(newTags);
    await refreshData();
    showToast('Tags updated');
  };

  // Profile & Appearance Handlers
  const handleUpdateProfile = async (profile: Profile) => {
    await api.updateProfile(profile);
    await refreshData();
    showToast('Profile updated successfully');
  };

  const handleUpdateAppearance = async (appearance: Appearance) => {
    await api.updateAppearance(appearance);
    await refreshData();
    showToast('Appearance settings saved');
  };

  const handleUpdateSettings = async (settings: Settings) => {
    await api.updateSettings(settings);
    await refreshData();
    showToast('System settings saved');
  };

  // Import handler
  const handleImportLinks = async (newLinks: Partial<LinkItem>[]) => {
    for (const l of newLinks) {
      await api.addLink(l);
    }
    await refreshData();
    showToast(`Successfully imported ${newLinks.length} links!`);
  };

  // Trash Handlers
  const handleRestoreLink = async (id: string) => {
    await api.restoreLink(id);
    await refreshData();
    showToast('Link restored from trash');
  };

  const handlePermanentDelete = async (id: string) => {
    await api.deleteLink(id, true);
    await refreshData();
    showToast('Link permanently deleted');
  };

  const handleEmptyTrash = async () => {
    const count = await api.emptyTrash();
    await refreshData();
    showToast(`Emptied trash (${count} items removed)`);
  };

  // Navigation tabs list
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'links', label: 'Links', icon: LinkIcon, count: data.links.filter((l) => !l.deletedAt).length },
    { id: 'categories', label: 'Categories', icon: FolderTree, count: data.categories.length },
    { id: 'tags', label: 'Tags', icon: TagIcon, count: data.tags.length },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'seo-preview', label: 'SEO & Social Preview', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'import-export', label: 'Import / Export', icon: UploadCloud },
    { id: 'link-health', label: 'Link Health', icon: ShieldCheck },
    { id: 'backup', label: 'Backup & Reset', icon: HardDriveDownload },
    { id: 'security', label: 'Security & Settings', icon: Shield },
    { id: 'trash', label: 'Recycle Bin', icon: Trash2, count: data.trashCount, isDanger: true },
  ];

  const trashLinks = data.links.filter((l) => !!l.deletedAt);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-rose-500 selection:text-white">
      {/* Toast Notification Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-white shadow-2xl animate-fadeIn">
          <Bell className="w-4 h-4 text-rose-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 shrink-0 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-bold text-white">BioLink Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <SyncStatusIndicator compact />
          <button
            onClick={onViewPublic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-200"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            <span>Public Site</span>
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-zinc-900/95 border-r border-zinc-800/80 p-4 shrink-0 fixed md:sticky top-0 h-screen z-40 overflow-y-auto no-scrollbar`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6 px-2 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-md">
              B
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">BioLink Hub</h1>
              <p className="text-[10px] text-zinc-400">Admin Control Panel</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Public Hub Button */}
        <button
          onClick={onViewPublic}
          className="w-full mb-5 flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-semibold text-zinc-200 shadow-sm transition group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>View Public Bio Link</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">Live</span>
        </button>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.isDanger ? 'text-rose-400' : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/20 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Live Sync & Logout */}
        <div className="pt-4 border-t border-zinc-800/80 mt-4 space-y-2.5">
          {/* Sync indicator in sidebar */}
          <div className="px-1">
            <SyncStatusIndicator />
          </div>

          <div className="px-2 py-1 text-[11px] text-zinc-500">
            <span>Signed in as </span>
            <strong className="text-zinc-300 font-mono">@{data.profile.username || 'admin'}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {/* Main Canvas Top Header with Real-Time Multi-Device Sync Bar */}
        <header className="hidden sm:flex items-center justify-between pb-5 mb-6 border-b border-zinc-800/80">
          <div>
            <h1 className="text-xl font-bold text-white capitalize">
              {navItems.find((n) => n.id === currentTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your bio link hub with real-time multi-device sync
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SyncStatusIndicator />
            <button
              onClick={handleOpenAddLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Link</span>
            </button>
          </div>
        </header>
        {currentTab === 'overview' && (
          <OverviewTab
            data={data}
            onNavigateTab={setCurrentTab}
            onOpenAddLink={handleOpenAddLink}
          />
        )}
        {currentTab === 'links' && (
          <LinksTab
            links={data.links}
            categories={data.categories}
            tags={data.tags}
            defaultButtonStyle={data.appearance.defaultButtonStyle}
            onAddLink={handleOpenAddLink}
            onEditLink={handleOpenEditLink}
            onDuplicateLink={handleDuplicateLink}
            onDeleteLink={handleDeleteLink}
            onToggleStatus={handleToggleStatus}
            onReorder={handleReorderLinks}
            onBulkAction={handleBulkAction}
          />
        )}
        {currentTab === 'categories' && (
          <CategoriesTab
            categories={data.categories}
            links={data.links}
            onUpdateCategories={handleUpdateCategories}
          />
        )}
        {currentTab === 'tags' && (
          <TagsTab
            tags={data.tags}
            links={data.links}
            onUpdateTags={handleUpdateTags}
          />
        )}
        {currentTab === 'profile' && (
          <ProfileTab
            profile={data.profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {currentTab === 'appearance' && (
          <AppearanceTab
            appearance={data.appearance}
            onUpdateAppearance={handleUpdateAppearance}
          />
        )}
        {currentTab === 'seo-preview' && (
          <SEOPreviewTab
            settings={data.settings}
            profile={data.profile}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
        {currentTab === 'analytics' && (
          <AnalyticsTab
            analytics={data.analytics}
            links={data.links}
          />
        )}
        {currentTab === 'import-export' && (
          <ImportExportTab
            links={data.links}
            categories={data.categories}
            tags={data.tags}
            onImportLinks={handleImportLinks}
          />
        )}
        {currentTab === 'link-health' && <LinkHealthTab />}
        {currentTab === 'backup' && <BackupTab onRefreshData={refreshData} />}
        {currentTab === 'security' && (
          <SecurityTab
            settings={data.settings}
            isDefaultPassword={data.adminMeta.isDefaultPassword}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
        {currentTab === 'trash' && (
          <TrashTab
            trashLinks={trashLinks}
            onRestoreLink={handleRestoreLink}
            onPermanentDelete={handlePermanentDelete}
            onEmptyTrash={handleEmptyTrash}
          />
        )}
      </main>

      {/* Add / Edit Link Modal */}
      <LinkEditModal
        isOpen={isLinkModalOpen}
        link={activeEditingLink}
        categories={data.categories}
        tags={data.tags}
        existingLinks={data.links}
        defaultButtonStyle={data.appearance.defaultButtonStyle}
        onClose={() => setIsLinkModalOpen(false)}
        onSave={handleSaveLink}
      />
    </div>
  );
};
