'use client';

import { FileClock, Printer, Eye } from 'lucide-react';
import type { PrescriptionRecord } from './prescription-data';
import { PrescriptionStatusBadge } from './prescription-status-badge';

export function PrescriptionHistory({
  prescriptions,
  onView,
  onPrint,
}: {
  prescriptions: PrescriptionRecord[];
  onView: (rx: PrescriptionRecord) => void;
  onPrint: (rx: PrescriptionRecord) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/90 theme-surface-shadow">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">Prescription History</h3>
      </div>

      {prescriptions.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">No prescription history recorded.</p>
      ) : (
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Medication</th>
                <th className="px-4 py-2.5 font-semibold">Prescriber</th>
                <th className="px-4 py-2.5 font-semibold">Linked Diagnosis</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">{rx.prescriptionDate}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{rx.medications[0]?.medicationName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rx.prescriber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rx.linkedDiagnosis || '—'}</td>
                  <td className="px-4 py-3"><PrescriptionStatusBadge status={rx.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onView(rx)} className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground" aria-label="View" title="View">
                        <Eye className="size-3.5" />
                      </button>
                      <button onClick={() => onPrint(rx)} className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground" aria-label="Print" title="Print">
                        <Printer className="size-3.5" />
                      </button>
                      <button onClick={() => onView(rx)} className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground" aria-label="View Amendments" title="View Amendments">
                        <FileClock className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {prescriptions.length > 0 && (
        <div className="space-y-3 p-3 md:hidden">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-xl border border-border bg-muted/30 p-3 dark:bg-background/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{rx.medications[0]?.medicationName}</p>
                <PrescriptionStatusBadge status={rx.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{rx.prescriptionDate} · {rx.prescriber}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => onView(rx)} className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold text-foreground">View</button>
                <button onClick={() => onPrint(rx)} className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold text-foreground">Print</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}