import React, { useState } from 'react';
import { Profile, SocialLink, PhotoShape } from '../../types';
import {
  User,
  Image,
  CheckCircle2,
  Sparkles,
  MapPin,
  Globe,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Props {
  profile: Profile;
  onUpdateProfile: (profile: Profile) => Promise<void>;
}

const AVAILABLE_PLATFORMS = [
  'instagram',
  'youtube',
  'telegram',
  'whatsapp',
  'x',
  'threads',
  'github',
  'discord',
  'linkedin',
  'pinterest',
  'snapchat',
  'website',
  'email',
];

export const ProfileTab: React.FC<Props> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Social Links management
  const handleAddSocial = (platform: string) => {
    const newSocial: SocialLink = {
      id: 'soc_' + Date.now(),
      platform,
      url: platform === 'email' ? 'mailto:hello@example.com' : `https://${platform}.com`,
      label: platform.charAt(0).toUpperCase() + platform.slice(1),
      enabled: true,
      order: (formData.socialLinks?.length || 0) + 1,
    };
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), newSocial],
    }));
  };

  const handleRemoveSocial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((s) => s.id !== id),
    }));
  };

  const handleToggleSocial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const handleSocialMove = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.socialLinks || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    setFormData((prev) => ({
      ...prev,
      socialLinks: list.map((item, idx) => ({ ...item, order: idx + 1 })),
    }));
  };

  const bioLength = formData.bio?.length || 0;
  const bioLimit = formData.bioCharLimit || 250;
  const nickLength = formData.nickname?.length || 0;
  const nickLimit = formData.nicknameCharLimit || 40;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Profile & Branding</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Configure your Instagram avatar, creator badges, bio text, and connected social accounts.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Avatar & Photo Settings Card */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
          Profile Photo & Style
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar Preview */}
          <div className="relative shrink-0">
            {formData.photoUrl ? (
              <img
                src={formData.photoUrl}
                alt="Avatar"
                style={{
                  width: `${formData.photoSize || 108}px`,
                  height: `${formData.photoSize || 108}px`,
                }}
                className={`object-cover ${
                  formData.photoShape === 'square'
                    ? 'rounded-2xl'
                    : formData.photoShape === 'rounded'
                    ? 'rounded-3xl'
                    : 'rounded-full'
                } ${formData.photoBorder ? 'ring-4 ring-rose-500/30' : ''} ${
                  formData.photoShadow ? 'shadow-2xl' : ''
                }`}
              />
            ) : (
              <div
                style={{
                  width: `${formData.photoSize || 108}px`,
                  height: `${formData.photoSize || 108}px`,
                }}
                className="bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500"
              >
                <User className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 w-full space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Photo Image URL or Upload File
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={formData.photoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-400 mb-1">Shape</label>
                <select
                  value={formData.photoShape || 'circle'}
                  onChange={(e) =>
                    setFormData({ ...formData, photoShape: e.target.value as PhotoShape })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                >
                  <option value="circle">Circular</option>
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-400 mb-1">
                  Size ({formData.photoSize || 108}px)
                </label>
                <input
                  type="range"
                  min="64"
                  max="160"
                  value={formData.photoSize || 108}
                  onChange={(e) =>
                    setFormData({ ...formData, photoSize: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="border-toggle"
                  checked={!!formData.photoBorder}
                  onChange={(e) => setFormData({ ...formData, photoBorder: e.target.checked })}
                  className="rounded accent-rose-500"
                />
                <label htmlFor="border-toggle" className="text-zinc-300 cursor-pointer">
                  Outer Border
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="shadow-toggle"
                  checked={!!formData.photoShadow}
                  onChange={(e) => setFormData({ ...formData, photoShadow: e.target.checked })}
                  className="rounded accent-rose-500"
                />
                <label htmlFor="shadow-toggle" className="text-zinc-300 cursor-pointer">
                  Soft Shadow
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Identity & Bio Fields */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
          Creator Identity & Bio
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">Nickname / Brand Name</label>
              <span className={`text-[10px] ${nickLength > nickLimit ? 'text-rose-400' : 'text-zinc-500'}`}>
                {nickLength}/{nickLimit}
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.nickname || ''}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Instagram Username
            </label>
            <input
              type="text"
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Display Name</label>
            <input
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Location</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="San Francisco, CA"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Bio Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-zinc-300">Bio</label>
            <span className={`text-[10px] ${bioLength > bioLimit ? 'text-rose-400' : 'text-zinc-500'}`}>
              {bioLength}/{bioLimit} characters
            </span>
          </div>
          <textarea
            rows={3}
            value={formData.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Introduce your channels, what you share, posting schedule..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500 leading-relaxed"
          />
        </div>

        {/* Short description & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Short Description (Meta / Subtitle)
            </label>
            <input
              type="text"
              value={formData.shortDescription || ''}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Custom Status Message
            </label>
            <input
              type="text"
              value={formData.customStatus || ''}
              onChange={(e) => setFormData({ ...formData, customStatus: e.target.value })}
              placeholder="e.g. Editing new video 🎬"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Badges Toggles */}
        <div className="pt-2 border-t border-zinc-800">
          <p className="text-xs font-semibold text-zinc-300 mb-2">Profile Badges & Status</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.verificationBadge}
                onChange={(e) =>
                  setFormData({ ...formData, verificationBadge: e.target.checked })
                }
                className="rounded accent-rose-500"
              />
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span className="text-zinc-200">Verification Badge</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.creatorBadge}
                onChange={(e) => setFormData({ ...formData, creatorBadge: e.target.checked })}
                className="rounded accent-rose-500"
              />
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-zinc-200">Creator Badge</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.onlineStatus}
                onChange={(e) => setFormData({ ...formData, onlineStatus: e.target.checked })}
                className="rounded accent-rose-500"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-200">Online Indicator</span>
            </label>
          </div>
        </div>
      </div>

      {/* Social Accounts Row */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Connected Social Accounts
          </h3>
          <div className="flex items-center gap-1.5">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddSocial(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl px-2.5 py-1 text-xs outline-none cursor-pointer"
            >
              <option value="" disabled>
                + Add Social Icon
              </option>
              {AVAILABLE_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {(formData.socialLinks || []).map((social, idx) => (
            <div
              key={social.id}
              className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
            >
              <span className="w-20 text-xs font-bold text-zinc-300 capitalize shrink-0">
                {social.platform}
              </span>
              <input
                type="text"
                value={social.url}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: (prev.socialLinks || []).map((s) =>
                      s.id === social.id ? { ...s, url: val } : s
                    ),
                  }));
                }}
                className="flex-1 w-full sm:w-auto bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
              />
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleSocialMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialMove(idx, 'down')}
                  disabled={idx === (formData.socialLinks?.length || 0) - 1}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSocial(social.id)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  {social.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSocial(social.id)}
                  className="p-1 text-zinc-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
