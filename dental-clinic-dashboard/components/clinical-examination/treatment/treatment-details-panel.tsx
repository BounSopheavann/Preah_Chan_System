'use client';

import { CalendarClock, ExternalLink, X } from 'lucide-react';
import type { TreatmentItem } from './treatment-data';
import { priorityBadgeColor, treatmentStatusBadgeColor } from './treatment-data';

interface TreatmentDetailsPanelProps {
  item: TreatmentItem | null;
  onClose: () => void;
  onEdit: (item: TreatmentItem) => void;
  onRemove: (item: TreatmentItem) => void;
}

export function TreatmentDetailsPanel({ item, onClose, onEdit, onRemove }: TreatmentDetailsPanelProps) {
  if (!item) {
    return (
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground"><CalendarClock className="size-6" /></div>
          <p className="mt-4 text-sm font-semibold text-foreground">No treatment selected</p>
          <p className="mt-1 text-xs text-muted-foreground">Click on a treatment item to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="mb-4 flex items-start justify-between">
          <div><h3 className="text-lg font-bold text-foreground">Treatment Details</h3><p className="text-xs text-muted-foreground">Treatment item record</p></div>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-3">
          <DetailField label="Procedure" value={item.procedure} />
          <DetailField label="Code" value={item.procedureCode || '—'} />
          <DetailField label="Linked Diagnosis" value={item.linkedDiagnosis} />
          <DetailField label="Tooth / Area" value={item.toothArea} />
          {item.toothSurface.length > 0 && <DetailField label="Surfaces" value={item.toothSurface.join(', ')} />}
          <DetailField label="Priority" value={<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeColor[item.priority]}`}>{item.priority}</span>} />
          <DetailField label="Status" value={<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${treatmentStatusBadgeColor[item.status]}`}>{item.status}</span>} />
          <DetailField label="Sequence" value={String(item.sequence)} />
          {item.treatmentPhase && <DetailField label="Phase" value={item.treatmentPhase} />}
          <DetailField label="Est. Duration" value={item.estimatedDuration} />
          <DetailField label="Quantity" value={String(item.quantity)} />
          <DetailField label="Unit Price" value={`$${item.unitPrice}`} />
          {item.discount > 0 && <DetailField label="Discount" value={`-$${item.discount}`} />}
          <DetailField label="Estimated Total" value={<span className="text-primary font-bold">${item.total}</span>} />
          <DetailField label="Dentist" value={item.dentist} />
        </div>
        {item.notes && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
            <p className="text-sm text-foreground">{item.notes}</p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => onEdit(item)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/70 px-3 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30">Edit</button>
          <button type="button" onClick={() => onRemove(item)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">Remove</button>
        </div>
      </section>

      {(item.linkedOdontogramFinding || item.linkedXrayImage) && (
        <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 text-sm font-bold text-foreground">Linked Clinical Evidence</h3>
          <div className="space-y-2">
            <EvidenceLink label="Diagnosis" value={`${item.linkedDiagnosis} (${item.toothArea})`} />
            {item.linkedOdontogramFinding && <EvidenceLink label="Odontogram" value={item.linkedOdontogramFinding} />}
            {item.linkedXrayImage && <EvidenceLink label="X-ray" value={item.linkedXrayImage} />}
          </div>
        </section>
      )}
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

function EvidenceLink({ label, value }: { label: string; value: string }) {
  return (
    <button type="button" className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-left transition-all hover:bg-muted/60 dark:bg-background/20">
      <span className="rounded-full bg-primary/10 p-1.5 text-primary"><ExternalLink className="size-3.5" /></span>
      <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold text-foreground">{value}</p></div>
    </button>
  );
}