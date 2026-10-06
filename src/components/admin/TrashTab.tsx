import React, { useState } from 'react';
import { LinkItem } from '../../types';
import { Trash2, RotateCcw, AlertTriangle, Check } from 'lucide-react';

interface Props {
  trashLinks: LinkItem[];
  onRestoreLink: (id: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
}

export const TrashTab: React.FC<Props> = ({
  trashLinks,
  onRestoreLink,
  onPermanentDelete,
  onEmptyTrash,
}) => {
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEmpty = async () => {
    setIsProcessing(true);
    try {
      await onEmptyTrash();
      setShowConfirmEmpty(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Recycle Bin (Trash)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
              {trashLinks.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Deleted links are preserved here and can be restored or permanently removed.
          </p>
        </div>

        {trashLinks.length > 0 && (
          <button
            onClick={() => setShowConfirmEmpty(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {trashLinks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-xs">
          <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <span>The Recycle Bin is currently empty.</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {trashLinks.map((link) => (
            <div
              key={link.id}
              className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-200 truncate">
                  {link.title}
                </h4>
                <p className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">{link.url}</p>
                {link.deletedAt && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Deleted {new Date(link.deletedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onRestoreLink(link.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-emerald-400 border border-zinc-700 transition"
                  title="Restore Link"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Permanently delete "${link.title}"? This cannot be undone.`)) {
                      onPermanentDelete(link.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 border border-zinc-700 transition"
                  title="Permanently Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Trash Confirmation Modal */}
      {showConfirmEmpty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Empty Trash</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete all <strong>{trashLinks.length}</strong> items in the Recycle Bin? This action is irreversible.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowConfirmEmpty(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEmpty}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Empty Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
