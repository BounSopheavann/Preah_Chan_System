'use client';

import { CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TreatmentSession, TreatmentSummary } from './treatment-execution-data';

interface CompleteVisitModalProps {
  isOpen: boolean;
  session: TreatmentSession;
  summary: TreatmentSummary;
  onClose: () => void;
  onConfirm: () => void;
}

export function CompleteVisitModal({ isOpen, session, summary, onClose, onConfirm }: CompleteVisitModalProps) {
  if (!isOpen) return null;

  const hasUnfinished = summary.inProgressProcedures.length > 0;
  const hasAllCompleted = summary.completedProcedures.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="mt-3 text-xl font-bold text-foreground">Complete Visit</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Finalize today's treatment records for <strong>{session.patientName}</strong>.
        </p>

        {/* Summary */}
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed procedures</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{summary.completedProcedures.length}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Unfinished / Interrupted</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{summary.inProgressProcedures.length}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining planned</span>
              <span className="font-bold text-slate-600 dark:text-slate-400">{summary.remainingPlanned.length}</span>
            </div>
            <hr className="my-2 border-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Total procedures today</span>
              <span className="font-bold text-foreground">
                {summary.completedProcedures.length + summary.inProgressProcedures.length}
              </span>
            </div>
          </div>

          {hasUnfinished && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Unfinished procedures</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {summary.inProgressProcedures.length} procedure(s) are still in progress or interrupted. They will remain available for future visits.
                </p>
              </div>
            </div>
          )}

          {!hasAllCompleted && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">No completed procedures</p>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  No procedures have been marked as completed. You can still complete the visit, but no billable items will be generated.
                </p>
              </div>
            </div>
          )}

          {/* Final notes preview */}
          {summary.finalNotes && (
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <FileText className="size-3.5" />
                Final Notes
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{summary.finalNotes}</p>
            </div>
          )}
        </div>

        {/* What happens next */}
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary">After completing this visit:</p>
          <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
            <li>✓ Completed procedures will be marked as billable</li>
            <li>✓ Unfinished treatments remain available for future visits</li>
            <li>✓ Appointment status will be updated</li>
            {hasAllCompleted && <li>→ You can proceed to Billing</li>}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>
            <CheckCircle2 className="size-4" />
            Confirm Complete Visit
          </Button>
        </div>
      </div>
    </div>
  );
}