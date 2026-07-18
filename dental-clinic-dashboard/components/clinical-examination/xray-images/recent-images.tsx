'use client';

import { Clock3 } from 'lucide-react';
import type { XrayImage } from './image-data';

interface RecentImagesProps {
  images: XrayImage[];
  onSelect: (image: XrayImage) => void;
  selectedImageId: string | null;
}

export function RecentImages({ images, onSelect, selectedImageId }: RecentImagesProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Recent Images</h3>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Last 5</span>
      </div>

      <div className="space-y-2">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onSelect(image)}
            className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all hover:bg-muted/50 ${
              selectedImageId === image.id
                ? 'border-primary/40 bg-primary/5'
                : 'border-transparent bg-muted/30'
            }`}
          >
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${image.thumbnailColor} text-xs font-bold text-white`}>
              {image.type === 'Periapical' || image.type === 'Bitewing' ? 'X' :
               image.type === 'Panoramic' ? 'P' :
               image.type === 'CBCT' ? '3D' : '📷'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{image.name}</p>
              <p className="text-xs text-muted-foreground">{image.type}</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock3 className="size-3" />
              <span>{image.uploadDate === 'Today, 10:30 AM' || image.uploadDate === 'Today, 10:25 AM' ? 'Today' :
                     image.uploadDate === 'Yesterday, 3:15 PM' || image.uploadDate === 'Yesterday, 2:45 PM' ? 'Yesterday' : '2 weeks ago'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}