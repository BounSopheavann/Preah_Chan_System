'use client';

import { patientRecords, type Patient } from '@/components/patients/patient-data';

/* ── Types ── (kept for compatibility with workspace imports) */

export type InviteType = 'QR' | 'Telegram' | 'SMS' | 'Manual';
export type InviteStatus = 'Pending' | 'Used' | 'Expired' | 'Cancelled';
export type LinkStatus = 'Active' | 'Unlinked' | 'Suspended';

export interface PatientInvite {
  inviteId: string;
  patientId: string;
  inviteToken: string;
  inviteType: InviteType;
  inviteStatus: InviteStatus;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  usedAt: string | null;
}

export interface TelegramLink {
  telegramLinkId: string;
  patientId: string;
  telegramUserId: string;
  telegramUsername: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  linkStatus: LinkStatus;
  linkedAt: string;
  lastLoginAt: string | null;
}

export interface TelegramLinkingPatientContext {
  patient: Patient;
}

/* ── Date helpers ── */

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return 'Invalid date';
  }
}

export function formatDateOnly(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return 'Invalid date';
  }
}

export function isExpired(_expiresAt: string): boolean {
  return false;
}

export function getExpiryCountdown(_expiresAt: string): string {
  return '--';
}

/* ── Simple mock helpers ── */

/** Returns a mock patient from the records, or null if none match. */
export function resolveBestPatientContext(): Patient | null {
  return patientRecords[0] ?? null;
}

/** Mock invite generation — returns a static invite object. */
export function generatePatientInvite(
  patientId: string,
  _inviteType: InviteType = 'QR',
  _createdBy = 'Clinic Staff',
): PatientInvite {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60000).toISOString();
  return {
    inviteId: `inv_mock_${Date.now()}`,
    patientId,
    inviteToken: `tg_inv_mock_${Date.now().toString(36)}`,
    inviteType: 'QR',
    inviteStatus: 'Pending',
    expiresAt,
    createdBy: 'Clinic Staff',
    createdAt: now.toISOString(),
    usedAt: null,
  };
}

export function cancelInvite(_inviteId: string): PatientInvite | null {
  return null;
}

export function cancelPendingInvitesForPatient(_patientId: string): void {
  /* no-op */
}

/** Perform a mock link — returns a TelegramLink in Active state. */
export function performMockLink(
  patientId: string,
  _inviteId: string,
  params: { telegramUserId: string; telegramUsername?: string; firstName?: string; lastName?: string },
): { success: boolean; error?: string; link?: TelegramLink } {
  if (!params.telegramUserId.trim()) {
    return { success: false, error: 'Telegram User ID is required.' };
  }

  const link: TelegramLink = {
    telegramLinkId: `tg_link_mock_${Date.now()}`,
    patientId,
    telegramUserId: params.telegramUserId.trim(),
    telegramUsername: params.telegramUsername?.trim() || null,
    firstName: params.firstName?.trim() || null,
    lastName: params.lastName?.trim() || null,
    photoUrl: null,
    linkStatus: 'Active',
    linkedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  return { success: true, link };
}

export function unlinkTelegramAccount(_telegramLinkId: string): TelegramLink | null {
  return null;
}

/* ── No-op persistence (kept for compatibility) ── */

export function loadPatientInvites(): PatientInvite[] {
  return [];
}

export function savePatientInvites(_invites: PatientInvite[]): void {
  /* no-op */
}

export function loadTelegramLinks(): TelegramLink[] {
  return [];
}

export function saveTelegramLinks(_links: TelegramLink[]): void {
  /* no-op */
}

export function getActiveInvitesForPatient(
  _invites: PatientInvite[],
  _patientId: string,
): PatientInvite[] {
  return [];
}

export function getActiveLinkForPatient(
  _links: TelegramLink[],
  _patientId: string,
): TelegramLink | null {
  return null;
}

export function getActiveLinkByTelegramUserId(
  _links: TelegramLink[],
  _telegramUserId: string,
  _excludePatientId?: string,
): TelegramLink | null {
  return null;
}

export function getTelegramLinksForPatient(_patientId: string): TelegramLink[] {
  return [];
}