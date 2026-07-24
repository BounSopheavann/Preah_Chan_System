'use client';

import { patientRecords, type Patient } from '@/components/patients/patient-data';

/* ── Types ── */

export interface FollowUpWorkspaceContext {
  patient: Patient;
  completedVisitLabel: string;
  completedTreatmentLabel: string;
  recommendedReason: string;
  suggestedAppointmentType: string;
  suggestedDentist: string;
}

export interface FollowUpAppointmentRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  phone: string;
  dentist: string;
  appointmentType: string;
  scheduledAt: string;
  dateLabel: string;
  timeLabel: string;
  status: string;
  checkInLabel: string;
  balance: number;
  avatarTone: string;
  reason: string;
  completedVisitLabel: string;
  completedTreatmentLabel: string;
  sourceSessionId: string;
  createdAt: string;
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

function formatDateLabel(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function formatTimeLabel(timeValue: string): string {
  const [hoursRaw, minutesRaw] = timeValue.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 'Not recorded';
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}

/* ── Build Workspace Context (simplified — uses first patient as mock) ── */

export function buildFollowUpWorkspaceContext(): FollowUpWorkspaceContext | null {
  const patient = patientRecords[0] ?? null;
  if (!patient) return null;
  return {
    patient,
    completedVisitLabel: 'July 23, 2026',
    completedTreatmentLabel: 'Composite Filling',
    recommendedReason: 'Post-treatment review',
    suggestedAppointmentType: 'Follow-up',
    suggestedDentist: 'Dr. Sarah',
  };
}

/* ── Persistence (no-op for UI prototype) ── */

export function loadSavedFollowUpAppointment(): FollowUpAppointmentRecord | null {
  return null;
}

export function saveFollowUpAppointment(_record: FollowUpAppointmentRecord): void {
  /* no-op */
}

export function clearSavedFollowUpAppointment(): void {
  /* no-op */
}

/* ── Build Record ── */

export function buildFollowUpAppointmentRecord(args: {
  context: FollowUpWorkspaceContext;
  dateValue: string;
  timeValue: string;
  dentist: string;
  appointmentType: string;
  reason: string;
}): FollowUpAppointmentRecord {
  const { context, dateValue, timeValue, dentist, appointmentType, reason } = args;
  const dateLabel = formatDateLabel(dateValue);
  const timeLabel = formatTimeLabel(timeValue);
  return {
    id: `follow-up-${context.patient.patientCode}-${dateValue}-${timeValue}`,
    appointmentId: `AP-FU-${dateValue.replace(/-/g, '')}-${timeValue.replace(':', '')}`,
    patientId: context.patient.patientCode,
    patientName: context.patient.fullName,
    patientCode: context.patient.patientCode,
    phone: context.patient.phone,
    dentist,
    appointmentType,
    scheduledAt: `${dateValue}T${timeValue}:00`,
    dateLabel,
    timeLabel,
    status: 'Booked',
    checkInLabel: 'Pending',
    balance: context.patient.outstandingBalance,
    avatarTone: context.patient.avatarTone,
    reason,
    completedVisitLabel: context.completedVisitLabel,
    completedTreatmentLabel: context.completedTreatmentLabel,
    sourceSessionId: 'mock-session',
    createdAt: new Date().toISOString(),
  };
}

export function toAppointmentRecord(record: FollowUpAppointmentRecord): import('@/components/appointments/appointment-data').AppointmentRecord {
  return {
    id: record.id,
    appointmentId: record.appointmentId,
    patientName: record.patientName,
    patientCode: record.patientCode,
    phone: record.phone,
    dentist: record.dentist as import('@/components/appointments/appointment-data').DentistName,
    appointmentType: record.appointmentType as import('@/components/appointments/appointment-data').AppointmentType,
    scheduledAt: record.scheduledAt,
    dateLabel: record.dateLabel,
    timeLabel: record.timeLabel,
    status: record.status as import('@/components/appointments/appointment-data').AppointmentStatus,
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