import React, { useState } from 'react';
import { useSyncState } from '../hooks/useSyncState';
import { syncEngine } from '../lib/syncEngine';
import { RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SyncStatusIndicator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const syncState = useSyncState();
  const [isForcing, setIsForcing] = useState(false);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleForceSync = async () => {
    setIsForcing(true);
    try {
      await syncEngine.forceSyncNow();
    } finally {
      setTimeout(() => setIsForcing(false), 500);
    }
  };

  const renderBadge = () => {
    switch (syncState.status) {
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>🔴 Offline</span>
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>🟡 Syncing...</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span>⚠️ Sync Error</span>
          </span>
        );
      case 'synced':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>🟢 Synced</span>
          </span>
        );
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {renderBadge()}
        <button
          onClick={handleForceSync}
          disabled={isForcing}
          title="Force Real-Time Sync"
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isForcing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-1.5 px-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs">
      {renderBadge()}

      <div className="hidden sm:flex flex-col text-[11px] leading-tight text-zinc-400 border-l border-zinc-800 pl-2.5">
        <span className="text-[10px] text-zinc-500 font-medium">Last synchronized:</span>
        <strong className="text-zinc-300 font-mono">{formatTime(syncState.lastSyncTime)}</strong>
      </div>

      <button
        onClick={handleForceSync}
        disabled={isForcing}
        title="Check server for updates now"
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold border border-zinc-700/60 transition disabled:opacity-40"
      >
        <RefreshCw className={`w-3 h-3 text-rose-400 ${isForcing ? 'animate-spin' : ''}`} />
        <span className="hidden md:inline">Sync Now</span>
      </button>
    </div>
  );
};
