'use client';

import { appointmentTypes, type AppointmentRecord, type AppointmentType, dentistOptions } from '@/components/appointments/appointment-data';
import { loadFlowState, buildSummaryFromSession } from '@/components/treatment-execution/procedure-workspace-store';
import { buildReceiptFromInvoice, loadSavedInvoice, loadSavedReceipt, type Invoice, type Receipt } from '@/components/billing/billing-store';
import { patientRecords, type Patient } from '@/components/patients/patient-data';
import type { TreatmentSession, TreatmentSummary } from '@/components/treatment-execution/treatment-execution-data';

const STORAGE_KEY = 'preah-chan-follow-up-appointment';

export interface FollowUpWorkspaceContext {
  patient: Patient;
  session: TreatmentSession | null;
  invoice: Invoice | null;
  receipt: Receipt | null;
  summary: TreatmentSummary | null;
  completedVisitLabel: string;
  completedTreatmentLabel: string;
  recommendedReason: string;
  suggestedAppointmentType: AppointmentType;
  suggestedDentist: string;
}

export interface FollowUpAppointmentRecord extends AppointmentRecord {
  patientId: string;
  reason: string;
  completedVisitLabel: string;
  completedTreatmentLabel: string;
  sourceSessionId: string;
  createdAt: string;
}

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

function formatTimeLabel(timeValue: string) {
  const [hoursRaw, minutesRaw] = timeValue.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 'Not recorded';
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function buildScheduledAt(dateValue: string, timeValue: string) {
  return `${dateValue}T${timeValue}:00`;
}

function parseVisitLabel(label?: string | null) {
  const raw = label?.trim();
  if (!raw || raw.toLowerCase() === 'no appointment') {
    return null;
  }

  const parts = raw.split(' - ');
  return {
    dateLabel: parts[0]?.trim() || 'Not recorded',
    reason: parts.slice(1).join(' - ').trim() || 'Post-treatment review',
  };
}

function resolvePatient(session: TreatmentSession | null, invoice: Invoice | null, receipt: Receipt | null) {
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
      return identifiers.includes(record.patientCode.toLowerCase()) || identifiers.includes(record.fullName.toLowerCase());
    }) ?? null
  );
}

function deriveRecommendedReason(summary: TreatmentSummary | null, patient: Patient | null) {
  const summaryReason = summary?.recommendations?.trim();
  if (summaryReason) {
    return summaryReason;
  }

  const visitLabel = parseVisitLabel(patient?.upcomingAppointment);
  if (visitLabel?.reason) {
    return visitLabel.reason;
  }

  return 'Post-treatment review';
}

function deriveCompletedVisitLabel(session: TreatmentSession | null, invoice: Invoice | null, receipt: Receipt | null) {
  return session?.appointmentDate ?? receipt?.appointmentDate ?? invoice?.appointmentDate ?? 'Not recorded';
}

function deriveCompletedTreatmentLabel(session: TreatmentSession | null, summary: TreatmentSummary | null) {
  const completedProcedures = session?.completedProcedures ?? summary?.completedProcedures ?? [];
  if (completedProcedures.length === 0) {
    return summary?.finalNotes?.trim() || 'Not recorded';
  }

  return completedProcedures
    .map((procedure) => procedure.procedure)
    .filter(Boolean)
    .join(', ');
}

function deriveSuggestedDentist(session: TreatmentSession | null, receipt: Receipt | null, invoice: Invoice | null, patient: Patient | null) {
  return session?.dentist ?? receipt?.dentist ?? invoice?.dentist ?? patient?.appointments.at(-1)?.dentist ?? dentistOptions[0];
}

export function buildFollowUpWorkspaceContext(): FollowUpWorkspaceContext | null {
  const storedFlow = loadFlowState();
  const storedInvoice = loadSavedInvoice();
  const storedReceipt = loadSavedReceipt();

  const session = storedFlow?.session ?? null;
  const invoice = storedInvoice;
  const receipt = storedReceipt ?? (storedInvoice && storedInvoice.status !== 'Draft' && storedInvoice.finalizedAt ? buildReceiptFromInvoice(storedInvoice) : null);
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
    recommendedReason: deriveRecommendedReason(summary, patient),
    suggestedAppointmentType: (appointmentTypes.find((type) => type === 'Follow-up') ?? appointmentTypes[0]) as AppointmentType,
    suggestedDentist: deriveSuggestedDentist(session, receipt, invoice, patient),
  };
}

export function loadSavedFollowUpAppointment(): FollowUpAppointmentRecord | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FollowUpAppointmentRecord;
  } catch {
    return null;
  }
}

export function saveFollowUpAppointment(record: FollowUpAppointmentRecord): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function clearSavedFollowUpAppointment(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isPastDate(dateValue: string, todayValue = getLocalDateValue()) {
  if (!dateValue) {
    return false;
  }

  return dateValue < todayValue;
}

export function buildFollowUpAppointmentRecord(args: {
  context: FollowUpWorkspaceContext;
  dateValue: string;
  timeValue: string;
  dentist: string;
  appointmentType: string;
  reason: string;
}): FollowUpAppointmentRecord {
  const { context, dateValue, timeValue, dentist, appointmentType, reason } = args;
  const scheduledAt = buildScheduledAt(dateValue, timeValue);
  const dateLabel = formatDateLabel(dateValue);
  const timeLabel = formatTimeLabel(timeValue);
  const appointmentId = `AP-FU-${dateValue.replace(/-/g, '')}-${timeValue.replace(':', '')}-${context.patient.patientCode.replace(/[^a-zA-Z0-9]/g, '')}`;

  return {
    id: `follow-up-${context.patient.patientCode}-${dateValue}-${timeValue}`,
    appointmentId,
    patientId: context.patient.patientCode,
    patientName: context.patient.fullName,
    patientCode: context.patient.patientCode,
    phone: context.patient.phone,
    dentist,
    appointmentType,
    scheduledAt,
    dateLabel,
    timeLabel,
    status: 'Booked',
    checkInLabel: 'Pending',
    balance: context.patient.outstandingBalance,
    avatarTone: context.patient.avatarTone,
    reason,
    completedVisitLabel: context.completedVisitLabel,
    completedTreatmentLabel: context.completedTreatmentLabel,
    sourceSessionId: context.session?.id ?? 'Not recorded',
    createdAt: new Date().toISOString(),
  };
}

export function toAppointmentRecord(record: FollowUpAppointmentRecord): AppointmentRecord {
  return {
    id: record.id,
    appointmentId: record.appointmentId,
    patientName: record.patientName,
    patientCode: record.patientCode,
    phone: record.phone,
    dentist: record.dentist,
    appointmentType: record.appointmentType as AppointmentType,
    scheduledAt: record.scheduledAt,
    dateLabel: record.dateLabel,
    timeLabel: record.timeLabel,
    status: record.status,
    checkInLabel: record.checkInLabel,
    checkInAt: null,
    priority: undefined,
    medicalAlert: null,
    medicalAlertTooltip: null,
    balance: record.balance,
    avatarTone: record.avatarTone,
  };
}

export function formatFollowUpSummary(record: FollowUpAppointmentRecord) {
  return {
    nextAppointmentLabel: `${record.dateLabel} - ${record.timeLabel}`,
    appointmentType: record.appointmentType,
    dentist: record.dentist,
    reason: record.reason,
  };
}

export function getTodayDateValue() {
  return getLocalDateValue();
}
