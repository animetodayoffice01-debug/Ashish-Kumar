import { PublicHubData, AdminHubData, LinkItem, Category, Tag, Profile, Appearance, Settings } from '../types';
import { localStore } from './localStore';

const AUTH_TOKEN_KEY = 'biolink_admin_token';
const AUTH_EXPIRY_KEY = 'biolink_admin_expiry';

export function getStoredToken(): string | null {
  try {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    const expiry = sessionStorage.getItem(AUTH_EXPIRY_KEY);
    if (!token || !expiry) return null;
    if (Date.now() > parseInt(expiry, 10)) {
      clearStoredToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string, expiresAt: number) {
  try {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_EXPIRY_KEY, expiresAt.toString());
  } catch (e) {
    console.error('Storage error', e);
  }
}

export function clearStoredToken() {
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_EXPIRY_KEY);
  } catch (e) {
    console.error('Storage error', e);
  }
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function isJsonResponse(res: Response): Promise<boolean> {
  const contentType = res.headers.get('content-type') || '';
  return res.ok && contentType.includes('application/json');
}

export const api = {
  // Public
  async getPublicData(): Promise<PublicHubData> {
    try {
      const res = await fetch('/api/public/data');
      if (await isJsonResponse(res)) {
        return await res.json();
      }
    } catch {
      // Fallback to local persistent store
    }
    return localStore.getPublicData();
  },

  async trackVisit(data: { referrer: string; utmSource: string; utmMedium: string; utmCampaign: string }) {
    try {
      const res = await fetch('/api/public/track-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (await isJsonResponse(res)) return;
    } catch {}
    localStore.trackVisit(data);
  },

  async trackClick(linkId: string, referrer: string, utmSource: string) {
    try {
      const res = await fetch('/api/public/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId, referrer, utmSource }),
      });
      if (await isJsonResponse(res)) return await res.json();
    } catch {}
    localStore.trackClick(linkId, referrer, utmSource);
  },

  // Auth
  async getAuthStatus(): Promise<{ hasPassword: boolean; isDefaultPassword: boolean; isLocked: boolean; lockRemainingSeconds: number }> {
    try {
      const res = await fetch('/api/admin/auth-status');
      if (await isJsonResponse(res)) return await res.json();
    } catch {}
    return localStore.getAuthStatus();
  },

  async setupPassword(password: string): Promise<{ token: string; expiresAt: number }> {
    try {
      const res = await fetch('/api/admin/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        setStoredToken(data.token, data.expiresAt);
        return data;
      }
    } catch {}
    const data = await localStore.setupPassword(password);
    setStoredToken(data.token, data.expiresAt);
    return data;
  },

  async login(password: string): Promise<{ token: string; expiresAt: number; isDefaultPassword: boolean }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        setStoredToken(data.token, data.expiresAt);
        return data;
      } else if (res.status === 401 || res.status === 429) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
    } catch (e: any) {
      if (e.message && e.message.includes('password')) throw e;
    }
    const data = await localStore.login(password);
    setStoredToken(data.token, data.expiresAt);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: authHeaders(),
      });
    } finally {
      clearStoredToken();
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (await isJsonResponse(res)) return;
      if (res.status === 401 || res.status === 400) {
        const err = await res.json();
        throw new Error(err.error || 'Password update failed');
      }
    } catch (e: any) {
      if (e.message) throw e;
    }
    await localStore.changePassword(currentPassword, newPassword);
  },

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ password }),
      });
      if (await isJsonResponse(res)) return true;
    } catch {}
    return localStore.verifyPassword(password);
  },

  // Admin Data CRUD
  async getAdminData(): Promise<AdminHubData> {
    try {
      const res = await fetch('/api/admin/data', { headers: authHeaders() });
      if (await isJsonResponse(res)) return await res.json();
    } catch {}
    return localStore.getAdminData();
  },

  async addLink(link: Partial<LinkItem>): Promise<LinkItem> {
    try {
      const res = await fetch('/api/admin/links', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(link),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.link;
      }
    } catch {}
    return localStore.addLink(link);
  },

  async updateLink(id: string, updates: Partial<LinkItem>): Promise<LinkItem> {
    try {
      const res = await fetch(`/api/admin/links/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.link;
      }
    } catch {}
    return localStore.updateLink(id, updates);
  },

  async deleteLink(id: string, permanent: boolean = false): Promise<void> {
    try {
      const res = await fetch(`/api/admin/links/${id}?permanent=${permanent}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (await isJsonResponse(res)) return;
    } catch {}
    await localStore.deleteLink(id, permanent);
  },

  async restoreLink(id: string): Promise<LinkItem> {
    try {
      const res = await fetch(`/api/admin/links/${id}/restore`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.link;
      }
    } catch {}
    return localStore.restoreLink(id);
  },

  async bulkOperation(action: string, linkIds: string[], payload?: any): Promise<void> {
    try {
      const res = await fetch('/api/admin/links/bulk', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ action, linkIds, payload }),
      });
      if (await isJsonResponse(res)) return;
    } catch {}
    await localStore.bulkOperation(action, linkIds, payload);
  },

  async reorderLinks(orders: { id: string; order: number }[]): Promise<void> {
    try {
      const res = await fetch('/api/admin/links/reorder', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ orders }),
      });
      if (await isJsonResponse(res)) return;
    } catch {}
    await localStore.reorderLinks(orders);
  },

  async updateCategories(categories: Category[]): Promise<Category[]> {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ categories }),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.categories;
      }
    } catch {}
    return localStore.updateCategories(categories);
  },

  async updateTags(tags: Tag[]): Promise<Tag[]> {
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ tags }),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.tags;
      }
    } catch {}
    return localStore.updateTags(tags);
  },

  async updateProfile(profile: Profile): Promise<Profile> {
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(profile),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.profile;
      }
    } catch {}
    return localStore.updateProfile(profile);
  },

  async updateAppearance(appearance: Appearance): Promise<Appearance> {
    try {
      const res = await fetch('/api/admin/appearance', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(appearance),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.appearance;
      }
    } catch {}
    return localStore.updateAppearance(appearance);
  },

  async updateSettings(settings: Settings): Promise<Settings> {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(settings),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.settings;
      }
    } catch {}
    return localStore.updateSettings(settings);
  },

  async exportBackup(): Promise<any> {
    try {
      const res = await fetch('/api/admin/backup/export', {
        method: 'POST',
        headers: authHeaders(),
      });
      if (await isJsonResponse(res)) return await res.json();
    } catch {}
    return localStore.exportBackup();
  },

  async restoreBackup(backupData: any, confirmPassword?: string): Promise<void> {
    try {
      const res = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ backupData, confirmPassword }),
      });
      if (await isJsonResponse(res)) return;
    } catch {}
    await localStore.restoreBackup(backupData);
  },

  async resetData(resetType: 'all' | 'appearance' | 'remove-demo', confirmPassword?: string): Promise<void> {
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ resetType, confirmPassword }),
      });
      if (await isJsonResponse(res)) return;
    } catch {}
    await localStore.resetData(resetType);
  },

  async checkLinkHealth(): Promise<any> {
    try {
      const res = await fetch('/api/admin/link-health', {
        method: 'POST',
        headers: authHeaders(),
      });
      if (await isJsonResponse(res)) return await res.json();
    } catch {}
    return localStore.checkLinkHealth();
  },

  async emptyTrash(): Promise<number> {
    try {
      const res = await fetch('/api/admin/empty-trash', {
        method: 'POST',
        headers: authHeaders(),
      });
      if (await isJsonResponse(res)) {
        const data = await res.json();
        return data.removedCount;
      }
    } catch {}
    return localStore.emptyTrash();
  },
};
