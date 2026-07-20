'use client';

import { Button } from '@/components/ui/button';
import { X, Printer } from 'lucide-react';
import { CLINIC_INFO, PATIENT, CURRENT_USER, CURRENT_EXAMINATION, todayLabel } from '../patient-context';
import { dummyDiagnoses } from '../diagnosis/diagnosis-data';
import { dummyTreatmentPlan } from '../treatment/treatment-data';
import { dummyPrescriptions } from '../prescription/prescription-data';
import { dummyProgressNotes } from '../progress-notes/progress-notes-data';

interface ClinicalSummaryPrintPreviewProps {
  onClose: () => void;
}

export function ClinicalSummaryPrintPreview({ onClose }: ClinicalSummaryPrintPreviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Clinical Summary — Print Preview</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 size-3.5" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="mr-1.5 size-3.5" /> Close
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 text-sm text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:border-none print:p-0">
        <div className="mb-4 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold">{CLINIC_INFO.name}</h2>
          <p className="text-xs text-slate-500">{CLINIC_INFO.address} · {CLINIC_INFO.phone}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold">Patient:</span> {PATIENT.name}</p>
            <p><span className="font-semibold">Code:</span> {PATIENT.code}</p>
            <p><span className="font-semibold">Age/Sex:</span> {PATIENT.age} / {PATIENT.sex}</p>
          </div>
          <div>
            <p><span className="font-semibold">Examination:</span> {CURRENT_EXAMINATION}</p>
            <p><span className="font-semibold">Date:</span> {todayLabel()}</p>
            <p><span className="font-semibold">Dentist:</span> {CURRENT_USER}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="font-bold">Chief Complaint</h4>
          <p className="text-slate-600">Pain while chewing on upper left molar.</p>
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="font-bold">Summary of Findings</h4>
          <p className="text-slate-600">Deep caries on tooth 26. Moderate calculus buildup. Generalized gingival inflammation. Existing composite restoration on tooth 11.</p>
        </div>
        {dummyDiagnoses.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-bold">Diagnoses</h4>
            <ul className="list-inside list-disc text-slate-600">
              {dummyDiagnoses.map((dx) => (
                <li key={dx.id}>{dx.diagnosisName} — Tooth {dx.toothNumber} ({dx.severity})</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 space-y-2">
          <h4 className="font-bold">Recommended Treatments</h4>
          {dummyTreatmentPlan.items.length > 0 ? (
            <ul className="list-inside list-disc text-slate-600">
              {dummyTreatmentPlan.items.map((item) => (
                <li key={item.id}>{item.procedure} — Tooth {item.toothArea} (${item.total})</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600">No treatment required at this time.</p>
          )}
        </div>
        {dummyPrescriptions.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-bold">Prescription</h4>
            {dummyPrescriptions.map((rx) => (
              <p key={rx.id} className="text-slate-600">{rx.medications.map(m => `${m.medicationName} ${m.strength} — ${m.instructions}`).join(', ')}</p>
            ))}
          </div>
        )}
        <div className="mt-4 space-y-2">
          <h4 className="font-bold">Follow-up Recommendation</h4>
          <p className="text-slate-600">Schedule root canal treatment. Review in 2 weeks. Regular 6-month recall dental examination.</p>
        </div>
      </div>
    </div>
  );
}