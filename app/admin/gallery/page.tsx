'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGallery, useCreateGalleryItem, useDeleteGalleryItem } from '@/lib/queries';

export default function GalleryPage() {
  const { data: gallery = [], isLoading } = useGallery();
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ url: '', caption: '' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) return;
    try {
      await createItem.mutateAsync({
        url: formData.url.trim(),
        image_url: formData.url.trim(),
        caption: formData.caption.trim() || null,
        sort_order: gallery.length + 1,
      });
      toast.success('Image added to gallery');
      setFormData({ url: '', caption: '' });
      setShowForm(false);
    } catch {
      toast.error('Failed to add image');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
      toast.success('Image removed');
      setConfirmDelete(null);
    } catch {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-espresso">Gallery Manager</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Image
        </button>
      </div>

      {/* Add image form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lift">
            <h2 className="font-display text-xl text-espresso mb-6">Add Gallery Image</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-espresso/70 mb-1">Image URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  required
                  className="w-full border border-espresso/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-espresso/70 mb-1">Caption</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Optional caption..."
                  className="w-full border border-espresso/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-terracotta"
                />
              </div>
              {formData.url && (
                <div className="rounded-xl overflow-hidden h-40 bg-cream-2">
                  <img src={formData.url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createItem.isPending} className="btn btn-primary flex-1 text-sm">
                  {createItem.isPending ? 'Adding...' : 'Add Image'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormData({ url: '', caption: '' }); }}
                  className="btn btn-dark text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden bg-cream-2 shadow-card">
              <img
                src={item.image_url || item.url}
                alt={item.caption || ''}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-espresso/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => setConfirmDelete(item.id)}
                  className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  aria-label="Delete image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {item.caption && (
                <div className="px-3 py-2 bg-white text-xs text-espresso/70 truncate">{item.caption}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {gallery.length === 0 && !isLoading && (
        <div className="text-center py-16 text-espresso/40">
          <p className="text-lg">No images yet</p>
          <p className="text-sm mt-1">Add your first gallery image above</p>
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-lift">
            <p className="text-espresso font-medium mb-2">Delete this image?</p>
            <p className="text-espresso/60 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="btn flex-1 bg-red-500 text-white text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn btn-dark flex-1 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
