import { Appearance, ButtonStyle, ThemePreset } from '../types';

export const THEME_PRESETS: Record<ThemePreset, Partial<Appearance>> = {
  creator: {
    preset: 'creator',
    themeMode: 'dark',
    bgType: 'gradient',
    bgColor: '#09090b',
    bgGradient: 'radial-gradient(ellipse at top, #1e112a 0%, #09090b 100%)',
    primaryColor: '#8b5cf6',
    textColor: '#f4f4f5',
    accentColor: '#ec4899',
    borderRadius: 16,
    defaultButtonStyle: 'glass',
    cardShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
  },
  instagram: {
    preset: 'instagram',
    themeMode: 'dark',
    bgType: 'gradient',
    bgColor: '#0b0c10',
    bgGradient: 'linear-gradient(135deg, #405de6 0%, #5851db 25%, #833ab4 50%, #c13584 75%, #e1306c 100%)',
    primaryColor: '#e1306c',
    textColor: '#ffffff',
    accentColor: '#fd1d1d',
    borderRadius: 20,
    defaultButtonStyle: 'glass',
    cardShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
  glass: {
    preset: 'glass',
    themeMode: 'dark',
    bgType: 'gradient',
    bgColor: '#0f172a',
    bgGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    primaryColor: '#38bdf8',
    textColor: '#f8fafc',
    accentColor: '#818cf8',
    borderRadius: 18,
    defaultButtonStyle: 'glass',
    cardShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  },
  neon: {
    preset: 'neon',
    themeMode: 'dark',
    bgType: 'color',
    bgColor: '#050505',
    bgGradient: '',
    primaryColor: '#22c55e',
    textColor: '#f0fdf4',
    accentColor: '#06b6d4',
    borderRadius: 14,
    defaultButtonStyle: 'neon',
    cardShadow: '0 0 20px rgba(34, 197, 94, 0.25)',
  },
  minimal: {
    preset: 'minimal',
    themeMode: 'dark',
    bgType: 'color',
    bgColor: '#121212',
    bgGradient: '',
    primaryColor: '#ffffff',
    textColor: '#fafafa',
    accentColor: '#a1a1aa',
    borderRadius: 8,
    defaultButtonStyle: 'minimal',
    cardShadow: 'none',
  },
  dark: {
    preset: 'dark',
    themeMode: 'dark',
    bgType: 'color',
    bgColor: '#09090b',
    bgGradient: '',
    primaryColor: '#a855f7',
    textColor: '#f4f4f5',
    accentColor: '#3b82f6',
    borderRadius: 14,
    defaultButtonStyle: 'card',
    cardShadow: '0 4px 12px rgba(0,0,0,0.5)',
  },
  light: {
    preset: 'light',
    themeMode: 'light',
    bgType: 'gradient',
    bgColor: '#f8fafc',
    bgGradient: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
    primaryColor: '#0f172a',
    textColor: '#0f172a',
    accentColor: '#2563eb',
    borderRadius: 16,
    defaultButtonStyle: 'card',
    cardShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
  },
  cyber: {
    preset: 'cyber',
    themeMode: 'dark',
    bgType: 'gradient',
    bgColor: '#030712',
    bgGradient: 'linear-gradient(135deg, #090d16 0%, #030712 100%)',
    primaryColor: '#06b6d4',
    textColor: '#e0f2fe',
    accentColor: '#f43f5e',
    borderRadius: 4,
    defaultButtonStyle: '3d',
    cardShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
  },
  professional: {
    preset: 'professional',
    themeMode: 'dark',
    bgType: 'gradient',
    bgColor: '#111827',
    bgGradient: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
    primaryColor: '#60a5fa',
    textColor: '#f9fafb',
    accentColor: '#3b82f6',
    borderRadius: 12,
    defaultButtonStyle: 'outline',
    cardShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  gaming: {
    preset: 'gaming',
    themeMode: 'dark',
    bgType: 'gradient',
    bgColor: '#0a0012',
    bgGradient: 'linear-gradient(135deg, #18002e 0%, #0a0012 100%)',
    primaryColor: '#c026d3',
    textColor: '#faf5ff',
    accentColor: '#e11d48',
    borderRadius: 16,
    defaultButtonStyle: 'gradient',
    cardShadow: '0 0 25px rgba(192, 38, 211, 0.35)',
  },
};

export function getButtonStyleClasses(style: ButtonStyle): string {
  switch (style) {
    case 'rounded':
      return 'rounded-2xl bg-zinc-900/80 border border-zinc-700/60 hover:bg-zinc-800/90 shadow-md hover:scale-[1.01]';
    case 'glass':
      return 'backdrop-blur-md bg-white/[0.07] border border-white/15 hover:bg-white/[0.12] shadow-lg hover:shadow-xl hover:scale-[1.01]';
    case 'outline':
      return 'bg-transparent border-2 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/40';
    case 'neon':
      return 'bg-zinc-950/90 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:border-emerald-400';
    case 'gradient':
      return 'bg-gradient-to-r from-violet-600/90 via-fuchsia-600/90 to-pink-600/90 border border-white/20 shadow-lg hover:brightness-110 hover:scale-[1.01] text-white';
    case 'minimal':
      return 'bg-zinc-900 border-none shadow-none hover:bg-zinc-800';
    case 'card':
      return 'bg-zinc-900 border border-zinc-800/90 shadow-xl hover:bg-zinc-850 hover:border-zinc-700';
    case 'floating':
      return 'bg-zinc-900/90 border border-zinc-700/50 shadow-2xl hover:-translate-y-1 hover:shadow-zinc-700/20';
    case 'pill':
      return 'rounded-full bg-zinc-900/90 border border-zinc-700/60 hover:bg-zinc-800 hover:scale-[1.01]';
    case '3d':
      return 'bg-zinc-900 border border-zinc-700 border-b-4 border-b-zinc-950 active:border-b active:translate-y-1 hover:bg-zinc-850';
    case 'compact':
      return 'py-2 px-3 bg-zinc-900/70 border border-zinc-800 text-sm hover:bg-zinc-800';
    case 'classic':
    default:
      return 'bg-zinc-900/90 border border-zinc-700/80 shadow-md hover:bg-zinc-800 hover:scale-[1.01]';
  }
}
