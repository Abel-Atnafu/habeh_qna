'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAllMenuItemsAdmin,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from '@/lib/queries';
import { MenuItem, MENU_CATEGORIES } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import ImageUpload from '@/components/admin/ImageUpload';

/* ─── Schema ─────────────────────────────────────────────────────────────────── */
const menuSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  category:    z.string().min(1, 'Category is required'),
  price:       z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a valid price'),
  description: z.string().optional(),
  image_url:   z.string().nullable().optional(),
  is_fasting:  z.boolean(),
  is_veg:      z.boolean(),
  is_spicy:    z.boolean(),
  available:   z.boolean(),
  sort_order:  z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a valid number'),
});

type MenuFormValues = z.infer<typeof menuSchema>;

/* ─── Available Toggle ───────────────────────────────────────────────────────── */
function AvailableToggle({
  available,
  onChange,
}: {
  available: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!available)}
      className={cn(
        'relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none',
        available ? 'bg-terracotta' : 'bg-gray-200'
      )}
      aria-label="Toggle availability"
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          available ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

/* ─── Menu Modal ─────────────────────────────────────────────────────────────── */
function MenuModal({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(item);
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name:        item?.name                   ?? '',
      category:    item?.category               ?? MENU_CATEGORIES[1],
      price:       String(item?.price           ?? 0),
      description: item?.description            ?? '',
      image_url:   item?.image_url              ?? '',
      is_fasting:  item?.is_fasting             ?? false,
      is_veg:      item?.is_veg                 ?? false,
      is_spicy:    item?.is_spicy               ?? false,
      available:   item?.available              ?? true,
      sort_order:  String(item?.sort_order      ?? 0),
    },
  });

  const watchedAvailable = watch('available');

  async function onSubmit(values: MenuFormValues) {
    try {
      const payload = {
        ...values,
        price:       Number(values.price),
        sort_order:  Number(values.sort_order),
        image_url:   values.image_url   || null,
        description: values.description || null,
      };
      if (isEdit && item) {
        await updateItem.mutateAsync({ id: item.id, ...payload });
        toast.success('Menu item updated');
      } else {
        await createItem.mutateAsync(payload);
        toast.success('Menu item created');
      }
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Something went wrong');
    }
  }

  const labelClass = 'block text-sm font-medium text-espresso/70 mb-1';
  const inputClass =
    'w-full rounded-xl border border-espresso/15 px-3 py-2.5 text-sm text-espresso focus:outline-none focus:border-terracotta transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lift">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-espresso">
            {isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-espresso/40 hover:text-espresso transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Name *</label>
            <input {...register('name')} className={inputClass} placeholder="e.g. Shiro Wat" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category *</label>
            <select {...register('category')} className={inputClass}>
              {MENU_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>Price (Birr) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price')}
              className={inputClass}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              {...register('description')}
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="Brief description..."
            />
          </div>

          {/* Image */}
          <ImageUpload
            value={watch('image_url') ?? ''}
            onChange={(url) => setValue('image_url', url ?? '', { shouldDirty: true })}
            folder="menu"
            label="Image"
          />

          {/* Sort Order */}
          <div>
            <label className={labelClass}>Sort Order</label>
            <input
              type="number"
              min="0"
              {...register('sort_order')}
              className={inputClass}
              placeholder="0"
            />
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {(
              [
                { field: 'is_fasting', label: 'Fasting' },
                { field: 'is_veg',     label: 'Vegetarian' },
                { field: 'is_spicy',   label: 'Spicy' },
              ] as const
            ).map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 text-sm text-espresso cursor-pointer">
                <input
                  type="checkbox"
                  {...register(field)}
                  className="rounded border-espresso/20 text-terracotta focus:ring-terracotta"
                />
                {label}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm text-espresso cursor-pointer">
              <input
                type="checkbox"
                checked={watchedAvailable}
                onChange={(e) => setValue('available', e.target.checked)}
                className="rounded border-espresso/20 text-terracotta focus:ring-terracotta"
              />
              Available
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-espresso/15 text-sm text-espresso hover:bg-cream-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn btn-primary"
              style={{ padding: '10px 20px', fontSize: 14 }}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function MenuPage() {
  const { data: items = [], isLoading } = useAllMenuItemsAdmin();
  const updateItem  = useUpdateMenuItem();
  const deleteItem  = useDeleteMenuItem();

  const [modalItem, setModalItem] = useState<MenuItem | null | undefined>(undefined);
  // undefined = closed, null = new item, MenuItem = edit item

  function openCreate() { setModalItem(null); }
  function openEdit(item: MenuItem) { setModalItem(item); }
  function closeModal() { setModalItem(undefined); }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success('Item deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Delete failed');
    }
  }

  async function handleToggleAvailable(item: MenuItem) {
    try {
      await updateItem.mutateAsync({ id: item.id, available: !item.available });
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Update failed');
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-espresso">Menu Manager</h1>
        <button onClick={openCreate} className="btn btn-primary flex items-center gap-2" style={{ padding: '10px 20px', fontSize: 14 }}>
          <Plus size={16} />
          Add New Item
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-espresso/5 bg-cream-2/60">
                <th className="text-left px-4 py-3 text-espresso/50 font-medium w-8">#</th>
                <th className="text-left px-4 py-3 text-espresso/50 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-espresso/50 font-medium">Category</th>
                <th className="text-left px-4 py-3 text-espresso/50 font-medium">Price</th>
                <th className="text-center px-4 py-3 text-espresso/50 font-medium">Fasting</th>
                <th className="text-center px-4 py-3 text-espresso/50 font-medium">Veg</th>
                <th className="text-center px-4 py-3 text-espresso/50 font-medium">Spicy</th>
                <th className="text-center px-4 py-3 text-espresso/50 font-medium">Available</th>
                <th className="text-right px-4 py-3 text-espresso/50 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-espresso/40">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-espresso/40">
                    No menu items yet. Add your first item!
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-espresso/5 last:border-0 hover:bg-cream-2/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-espresso/40 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-espresso">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-espresso/50 truncate max-w-[180px]">{item.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-cream-2 text-espresso/70">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-espresso">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3 text-center">
                      {item.is_fasting ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-forest" />
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-espresso/10" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.is_veg ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-espresso/10" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.is_spicy ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                      ) : (
                        <span className="inline-block w-2 h-2 rounded-full bg-espresso/10" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AvailableToggle
                        available={item.available}
                        onChange={() => handleToggleAvailable(item)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-espresso/40 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-espresso/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalItem !== undefined && (
        <MenuModal item={modalItem} onClose={closeModal} />
      )}
    </div>
  );
}
