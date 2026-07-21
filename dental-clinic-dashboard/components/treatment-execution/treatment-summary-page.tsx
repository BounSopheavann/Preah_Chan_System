'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Pill,
  Paperclip,
  Stethoscope,
  User,
  XCircle,
  AlertCircle,
  Syringe,
  Package,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PatientContextHeader } from './patient-context-header';
import { PATIENT } from '@/components/clinical-examination/patient-context';
import {
  loadFlowState,
  saveFlowState,
  buildSummaryFromSession,
  applyVisitCompletion,
  type TreatmentFlowState,
  type VisitCompletionData,
} from './procedure-workspace-store';
import type { TreatmentSummary, ProcedureExecution } from './treatment-execution-data';
import { procedureStatusBadgeColor, planItemStatusBadgeColor } from './treatment-execution-data';

type ValidationError = {
  type: 'no_completed' | 'no_final_notes' | 'in_progress_procedure';
  message: string;
};

export function TreatmentSummaryPage() {
  const router = useRouter();
  const [flow, setFlow] = useState<TreatmentFlowState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [postOpInstructions, setPostOpInstructions] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const stored = loadFlowState();
    if (stored) {
      setFlow(stored);
      const summary = buildSummaryFromSession(stored.session);
      setFinalNotes(summary.finalNotes || stored.session.summary?.finalNotes || '');
      setRecommendations(summary.recommendations || stored.session.summary?.recommendations || '');
      setPostOpInstructions(summary.postOpInstructions || stored.session.summary?.postOpInstructions || '');
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !flow) return;
    saveFlowState(flow);
  }, [flow, hydrated]);

  const summary = useMemo<TreatmentSummary>(() => {
    if (!flow) {
      return {
        completedProcedures: [],
        inProgressProcedures: [],
        remainingPlanned: [],
        dentist: '',
        totalDuration: 'N/A',
        finalNotes: '',
        recommendations: '',
        postOpInstructions: '',
        createdAt: '',
      };
    }
    return buildSummaryFromSession(flow.session);
  }, [flow]);

  const session = flow?.session;

  const completedCount = summary.completedProcedures.length;
  const inProgressCount = summary.inProgressProcedures.length;
  const remainingCount = summary.remainingPlanned.length;
  const hasInProgress = inProgressCount > 0;
  const hasCompleted = completedCount > 0;

  /* Helper to collect all unique prescriptions from completed procedures */
  const allPrescriptions = useMemo(() => {
    return summary.completedProcedures
      .filter((p) => p.prescriptions.length > 0)
      .flatMap((p) => p.prescriptions);
  }, [summary.completedProcedures]);

  /* Helper to collect all unique attachments from completed procedures */
  const allAttachments = useMemo(() => {
    return summary.completedProcedures
      .filter((p) => p.attachments.length > 0)
      .flatMap((p) => p.attachments);
  }, [summary.completedProcedures]);

  /* Has anesthesia records */
  const hasAnesthesia = summary.completedProcedures.some((p) => p.anesthesiaUsed && p.anesthesia);

  /* Has consumables */
  const hasConsumables = summary.completedProcedures.some((p) => p.consumables.length > 0);

  const handleReturnToTreatment = useCallback(() => {
    router.push('/treatment-execution');
  }, [router]);

  const validate = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (completedCount === 0) {
      errors.push({
        type: 'no_completed',
        message: 'At least one procedure must be completed before completing the visit.',
      });
    }
    if (!finalNotes.trim()) {
      errors.push({
        type: 'no_final_notes',
        message: 'Final clinical notes are required before completing the visit.',
      });
    }
    if (hasInProgress) {
      errors.push({
        type: 'in_progress_procedure',
        message:
          'An active procedure is still in progress. Resume or resolve the procedure before completing the visit.',
      });
    }
    return errors;
  }, [completedCount, finalNotes, hasInProgress]);

  const handleCompleteVisit = useCallback(() => {
    const errors = validate();
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setIsCompleting(true);

    const completionData: VisitCompletionData = {
      finalNotes: finalNotes.trim(),
      recommendations: recommendations.trim(),
      postOpInstructions: postOpInstructions.trim(),
    };

    const nextFlow = applyVisitCompletion(flow!, completionData);
    setFlow(nextFlow);
    saveFlowState(nextFlow);

    // Navigate to billing
    router.push('/billing');
  }, [flow, finalNotes, recommendations, postOpInstructions, validate, router]);

  const dismissError = useCallback((type: ValidationError['type']) => {
    setValidationErrors((prev) => prev.filter((e) => e.type !== type));
  }, []);

  const textareaClass =
    'min-h-20 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60';

  if (!hydrated) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading treatment summary...</p>
        </div>
      </div>
    );
  }

  if (!flow || !session) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">No active treatment session found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-[100px]">
      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReturnToTreatment}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Treatment Execution
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Treatment Summary</h1>
          <p className="text-sm text-muted-foreground">
            Final clinical review for {session.patientName} · {session.appointmentDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleReturnToTreatment}>
            <ArrowRight className="size-4 rotate-180" />
            Return to Treatment
          </Button>
          <Button onClick={handleCompleteVisit} disabled={isCompleting}>
            <CheckCircle2 className="size-4" />
            {isCompleting ? 'Completing...' : 'Complete Visit'}
          </Button>
        </div>
      </div>

      {/* Patient / Visit Header */}
      <PatientContextHeader session={session} />

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((err) => (
            <div
              key={err.type}
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                  {err.type === 'no_completed' && 'No Completed Procedures'}
                  {err.type === 'no_final_notes' && 'Missing Final Clinical Notes'}
                  {err.type === 'in_progress_procedure' && 'In Progress Procedure'}
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-300">{err.message}</p>
              </div>
              <button
                onClick={() => dismissError(err.type)}
                className="shrink-0 text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Visit Status Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-lg font-bold">{completedCount}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {completedCount === 1 ? 'Procedure' : 'Procedures'} Completed
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-bold">{inProgressCount}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            In Progress
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-lg font-bold">{remainingCount}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Remaining / Planned
          </p>
        </div>
      </div>

      {/* Completed Procedures */}
      {completedCount > 0 && (
        <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Completed Procedures
          </h3>
          <div className="space-y-2">
            {summary.completedProcedures.map((proc) => (
              <div
                key={proc.id}
                className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{proc.procedure}</p>
                    <p className="text-xs text-muted-foreground">
                      Tooth {proc.toothNumber}
                      {proc.toothSurface.length > 0 && ` · ${proc.toothSurface.join(', ')}`}
                      {proc.duration && ` · ${proc.duration}`}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${procedureStatusBadgeColor.Completed}`}
                  >
                    Completed
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {proc.dentist}
                  </span>
                  {proc.startTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {proc.startTime}
                      {proc.endTime && ` - ${proc.endTime}`}
                    </span>
                  )}
                </div>
                {proc.clinicalNotes && (
                  <p className="mt-0.5 text-xs text-muted-foreground/80 line-clamp-2 border-t border-border/50 pt-1.5">
                    {proc.clinicalNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Procedures */}
      {inProgressCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 dark:border-amber-500/20 dark:bg-amber-500/5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
            <Clock className="size-4" />
            In Progress Procedures
          </h3>
          <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
            These procedures are NOT completed. They must be resolved before the visit can be finalized.
          </p>
          <div className="space-y-2">
            {summary.inProgressProcedures.map((proc) => (
              <div
                key={proc.id}
                className="flex items-center justify-between rounded-xl border border-amber-200 bg-white/50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{proc.procedure}</p>
                  <p className="text-xs text-muted-foreground">
                    Tooth {proc.toothNumber} · Started at {proc.startTime}
                    {proc.interruptionReason && ` · ${proc.interruptionReason}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${procedureStatusBadgeColor['In Progress']}`}
                >
                  In Progress
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={handleReturnToTreatment}>
              <ArrowRight className="mr-1 size-3 rotate-180" />
              Return to resolve in Treatment
            </Button>
          </div>
        </div>
      )}

      {/* Remaining / Planned Procedures */}
      {remainingCount > 0 && (
        <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <AlertTriangle className="size-4 text-slate-400" />
            Remaining / Planned Procedures
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            These procedures were not completed during this visit and remain available for future treatment.
          </p>
          <div className="space-y-2">
            {summary.remainingPlanned.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.procedure}</p>
                  <p className="text-xs text-muted-foreground">
                    Tooth {item.toothArea}
                    {item.toothSurface.length > 0 && ` · ${item.toothSurface.join(', ')}`}
                    {item.estimatedDuration && ` · ${item.estimatedDuration}`}
                    {item.priority && ` · ${item.priority} priority`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${planItemStatusBadgeColor[item.status] || 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Record Summary */}
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <FileText className="size-4" />
          Clinical Record Summary
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Clinical Notes */}
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <FileText className="size-3.5" />
              Clinical Notes
            </div>
            {summary.completedProcedures.some((p) => p.clinicalNotes) ? (
              <div className="space-y-1.5">
                {summary.completedProcedures
                  .filter((p) => p.clinicalNotes)
                  .map((p) => (
                    <p key={p.id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{p.procedure}:</span>{' '}
                      {p.clinicalNotes}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No clinical notes recorded.</p>
            )}
          </div>

          {/* Anesthesia */}
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Syringe className="size-3.5" />
              Anesthesia
            </div>
            {hasAnesthesia ? (
              <div className="space-y-1.5">
                {summary.completedProcedures
                  .filter((p) => p.anesthesiaUsed && p.anesthesia)
                  .map((p) => (
                    <div key={p.id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{p.procedure}:</span>{' '}
                      {p.anesthesia!.drug} ({p.anesthesia!.dosage})
                      {p.anesthesia!.injectionSite && ` · ${p.anesthesia!.injectionSite}`}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No anesthesia recorded.</p>
            )}
          </div>

          {/* Consumables / Materials */}
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Package className="size-3.5" />
              Consumables / Materials
            </div>
            {hasConsumables ? (
              <div className="space-y-1">
                {summary.completedProcedures
                  .filter((p) => p.consumables.length > 0)
                  .flatMap((p) =>
                    p.consumables.map((c) => (
                      <p key={c.id} className="text-xs text-muted-foreground">
                        {c.material} × {c.quantityUsed}
                        {c.unit && ` ${c.unit}`}
                        {c.batchLot && ` · Lot: ${c.batchLot}`}
                      </p>
                    ))
                  )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No consumables recorded.</p>
            )}
          </div>

          {/* Prescriptions */}
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Pill className="size-3.5" />
              Prescriptions
            </div>
            {allPrescriptions.length > 0 ? (
              <div className="space-y-1">
                {allPrescriptions.map((rx) => (
                  <p key={rx.id} className="text-xs text-muted-foreground">
                    {rx.medicineName} {rx.dosage} · {rx.frequency} · {rx.duration}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No prescriptions recorded.</p>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="mt-3 rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Paperclip className="size-3.5" />
            Clinical Attachments
          </div>
          {allAttachments.length > 0 ? (
            <div className="space-y-1">
              {allAttachments.map((att) => (
                <p key={att.id} className="text-xs text-muted-foreground">
                  {att.fileName} ({att.type}) · Uploaded by {att.uploadedBy} at {att.uploadedAt}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">No clinical attachments.</p>
          )}
        </div>
      </div>

      {/* Final Clinical Review - Editable Fields */}
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <Stethoscope className="size-4" />
          Final Clinical Review
        </h3>

        {/* Final Notes */}
        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <FileText className="size-3.5" />
            Final Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={finalNotes}
            onChange={(e) => {
              setFinalNotes(e.target.value);
              dismissError('no_final_notes');
            }}
            className={textareaClass}
            placeholder="Enter final clinical notes for today's visit (required)..."
          />
          {!finalNotes.trim() && (
            <p className="mt-1 text-[10px] text-rose-500">Final notes are required to complete the visit.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Stethoscope className="size-3.5" />
            Recommendations
          </label>
          <textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className={textareaClass}
            placeholder="Enter follow-up recommendations for the patient..."
          />
        </div>

        {/* Post-Operative Instructions */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <AlertTriangle className="size-3.5" />
            Post-Operative / Home Care Instructions
          </label>
          <textarea
            value={postOpInstructions}
            onChange={(e) => setPostOpInstructions(e.target.value)}
            className={textareaClass}
            placeholder="Enter post-operative / home care instructions..."
          />
        </div>
      </div>

      {/* Additional Visit Required */}
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <AlertTriangle className="size-4" />
          Visit Status
        </h3>
        {remainingCount > 0 || hasInProgress ? (
          <div>
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Additional treatment remains
                </p>
                <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                  {remainingCount > 0 && `${remainingCount} planned procedure${remainingCount !== 1 ? 's' : ''} not yet completed. `}
                  {hasInProgress && `${inProgressCount} procedure${inProgressCount !== 1 ? 's' : ''} still in progress. `}
                  These will remain available for future visits.
                </p>
              </div>
            </div>
            {remainingCount > 0 && (
              <div className="mt-2 space-y-1">
                {summary.remainingPlanned.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                  >
                    <span className="text-xs text-foreground">{item.procedure}</span>
                    <span
                      className={`inline-flex items-center rounded border px-1.5 py-0.25 text-[10px] font-semibold ${planItemStatusBadgeColor[item.status] || 'border-slate-200 bg-slate-50 text-slate-700'}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                All planned procedures completed
              </p>
              <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                All treatment items for this visit have been completed.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="size-3.5" />
          Responsible Dentist: <strong className="text-foreground">{session.dentist}</strong>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleReturnToTreatment}>
            <ArrowRight className="mr-1 size-4 rotate-180" />
            Return to Treatment
          </Button>
          <Button onClick={handleCompleteVisit} disabled={isCompleting}>
            <CheckCircle2 className="size-4" />
            {isCompleting ? 'Completing...' : 'Complete Visit'}
          </Button>
        </div>
      </div>
    </div>
  );
}