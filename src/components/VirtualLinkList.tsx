import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { LinkItem, ButtonStyle } from '../types';
import { PublicLinkCard } from './PublicLinkCard';
import { SearchX, ChevronDown } from 'lucide-react';

interface Props {
  links: LinkItem[];
  defaultButtonStyle: ButtonStyle;
  animationsEnabled: boolean;
  onLinkClick: (link: LinkItem) => void;
  layoutMode?: 'list' | 'grid2';
}

const CHUNK_SIZE = 40;

export const VirtualLinkList: React.FC<Props> = memo(({
  links,
  defaultButtonStyle,
  animationsEnabled,
  onLinkClick,
  layoutMode = 'list',
}) => {
  const [renderedCount, setRenderedCount] = useState<number>(CHUNK_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset slice count when links filter changes
  useEffect(() => {
    setRenderedCount(CHUNK_SIZE);
  }, [links]);

  // Infinite intersection observer for virtual progressive rendering
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && renderedCount < links.length) {
          setRenderedCount((prev) => Math.min(prev + CHUNK_SIZE, links.length));
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [renderedCount, links.length]);

  const visibleLinks = useMemo(() => {
    return links.slice(0, renderedCount);
  }, [links, renderedCount]);

  if (links.length === 0) {
    return (
      <div className="py-12 px-4 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-xs my-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mx-auto mb-3 text-zinc-400">
          <SearchX className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-200">No links found</h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
          Try a different search query or select another category above.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className={layoutMode === 'grid2' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'flex flex-col gap-3'}>
        {visibleLinks.map((link) => (
          <PublicLinkCard
            key={link.id}
            link={link}
            defaultButtonStyle={defaultButtonStyle}
            animationsEnabled={animationsEnabled}
            onLinkClick={onLinkClick}
          />
        ))}
      </div>

      {/* Sentinel observer for lazy rendering of thousands of links */}
      {renderedCount < links.length && (
        <div ref={sentinelRef} className="pt-4 pb-2 text-center">
          <button
            onClick={() => setRenderedCount((prev) => Math.min(prev + CHUNK_SIZE * 2, links.length))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-800/70 hover:bg-zinc-700/80 text-xs font-medium text-zinc-300 border border-zinc-700/40 transition"
          >
            <span>Showing {renderedCount} of {links.length} links</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
});
