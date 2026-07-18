'use client';

import { Camera, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CapturePhotoPlaceholderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CapturePhotoPlaceholder({ isOpen, onClose }: CapturePhotoPlaceholderProps) {
  const [captured, setCaptured] = useState(false);

  if (!isOpen) return null;

  const handleCapture = () => {
    setCaptured(true);
  };

  const handleRetake = () => {
    setCaptured(false);
  };

  const handleSave = () => {
    setCaptured(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Capture Photo</h2>
            <p className="text-sm text-muted-foreground">Use your camera to take a clinical photo.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <Camera className="size-3.5" />
            UI Preview
          </span>
        </div>

        {/* Camera preview placeholder */}
        <div className="mb-4 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-slate-800 to-slate-900">
          {captured ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Camera className="size-10 text-white/60" />
              </div>
              <span className="text-sm font-semibold text-white/60">Photo captured (preview)</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Ready to save
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex size-24 items-center justify-center rounded-full bg-white/5 backdrop-blur-sm ring-4 ring-white/10">
                <Camera className="size-10 text-white/40" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white/70">Camera Preview</p>
                <p className="mt-1 text-sm text-white/40">
                  Camera functionality is not available in this preview.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-400">Camera idle</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          {captured ? (
            <>
              <Button variant="outline" onClick={handleRetake}>
                <RotateCcw className="size-4" />
                Retake
              </Button>
              <Button onClick={handleSave}>Save Photo</Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCapture}>
                <Camera className="size-4" />
                Capture
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}