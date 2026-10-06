import React, { useState } from 'react';
import { Appearance, ThemePreset, ButtonStyle } from '../../types';
import { THEME_PRESETS, getButtonStyleClasses } from '../../lib/theme';
import { Palette, Check, Sparkles, Sliders, Code2, RotateCcw } from 'lucide-react';

interface Props {
  appearance: Appearance;
  onUpdateAppearance: (appearance: Appearance) => Promise<void>;
}

export const AppearanceTab: React.FC<Props> = ({ appearance, onUpdateAppearance }) => {
  const [formData, setFormData] = useState<Appearance>({ ...appearance });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleApplyPreset = (presetKey: ThemePreset) => {
    const preset = THEME_PRESETS[presetKey];
    setFormData((prev) => ({
      ...prev,
      ...preset,
      preset: presetKey,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateAppearance(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const buttonStyles: ButtonStyle[] = [
    'classic',
    'rounded',
    'glass',
    'outline',
    'neon',
    'gradient',
    'minimal',
    'card',
    'floating',
    'pill',
    '3d',
    'compact',
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Appearance & Theme Presets</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Tailor colors, backgrounds, button styles, animations and custom CSS.
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
              <span>Save Theme</span>
            </>
          )}
        </button>
      </div>

      {/* Theme Presets Grid */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Curated Theme Presets</span>
        </h3>
        <p className="text-xs text-zinc-400">
          Click any preset to immediately apply color harmonies and styling.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((key) => {
            const preset = THEME_PRESETS[key];
            const isSelected = formData.preset === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'ring-2 ring-rose-500 bg-zinc-800 border-rose-500 shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div
                  className="w-full h-10 rounded-xl mb-2 flex items-center justify-center font-bold text-[10px] uppercase shadow-inner"
                  style={{
                    background:
                      preset.bgGradient || preset.bgColor || '#18181b',
                    color: preset.textColor || '#fff',
                  }}
                >
                  {key}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white capitalize">{key}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Button Styles Showcase & Default Selector */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <Palette className="w-4 h-4" />
          <span>Default Button Style (12 Available Styles)</span>
        </h3>
        <p className="text-xs text-zinc-400">
          Select default look for all link buttons (individual links can override this).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
          {buttonStyles.map((style) => {
            const isSelected = formData.defaultButtonStyle === style;
            const classes = getButtonStyleClasses(style);

            return (
              <button
                key={style}
                type="button"
                onClick={() => setFormData({ ...formData, defaultButtonStyle: style })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'ring-2 ring-rose-500 border-rose-500 bg-zinc-800'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`p-2 mb-1.5 text-xs font-semibold ${classes} text-center truncate`}>
                  {style.toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-zinc-400 capitalize">
                  {style} {isSelected && '✓'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background & Colors Configuration */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <Sliders className="w-4 h-4" />
          <span>Color & Layout Controls</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Background Type
            </label>
            <select
              value={formData.bgType}
              onChange={(e) => setFormData({ ...formData, bgType: e.target.value as any })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="gradient">Gradient</option>
              <option value="color">Solid Color</option>
              <option value="image">Background Image</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Solid Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.bgColor || '#09090b'}
                onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={formData.bgColor || '#09090b'}
                onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Primary Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primaryColor || '#8b5cf6'}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={formData.primaryColor || '#8b5cf6'}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {formData.bgType === 'gradient' && (
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              CSS Gradient String
            </label>
            <input
              type="text"
              value={formData.bgGradient || ''}
              onChange={(e) => setFormData({ ...formData, bgGradient: e.target.value })}
              placeholder="linear-gradient(135deg, #18181b 0%, #09090b 100%)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
            />
          </div>
        )}

        {formData.bgType === 'image' && (
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Background Image URL
            </label>
            <input
              type="url"
              value={formData.bgImageUrl || ''}
              onChange={(e) => setFormData({ ...formData, bgImageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Border Radius ({formData.borderRadius}px)
            </label>
            <input
              type="range"
              min="0"
              max="32"
              value={formData.borderRadius ?? 16}
              onChange={(e) =>
                setFormData({ ...formData, borderRadius: parseInt(e.target.value, 10) })
              }
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Link Layout Mode
            </label>
            <select
              value={formData.linkLayout}
              onChange={(e) =>
                setFormData({ ...formData, linkLayout: e.target.value as 'list' | 'grid2' })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="list">Single Column List (Mobile Optimized)</option>
              <option value="grid2">2-Column Grid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Max Featured Links
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.maxFeaturedCount || 3}
              onChange={(e) =>
                setFormData({ ...formData, maxFeaturedCount: parseInt(e.target.value, 10) || 3 })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
            <input
              type="checkbox"
              checked={!!formData.animationsEnabled}
              onChange={(e) =>
                setFormData({ ...formData, animationsEnabled: e.target.checked })
              }
              className="rounded accent-rose-500"
            />
            <span className="text-zinc-200">Subtle Animations (Hover & scale effects)</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
            <input
              type="checkbox"
              checked={!!formData.showPublicStats}
              onChange={(e) => setFormData({ ...formData, showPublicStats: e.target.checked })}
              className="rounded accent-rose-500"
            />
            <span className="text-zinc-200">Show Public Visitor/Click Counter Badge</span>
          </label>
        </div>
      </div>

      {/* Custom CSS Editor */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Code2 className="w-4 h-4" />
            <span>Custom CSS (Advanced Styling)</span>
          </h3>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, customCss: '' })}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset CSS</span>
          </button>
        </div>
        <p className="text-xs text-zinc-400">
          Inject custom rules to style links, cards, or fonts on your public page.
        </p>
        <textarea
          rows={4}
          value={formData.customCss || ''}
          onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
          placeholder="/* Custom CSS rules */&#10;.custom-glow { filter: drop-shadow(0 0 10px #ec4899); }"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-emerald-400 font-mono outline-none focus:border-rose-500 leading-relaxed"
        />
      </div>
    </form>
  );
};
