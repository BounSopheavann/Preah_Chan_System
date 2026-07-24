'use client';

/* ── Reminder Types ── */

export const reminderDeliveryStatuses = ['Pending', 'Sent', 'Failed'] as const;
export type ReminderDeliveryStatus = (typeof reminderDeliveryStatuses)[number];

export interface ReminderAttempt {
  attemptNumber: number;
  attemptedAt: string;
  status: ReminderDeliveryStatus;
  failureReason?: string | null;
}

export interface ReminderRecord {
  reminderId: string;
  recallId: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  recallType: string;
  dueDate: string;
  dueDateLabel: string;
  reminderMethod: string;
  reminderStatus: ReminderDeliveryStatus;
  sentAt: string | null;
  attemptCount: number;
  lastAttemptAt: string | null;
  failureReason: string | null;
  history: ReminderAttempt[];
  createdAt: string;
  updatedAt: string;
}

/* ── Static mock data ── */

const MOCK_REMINDERS: ReminderRecord[] = [
  {
    reminderId: 'rm-001',
    recallId: 'recall-001',
    patientId: 'pt-001',
    patientName: 'Ariana Lopez',
    patientCode: 'PC-1001',
    recallType: 'Routine Check-up',
    dueDate: '2026-08-01',
    dueDateLabel: 'August 1, 2026',
    reminderMethod: 'Telegram',
    reminderStatus: 'Pending',
    sentAt: null,
    attemptCount: 0,
    lastAttemptAt: null,
    failureReason: null,
    history: [],
    createdAt: '2026-07-23T00:00:00.000Z',
    updatedAt: '2026-07-23T00:00:00.000Z',
  },
  {
    reminderId: 'rm-002',
    recallId: 'recall-002',
    patientId: 'pt-002',
    patientName: 'Daniel Kim',
    patientCode: 'PC-1002',
    recallType: 'Periodontal Maintenance',
    dueDate: '2026-07-25',
    dueDateLabel: 'July 25, 2026',
    reminderMethod: 'SMS',
    reminderStatus: 'Sent',
    sentAt: '2026-07-22T10:00:00.000Z',
    attemptCount: 1,
    lastAttemptAt: '2026-07-22T10:00:00.000Z',
    failureReason: null,
    history: [{ attemptNumber: 1, attemptedAt: '2026-07-22T10:00:00.000Z', status: 'Sent' }],
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-22T10:00:00.000Z',
  },
  {
    reminderId: 'rm-003',
    recallId: 'recall-003',
    patientId: 'pt-003',
    patientName: 'Sofia Martin',
    patientCode: 'PC-1003',
    recallType: 'Treatment Follow-up',
    dueDate: '2026-07-20',
    dueDateLabel: 'July 20, 2026',
    reminderMethod: 'Telegram',
    reminderStatus: 'Failed',
    sentAt: null,
    attemptCount: 2,
    lastAttemptAt: '2026-07-21T14:00:00.000Z',
    failureReason: 'Telegram user not found',
    history: [
      { attemptNumber: 1, attemptedAt: '2026-07-19T09:00:00.000Z', status: 'Failed', failureReason: 'Network error' },
      { attemptNumber: 2, attemptedAt: '2026-07-21T14:00:00.000Z', status: 'Failed', failureReason: 'Telegram user not found' },
    ],
    createdAt: '2026-07-18T00:00:00.000Z',
    updatedAt: '2026-07-21T14:00:00.000Z',
  },
];

/* ── Simple mock functions ── */

export function loadSavedReminders(): ReminderRecord[] {
  return MOCK_REMINDERS;
}

export function deriveRemindersFromRecalls(): ReminderRecord[] {
  return MOCK_REMINDERS;
}

export function sendReminderNow(reminderId: string): { success: boolean; error?: string } {
  return { success: true };
}

export function retryFailedReminder(reminderId: string): { success: boolean; error?: string } {
  return { success: true };
}

export function simulateFailedReminder(reminderId: string, reason?: string): { success: boolean; error?: string } {
  return { success: true };
}

export function getReminderHistory(reminderId: string): ReminderAttempt[] {
  const reminder = MOCK_REMINDERS.find((r) => r.reminderId === reminderId);
  return reminder?.history ?? [];
}

export function updateRecallReminderDate(recallId: string): void {
  /* no-op */
}

export function getDueDateLabel(dueDate: string): string {
  return 'Due soon';
}

export function rederiveAllReminders(): void {
  /* no-op */
}