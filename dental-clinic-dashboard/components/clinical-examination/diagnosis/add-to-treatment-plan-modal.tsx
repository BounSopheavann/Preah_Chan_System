'use client';

import { ClipboardList, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DiagnosisRecord } from './diagnosis-data';

interface AddToTreatmentPlanModalProps {
  isOpen: boolean;
  diagnosis: DiagnosisRecord | null;
  onClose: () => void;
}

export function AddToTreatmentPlanModal({ isOpen, diagnosis, onClose }: AddToTreatmentPlanModalProps) {
  if (!isOpen || !diagnosis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add to Treatment Plan</h2>
            <p className="text-sm text-muted-foreground">This diagnosis will be used to create a treatment plan item.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
            <p className="text-xs text-muted-foreground">Diagnosis</p>
            <p className="text-sm font-bold text-foreground">{diagnosis.diagnosisName}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
            <p className="text-xs text-muted-foreground">Tooth</p>
            <p className="text-sm font-bold text-foreground">{diagnosis.toothNumber}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
            <p className="text-xs text-muted-foreground">Suggested Procedure</p>
            <p className="text-sm font-bold text-foreground">
              {diagnosis.diagnosisName.includes('Caries') ? 'Composite Restoration' :
               diagnosis.diagnosisName.includes('Pulpitis') || diagnosis.diagnosisName.includes('Periapical') ? 'Root Canal Treatment' :
               diagnosis.diagnosisName.includes('Gingivitis') ? 'Scaling & Root Planing' :
               'Comprehensive Evaluation'}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
            <p className="text-xs text-muted-foreground">Priority</p>
            <p className="text-sm font-bold text-foreground">{diagnosis.priority}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>
            <ClipboardList className="size-4" />
            Continue to Treatment Plan
          </Button>
        </div>
      </div>
    </div>
  );
}