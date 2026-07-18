'use client';

import { CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { DiagnosisRecord } from './diagnosis-data';

interface ResolveDiagnosisModalProps {
  isOpen: boolean;
  diagnosis: DiagnosisRecord | null;
  onClose: () => void;
  onConfirm: (diagnosis: DiagnosisRecord, resolutionDate: string, resolutionNotes: string) => void;
}

export function ResolveDiagnosisModal({ isOpen, diagnosis, onClose, onConfirm }: ResolveDiagnosisModalProps) {
  const [resolutionDate, setResolutionDate] = useState(new Date().toISOString().slice(0, 10));
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!isOpen || !diagnosis) return null;

  const handleConfirm = () => {
    onConfirm(diagnosis, resolutionDate, resolutionNotes);
    setResolutionNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Mark as Resolved</h2>
            <p className="text-sm text-muted-foreground">Confirm resolution of this diagnosis.</p>
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
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Diagnosis</p>
            <p className="text-sm font-bold text-foreground">{diagnosis.diagnosisName}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Tooth</p>
            <p className="text-sm font-bold text-foreground">{diagnosis.toothNumber}</p>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Resolution Date
            <input
              type="date"
              value={resolutionDate}
              onChange={(e) => setResolutionDate(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Resolution Notes <span className="text-[10px] font-normal">(optional)</span>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              placeholder="Describe the outcome or treatment provided..."
              className="min-h-20 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground/60"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>
            <CheckCircle2 className="size-4" />
            Mark Resolved
          </Button>
        </div>
      </div>
    </div>
  );
}