'use client';

import { CalendarClock, X } from 'lucide-react';
import type { PrescriptionRecord } from './prescription-data';
import { PrescriptionStatusBadge } from './prescription-status-badge';

export function PrescriptionDetailsPanel({
  prescription,
  onClose,
}: {
  prescription: PrescriptionRecord | null;
  onClose: () => void;
}) {
  if (!prescription) {
    return (
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <CalendarClock className="size-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">No prescription selected</p>
          <p className="mt-1 text-xs text-muted-foreground">Click a prescription to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Prescription Details</h3>
            <p className="text-xs text-muted-foreground">{prescription.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <DetailField label="Date" value={prescription.prescriptionDate} />
          <DetailField label="Patient" value={`${prescription.patientName} (${prescription.patientCode})`} />
          <DetailField label="Prescriber" value={prescription.prescriber} />
          <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
            <div className="mt-1"><PrescriptionStatusBadge status={prescription.status} /></div>
          </div>
          {prescription.linkedDiagnosis && (
            <DetailField label="Linked Diagnosis" value={prescription.linkedDiagnosis} />
          )}
          {prescription.linkedTreatment && (
            <DetailField label="Linked Treatment" value={prescription.linkedTreatment} />
          )}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Medications</p>
          <div className="space-y-2">
            {prescription.medications.map((med) => (
              <div key={med.id} className="rounded-xl border border-border bg-muted/30 p-3 dark:bg-background/20">
                <p className="text-sm font-semibold text-foreground">
                  {med.medicationName} <span className="text-xs font-normal text-muted-foreground">{med.strength}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {med.dosage} · {med.frequency} · {med.route} · {med.duration}
                </p>
                {med.instructions && (
                  <p className="mt-1 text-xs text-muted-foreground">Instructions: {med.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {prescription.clinicalNotes && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Clinical Notes</p>
            <p className="text-sm text-foreground">{prescription.clinicalNotes}</p>
          </div>
        )}

        {prescription.amendments.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amendment History</p>
            <div className="space-y-2">
              {prescription.amendments.map((am, i) => (
                <div key={i} className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs dark:border-amber-500/30 dark:bg-amber-500/10">
                  <p className="font-semibold text-foreground">{am.reason}</p>
                  <p className="mt-1 text-muted-foreground">{am.content}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Amended by {am.amendedBy} · {am.amendmentDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}