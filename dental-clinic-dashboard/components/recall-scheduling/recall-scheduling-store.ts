'use client';

import { patientRecords, type Patient } from '@/components/patients/patient-data';

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
  session: null;
  invoice: null;
  receipt: null;
  summary: null;
  completedVisitLabel: string;
  completedTreatmentLabel: string;
  appointmentId: string | null;
  suggestedDentist: string;
}

/* ── Helpers ── */

export function getTodayDateValue(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isPastDate(dateValue: string, todayValue = getTodayDateValue()): boolean {
  if (!dateValue) return false;
  return dateValue < todayValue;
}

export function addMonths(dateValue: string, months: number): string {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  date.setMonth(date.getMonth() + months);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

/* ── Build Workspace Context (simplified — uses first patient as mock) ── */

export function buildRecallWorkspaceContext(): RecallWorkspaceContext | null {
  const patient = patientRecords[0] ?? null;
  if (!patient) return null;
  return {
    patient,
    session: null,
    invoice: null,
    receipt: null,
    summary: null,
    completedVisitLabel: 'July 23, 2026',
    completedTreatmentLabel: 'Composite Filling',
    appointmentId: null,
    suggestedDentist: 'Dr. Sarah',
  };
}

/* ── Recall Persistence (no-op for UI prototype) ── */

export function loadSavedRecalls(): RecallRecord[] {
  return [];
}

export function saveRecall(_record: RecallRecord): void {
  /* no-op — UI prototype only */
}

export function findDuplicateRecall(
  _patientCode: string,
  _recallType: RecallType,
  _dueDate: string,
): RecallRecord | null {
  return null;
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
  return {
    recallId: `recall-${Date.now()}`,
    patientId: context.patient.patientCode,
    patientName: context.patient.fullName,
    patientCode: context.patient.patientCode,
    appointmentId: null,
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