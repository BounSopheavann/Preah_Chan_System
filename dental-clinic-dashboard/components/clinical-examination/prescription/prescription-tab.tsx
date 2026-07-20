'use client';

import { FileText, History, Plus, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PATIENT, PRESCRIBER, todayLabel } from '../patient-context';
import {
  dummyPrescriptions,
  type PrescriptionMedication,
  type PrescriptionRecord,
} from './prescription-data';
import { PatientSafetyPanel } from './patient-safety-panel';
import { PrescriptionEditor } from './prescription-editor';
import { MedicationList } from './medication-list';
import { PrescriptionHistory } from './prescription-history';
import { PrescriptionDetailsPanel } from './prescription-details-panel';
import { PrescriptionPrintPreview } from './prescription-print-preview';

export function PrescriptionTab() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(dummyPrescriptions);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selected, setSelected] = useState<PrescriptionRecord | null>(null);
  const [printTarget, setPrintTarget] = useState<PrescriptionRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const current = prescriptions[0];
  const finalizedCount = prescriptions.filter((p) => p.status !== 'Cancelled').length;

  const handleSaveDraft = (
    meds: PrescriptionMedication[],
    clinicalNotes: string,
    linkedDiagnosis: string,
    linkedTreatment: string
  ) => {
    const rx: PrescriptionRecord = {
      id: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      prescriptionDate: todayLabel(),
      patientName: PATIENT.name,
      patientCode: PATIENT.code,
      prescriber: PRESCRIBER,
      linkedDiagnosis,
      linkedTreatment,
      status: 'Draft',
      clinicalNotes,
      medications: meds,
      amendments: [],
    };
    setPrescriptions((prev) => [rx, ...prev]);
  };

  const handleFinalize = (
    meds: PrescriptionMedication[],
    clinicalNotes: string,
    linkedDiagnosis: string,
    linkedTreatment: string
  ) => {
    const rx: PrescriptionRecord = {
      id: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      prescriptionDate: todayLabel(),
      patientName: PATIENT.name,
      patientCode: PATIENT.code,
      prescriber: PRESCRIBER,
      linkedDiagnosis,
      linkedTreatment,
      status: 'Finalized',
      clinicalNotes,
      medications: meds,
      amendments: [],
    };
    setPrescriptions((prev) => [rx, ...prev]);
  };

  const summary = useMemo(() => {
    const totalMeds = prescriptions.reduce((sum, p) => sum + p.medications.length, 0);
    return { count: prescriptions.length, totalMeds };
  }, [prescriptions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonHeader />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-muted/40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prescription</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage medications prescribed during the patient's care.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsEditorOpen(true)}>
            <Plus className="size-4" />
            New Prescription
          </Button>
          <Button variant="outline" onClick={() => current && setPrintTarget(current)} disabled={!current}>
            <Printer className="size-4" />
            Print Prescription
          </Button>
          <Button variant="outline" onClick={() => setSelected(prescriptions[0] ?? null)} disabled={!prescriptions.length}>
            <History className="size-4" />
            View History
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left 70% */}
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/90 px-6 py-14 text-center theme-surface-shadow">
              <div className="mb-5 flex size-24 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary">
                <FileText className="size-10" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No prescriptions recorded for this examination.</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Create a prescription only when clinically required.
              </p>
              <Button className="mt-5" onClick={() => setIsEditorOpen(true)}>
                <Plus className="size-4" />
                New Prescription
              </Button>
            </div>
          ) : (
            <>
              <MedicationList
                medications={current.medications}
                onView={(med) => setSelected(current)}
                onEdit={(med) => setIsEditorOpen(true)}
                onRemove={() => {}}
              />
              <PrescriptionHistory
                prescriptions={prescriptions}
                onView={(rx) => setSelected(rx)}
                onPrint={(rx) => setPrintTarget(rx)}
              />
            </>
          )}
        </div>

        {/* Right 30% */}
        <div className="space-y-4">
          <PatientSafetyPanel />
          <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
            <h3 className="mb-3 text-sm font-bold text-foreground">Prescription Summary</h3>
            <div className="space-y-2">
              <SummaryRow label="Total Prescriptions" value={String(summary.count)} />
              <SummaryRow label="Active Medications" value={String(summary.totalMeds)} />
              <SummaryRow label="Patient" value={PATIENT.name} />
              <SummaryRow label="Prescriber" value={PRESCRIBER} />
            </div>
            {finalizedCount > 0 && (
              <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                {finalizedCount} prescription(s) on record. Finalized prescriptions remain in patient history.
              </p>
            )}
          </section>
        </div>
      </div>

      <PrescriptionEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveDraft={handleSaveDraft}
        onFinalize={handleFinalize}
      />

      <PrescriptionDetailsPanel prescription={selected} onClose={() => setSelected(null)} />

      <PrescriptionPrintPreview prescription={printTarget} onClose={() => setPrintTarget(null)} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-muted/50" />
      <div className="h-9 w-48 animate-pulse rounded-lg bg-muted/50" />
    </div>
  );
}