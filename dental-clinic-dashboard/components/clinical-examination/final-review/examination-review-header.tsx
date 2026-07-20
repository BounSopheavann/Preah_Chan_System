'use client';

import { X } from 'lucide-react';
import { PATIENT, CURRENT_USER, CURRENT_EXAMINATION, todayLabel } from '../patient-context';

interface ExaminationReviewHeaderProps {
  onClose: () => void;
}

export function ExaminationReviewHeader({ onClose }: ExaminationReviewHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review & Complete Examination</h2>
        <p className="mt-1 text-sm text-muted-foreground">Review the clinical record before completing this examination.</p>
        <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Patient:</span>
            <span className="text-muted-foreground">{PATIENT.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Patient Code:</span>
            <span className="text-muted-foreground">{PATIENT.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Examination:</span>
            <span className="text-muted-foreground">{CURRENT_EXAMINATION}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Dentist:</span>
            <span className="text-muted-foreground">{CURRENT_USER}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Examination Type:</span>
            <span className="text-muted-foreground">Periodic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Status:</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">In Progress</span>
          </div>
        </div>
      </div>
      <button type="button" onClick={onClose} className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground" aria-label="Close review">
        <X className="size-5" />
      </button>
    </div>
  );
}