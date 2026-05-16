'use client';

import { useRef, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const BUCKET = 'yeroo-uploads';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label = 'Image',
  className,
}: ImageUploadProps) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sb = getSupabaseClient();

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP images are allowed.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Image is too large (max 5 MB).');
      return;
    }

    setBusy(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const safeName = `${crypto.randomUUID()}.${ext.toLowerCase()}`;
      const path = `${folder}/${safeName}`;

      const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success('Image uploaded');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="block text-sm font-medium text-espresso/70">{label}</span>

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-espresso/10 bg-cream-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-espresso/80 text-cream hover:bg-espresso transition-colors"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer',
            'border-espresso/20 bg-cream-2/40 hover:bg-cream-2 hover:border-terracotta/50 transition-colors',
            'h-40 text-center px-4',
            busy && 'opacity-60 cursor-wait',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            disabled={busy}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {busy ? (
            <>
              <Loader2 size={22} className="text-terracotta animate-spin" />
              <span className="text-xs text-espresso/60">Uploading…</span>
            </>
          ) : (
            <>
              <UploadCloud size={24} className="text-terracotta/80" />
              <span className="text-sm text-espresso/70 font-medium">
                Click or drop an image
              </span>
              <span className="text-[11px] text-espresso/40">JPG, PNG or WebP · max 5 MB</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
