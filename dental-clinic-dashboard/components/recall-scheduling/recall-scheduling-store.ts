'use client';

import {
  loadFlowState,
  buildSummaryFromSession,
} from '@/components/treatment-execution/procedure-workspace-store';
import {
  buildReceiptFromInvoice,
  loadSavedInvoice,
  loadSavedReceipt,
} from '@/components/billing/billing-store';
import type { Invoice, Receipt } from '@/components/billing/billing-data';
import { patientRecords, type Patient } from '@/components/patients/patient-data';
import type {
  TreatmentSession,
  TreatmentSummary,
} from '@/components/treatment-execution/treatment-execution-data';

const STORAGE_KEY = 'preah-chan-recalls';

/* ── Recall Types ── */

export const recallTypes = [
  'Routine Check-up',
  'Treatment Follow-up',
  'Orthodontic Review',
  'Periodontal Maintenance',
  'Other',
] as const;

export type RecallType = (typeof recallTypes)[number];

export const reminderMethods = ['Telegram', 'SMS', 'Phone', 'Email'] as const;

export type ReminderMethod = (typeof reminderMethods)[number];

export type RecallStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Overdue';

/* ── Recall Record ── */

export interface RecallRecord {
  recallId: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  appointmentId: string | null;
  recallType: RecallType;
  dueDate: string;
  dueDateLabel: string;
  reminderMethod: ReminderMethod;
  recallStatus: RecallStatus;
  reminderSentAt: string | null;
  completedAt: string | null;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Workspace Context ── */

export interface RecallWorkspaceContext {
  patient: Patient;
  session: TreatmentSession | null;
  invoice: Invoice | null;
  receipt: Receipt | null;
  summary: TreatmentSummary | null;
  completedVisitLabel: string;
  completedTreatmentLabel: string;
  appointmentId: string | null;
  suggestedDentist: string;
}

/* ── Helpers ── */

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return 'Not recorded';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function resolvePatient(
  session: TreatmentSession | null,
  invoice: Invoice | null,
  receipt: Receipt | null,
) {
  const identifiers = [
    session?.patientId,
    invoice?.patientId,
    receipt?.patientId,
    session?.patientName,
    invoice?.patientName,
    receipt?.patientName,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return (
    patientRecords.find((record) => {
      return (
        identifiers.includes(record.patientCode.toLowerCase()) ||
        identifiers.includes(record.fullName.toLowerCase())
      );
    }) ?? null
  );
}

function deriveCompletedVisitLabel(
  session: TreatmentSession | null,
  invoice: Invoice | null,
  receipt: Receipt | null,
) {
  return (
    session?.appointmentDate ??
    receipt?.appointmentDate ??
    invoice?.appointmentDate ??
    'Not recorded'
  );
}

function deriveCompletedTreatmentLabel(
  session: TreatmentSession | null,
  summary: TreatmentSummary | null,
) {
  const completedProcedures =
    session?.completedProcedures ?? summary?.completedProcedures ?? [];
  if (completedProcedures.length === 0) {
    return summary?.finalNotes?.trim() || 'Not recorded';
  }
  return completedProcedures
    .map((p) => p.procedure)
    .filter(Boolean)
    .join(', ');
}

/* ── Build Workspace Context ── */

export function buildRecallWorkspaceContext(): RecallWorkspaceContext | null {
  const storedFlow = loadFlowState();
  const storedInvoice = loadSavedInvoice();
  const storedReceipt = loadSavedReceipt();

  const session = storedFlow?.session ?? null;
  const invoice = storedInvoice;
  const receipt =
    storedReceipt ??
    (storedInvoice &&
    storedInvoice.status !== 'Draft' &&
    storedInvoice.finalizedAt
      ? buildReceiptFromInvoice(storedInvoice)
      : null);
  const summary = session ? buildSummaryFromSession(session) : null;
  const patient = resolvePatient(session, invoice, receipt);

  if (!patient) {
    return null;
  }

  return {
    patient,
    session,
    invoice,
    receipt,
    summary,
    completedVisitLabel: deriveCompletedVisitLabel(session, invoice, receipt),
    completedTreatmentLabel: deriveCompletedTreatmentLabel(session, summary),
    appointmentId: session?.id ?? null,
    suggestedDentist:
      session?.dentist ??
      receipt?.dentist ??
      invoice?.dentist ??
      'Not recorded',
  };
}

/* ── Recall Persistence ── */

export function loadSavedRecalls(): RecallRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecallRecord[];
  } catch {
    return [];
  }
}

function saveRecalls(recalls: RecallRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recalls));
}

export function saveRecall(record: RecallRecord): void {
  const recalls = loadSavedRecalls();
  const existingIndex = recalls.findIndex(
    (r) => r.recallId === record.recallId,
  );
  if (existingIndex >= 0) {
    recalls[existingIndex] = record;
  } else {
    recalls.push(record);
  }
  saveRecalls(recalls);
}

export function findDuplicateRecall(
  patientCode: string,
  recallType: RecallType,
  dueDate: string,
): RecallRecord | null {
  const recalls = loadSavedRecalls();
  return (
    recalls.find(
      (r) =>
        r.patientCode.toLowerCase() === patientCode.toLowerCase() &&
        r.recallType === recallType &&
        r.dueDate === dueDate &&
        r.recallStatus === 'Pending',
    ) ?? null
  );
}

/* ── Build Recall Record ── */

export function buildRecallRecord(args: {
  context: RecallWorkspaceContext;
  recallType: RecallType;
  dueDate: string;
  reminderMethod: ReminderMethod;
  notes: string;
}): RecallRecord {
  const { context, recallType, dueDate, reminderMethod, notes } = args;
  const now = new Date().toISOString();
  const timestamp = Date.now();
  const patientCodeClean = context.patient.patientCode.replace(
    /[^a-zA-Z0-9]/g,
    '',
  );
  const dueDateClean = dueDate.replace(/-/g, '');

  return {
    recallId: `recall-${patientCodeClean}-${dueDateClean}-${timestamp}`,
    patientId: context.patient.patientCode,
    patientName: context.patient.fullName,
    patientCode: context.patient.patientCode,
    appointmentId: context.appointmentId,
    recallType,
    dueDate,
    dueDateLabel: formatDateLabel(dueDate),
    reminderMethod,
    recallStatus: 'Pending',
    reminderSentAt: null,
    completedAt: null,
    notes: notes.trim(),
    createdBy: context.suggestedDentist || 'Receptionist',
    createdAt: now,
    updatedAt: now,
  };
}

/* ── Date Utilities ── */

export function getTodayDateValue() {
  return getLocalDateValue();
}

export function isPastDate(dateValue: string, todayValue = getLocalDateValue()) {
  if (!dateValue) return false;
  return dateValue < todayValue;
}

export function addMonths(dateValue: string, months: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  date.setMonth(date.getMonth() + months);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}