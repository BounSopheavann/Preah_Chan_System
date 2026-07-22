'use client';

import { loadSavedRecalls, type RecallRecord, type RecallStatus } from '@/components/recall-scheduling/recall-scheduling-store';

const REMINDERS_KEY = 'preah-chan-reminders';

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

/* ── Helpers ── */

function getNowISO(): string {
  return new Date().toISOString();
}

function getTodayDateValue(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function generateReminderId(recall: RecallRecord): string {
  const ts = Date.now();
  const code = recall.patientCode.replace(/[^a-zA-Z0-9]/g, '');
  return `reminder-${code}-${ts}`;
}

/* ── Persistence ── */

export function loadSavedReminders(): ReminderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(REMINDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReminderRecord[];
  } catch {
    return [];
  }
}

function saveReminders(reminders: ReminderRecord[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

/* ── Derive reminders from pending recalls ── */

/**
 * Derives ReminderRecord entries from Pending recalls that don't already
 * have a corresponding reminder. This prevents duplicate entries on every page load.
 */
export function deriveRemindersFromRecalls(): ReminderRecord[] {
  const recalls = loadSavedRecalls();
  const reminders = loadSavedReminders();

  // Build a set of recallIds that already have reminders
  const existingRecallIds = new Set(reminders.map((r) => r.recallId));

  const newReminders: ReminderRecord[] = [];

  for (const recall of recalls) {
    // Only derive from Pending recalls that don't yet have a reminder entry
    if (existingRecallIds.has(recall.recallId)) continue;
    if (recall.recallStatus !== 'Pending') continue;

    const now = getNowISO();

    const reminder: ReminderRecord = {
      reminderId: generateReminderId(recall),
      recallId: recall.recallId,
      patientId: recall.patientId,
      patientName: recall.patientName,
      patientCode: recall.patientCode,
      recallType: recall.recallType,
      dueDate: recall.dueDate,
      dueDateLabel: recall.dueDateLabel,
      reminderMethod: recall.reminderMethod,
      reminderStatus: 'Pending',
      sentAt: null,
      attemptCount: 0,
      lastAttemptAt: null,
      failureReason: null,
      history: [],
      createdAt: now,
      updatedAt: now,
    };

    newReminders.push(reminder);
  }

  if (newReminders.length > 0) {
    saveReminders([...reminders, ...newReminders]);
    return loadSavedReminders();
  }

  return reminders;
}

/* ── Send Now ── */

export function sendReminderNow(reminderId: string): { success: boolean; error?: string } {
  try {
    const reminders = loadSavedReminders();
    const idx = reminders.findIndex((r) => r.reminderId === reminderId);
    if (idx < 0) return { success: false, error: 'Reminder not found.' };

    const reminder = reminders[idx];
    if (reminder.reminderStatus === 'Sent') {
      return { success: false, error: 'Reminder has already been sent.' };
    }

    const now = getNowISO();
    const attemptNumber = reminder.attemptCount + 1;

    const attempt: ReminderAttempt = {
      attemptNumber,
      attemptedAt: now,
      status: 'Sent',
    };

    reminders[idx] = {
      ...reminder,
      reminderStatus: 'Sent',
      sentAt: now,
      attemptCount: attemptNumber,
      lastAttemptAt: now,
      failureReason: null,
      history: [...reminder.history, attempt],
      updatedAt: now,
    };

    saveReminders(reminders);
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* ── Retry Failed ── */

export function retryFailedReminder(reminderId: string): { success: boolean; error?: string } {
  try {
    const reminders = loadSavedReminders();
    const idx = reminders.findIndex((r) => r.reminderId === reminderId);
    if (idx < 0) return { success: false, error: 'Reminder not found.' };

    const reminder = reminders[idx];
    if (reminder.reminderStatus !== 'Failed') {
      return { success: false, error: 'Only failed reminders can be retried.' };
    }

    const now = getNowISO();
    const attemptNumber = reminder.attemptCount + 1;

    const attempt: ReminderAttempt = {
      attemptNumber,
      attemptedAt: now,
      status: 'Sent',
    };

    reminders[idx] = {
      ...reminder,
      reminderStatus: 'Sent',
      sentAt: now,
      attemptCount: attemptNumber,
      lastAttemptAt: now,
      failureReason: null,
      history: [...reminder.history, attempt],
      updatedAt: now,
    };

    saveReminders(reminders);
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* ── Simulate Failed Reminder (for testing/edge cases) ── */

export function simulateFailedReminder(
  reminderId: string,
  reason = 'Simulated delivery failure',
): { success: boolean; error?: string } {
  try {
    const reminders = loadSavedReminders();
    const idx = reminders.findIndex((r) => r.reminderId === reminderId);
    if (idx < 0) return { success: false, error: 'Reminder not found.' };

    const reminder = reminders[idx];
    const now = getNowISO();
    const attemptNumber = reminder.attemptCount + 1;

    const attempt: ReminderAttempt = {
      attemptNumber,
      attemptedAt: now,
      status: 'Failed',
      failureReason: reason,
    };

    reminders[idx] = {
      ...reminder,
      reminderStatus: 'Failed',
      attemptCount: attemptNumber,
      lastAttemptAt: now,
      failureReason: reason,
      history: [...reminder.history, attempt],
      updatedAt: now,
    };

    saveReminders(reminders);
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/* ── Get Reminder History ── */

export function getReminderHistory(reminderId: string): ReminderAttempt[] {
  const reminders = loadSavedReminders();
  const reminder = reminders.find((r) => r.reminderId === reminderId);
  return reminder?.history ?? [];
}

/* ── Update recall's last_reminder_at when a reminder is sent ── */

export function updateRecallReminderDate(recallId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const STORAGE_KEY = 'preah-chan-recalls';
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const recalls: RecallRecord[] = JSON.parse(raw);
    const idx = recalls.findIndex((r) => r.recallId === recallId);
    if (idx < 0) return;

    recalls[idx].reminderSentAt = getNowISO();
    recalls[idx].updatedAt = getNowISO();

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recalls));
  } catch {
    // Silently fail — this is a non-critical side effect
  }
}

/* ── Date helper for display ── */

export function getDueDateLabel(dueDate: string): string {
  const today = getTodayDateValue();
  if (!dueDate) return 'No date';

  if (dueDate === today) return 'Due Today';
  if (dueDate < today) return 'Overdue';

  const due = new Date(`${dueDate}T00:00:00`);
  const now = new Date(`${today}T00:00:00`);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Due Tomorrow';
  if (diffDays <= 30) return `Due in ${diffDays} days`;
  if (diffDays <= 60) return `Due in ${Math.floor(diffDays / 7)} weeks`;
  return formatDateLabel(dueDate);
}

/* ── Re-derive (force refresh all from recalls) ── */

export function rederiveAllReminders(): void {
  if (typeof window === 'undefined') return;
  // Clear existing reminders and re-derive from all pending recalls
  window.localStorage.removeItem(REMINDERS_KEY);
  deriveRemindersFromRecalls();
}