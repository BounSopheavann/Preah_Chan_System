'use client';

import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { imageTypeOptions } from './image-data';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [imageType, setImageType] = useState('Periapical');
  const [toothNumber, setToothNumber] = useState('');
  const [imageDate, setImageDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles].slice(0, 5));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    // UI-only: simulate upload
    onClose();
    setFiles([]);
    setToothNumber('');
    setNotes('');
    setImageType('Periapical');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Upload Image</h2>
            <p className="text-sm text-muted-foreground">Add diagnostic images to the patient record.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drag & drop area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-4 flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50'
          }`}
        >
          <div className="flex flex-col items-center gap-3 p-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="size-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                Drop files here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, JPEG, WEBP, PDF · Max 20 MB
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
              <Upload className="size-4" />
              Browse Files
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Selected files */}
        {files.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary uppercase">
                    {file.name.split('.').pop()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form fields */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Image Type
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
            >
              {imageTypeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Tooth Number <span className="text-[10px] font-normal text-muted-foreground/70">(optional)</span>
            <input
              type="text"
              value={toothNumber}
              onChange={(e) => setToothNumber(e.target.value)}
              placeholder="e.g. 26, 24-27"
              className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground/50"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Image Date
            <input
              type="date"
              value={imageDate}
              onChange={(e) => setImageDate(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
            />
          </label>
        </div>

        <label className="mb-6 flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
          Notes <span className="text-[10px] font-normal text-muted-foreground/70">(optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add clinical notes for this image..."
            className="min-h-20 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground/50"
          />
        </label>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0}>
            <Upload className="size-4" />
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}