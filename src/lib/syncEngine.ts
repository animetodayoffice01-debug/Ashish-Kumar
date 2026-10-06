import { SyncState, SyncStatus } from '../types';

type SyncListener = (state: SyncState) => void;
type RemoteUpdateCallback = (payload: { version: number; lastUpdated: string; action?: string }) => void;

class RealtimeSyncEngine {
  private status: SyncStatus = 'synced';
  private lastSyncTime: Date | null = new Date();
  private version: number = 1;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private eventSource: EventSource | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private listeners = new Set<SyncListener>();
  private updateCallbacks = new Set<RemoteUpdateCallback>();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private role: 'admin' | 'public' = 'public';
  private isDestroyed = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public init(role: 'admin' | 'public' = 'public') {
    this.role = role;
    this.isDestroyed = false;
    this.connectSSE();
    this.startHeartbeatPolling();
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public getState(): SyncState {
    return {
      status: this.status,
      lastSyncTime: this.lastSyncTime,
      version: this.version,
      isOnline: this.isOnline,
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public onRemoteUpdate(cb: RemoteUpdateCallback): () => void {
    this.updateCallbacks.add(cb);
    return () => this.updateCallbacks.delete(cb);
  }

  public setStatus(newStatus: SyncStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.notifyListeners();
    }
  }

  public recordSyncSuccess(newVersion?: number) {
    if (newVersion && newVersion > this.version) {
      this.version = newVersion;
    }
    this.lastSyncTime = new Date();
    this.setStatus('synced');
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  private handleNetworkChange(online: boolean) {
    this.isOnline = online;
    if (!online) {
      this.setStatus('offline');
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    } else {
      this.setStatus('syncing');
      this.connectSSE();
      this.checkServerVersion(true);
    }
  }

  private connectSSE() {
    if (this.isDestroyed || !this.isOnline || typeof window === 'undefined') return;

    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      this.eventSource = new EventSource(`/api/sync/stream?role=${this.role}`);

      this.eventSource.onopen = () => {
        this.recordSyncSuccess();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.handleEventPayload(payload);
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      this.eventSource.onerror = () => {
        // SSE connection dropped, close and schedule reconnection
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        if (this.isOnline) {
          this.setStatus('syncing');
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout || this.isDestroyed) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connectSSE();
    }, 4000);
  }

  private handleEventPayload(payload: any) {
    if (!payload) return;

    if (payload.type === 'connected') {
      if (payload.version) {
        this.version = payload.version;
      }
      this.recordSyncSuccess();
      return;
    }

    if (payload.type === 'mutation') {
      this.setStatus('syncing');
      if (payload.version && payload.version > this.version) {
        this.version = payload.version;
      }
      this.lastSyncTime = new Date();

      // Broadcast to components that need to reload fresh data
      this.updateCallbacks.forEach((cb) => cb(payload));

      setTimeout(() => {
        this.recordSyncSuccess();
      }, 400);
    }
  }

  // Heartbeat fallback polling (checks every 3.5 seconds)
  private startHeartbeatPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.pollInterval = setInterval(() => {
      if (this.isOnline && !this.isDestroyed && document.visibilityState === 'visible') {
        this.checkServerVersion();
      }
    }, 3500);
  }

  public async checkServerVersion(forceNotify: boolean = false) {
    try {
      const res = await fetch('/api/sync/status', { cache: 'no-store' });
      if (!res.ok) {
        if (this.isOnline) this.setStatus('error');
        return;
      }
      const data = await res.json();
      const serverVersion = data.version || 1;

      if (serverVersion > this.version || forceNotify) {
        this.version = serverVersion;
        this.setStatus('syncing');
        this.lastSyncTime = new Date();
        this.updateCallbacks.forEach((cb) =>
          cb({ version: serverVersion, lastUpdated: data.lastUpdated, action: 'poll_sync' })
        );
        setTimeout(() => this.recordSyncSuccess(), 400);
      } else {
        this.recordSyncSuccess();
      }
    } catch {
      if (this.isOnline) {
        this.setStatus('error');
      }
    }
  }

  public async forceSyncNow(): Promise<void> {
    this.setStatus('syncing');
    await this.checkServerVersion(true);
  }
}

export const syncEngine = new RealtimeSyncEngine();
