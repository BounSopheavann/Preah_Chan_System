'use client';

import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CLINIC_INFO, PATIENT } from '../patient-context';
import type { PrescriptionRecord } from './prescription-data';

export function PrescriptionPrintPreview({
  prescription,
  onClose,
}: {
  prescription: PrescriptionRecord | null;
  onClose: () => void;
}) {
  if (!prescription) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-white p-8 shadow-2xl text-foreground">
        {/* Clinic header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
              {CLINIC_INFO.logoText}
            </span>
            <div>
              <p className="text-lg font-bold">{CLINIC_INFO.name}</p>
              <p className="text-xs text-slate-500">{CLINIC_INFO.address}</p>
              <p className="text-xs text-slate-500">{CLINIC_INFO.phone} · {CLINIC_INFO.email}</p>
            </div>
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Prescription</span>
        </div>

        {/* Patient block */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Patient</p>
            <p className="font-semibold">{prescription.patientName}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Patient Code</p>
            <p className="font-semibold">{prescription.patientCode}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date</p>
            <p className="font-semibold">{prescription.prescriptionDate}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Prescriber</p>
            <p className="font-semibold">{prescription.prescriber}</p>
          </div>
        </div>

        {/* Allergy alert */}
        {PATIENT.allergies.length > 0 && (
          <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
            <strong>Allergy Alert:</strong> {PATIENT.allergies.join(', ')}
          </div>
        )}

        {/* Medications */}
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Medications</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs text-slate-500">
                <th className="py-2 font-semibold">Medication</th>
                <th className="py-2 font-semibold">Dosage</th>
                <th className="py-2 font-semibold">Frequency</th>
                <th className="py-2 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medications.map((med) => (
                <tr key={med.id} className="border-b border-slate-200">
                  <td className="py-2 font-semibold">
                    {med.medicationName} <span className="font-normal text-slate-500">{med.strength}</span>
                    {med.instructions && (
                      <p className="text-xs font-normal text-slate-500">{med.instructions}</p>
                    )}
                  </td>
                  <td className="py-2 text-slate-600">{med.dosage}</td>
                  <td className="py-2 text-slate-600">{med.frequency} · {med.route}</td>
                  <td className="py-2 text-slate-600">{med.duration} · Qty: {med.quantity || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {prescription.linkedDiagnosis && (
          <p className="mt-3 text-xs text-slate-500">
            Linked Diagnosis: <span className="font-semibold text-slate-700">{prescription.linkedDiagnosis}</span>
            {prescription.linkedTreatment ? ` · Treatment: ${prescription.linkedTreatment}` : ''}
          </p>
        )}

        {/* Signature */}
        <div className="mt-10 flex items-end justify-between">
          <div>
            <div className="h-12 w-48 border-b border-slate-400" />
            <p className="mt-1 text-xs text-slate-500">Prescriber Signature</p>
          </div>
          <p className="text-[10px] text-slate-400">Rx ID: {prescription.id}</p>
        </div>

        <p className="mt-6 border-t border-slate-200 pt-3 text-[10px] leading-relaxed text-slate-400">
          {CLINIC_INFO.disclaimer}
        </p>

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            <X className="size-4" />
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}