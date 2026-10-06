import React, { useState } from 'react';
import { Category, LinkItem } from '../../types';
import { POPULAR_ICONS, getIconComponent } from '../../lib/icons';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, FolderTree } from 'lucide-react';

interface Props {
  categories: Category[];
  links: LinkItem[];
  onUpdateCategories: (categories: Category[]) => Promise<void>;
}

export const CategoriesTab: React.FC<Props> = ({ categories, links, onUpdateCategories }) => {
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('#8b5cf6');

  // Count links per category
  const getCategoryCount = (id: string) => {
    return links.filter((l) => !l.deletedAt && l.categoryId === id).length;
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Folder');
    setColor('#8b5cf6');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updated: Category[];
    if (editingCategory?.id) {
      updated = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, name: name.trim(), icon, color } : c
      );
    } else {
      const newCat: Category = {
        id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: name.trim(),
        icon,
        color,
        order: categories.length + 1,
        hidden: false,
      };
      updated = [...categories, newCat];
    }

    await onUpdateCategories(updated);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const count = getCategoryCount(id);
    if (count > 0) {
      if (
        !window.confirm(
          `This category has ${count} link(s). Deleting it will keep the links uncategorized. Continue?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm('Delete this category?')) return;
    }
    const updated = categories.filter((c) => c.id !== id);
    await onUpdateCategories(updated);
  };

  const handleToggleHidden = async (id: string) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, hidden: !c.hidden } : c));
    await onUpdateCategories(updated);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const updated = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    const reordered = updated.map((c, i) => ({ ...c, order: i + 1 }));
    await onUpdateCategories(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Link Categories</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
              {categories.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Organize links into interactive filter pills for your Instagram visitors.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat, idx) => {
          const IconComp = getIconComponent(cat.icon);
          const linkCount = getCategoryCount(cat.id);

          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/10"
                  style={{ backgroundColor: `${cat.color}25` }}
                >
                  <IconComp className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white truncate">{cat.name}</h4>
                    {cat.hidden && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-zinc-800 text-zinc-400 font-bold">
                        HIDDEN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                    {linkCount} {linkCount === 1 ? 'link' : 'links'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === categories.length - 1}
                  className="p-1 rounded text-zinc-500 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleHidden(cat.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title={cat.hidden ? 'Show on Public Site' : 'Hide from Public Site'}
                >
                  {cat.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="Edit Category"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingCategory?.id ? 'Edit Category' : 'Create New Category'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. YouTube Videos, Free Tools, Presets"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Icon</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
                >
                  {POPULAR_ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
