'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  ListChecks,
  Play,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PatientContextHeader } from './patient-context-header';
import { PlannedTreatmentList } from './planned-treatment-list';
import {
  applyProcedureStart,
  createDefaultFlowState,
  loadFlowState,
  saveFlowState,
  type TreatmentFlowState,
} from './procedure-workspace-store';
import type { PlannedTreatmentItem } from './treatment-execution-data';

export function TreatmentExecutionPage() {
  const router = useRouter();
  const [flow, setFlow] = useState<TreatmentFlowState>(() => createDefaultFlowState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFlowState();
    if (stored) {
      setFlow(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveFlowState(flow);
  }, [flow, hydrated]);

  const session = flow.session;

  const totalEstimatedValue = useMemo(() => {
    return session.plannedItems.reduce((sum, item) => sum + item.estimatedPrice, 0);
  }, [session.plannedItems]);

  const totalEstimatedDuration = useMemo(() => {
    const sumMins = session.plannedItems.reduce((sum, item) => {
      const numericVal = parseInt(item.estimatedDuration.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + numericVal;
    }, 0);
    return `${sumMins} min`;
  }, [session.plannedItems]);

  const handleStartProcedure = useCallback(
    (item: PlannedTreatmentItem) => {
      const nextFlow = applyProcedureStart(
        flow,
        item,
        session.dentist,
        session.assistant || 'Nurse Lina'
      );
      setFlow(nextFlow);
      saveFlowState(nextFlow);
      router.push('/active-procedure-workspace');
    },
    [flow, router, session.assistant, session.dentist]
  );

  const handleFinishVisit = useCallback(() => {
    // Save current state before navigating to Treatment Summary
    saveFlowState(flow);
    router.push('/treatment-summary');
  }, [flow, router]);

  const hasProceduresDone = session.completedProcedures.length > 0;

  if (!hydrated) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading treatment execution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-[100px]">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/clinical-examination')}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Clinical Examination
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Treatment Execution</h1>
          <p className="text-sm text-muted-foreground">
            {session.status === 'Completed'
              ? 'Visit completed'
              : 'Active Treatment Session'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasProceduresDone && session.status !== 'Completed' && (
            <Button variant="outline" onClick={handleFinishVisit}>
              <ListChecks className="size-4" />
              View Summary
            </Button>
          )}
          {hasProceduresDone && session.status !== 'Completed' && (
            <Button onClick={handleFinishVisit}>
              <ClipboardList className="size-4" />
              Finish Visit
            </Button>
          )}
          {session.status === 'Completed' && (
            <Button variant="outline" onClick={() => router.push('/billing')}>
              <ArrowRight className="size-4" />
              Go to Billing
            </Button>
          )}
        </div>
      </div>

      <PatientContextHeader session={session} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-10">
        <div className="space-y-4 lg:col-span-7">
          {session.completedProcedures.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-500/10 dark:bg-emerald-500/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {session.completedProcedures.length} procedure
                  {session.completedProcedures.length !== 1 ? 's' : ''} completed
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleFinishVisit}>
                    <ListChecks className="mr-1 size-3.5" />
                    View Summary
                  </Button>
                  <Button size="sm" className="h-8 text-xs" onClick={handleFinishVisit}>
                    <ClipboardList className="mr-1 size-3.5" />
                    Finish Visit
                  </Button>
                </div>
              </div>
            </div>
          )}

          {session.inProgressProcedure && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 dark:border-amber-500/10 dark:bg-amber-500/5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                    <Play className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                      In Progress: {session.inProgressProcedure.procedure}
                    </p>
                    <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                      Tooth {session.inProgressProcedure.toothNumber} · Started at {session.inProgressProcedure.startTime}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => router.push('/active-procedure-workspace')}
                >
                  <Play className="mr-1 size-3" />
                  Resume
                </Button>
              </div>
            </div>
          )}

          <PlannedTreatmentList
            items={session.plannedItems}
            onStartProcedure={handleStartProcedure}
            highlightedItemId={session.lastCompletedItemId || null}
          />
        </div>

        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-border bg-card/95 p-4 shadow-sm space-y-3.5">
            <div className="border-b border-border pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Treatment Session Summary
              </h4>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Session: {session.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/30 p-2">
                <span className="block text-[10px] text-muted-foreground">Session Status</span>
                <span className="mt-0.5 block font-bold text-foreground">{session.status}</span>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <span className="block text-[10px] text-muted-foreground">Procedures Done</span>
                <span className="mt-0.5 block font-bold text-foreground">
                  {session.completedProcedures.length} / {session.plannedItems.length}
                </span>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/10 p-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Active Procedure
              </span>
              {session.inProgressProcedure ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    {session.inProgressProcedure.procedure}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>
                      Tooth: <strong className="text-foreground">{session.inProgressProcedure.toothNumber}</strong>
                    </span>
                    <span>
                      Started: <strong className="text-foreground">{session.inProgressProcedure.startTime}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="py-1 text-xs italic text-muted-foreground/80">
                  No active procedure. Select a procedure to begin.
                </p>
              )}
            </div>

            <div className="space-y-2 border-t border-border pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Planned Duration</span>
                <span className="font-bold text-foreground">{totalEstimatedDuration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Estimated Price</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ${totalEstimatedValue}
                </span>
              </div>
            </div>
          </div>

          {/* Finish Visit card when procedures are done */}
          {hasProceduresDone && session.status !== 'Completed' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-500/10 dark:bg-emerald-500/5">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Ready for Final Review
              </p>
              <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                {session.completedProcedures.length} procedure{session.completedProcedures.length !== 1 ? 's' : ''} completed.
                Finish the visit to proceed to summary and billing.
              </p>
              <Button size="sm" className="mt-3 h-8 w-full text-xs" onClick={handleFinishVisit}>
                <ClipboardList className="mr-1 size-3.5" />
                Finish Visit
              </Button>
            </div>
          )}

          {/* Completed state */}
          {session.status === 'Completed' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-500/10 dark:bg-emerald-500/5">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Visit Completed
              </p>
              <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                This visit has been completed and procedures are marked as billing-eligible.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="h-8 flex-1 text-xs" onClick={() => router.push('/billing')}>
                  Go to Billing
                </Button>
                <Button size="sm" variant="outline" className="h-8 flex-1 text-xs" onClick={handleFinishVisit}>
                  View Summary
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}