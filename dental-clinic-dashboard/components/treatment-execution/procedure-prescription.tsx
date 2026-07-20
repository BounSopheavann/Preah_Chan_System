'use client';

import { Pill, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProcedurePrescriptionItem } from './treatment-execution-data';

interface ProcedurePrescriptionSectionProps {
  prescriptions: ProcedurePrescriptionItem[];
  onChange: (prescriptions: ProcedurePrescriptionItem[]) => void;
}

export function ProcedurePrescriptionSection({ prescriptions, onChange }: ProcedurePrescriptionSectionProps) {
  const selectClass = 'h-9 rounded-xl border border-border bg-background/70 px-3 text-xs font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 w-full';

  const addPrescription = () => {
    const newItem: ProcedurePrescriptionItem = {
      id: `rx-${Date.now()}`,
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    };
    onChange([...prescriptions, newItem]);
  };

  const removePrescription = (id: string) => {
    onChange(prescriptions.filter((p) => p.id !== id));
  };

  const updatePrescription = (id: string, field: keyof ProcedurePrescriptionItem, value: string) => {
    onChange(prescriptions.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Prescription</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{prescriptions.length}</span>
        </div>
        <Button variant="outline" size="sm" onClick={addPrescription}>
          <Plus className="size-3.5" />
          Add Prescription
        </Button>
      </div>

      {prescriptions.length === 0 && (
        <p className="text-xs text-muted-foreground">No prescriptions added. Click "Add Prescription" if medication is required.</p>
      )}

      <div className="space-y-3">
        {prescriptions.map((item) => (
          <div key={item.id} className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-background/50 p-3 dark:bg-background/20">
            <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold text-muted-foreground min-w-[140px]">
              Medicine Name
              <input type="text" value={item.medicineName} onChange={(e) => updatePrescription(item.id, 'medicineName', e.target.value)} placeholder="e.g. Amoxicillin" className={selectClass} />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold text-muted-foreground w-24">
              Dosage
              <input type="text" value={item.dosage} onChange={(e) => updatePrescription(item.id, 'dosage', e.target.value)} placeholder="e.g. 500mg" className={selectClass} />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold text-muted-foreground w-28">
              Frequency
              <input type="text" value={item.frequency} onChange={(e) => updatePrescription(item.id, 'frequency', e.target.value)} placeholder="e.g. 3x daily" className={selectClass} />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold text-muted-foreground w-24">
              Duration
              <input type="text" value={item.duration} onChange={(e) => updatePrescription(item.id, 'duration', e.target.value)} placeholder="e.g. 7 days" className={selectClass} />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold text-muted-foreground min-w-[120px]">
              Instructions <span className="text-[9px] font-normal">(optional)</span>
              <input type="text" value={item.instructions} onChange={(e) => updatePrescription(item.id, 'instructions', e.target.value)} placeholder="e.g. Take after meals" className={selectClass} />
            </label>
            <button
              type="button"
              onClick={() => removePrescription(item.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}