'use client';

import { CalendarClock, User } from 'lucide-react';
import type { XrayImage } from './image-data';
import { imageTypeBadgeColor, imageTagBadgeColor } from './image-data';

interface ImageDetailsPanelProps {
  image: XrayImage | null;
}

export function ImageDetailsPanel({ image }: ImageDetailsPanelProps) {
  if (!image) {
    return (
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <CalendarClock className="size-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">No image selected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click on an image to view details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image Info */}
      <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-4 text-lg font-bold text-foreground">Image Information</h3>

        <div className="space-y-3">
          <DetailField label="Image Name" value={image.name} />
          <DetailField
            label="Image Type"
            value={
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${imageTypeBadgeColor[image.type]}`}>
                {image.type}
              </span>
            }
          />
          <DetailField label="Patient Name" value={image.patientName} />
          <DetailField
            label="Tooth Number"
            value={image.toothNumber ?? '—'}
          />
          <DetailField label="Upload Date" value={image.uploadDate} />
          <DetailField label="Uploaded By" value={image.uploadedBy} />
          <DetailField label="File Size" value={image.fileSize} />
          <DetailField label="Resolution" value={image.resolution} />
          <DetailField
            label="Status"
            value={
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                image.status === 'Final'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : image.status === 'Preliminary'
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                  : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300'
              }`}>
                {image.status}
              </span>
            }
          />

          {image.tags.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {image.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${imageTagBadgeColor[tag]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-3 text-sm font-bold text-foreground">Clinical Notes</h3>
        <textarea
          defaultValue={image.notes}
          rows={4}
          className="min-h-24 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
          placeholder="Add clinical notes..."
        />
      </section>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}