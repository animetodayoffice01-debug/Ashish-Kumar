import React, { useState, useEffect, useCallback } from 'react';
import { PublicHubData, AdminHubData } from './types';
import { api, getStoredToken, clearStoredToken } from './lib/api';
import { syncEngine } from './lib/syncEngine';
import { PublicView } from './components/PublicView';
import { AdminAuthView } from './components/AdminAuthView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [appView, setAppView] = useState<'public' | 'auth' | 'admin'>('public');
  const [publicData, setPublicData] = useState<PublicHubData | null>(null);
  const [adminData, setAdminData] = useState<AdminHubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load public hub data (with silent option for background real-time sync)
  const loadPublicData = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setIsLoading(true);
      setLoadError(null);
    }
    try {
      const data = await api.getPublicData();
      setPublicData(data);
      syncEngine.recordSyncSuccess();
    } catch (err: any) {
      if (!silent) {
        setLoadError(err.message || 'Failed to connect to server');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  // Multi-device real-time sync listener
  useEffect(() => {
    syncEngine.init(appView === 'admin' ? 'admin' : 'public');

    const unsubscribe = syncEngine.onRemoteUpdate((_payload) => {
      if (appView === 'public') {
        loadPublicData(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [appView, loadPublicData]);

  // Track visit on initial load with UTM detection
  useEffect(() => {
    loadPublicData();

    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || '';
      const utmMedium = params.get('utm_medium') || '';
      const utmCampaign = params.get('utm_campaign') || '';
      const referrer = document.referrer || '';

      api.trackVisit({
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
      });
    } catch (e) {
      console.error(e);
    }
  }, [loadPublicData]);

  // Click tracker for external links
  const handleTrackClick = useCallback((linkId: string) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || '';
      const referrer = document.referrer || '';
      api.trackClick(linkId, referrer, utmSource);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Switch to admin view handler
  const handleOpenAdmin = useCallback(async () => {
    const token = getStoredToken();
    if (token) {
      try {
        setIsLoading(true);
        const fullAdminData = await api.getAdminData();
        setAdminData(fullAdminData);
        setAppView('admin');
        setIsLoading(false);
        return;
      } catch {
        clearStoredToken();
      }
    }
    setAppView('auth');
    setIsLoading(false);
  }, []);

  // Auth success handler
  const handleAuthSuccess = useCallback(async () => {
    setIsLoading(true);
    try {
      const fullAdminData = await api.getAdminData();
      setAdminData(fullAdminData);
      setAppView('admin');
    } catch (err: any) {
      alert('Failed to load admin data: ' + err.message);
      setAppView('auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin Logout handler
  const handleLogout = useCallback(async () => {
    await api.logout();
    setAdminData(null);
    setAppView('public');
    loadPublicData();
  }, [loadPublicData]);

  // View public hub from admin
  const handleViewPublic = useCallback(() => {
    loadPublicData();
    setAppView('public');
  }, [loadPublicData]);

  // Custom CSS injection if present
  useEffect(() => {
    const customCss =
      (appView === 'admin' ? adminData?.appearance?.customCss : publicData?.appearance?.customCss) || '';
    let styleTag = document.getElementById('biolink-custom-css') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'biolink-custom-css';
      document.head.appendChild(styleTag);
    }
    // Only apply custom CSS in public view or scoped to avoid breaking admin navigation
    if (appView === 'public') {
      styleTag.textContent = customCss;
    } else {
      styleTag.textContent = '';
    }

    // Sync document title and meta description
    const title =
      publicData?.settings?.metaTitle ||
      publicData?.settings?.siteTitle ||
      publicData?.profile?.websiteTitle ||
      'BioLink Hub – Instagram Link in Bio';
    document.title = title;

    const desc =
      publicData?.settings?.metaDescription ||
      publicData?.profile?.shortDescription ||
      publicData?.profile?.bio ||
      '';
    if (desc) {
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (metaDesc) {
        metaDesc.content = desc;
      }
    }
  }, [appView, publicData?.appearance?.customCss, adminData?.appearance?.customCss, publicData?.settings, publicData?.profile]);

  // Loading Screen
  if (isLoading && !publicData && !adminData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg mb-4 animate-pulse">
          B
        </div>
        <p className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
          <span>Loading BioLink Hub...</span>
        </p>
      </div>
    );
  }

  // Error Screen
  if (loadError && !publicData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white mb-1">Unable to Load Bio Hub</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">{loadError}</p>
        <button
          onClick={() => loadPublicData(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white border border-zinc-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // Admin Dashboard Mode
  if (appView === 'admin' && adminData) {
    return (
      <AdminDashboardView
        initialData={adminData}
        onViewPublic={handleViewPublic}
        onLogout={handleLogout}
      />
    );
  }

  // Admin Password Challenge Mode
  if (appView === 'auth') {
    return (
      <AdminAuthView
        onSuccess={handleAuthSuccess}
        onCancel={() => setAppView('public')}
      />
    );
  }

  // Public Bio Link Mode (Default)
  return publicData ? (
    <PublicView
      data={publicData}
      onOpenAdminAuth={handleOpenAdmin}
      onTrackClick={handleTrackClick}
    />
  ) : null;
}
