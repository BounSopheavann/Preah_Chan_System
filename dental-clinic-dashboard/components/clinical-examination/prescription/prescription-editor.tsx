'use client';

import { AlertTriangle, Pill, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PATIENT, PRESCRIBER, todayLabel } from '../patient-context';
import {
  frequencyOptions,
  medicationCatalog,
  routeOptions,
  type FrequencyOption,
  type MedicationRoute,
  type PrescriptionMedication,
} from './prescription-data';
import { MedicationSelector, AllergyWarningModal } from './medication-selector';

interface PrescriptionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft: (meds: PrescriptionMedication[], clinicalNotes: string, linkedDiagnosis: string, linkedTreatment: string) => void;
  onFinalize: (meds: PrescriptionMedication[], clinicalNotes: string, linkedDiagnosis: string, linkedTreatment: string) => void;
}

const selectClass =
  'h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

const inputClass =
  'h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

function emptyMed(): PrescriptionMedication {
  return {
    id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    medicationName: '',
    genericName: '',
    dosage: '',
    strength: '',
    frequency: 'Twice daily',
    route: 'Oral',
    duration: '',
    quantity: '',
    refills: '0',
    instructions: '',
  };
}

export function PrescriptionEditor({
  isOpen,
  onClose,
  onSaveDraft,
  onFinalize,
}: PrescriptionEditorProps) {
  const [meds, setMeds] = useState<PrescriptionMedication[]>([emptyMed()]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [linkedDiagnosis, setLinkedDiagnosis] = useState('Deep Dental Caries');
  const [linkedTreatment, setLinkedTreatment] = useState('Root Canal Treatment');
  const [warningMed, setWarningMed] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const updateMed = (index: number, patch: Partial<PrescriptionMedication>) => {
    setMeds((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const handleSelectMed = (index: number, name: string) => {
    const catalog = medicationCatalog.find((m) => m.name === name);
    const med = meds[index];
    const conflict = catalog?.allergyConflict?.some((a) => PATIENT.allergies.includes(a));
    updateMed(index, {
      medicationName: name,
      genericName: catalog?.genericName ?? med.genericName,
      strength: catalog?.defaultStrength ?? med.strength,
      route: catalog?.defaultRoute ?? med.route,
    });
    if (conflict) {
      setWarningMed(name);
    }
  };

  const handleCustomMed = (index: number, name: string) => {
    updateMed(index, { medicationName: name });
  };

  const addMed = () => setMeds((prev) => [...prev, emptyMed()]);
  const removeMed = (index: number) => setMeds((prev) => prev.filter((_, i) => i !== index));

  const validate = () => meds.every((m) => m.medicationName && m.dosage && m.frequency && m.duration);

  const reset = () => {
    setMeds([emptyMed()]);
    setClinicalNotes('');
    setLinkedDiagnosis('Deep Dental Caries');
    setLinkedTreatment('Root Canal Treatment');
    setWarningMed(null);
    setEditingIndex(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = (finalize: boolean) => {
    if (finalize && !validate()) return;
    if (finalize) onFinalize(meds, clinicalNotes, linkedDiagnosis, linkedTreatment);
    else onSaveDraft(meds, clinicalNotes, linkedDiagnosis, linkedTreatment);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm pt-8 pb-10">
      <div className="mx-4 w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">New Prescription</h2>
            <p className="text-sm text-muted-foreground">Add medications prescribed during the patient's care.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Auto-filled context */}
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          <ContextField label="Prescription Date" value={todayLabel()} />
          <ContextField label="Patient" value={PATIENT.name} />
          <ContextField label="Patient Code" value={PATIENT.code} />
          <ContextField label="Prescriber" value={PRESCRIBER} />
        </div>

        <div className="space-y-4">
          {meds.map((med, index) => (
            <div key={med.id} className="rounded-2xl border border-border bg-muted/30 p-4 dark:bg-background/20">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground">Medication {index + 1}</span>
                </div>
                {meds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMed(index)}
                    className="text-xs font-semibold text-rose-600 transition-all hover:text-rose-700 dark:text-rose-400"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <MedicationSelector
                    onSelect={(name) => handleSelectMed(index, name)}
                    onCustom={(name) => handleCustomMed(index, name)}
                  />
                  {med.medicationName && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Generic: {med.genericName || '—'} · Route: {med.route}
                    </p>
                  )}
                </div>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                  Dosage <span className="text-destructive">*</span>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMed(index, { dosage: e.target.value })}
                    placeholder="e.g. 1 tablet"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                  Strength
                  <input
                    type="text"
                    value={med.strength}
                    onChange={(e) => updateMed(index, { strength: e.target.value })}
                    placeholder="e.g. 400 mg"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                  Frequency <span className="text-destructive">*</span>
                  <select
                    value={med.frequency}
                    onChange={(e) => updateMed(index, { frequency: e.target.value })}
                    className={selectClass}
                  >
                    {frequencyOptions.map((f: FrequencyOption) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                  Route
                  <select
                    value={med.route}
                    onChange={(e) => updateMed(index, { route: e.target.value as MedicationRoute })}
                    className={selectClass}
                  >
                    {routeOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                  Duration <span className="text-destructive">*</span>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => updateMed(index, { duration: e.target.value })}
                    placeholder="e.g. 5 Days"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                  Quantity
                  <input
                    type="text"
                    value={med.quantity}
                    onChange={(e) => updateMed(index, { quantity: e.target.value })}
                    placeholder="e.g. 15 tablets"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                  Refills
                  <input
                    type="text"
                    value={med.refills}
                    onChange={(e) => updateMed(index, { refills: e.target.value })}
                    placeholder="0"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground sm:col-span-2">
                  Instructions
                  <textarea
                    value={med.instructions}
                    onChange={(e) => updateMed(index, { instructions: e.target.value })}
                    rows={2}
                    placeholder="e.g. Take with food after meals."
                    className="min-h-16 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
                  />
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addMed}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-dashed border-border px-3 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
          >
            <Plus className="size-4" />
            Add Another Medication
          </button>
        </div>

        {/* Linked records */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Linked Diagnosis
            <input type="text" value={linkedDiagnosis} onChange={(e) => setLinkedDiagnosis(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Linked Treatment
            <input type="text" value={linkedTreatment} onChange={(e) => setLinkedTreatment(e.target.value)} className={inputClass} />
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
          Clinical Notes <span className="text-[10px] font-normal">(optional)</span>
          <textarea
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            rows={2}
            placeholder="Additional clinical context..."
            className="min-h-16 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
          />
        </label>

        {!validate() && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="size-4" />
            Each medication requires a name, dosage, frequency, and duration before finalizing.
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSave(false)}>Save Draft</Button>
          <Button onClick={() => handleSave(true)} disabled={!validate()}>
            <Pill className="size-4" />
            Finalize Prescription
          </Button>
        </div>
      </div>

      <AllergyWarningModal
        isOpen={warningMed !== null}
        medicationName={warningMed ?? ''}
        allergy={PATIENT.allergies.join(', ')}
        onCancel={() => setWarningMed(null)}
        onAcknowledge={() => setWarningMed(null)}
      />
    </div>
  );
}

function ContextField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}