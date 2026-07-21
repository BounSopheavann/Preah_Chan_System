'use client';

import { nowTime } from '@/components/clinical-examination/patient-context';
import {
  dummySession,
  type PlannedTreatmentItem,
  type ProcedureExecution,
  type TreatmentSession,
} from './treatment-execution-data';

const STORAGE_KEY = 'preah-chan-treatment-flow';

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
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as TreatmentFlowState;
    return {
      session: cloneSession(parsed.session),
      activeItemId: parsed.activeItemId ?? null,
      workspaceStartedAt: parsed.workspaceStartedAt ?? null,
      lastSavedAt: parsed.lastSavedAt ?? null,
    };
  } catch {
    return null;
  }
}

export function saveFlowState(state: TreatmentFlowState): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      lastSavedAt: new Date().toISOString(),
    })
  );
}

export function clearFlowState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
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
