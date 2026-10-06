import React, { useState } from 'react';
import { Settings } from '../../types';
import { api } from '../../lib/api';
import { Shield, KeyRound, Clock, Globe, Check, AlertCircle } from 'lucide-react';

interface Props {
  settings: Settings;
  isDefaultPassword?: boolean;
  onUpdateSettings: (settings: Settings) => Promise<void>;
}

export const SecurityTab: React.FC<Props> = ({
  settings,
  isDefaultPassword,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<Settings>({ ...settings });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await onUpdateSettings(formData);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2500);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Security & System Settings</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Manage master credentials, session timeout policies, and public feature permissions.
        </p>
      </div>

      {isDefaultPassword && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Default Password Active</p>
            <p className="mt-0.5 text-zinc-300">
              Your admin panel is currently using the default &quot;admin123&quot; password. For full security, change to a custom master password below.
            </p>
          </div>
        </div>
      )}

      {/* Change Password Card */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          <span>Change Master Admin Password</span>
        </h3>

        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
          {!isDefaultPassword && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 chars"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isChangingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Global Application Settings */}
      <form onSubmit={handleSaveSettings} className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Session & Public Privacy Settings</span>
          </h3>
          <button
            type="submit"
            disabled={isSavingSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition cursor-pointer"
          >
            {settingsSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Website Page Title Override
            </label>
            <input
              type="text"
              value={formData.siteTitle || ''}
              onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Inactivity Auto-Logout Timeout
            </label>
            <select
              value={formData.autoLogoutMinutes || 60}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  autoLogoutMinutes: parseInt(e.target.value, 10),
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value={15}>15 Minutes of Inactivity</option>
              <option value={30}>30 Minutes of Inactivity</option>
              <option value={60}>1 Hour of Inactivity (Recommended)</option>
              <option value={240}>4 Hours of Inactivity</option>
            </select>
          </div>
        </div>

        {/* Public Permissions Toggles */}
        <div className="pt-2 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowSearch !== false}
              onChange={(e) => setFormData({ ...formData, allowSearch: e.target.checked })}
              className="rounded accent-rose-500"
            />
            <span className="text-zinc-200">Enable Public Search Bar</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowSharing !== false}
              onChange={(e) => setFormData({ ...formData, allowSharing: e.target.checked })}
              className="rounded accent-rose-500"
            />
            <span className="text-zinc-200">Enable Share Modal</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowQrCode !== false}
              onChange={(e) => setFormData({ ...formData, allowQrCode: e.target.checked })}
              className="rounded accent-rose-500"
            />
            <span className="text-zinc-200">Enable QR Code Button</span>
          </label>
        </div>
      </form>
    </div>
  );
};
