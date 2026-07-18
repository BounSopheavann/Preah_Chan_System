'use client';

import {
  Download,
  Edit3,
  Eye,
  Heart,
  RotateCcw,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { useState } from 'react';
import type { XrayImage } from './image-data';
import { imageTypeBadgeColor, imageTagBadgeColor } from './image-data';

interface ImageCardProps {
  image: XrayImage;
  onView: (image: XrayImage) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ImageCard({ image, onView, onToggleFavorite, onDelete }: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${image.thumbnailColor} opacity-30`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white drop-shadow-md">
                {image.type === 'Periapical' || image.type === 'Bitewing' ? 'X' :
                 image.type === 'Panoramic' ? 'P' :
                 image.type === 'CBCT' ? '3D' :
                 image.type === 'Clinical Photo' || image.type === 'Intraoral Photo' || image.type === 'Extraoral Photo' ? '📷' : '📋'}
              </span>
            </div>
          </div>
        </div>

        {/* Image type badge */}
        <div className="absolute left-2 top-2 z-10">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${imageTypeBadgeColor[image.type]}`}>
            {image.type}
          </span>
        </div>

        {/* Tags */}
        {image.tags.length > 0 && (
          <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
            {image.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${imageTagBadgeColor[tag]}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(image.id); }}
          className="absolute bottom-2 left-2 z-10 flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-muted-foreground backdrop-blur-sm transition-all hover:bg-background hover:text-rose-500"
        >
          <Heart className={`size-3.5 ${image.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Hover actions overlay */}
        {isHovered && (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm transition-all">
            <button
              type="button"
              onClick={() => onView(image)}
              className="flex size-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-lg transition-all hover:bg-white hover:scale-110"
              title="View"
            >
              <Eye className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-lg transition-all hover:bg-white hover:scale-110"
              title="Zoom"
            >
              <ZoomIn className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-lg transition-all hover:bg-white hover:scale-110"
              title="Download"
            >
              <Download className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl bg-white/90 text-slate-800 shadow-lg transition-all hover:bg-white hover:scale-110"
              title="Edit Information"
            >
              <Edit3 className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
              className="flex size-9 items-center justify-center rounded-xl bg-rose-500/90 text-white shadow-lg transition-all hover:bg-rose-500 hover:scale-110"
              title="Delete"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{image.name}</p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{image.uploadDate}</span>
          {image.toothNumber && (
            <span className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-semibold text-foreground">
              Tooth {image.toothNumber}
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground">
          Uploaded by {image.uploadedBy}
        </div>
      </div>
    </div>
  );
}