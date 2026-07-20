'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, ClipboardList, FileText, ChevronRight, ListChecks, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientContextHeader } from './patient-context-header';
import { PlannedTreatmentList } from './planned-treatment-list';
import { ProcedureRecordingDrawer } from './procedure-recording-drawer';
import { TreatmentSummaryView } from './treatment-summary-view';
import { CompleteVisitModal } from './complete-visit-modal';
import {
  dummySession,
} from './treatment-execution-data';
import type {
  TreatmentSession, PlannedTreatmentItem, ProcedureExecution,
  InterruptionReason, TreatmentSummary,
} from './treatment-execution-data';
import { procedureStatusBadgeColor } from './treatment-execution-data';

type PageView = 'treatment' | 'summary';

export function TreatmentExecutionPage() {
  const router = useRouter();
  const [session, setSession] = useState<TreatmentSession>(() => ({
    ...dummySession,
    plannedItems: dummySession.plannedItems.map((item) => ({ ...item })),
    completedProcedures: [],
    inProgressProcedure: null,
  }));
  const [view, setView] = useState<PageView>('treatment');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePlannedItem, setActivePlannedItem] = useState<PlannedTreatmentItem | null>(null);
  const [activeExecution, setActiveExecution] = useState<ProcedureExecution | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  /* ── Build summary from current state ── */
  const inProgressItems = session.plannedItems.filter(
    (i) => i.status === 'In Progress'
  );
  const completedItems = session.plannedItems.filter(
    (i) => i.status === 'Completed'
  );
  const remainingPlanned = session.plannedItems.filter(
    (i) => i.status === 'Planned' || i.status === 'Postponed'
  );

  const summary: TreatmentSummary = {
    completedProcedures: session.completedProcedures,
    inProgressProcedures: session.inProgressProcedure
      ? [session.inProgressProcedure]
      : [],
    remainingPlanned,
    dentist: session.dentist,
    totalDuration: session.completedProcedures
      .filter((p) => p.duration)
      .map((p) => p.duration)
      .join(', ') || 'N/A',
    finalNotes: '',
    recommendations: '',
    postOpInstructions: '',
    createdAt: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };

  /* ── Handlers ── */

  const handleStartProcedure = useCallback((item: PlannedTreatmentItem) => {
    const existingExec = session.inProgressProcedure?.treatmentItemId === item.id
      ? session.inProgressProcedure
      : null;

    setActivePlannedItem(item);
    setActiveExecution(existingExec);
    setDrawerOpen(true);

    // Mark item as In Progress if starting fresh
    if (!existingExec) {
      setSession((prev) => ({
        ...prev,
        status: 'In Treatment',
        plannedItems: prev.plannedItems.map((pi) =>
          pi.id === item.id ? { ...pi, status: 'In Progress' as const } : pi
        ),
      }));
    }
  }, [session.inProgressProcedure]);

  const handleSaveDraft = useCallback((execution: ProcedureExecution) => {
    setSession((prev) => ({
      ...prev,
      inProgressProcedure: execution,
    }));
    setDrawerOpen(false);
    setActivePlannedItem(null);
    setActiveExecution(null);
  }, []);

  const handleComplete = useCallback((execution: ProcedureExecution) => {
    setSession((prev) => {
      // Find the corresponding planned item and mark it Completed
      const updatedPlannedItems = prev.plannedItems.map((pi) =>
        pi.id === execution.treatmentItemId
          ? { ...pi, status: 'Completed' as const }
          : pi
      );

      return {
        ...prev,
        plannedItems: updatedPlannedItems,
        completedProcedures: [...prev.completedProcedures, execution],
        inProgressProcedure: null,
      };
    });
    setDrawerOpen(false);
    setActivePlannedItem(null);
    setActiveExecution(null);
  }, []);

  const handleInterrupt = useCallback(
    (execution: ProcedureExecution, _reason: InterruptionReason, _notes: string) => {
      setSession((prev) => {
        const updatedPlannedItems = prev.plannedItems.map((pi) =>
          pi.id === execution.treatmentItemId
            ? { ...pi, status: 'Postponed' as const }
            : pi
        );

        return {
          ...prev,
          plannedItems: updatedPlannedItems,
          completedProcedures: [...prev.completedProcedures, execution],
          inProgressProcedure: null,
        };
      });
      setDrawerOpen(false);
      setActivePlannedItem(null);
      setActiveExecution(null);
    },
    []
  );

  const handleCancel = useCallback(() => {
    // Return planned item back to 'Planned' if it wasn't completed
    if (activePlannedItem) {
      setSession((prev) => ({
        ...prev,
        plannedItems: prev.plannedItems.map((pi) =>
          pi.id === activePlannedItem.id && pi.status === 'In Progress'
            ? { ...pi, status: 'Planned' as const }
            : pi
        ),
      }));
    }
    setDrawerOpen(false);
    setActivePlannedItem(null);
    setActiveExecution(null);
  }, [activePlannedItem]);

  const handleReturnToTreatment = useCallback(() => {
    setView('treatment');
  }, []);

  const handleGoToSummary = useCallback(() => {
    setView('summary');
  }, []);

  const handleSummaryChange = useCallback((newSummary: TreatmentSummary) => {
    // Summary is computed from state, so this is for editable fields
    setSession((prev) => ({
      ...prev,
      // We store editable summary fields in the session for persistence
    }));
  }, []);

  const handleCompleteVisit = useCallback(() => {
    setShowCompleteModal(true);
  }, []);

  const handleConfirmCompleteVisit = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      status: 'Completed',
    }));
    setShowCompleteModal(false);
    // Future: navigate to Billing module
  }, []);

  /* ── Completed procedures grouped ── */
  const hasProceduresDone = session.completedProcedures.length > 0;

  /* ── Derivable statistics for Summary Panel ── */
  const totalEstimatedValue = useMemo(() => {
    return session.plannedItems.reduce((sum, item) => sum + item.estimatedPrice, 0);
  }, [session.plannedItems]);

  const totalEstimatedDuration = useMemo(() => {
    const sumMins = session.plannedItems.reduce((sum, item) => {
      const numericVal = parseInt(item.estimatedDuration.replace(/[^0-9]/g, '')) || 0;
      return sum + numericVal;
    }, 0);
    return `${sumMins} min`;
  }, [session.plannedItems]);

  return (
    <div className="space-y-4 mx-[100px]">
      {/* Back Navigation */}
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

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Treatment Execution</h1>
          <p className="text-sm text-muted-foreground">
            {session.status === 'Completed'
              ? 'Visit completed'
              : view === 'summary'
              ? 'Treatment Summary'
              : 'Active Treatment Session'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {view === 'treatment' && hasProceduresDone && (
            <Button variant="outline" onClick={handleGoToSummary}>
              <ListChecks className="size-4" />
              View Summary
            </Button>
          )}
          {view === 'summary' && (
            <Button variant="outline" onClick={handleReturnToTreatment}>
              <ArrowRight className="size-4 rotate-180" />
              Back to Treatment
            </Button>
          )}
          {view === 'summary' && session.status !== 'Completed' && (
            <Button onClick={handleCompleteVisit}>
              <ClipboardList className="size-4" />
              Complete Visit
            </Button>
          )}
          {session.status === 'Completed' && (
            <Button onClick={() => {}}>
              <FileText className="size-4" />
              Proceed to Billing
            </Button>
          )}
        </div>
      </div>

      {/* Patient Context */}
      <PatientContextHeader session={session} />

      {view === 'treatment' && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
          {/* LEFT 70%: Today's Treatment Plan */}
          <div className="lg:col-span-7 space-y-4">
            {/* Completed procedures summary bar */}
            {session.completedProcedures.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-500/10 dark:bg-emerald-500/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {session.completedProcedures.length} procedure{session.completedProcedures.length !== 1 ? 's' : ''} completed
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleGoToSummary}>
                      <ListChecks className="size-3.5 mr-1" />
                      View Summary
                    </Button>
                    <Button size="sm" className="h-8 text-xs" onClick={handleCompleteVisit}>
                      <ClipboardList className="size-3.5 mr-1" />
                      Complete Visit
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Current in-progress banner */}
            {session.inProgressProcedure && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 dark:border-amber-500/10 dark:bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
                      <Play className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                        In Progress: {session.inProgressProcedure.procedure}
                      </p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                        Tooth {session.inProgressProcedure.toothNumber} · Started at {session.inProgressProcedure.startTime}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      const plannedItem = session.plannedItems.find(
                        (pi) => pi.id === session.inProgressProcedure!.treatmentItemId
                      );
                      if (plannedItem) {
                        setActivePlannedItem(plannedItem);
                        setActiveExecution(session.inProgressProcedure);
                        setDrawerOpen(true);
                      }
                    }}
                  >
                    <Play className="size-3 mr-1" />
                    Resume
                  </Button>
                </div>
              </div>
            )}

            {/* Planned Treatment Items */}
            <PlannedTreatmentList
              items={session.plannedItems}
              onStartProcedure={handleStartProcedure}
            />
          </div>

          {/* RIGHT 30%: Treatment Session Summary panel */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-border bg-card/95 p-4 shadow-sm space-y-3.5">
              <div className="border-b border-border pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Treatment Session Summary</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Session: {session.id}</p>
              </div>

              {/* Session Status & Progress */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/30 p-2 rounded-lg">
                  <span className="block text-[10px] text-muted-foreground">Session Status</span>
                  <span className="font-bold text-foreground mt-0.5 block">{session.status}</span>
                </div>
                <div className="bg-muted/30 p-2 rounded-lg">
                  <span className="block text-[10px] text-muted-foreground">Procedures Done</span>
                  <span className="font-bold text-foreground mt-0.5 block">
                    {session.completedProcedures.length} / {session.plannedItems.length}
                  </span>
                </div>
              </div>

              {/* Active Procedure Details */}
              <div className="border border-border/60 bg-muted/10 p-3 rounded-lg space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Procedure</span>
                {session.inProgressProcedure ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">{session.inProgressProcedure.procedure}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Tooth: <strong className="text-foreground">{session.inProgressProcedure.toothNumber}</strong></span>
                      <span>Started: <strong className="text-foreground">{session.inProgressProcedure.startTime}</strong></span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/80 italic py-1">
                    No active procedure. Select a procedure to begin.
                  </p>
                )}
              </div>

              {/* Duration and Estimated Values */}
              <div className="space-y-2 text-xs border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Planned Duration</span>
                  <span className="font-bold text-foreground">{totalEstimatedDuration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Estimated Price</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">${totalEstimatedValue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'summary' && (
        <TreatmentSummaryView
          session={session}
          summary={summary}
          onSummaryChange={handleSummaryChange}
          onReturnToTreatment={handleReturnToTreatment}
          onCompleteVisit={handleCompleteVisit}
        />
      )}

      {/* Procedure Recording Drawer */}
      <ProcedureRecordingDrawer
        isOpen={drawerOpen}
        plannedItem={activePlannedItem}
        existingExecution={activeExecution}
        onClose={() => { setDrawerOpen(false); setActivePlannedItem(null); setActiveExecution(null); }}
        onSaveDraft={handleSaveDraft}
        onComplete={handleComplete}
        onInterrupt={handleInterrupt}
        onCancel={handleCancel}
      />

      {/* Complete Visit Modal */}
      <CompleteVisitModal
        isOpen={showCompleteModal}
        session={session}
        summary={summary}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleConfirmCompleteVisit}
      />
    </div>
  );
}