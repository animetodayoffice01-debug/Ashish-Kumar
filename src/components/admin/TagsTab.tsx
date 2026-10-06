import React, { useState } from 'react';
import { Tag, LinkItem } from '../../types';
import { Plus, Tag as TagIcon, Trash2, Edit, Check } from 'lucide-react';

interface Props {
  tags: Tag[];
  links: LinkItem[];
  onUpdateTags: (tags: Tag[]) => Promise<void>;
}

export const TagsTab: React.FC<Props> = ({ tags, links, onUpdateTags }) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8b5cf6');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // Count usage of each tag
  const getTagUsage = (tagName: string) => {
    return links.filter((l) => !l.deletedAt && l.tags && l.tags.includes(tagName)).length;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const clean = newTagName.trim().replace(/^#/, '');
    if (tags.some((t) => t.name.toLowerCase() === clean.toLowerCase())) {
      alert('Tag already exists');
      return;
    }
    const newTag: Tag = {
      id: 'tag_' + Date.now(),
      name: clean,
      color: newTagColor,
    };
    await onUpdateTags([...tags, newTag]);
    setNewTagName('');
  };

  const handleDelete = async (id: string, name: string) => {
    const usage = getTagUsage(name);
    if (usage > 0) {
      if (!window.confirm(`Tag is assigned to ${usage} link(s). Remove tag from system?`)) return;
    }
    await onUpdateTags(tags.filter((t) => t.id !== id));
  };

  const handleStartEdit = (t: Tag) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditColor(t.color);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const updated = tags.map((t) =>
      t.id === id ? { ...t, name: editName.trim().replace(/^#/, ''), color: editColor } : t
    );
    await onUpdateTags(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Tag System</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
            {tags.length}
          </span>
        </h2>
        <p className="text-xs text-zinc-400">
          Tag links with topics like #AI, #Free, #YouTube, #Tutorial for smart filtering and search.
        </p>
      </div>

      {/* Add New Tag Card */}
      <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name (e.g. Photoshop, AI, Workflow)..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tag</span>
          </button>
        </div>
      </form>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tags.map((t) => {
          const usage = getTagUsage(t.name);
          const isEditing = editingId === t.id;

          return (
            <div
              key={t.id}
              className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-2 shadow-xs"
            >
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-6 h-6 rounded border-0 p-0 cursor-pointer"
                  />
                  <button
                    onClick={() => handleSaveEdit(t.id)}
                    className="p-1 rounded bg-emerald-600 text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: t.color || '#8b5cf6' }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">#{t.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {usage} {usage === 1 ? 'link' : 'links'} tagged
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 shrink-0">
                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(t)}
                    className="p-1 text-zinc-500 hover:text-white"
                    title="Edit Tag"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  className="p-1 text-zinc-500 hover:text-rose-400"
                  title="Delete Tag"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
