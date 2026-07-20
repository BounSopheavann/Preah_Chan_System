'use client';

import { FileText, CheckCircle2, Clock, AlertTriangle, Pill, Paperclip, User, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TreatmentSession, TreatmentSummary, ProcedureExecution, PlannedTreatmentItem } from './treatment-execution-data';
import { procedureStatusBadgeColor } from './treatment-execution-data';

interface TreatmentSummaryViewProps {
  session: TreatmentSession;
  summary: TreatmentSummary;
  onSummaryChange: (summary: TreatmentSummary) => void;
  onReturnToTreatment: () => void;
  onCompleteVisit: () => void;
}

export function TreatmentSummaryView({
  session, summary, onSummaryChange, onReturnToTreatment, onCompleteVisit,
}: TreatmentSummaryViewProps) {
  const inputClass = 'h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60';
  const textareaClass = 'min-h-20 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60';

  const completedCount = summary.completedProcedures.length;
  const inProgressCount = summary.inProgressProcedures.length;
  const remainingCount = summary.remainingPlanned.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Treatment Summary</h2>
          <p className="text-sm text-muted-foreground">Session {session.id} · {session.patientName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onReturnToTreatment}>
            Return to Treatment
          </Button>
          <Button onClick={onCompleteVisit}>
            <CheckCircle2 className="size-4" />
            Complete Visit
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-lg font-bold">{completedCount}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Completed Procedures</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-bold">{inProgressCount}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">In Progress / Interrupted</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-lg font-bold">{remainingCount}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Remaining Planned</p>
        </div>
      </div>

      {/* Completed procedures */}
      {completedCount > 0 && (
        <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 text-sm font-bold text-foreground">Completed Procedures Today</h3>
          <div className="space-y-2">
            {summary.completedProcedures.map((proc) => (
              <div key={proc.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">{proc.procedure}</p>
                  <p className="text-xs text-muted-foreground">Tooth {proc.toothNumber} · {proc.duration} · {proc.dentist}</p>
                </div>
                <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${procedureStatusBadgeColor.Completed}`}>
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In progress / interrupted */}
      {inProgressCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 dark:border-amber-500/20 dark:bg-amber-500/5">
          <h3 className="mb-3 text-sm font-bold text-amber-800 dark:text-amber-200">In Progress / Interrupted</h3>
          <div className="space-y-2">
            {summary.inProgressProcedures.map((proc) => (
              <div key={proc.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-white/50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div>
                  <p className="text-sm font-semibold text-foreground">{proc.procedure}</p>
                  <p className="text-xs text-muted-foreground">
                    Tooth {proc.toothNumber} · {proc.status}
                    {proc.interruptionReason && ` · ${proc.interruptionReason}`}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${procedureStatusBadgeColor[proc.status]}`}>
                  {proc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remaining planned */}
      {remainingCount > 0 && (
        <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 text-sm font-bold text-foreground">Remaining Planned Procedures</h3>
          <div className="space-y-2">
            {summary.remainingPlanned.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.procedure}</p>
                  <p className="text-xs text-muted-foreground">Tooth {item.toothArea} · {item.estimatedDuration}</p>
                </div>
                <span className="text-xs text-muted-foreground">Available for future visit</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dentist & duration */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 dark:bg-background/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <User className="size-3.5" />
            Dentist
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">{summary.dentist}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 dark:bg-background/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Clock className="size-3.5" />
            Total Treatment Duration
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">{summary.totalDuration}</p>
        </div>
      </div>

      {/* Final notes */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <FileText className="size-3.5" />
          Final Treatment Notes
        </label>
        <textarea
          value={summary.finalNotes}
          onChange={(e) => onSummaryChange({ ...summary, finalNotes: e.target.value })}
          className={textareaClass}
          placeholder="Overall summary of today's treatment..."
        />
      </div>

      {/* Recommendations */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Stethoscope className="size-3.5" />
          Recommendations
        </label>
        <textarea
          value={summary.recommendations}
          onChange={(e) => onSummaryChange({ ...summary, recommendations: e.target.value })}
          className={textareaClass}
          placeholder="Follow-up recommendations..."
        />
      </div>

      {/* Post-op instructions */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <AlertTriangle className="size-3.5" />
          Post-Operative Instructions
        </label>
        <textarea
          value={summary.postOpInstructions}
          onChange={(e) => onSummaryChange({ ...summary, postOpInstructions: e.target.value })}
          className={textareaClass}
          placeholder="Instructions for the patient after treatment..."
        />
      </div>

      {/* Prescriptions summary */}
      {summary.completedProcedures.some((p) => p.prescriptions.length > 0) && (
        <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Pill className="size-4" />
            Prescriptions Issued
          </h3>
          <div className="space-y-2">
            {summary.completedProcedures.filter((p) => p.prescriptions.length > 0).map((proc) =>
              proc.prescriptions.map((rx) => (
                <div key={rx.id} className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                  <p className="text-sm font-semibold text-foreground">{rx.medicineName} {rx.dosage}</p>
                  <p className="text-xs text-muted-foreground">{rx.frequency} · {rx.duration} · {rx.instructions}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Attachments summary */}
      {summary.completedProcedures.some((p) => p.attachments.length > 0) && (
        <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Paperclip className="size-4" />
            Attachments
          </h3>
          <p className="text-sm text-muted-foreground">
            {summary.completedProcedures.reduce((acc, p) => acc + p.attachments.length, 0)} file(s) attached to today's procedures.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        <Button variant="outline" onClick={onReturnToTreatment}>
          Return to Treatment
        </Button>
        <Button onClick={onCompleteVisit}>
          <CheckCircle2 className="size-4" />
          Complete Visit
        </Button>
      </div>
    </div>
  );
}