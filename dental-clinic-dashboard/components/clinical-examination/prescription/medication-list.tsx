'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { PrescriptionMedication } from './prescription-data';

export function MedicationList({
  medications,
  onView,
  onEdit,
  onRemove,
}: {
  medications: PrescriptionMedication[];
  onView: (med: PrescriptionMedication) => void;
  onEdit: (med: PrescriptionMedication) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/90 theme-surface-shadow">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">Medication List</h3>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-semibold">Medication</th>
              <th className="px-4 py-2.5 font-semibold">Strength</th>
              <th className="px-4 py-2.5 font-semibold">Dosage</th>
              <th className="px-4 py-2.5 font-semibold">Frequency</th>
              <th className="px-4 py-2.5 font-semibold">Duration</th>
              <th className="px-4 py-2.5 font-semibold">Quantity</th>
              <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((med) => (
              <tr key={med.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold text-foreground">{med.medicationName}</td>
                <td className="px-4 py-3 text-muted-foreground">{med.strength || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{med.dosage || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{med.frequency}</td>
                <td className="px-4 py-3 text-muted-foreground">{med.duration || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{med.quantity || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <TableAction icon={<Eye className="size-3.5" />} label="View" onClick={() => onView(med)} />
                    <TableAction icon={<Pencil className="size-3.5" />} label="Edit" onClick={() => onEdit(med)} />
                    <TableAction icon={<Trash2 className="size-3.5" />} label="Remove" danger onClick={() => onRemove(med.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 p-3 md:hidden">
        {medications.map((med) => (
          <div key={med.id} className="rounded-xl border border-border bg-muted/30 p-3 dark:bg-background/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{med.medicationName}</p>
              <span className="text-xs text-muted-foreground">{med.strength}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Dosage: {med.dosage || '—'}</span>
              <span>Freq: {med.frequency}</span>
              <span>Duration: {med.duration || '—'}</span>
              <span>Qty: {med.quantity || '—'}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => onView(med)} className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold text-foreground">View</button>
              <button onClick={() => onEdit(med)} className="flex-1 rounded-lg border border-border py-1.5 text-xs font-semibold text-foreground">Edit</button>
              <button onClick={() => onRemove(med.id)} className="flex-1 rounded-lg border border-rose-200 py-1.5 text-xs font-semibold text-rose-600 dark:border-rose-500/30">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex size-8 items-center justify-center rounded-lg border transition-all ${
        danger
          ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10'
          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
    </button>
  );
}