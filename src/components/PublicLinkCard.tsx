import React, { memo, useState } from 'react';
import { LinkItem, ButtonStyle } from '../types';
import { getIconComponent } from '../lib/icons';
import { getButtonStyleClasses } from '../lib/theme';
import { ExternalLink, Star, Sparkles, ShieldAlert } from 'lucide-react';

interface Props {
  link: LinkItem;
  defaultButtonStyle: ButtonStyle;
  animationsEnabled: boolean;
  onLinkClick: (link: LinkItem) => void;
}

export const PublicLinkCard: React.FC<Props> = memo(({
  link,
  defaultButtonStyle,
  animationsEnabled,
  onLinkClick,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const IconComp = getIconComponent(link.icon);
  const buttonStyle = link.buttonStyle || defaultButtonStyle;
  const styleClasses = getButtonStyleClasses(buttonStyle);

  const handleClick = (e: React.MouseEvent) => {
    if (link.confirmBeforeOpening) {
      e.preventDefault();
      setShowConfirm(true);
      return;
    }
    onLinkClick(link);
  };

  const handleConfirmedOpen = () => {
    setShowConfirm(false);
    onLinkClick(link);
    window.open(link.url, link.openNewTab ? '_blank' : '_self', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className={`relative w-full group transition-all duration-200 ${
          animationsEnabled ? 'hover:-translate-y-0.5' : ''
        }`}
      >
        <a
          href={link.url}
          target={link.openNewTab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          onClick={handleClick}
          style={{
            borderRadius: link.borderRadius ? `${link.borderRadius}px` : undefined,
          }}
          className={`flex items-center gap-3.5 p-3.5 w-full text-left relative overflow-hidden transition-all duration-200 ${styleClasses}`}
        >
          {/* Accent or Special Colored Left Indicator */}
          {link.buttonColor && (
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full opacity-80 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: link.buttonColor }}
            />
          )}

          {/* Thumbnail / Icon / Emoji */}
          <div className="shrink-0 flex items-center justify-center">
            {link.thumbnailUrl ? (
              <img
                src={link.thumbnailUrl}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-sm"
              />
            ) : link.emoji ? (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-white/10"
                style={{ backgroundColor: link.buttonColor ? `${link.buttonColor}20` : 'rgba(255,255,255,0.08)' }}
              >
                <span>{link.emoji}</span>
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white/90 shadow-sm border border-white/10"
                style={{ backgroundColor: link.buttonColor ? `${link.buttonColor}25` : 'rgba(255,255,255,0.08)' }}
              >
                <IconComp className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              {link.featured && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Star className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                  FEATURED
                </span>
              )}
              {link.newBadge && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  NEW
                </span>
              )}
              {link.sponsoredLabel && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded bg-zinc-700/60 text-zinc-300 uppercase">
                  Sponsored
                </span>
              )}
              {link.badge && link.badgeText && (
                <span
                  className="px-2 py-0.5 text-[10px] font-bold rounded-md shadow-xs border"
                  style={{
                    backgroundColor: link.buttonColor ? `${link.buttonColor}25` : 'rgba(236,72,153,0.2)',
                    borderColor: link.buttonColor ? `${link.buttonColor}40` : 'rgba(236,72,153,0.3)',
                    color: link.buttonColor || '#ec4899',
                  }}
                >
                  {link.badgeText}
                </span>
              )}
            </div>

            <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate tracking-tight">
              {link.title}
            </h4>

            {link.description && (
              <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 font-normal leading-relaxed">
                {link.description}
              </p>
            )}

            {/* Tags preview */}
            {link.tags && link.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {link.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.2 rounded-sm bg-white/5 text-zinc-400 border border-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* External arrow indicator */}
          <div className="shrink-0 p-1 rounded-lg text-zinc-500 group-hover:text-zinc-200 transition-colors">
            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          </div>
        </a>
      </div>

      {/* Confirmation Modal if enabled for sensitive/download link */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl text-left">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">Leaving BioLink Hub</h4>
            </div>
            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              You are about to visit an external website:
              <br />
              <strong className="text-zinc-100 font-mono text-[11px] break-all">{link.url}</strong>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedOpen}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-md transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
