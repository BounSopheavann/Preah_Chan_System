'use client';

import { CalendarClock, ExternalLink, X } from 'lucide-react';
import type { DiagnosisRecord } from './diagnosis-data';
import {
  priorityBadgeColor,
  severityBadgeColor,
  sourceBadgeColor,
  statusBadgeColor,
} from './diagnosis-data';

interface DiagnosisDetailsPanelProps {
  diagnosis: DiagnosisRecord | null;
  onClose: () => void;
  onResolve: (diagnosis: DiagnosisRecord) => void;
  onAddToTreatmentPlan: (diagnosis: DiagnosisRecord) => void;
}

export function DiagnosisDetailsPanel({
  diagnosis,
  onClose,
  onResolve,
  onAddToTreatmentPlan,
}: DiagnosisDetailsPanelProps) {
  if (!diagnosis) {
    return (
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <CalendarClock className="size-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">No diagnosis selected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click on a diagnosis to view details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Diagnosis Details</h3>
            <p className="text-xs text-muted-foreground">Clinical diagnosis record</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <DetailField label="Diagnosis" value={diagnosis.diagnosisName} />
          <DetailField label="Code" value={diagnosis.diagnosisCode || '—'} />
          <DetailField label="Tooth / Area" value={diagnosis.toothNumber} />
          {diagnosis.toothSurface.length > 0 && (
            <DetailField label="Surfaces" value={diagnosis.toothSurface.join(', ')} />
          )}
          <DetailField
            label="Severity"
            value={<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${severityBadgeColor[diagnosis.severity]}`}>{diagnosis.severity}</span>}
          />
          <DetailField
            label="Priority"
            value={<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeColor[diagnosis.priority]}`}>{diagnosis.priority}</span>}
          />
          <DetailField
            label="Status"
            value={<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeColor[diagnosis.status]}`}>{diagnosis.status}</span>}
          />
          <DetailField
            label="Source"
            value={<span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sourceBadgeColor[diagnosis.source]}`}>{diagnosis.source}</span>}
          />
          <DetailField label="Date Identified" value={diagnosis.dateIdentified} />
          <DetailField label="Diagnosed By" value={diagnosis.diagnosedBy} />

          {diagnosis.resolutionDate && (
            <DetailField label="Resolution Date" value={diagnosis.resolutionDate} />
          )}
        </div>

        {/* Clinical Notes */}
        {diagnosis.clinicalNotes && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Clinical Notes</p>
            <p className="text-sm text-foreground">{diagnosis.clinicalNotes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {diagnosis.status !== 'Resolved' && (
            <button
              type="button"
              onClick={() => onResolve(diagnosis)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
            >
              Mark as Resolved
            </button>
          )}
          <button
            type="button"
            onClick={() => onAddToTreatmentPlan(diagnosis)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
          >
            Add to Treatment Plan
          </button>
        </div>
      </section>

      {/* Linked Evidence */}
      <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-3 text-sm font-bold text-foreground">Linked Evidence</h3>
        <div className="space-y-2">
          {diagnosis.linkedOdontogramFinding && (
            <EvidenceLink label="Odontogram" value={diagnosis.linkedOdontogramFinding} />
          )}
          {diagnosis.linkedXrayImage && (
            <EvidenceLink label="X-ray" value={diagnosis.linkedXrayImage} />
          )}
          {diagnosis.linkedClinicalFinding && (
            <EvidenceLink label="Clinical Finding" value={diagnosis.linkedClinicalFinding} />
          )}
          {!diagnosis.linkedOdontogramFinding && !diagnosis.linkedXrayImage && !diagnosis.linkedClinicalFinding && (
            <p className="text-xs text-muted-foreground">No linked evidence records.</p>
          )}
        </div>
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

function EvidenceLink({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-left transition-all hover:bg-muted/60 dark:bg-background/20"
    >
      <span className="rounded-full bg-primary/10 p-1.5 text-primary">
        <ExternalLink className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </button>
  );
}