'use client';

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { XrayImage } from './image-data';
import { imageTypeBadgeColor } from './image-data';

interface ImageViewerModalProps {
  image: XrayImage;
  images: XrayImage[];
  onClose: () => void;
  onNavigate: (image: XrayImage) => void;
}

export function ImageViewerModal({ image, images, onClose, onNavigate }: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFitToScreen, setIsFitToScreen] = useState(true);

  const currentIndex = images.findIndex((img) => img.id === image.id);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(images[currentIndex - 1]);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(images[currentIndex + 1]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images, onClose, onNavigate]);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setIsFitToScreen(true);
  }, [image.id]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
    setIsFitToScreen(false);
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
    setIsFitToScreen(false);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleFitToScreen = () => {
    setIsFitToScreen(true);
    setZoom(1);
    setRotation(0);
  };

  const handleActualSize = () => {
    setIsFitToScreen(false);
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-50 flex size-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      {/* Navigation - Previous */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={() => onNavigate(images[currentIndex - 1])}
          className="absolute left-4 top-1/2 z-50 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      {/* Navigation - Next */}
      {currentIndex < images.length - 1 && (
        <button
          type="button"
          onClick={() => onNavigate(images[currentIndex + 1])}
          className="absolute right-4 top-1/2 z-50 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      {/* Image container */}
      <div className="flex max-h-[80vh] max-w-[85vw] items-center justify-center overflow-hidden">
        <div
          className="flex items-center justify-center transition-all duration-300"
          style={{
            transform: `scale(${isFitToScreen ? 1 : zoom}) rotate(${rotation}deg)`,
          }}
        >
          <div className={`flex size-64 items-center justify-center rounded-3xl bg-gradient-to-br ${image.thumbnailColor} shadow-2xl`}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm">
                <span className="text-4xl font-bold text-white drop-shadow-lg">
                  {image.type === 'Periapical' || image.type === 'Bitewing' ? 'X' :
                   image.type === 'Panoramic' ? 'P' :
                   image.type === 'CBCT' ? '3D' :
                   image.type === 'Clinical Photo' || image.type === 'Intraoral Photo' || image.type === 'Extraoral Photo' ? '📷' : '📋'}
                </span>
              </div>
              <span className="text-sm font-semibold text-white/80">{image.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image info overlay */}
      <div className="absolute bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-center text-sm text-white backdrop-blur-sm">
        <span className="font-semibold">{image.name}</span>
        <span className="mx-2 text-white/40">·</span>
        <span className="text-white/70">{image.type}</span>
        <span className="mx-2 text-white/40">·</span>
        <span className="text-white/70">
          {currentIndex + 1} of {images.length}
        </span>
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
        <button
          type="button"
          onClick={handleZoomIn}
          className="flex size-9 items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white"
          title="Zoom In"
        >
          <ZoomIn className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="flex size-9 items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white"
          title="Zoom Out"
        >
          <ZoomOut className="size-4" />
        </button>
        <span className="h-6 w-px bg-white/10" />
        <button
          type="button"
          onClick={handleRotateLeft}
          className="flex size-9 items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white"
          title="Rotate Left"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleRotateRight}
          className="flex size-9 items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white"
          title="Rotate Right"
        >
          <RotateCw className="size-4" />
        </button>
        <span className="h-6 w-px bg-white/10" />
        <button
          type="button"
          onClick={handleFitToScreen}
          className={`flex size-9 items-center justify-center rounded-xl transition-all ${
            isFitToScreen ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          title="Fit to Screen"
        >
          <Maximize2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleActualSize}
          className={`flex size-9 items-center justify-center rounded-xl transition-all ${
            !isFitToScreen && zoom === 1 ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          title="Actual Size"
        >
          <Minimize2 className="size-4" />
        </button>
        <span className="h-6 w-px bg-white/10" />
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white"
          title="Download"
        >
          <Download className="size-4" />
        </button>
      </div>
    </div>
  );
}