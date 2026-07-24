'use client';

import { nowTime } from '@/components/clinical-examination/patient-context';
import {
  dummySession,
  type PlannedTreatmentItem,
  type ProcedureExecution,
  type TreatmentSession,
  type TreatmentSummary,
} from './treatment-execution-data';

export interface TreatmentFlowState {
  session: TreatmentSession;
  activeItemId: string | null;
  workspaceStartedAt: number | null;
  lastSavedAt: string | null;
}

function cloneSession(session: TreatmentSession): TreatmentSession {
  return structuredClone(session);
}

export function createDefaultFlowState(): TreatmentFlowState {
  return {
    session: cloneSession(dummySession),
    activeItemId: null,
    workspaceStartedAt: null,
    lastSavedAt: null,
  };
}

export function loadFlowState(): TreatmentFlowState | null {
  return createDefaultFlowState();
}

export function saveFlowState(_state: TreatmentFlowState): void {
  /* no-op — UI prototype only */
}

export function clearFlowState(): void {
  /* no-op — UI prototype only */
}

export function buildProcedureExecution(
  item: PlannedTreatmentItem,
  dentist: string,
  assistant: string,
  existingExecution?: ProcedureExecution | null
): ProcedureExecution {
  return {
    id: existingExecution?.id || `exec-${item.id}-${Date.now()}`,
    treatmentItemId: item.id,
    procedure: item.procedure,
    procedureCode: item.procedureCode,
    toothNumber: item.toothArea,
    toothSurface: [...item.toothSurface],
    dentist,
    assistant,
    startTime: existingExecution?.startTime || nowTime(),
    startedAtMs: existingExecution?.startedAtMs || Date.now(),
    endTime: existingExecution?.endTime,
    status: existingExecution?.status || 'In Progress',
    clinicalNotes: existingExecution?.clinicalNotes || '',
    complications: existingExecution?.complications || '',
    quantity: existingExecution?.quantity || 1,
    duration: existingExecution?.duration || item.estimatedDuration,
    anesthesiaUsed: existingExecution?.anesthesiaUsed || false,
    anesthesia: existingExecution?.anesthesia,
    consumables: existingExecution?.consumables ? structuredClone(existingExecution.consumables) : [],
    attachments: existingExecution?.attachments ? structuredClone(existingExecution.attachments) : [],
    prescriptions: existingExecution?.prescriptions ? structuredClone(existingExecution.prescriptions) : [],
    interruptionReason: existingExecution?.interruptionReason,
    interruptionNotes: existingExecution?.interruptionNotes,
  };
}

export function updatePlannedItemStatus(
  session: TreatmentSession,
  itemId: string,
  status: PlannedTreatmentItem['status']
): TreatmentSession {
  return {
    ...session,
    plannedItems: session.plannedItems.map((item) =>
      item.id === itemId ? { ...item, status } : item
    ),
  };
}

export function applyProcedureStart(
  flow: TreatmentFlowState,
  item: PlannedTreatmentItem,
  dentist: string,
  assistant: string
): TreatmentFlowState {
  const execution = buildProcedureExecution(item, dentist, assistant, flow.session.inProgressProcedure);

  return {
    ...flow,
    session: {
      ...updatePlannedItemStatus(flow.session, item.id, 'In Progress'),
      status: 'In Treatment',
      assistant,
      inProgressProcedure: execution,
      lastCompletedItemId: null,
    },
    activeItemId: item.id,
    workspaceStartedAt: execution.startedAtMs || Date.now(),
  };
}

export function applyProcedureCompletion(flow: TreatmentFlowState): TreatmentFlowState {
  const activeExecution = flow.session.inProgressProcedure;

  if (!activeExecution) {
    return flow;
  }

  const completedExecution: ProcedureExecution = {
    ...activeExecution,
    status: 'Completed',
    endTime: nowTime(),
  };

  const updatedSession = updatePlannedItemStatus(
    flow.session,
    activeExecution.treatmentItemId,
    'Completed'
  );

  return {
    ...flow,
    session: {
      ...updatedSession,
      completedProcedures: [...updatedSession.completedProcedures, completedExecution],
      inProgressProcedure: null,
      status: updatedSession.plannedItems.every((item) => item.status === 'Completed')
        ? 'Completed'
        : 'In Chair',
      lastCompletedItemId: activeExecution.treatmentItemId,
    },
    activeItemId: null,
    workspaceStartedAt: null,
  };
}

export function applyProcedureIncomplete(flow: TreatmentFlowState): TreatmentFlowState {
  const activeExecution = flow.session.inProgressProcedure;

  if (!activeExecution) {
    return flow;
  }

  const updatedSession = updatePlannedItemStatus(
    flow.session,
    activeExecution.treatmentItemId,
    'Postponed'
  );

  return {
    ...flow,
    session: {
      ...updatedSession,
      inProgressProcedure: null,
      status: updatedSession.plannedItems.every((item) => item.status === 'Completed')
        ? 'Completed'
        : 'In Chair',
      lastCompletedItemId: null,
    },
    activeItemId: null,
    workspaceStartedAt: null,
  };
}

/* ── Treatment Summary Store Functions ── */

export interface VisitCompletionData {
  finalNotes: string;
  recommendations: string;
  postOpInstructions: string;
}

export function applySummaryFieldUpdate(
  flow: TreatmentFlowState,
  field: keyof VisitCompletionData,
  value: string
): TreatmentFlowState {
  return {
    ...flow,
    session: {
      ...flow.session,
      summary: {
        ...flow.session.summary,
        [field]: value,
      } as TreatmentSummary,
    },
  };
}

export function applyVisitCompletion(
  flow: TreatmentFlowState,
  completionData: VisitCompletionData
): TreatmentFlowState {
  const updatedProcedures = flow.session.completedProcedures.map((proc) => ({
    ...proc,
    billingEligible: true,
  }));

  const now = new Date().toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    ...flow,
    session: {
      ...flow.session,
      status: 'Completed',
      completedProcedures: updatedProcedures,
      summary: {
        completedProcedures: updatedProcedures,
        inProgressProcedures: flow.session.inProgressProcedure
          ? [flow.session.inProgressProcedure]
          : [],
        remainingPlanned: flow.session.plannedItems.filter(
          (item) => item.status === 'Planned' || item.status === 'Postponed'
        ),
        dentist: flow.session.dentist,
        totalDuration:
          updatedProcedures
            .filter((proc) => proc.duration)
            .map((proc) => proc.duration)
            .join(', ') || 'N/A',
        finalNotes: completionData.finalNotes,
        recommendations: completionData.recommendations,
        postOpInstructions: completionData.postOpInstructions,
        createdAt: now,
      },
    },
  };
}

export function buildSummaryFromSession(session: TreatmentSession): TreatmentSummary {
  const activeExecution = session.inProgressProcedure;
  const remainingPlanned = session.plannedItems.filter(
    (item) => item.status === 'Planned' || item.status === 'Postponed'
  );

  return {
    completedProcedures: session.completedProcedures,
    inProgressProcedures: activeExecution ? [activeExecution] : [],
    remainingPlanned,
    dentist: session.dentist,
    totalDuration:
      session.completedProcedures
        .filter((proc) => proc.duration)
        .map((proc) => proc.duration)
        .join(', ') || 'N/A',
    finalNotes: session.summary?.finalNotes || '',
    recommendations: session.summary?.recommendations || '',
    postOpInstructions: session.summary?.postOpInstructions || '',
    createdAt: session.summary?.createdAt || new Date().toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}