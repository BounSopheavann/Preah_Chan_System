'use client';

import { Button } from '@/components/ui/button';
import { PATIENT, CURRENT_USER, CURRENT_EXAMINATION, todayLabel } from '../patient-context';
import { AlertTriangle } from 'lucide-react';

interface CompleteExaminationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CompleteExaminationModal({ open, onClose, onConfirm }: CompleteExaminationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Complete Examination?</h3>
            <p className="text-sm text-muted-foreground">
              You are about to complete this clinical examination. After completion, the clinical record will become read-only and future corrections must be recorded as amendments.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2 rounded-xl border border-border bg-muted/40 p-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Patient:</span><span className="font-semibold text-foreground">{PATIENT.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Examination:</span><span className="font-semibold text-foreground">{CURRENT_EXAMINATION}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Dentist:</span><span className="font-semibold text-foreground">{CURRENT_USER}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span className="font-semibold text-foreground">{todayLabel()}</span></div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Complete Examination</Button>
        </div>
      </div>
    </div>
  );
}