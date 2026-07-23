'use client';

import { patientRecords, type Patient } from '@/components/patients/patient-data';

/* ── Storage Keys ── */

const INVITES_KEY = 'preah-chan-patient-invites';
const LINKS_KEY = 'preah-chan-telegram-links';

/* ── Types ── */

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

/* ── Token Generation ── */

function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'tg_inv_';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/* ── Date Helpers ── */

export function getNowISO(): string {
  return new Date().toISOString();
}

export function getExpiresAt(minutes = 30): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return 'Invalid date';
  }
}

export function formatDateOnly(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return 'Invalid date';
  }
}

export function isExpired(expiresAt: string): boolean {
  try {
    return new Date(expiresAt).getTime() <= Date.now();
  } catch {
    return true;
  }
}

export function getExpiryCountdown(expiresAt: string): string {
  try {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'Expired';
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  } catch {
    return 'Unknown';
  }
}

/* ── Patient Invite Persistence ── */

export function loadPatientInvites(): PatientInvite[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(INVITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PatientInvite[];
  } catch {
    return [];
  }
}

export function savePatientInvites(invites: PatientInvite[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
}

/* ── Telegram Link Persistence ── */

export function loadTelegramLinks(): TelegramLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LINKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TelegramLink[];
  } catch {
    return [];
  }
}

export function saveTelegramLinks(links: TelegramLink[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

/* ── Patient Context Resolution ── */

export function resolvePatientFromFlow(): Patient | null {
  try {
    const raw = window.localStorage.getItem('preah-chan-flow');
    if (!raw) return null;
    const flow = JSON.parse(raw);
    const identifiers = [
      flow?.session?.patientId,
      flow?.session?.patientName,
    ]
      .filter(Boolean)
      .map((value: string) => String(value).toLowerCase());

    return (
      patientRecords.find((record) => {
        return (
          identifiers.includes(record.patientCode.toLowerCase()) ||
          identifiers.includes(record.fullName.toLowerCase())
        );
      }) ?? null
    );
  } catch {
    return null;
  }
}

export function resolvePatientFromInvoice(): Patient | null {
  try {
    const raw = window.localStorage.getItem('preah-chan-invoice');
    if (!raw) return null;
    const invoice = JSON.parse(raw);
    const identifiers = [
      invoice?.patientId,
      invoice?.patientName,
    ]
      .filter(Boolean)
      .map((value: string) => String(value).toLowerCase());

    return (
      patientRecords.find((record) => {
        return (
          identifiers.includes(record.patientCode.toLowerCase()) ||
          identifiers.includes(record.fullName.toLowerCase())
        );
      }) ?? null
    );
  } catch {
    return null;
  }
}

export function resolvePatientFromQuery(
  patientCode?: string | null,
  patientName?: string | null,
): Patient | null {
  if (!patientCode && !patientName) return null;
  const identifiers = [patientCode, patientName]
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

export function resolveBestPatientContext(): Patient | null {
  return (
    resolvePatientFromFlow() ??
    resolvePatientFromInvoice() ??
    null
  );
}

export function findPatientByCodeOrName(query: string): Patient | null {
  if (!query.trim()) return null;
  const lower = query.toLowerCase();
  return (
    patientRecords.find((record) => {
      return (
        record.patientCode.toLowerCase().includes(lower) ||
        record.fullName.toLowerCase().includes(lower)
      );
    }) ?? null
  );
}

/* ── Invite Business Logic ── */

export function getActiveInvitesForPatient(
  invites: PatientInvite[],
  patientId: string,
): PatientInvite[] {
  // Expire any pending invites that are past expiration
  const updated = invites.map((invite) => {
    if (
      invite.inviteStatus === 'Pending' &&
      isExpired(invite.expiresAt)
    ) {
      return { ...invite, inviteStatus: 'Expired' as InviteStatus };
    }
    return invite;
  });

  // Persist if changes were made
  const hasExpired = updated.some(
    (inv, i) => inv.inviteStatus !== invites[i].inviteStatus,
  );
  if (hasExpired) {
    savePatientInvites(updated);
  }

  return updated.filter(
    (invite) =>
      invite.patientId === patientId &&
      (invite.inviteStatus === 'Pending'),
  );
}

export function generatePatientInvite(
  patientId: string,
  inviteType: InviteType = 'QR',
  createdBy = 'Clinic Staff',
): PatientInvite {
  const now = getNowISO();
  const invite: PatientInvite = {
    inviteId: generateId('inv'),
    patientId,
    inviteToken: generateInviteToken(),
    inviteType,
    inviteStatus: 'Pending',
    expiresAt: getExpiresAt(30),
    createdBy,
    createdAt: now,
    usedAt: null,
  };

  const invites = loadPatientInvites();
  invites.push(invite);
  savePatientInvites(invites);
  return invite;
}

export function cancelInvite(inviteId: string): PatientInvite | null {
  const invites = loadPatientInvites();
  const idx = invites.findIndex((inv) => inv.inviteId === inviteId);
  if (idx === -1) return null;

  invites[idx] = { ...invites[idx], inviteStatus: 'Cancelled' };
  savePatientInvites(invites);
  return invites[idx];
}

export function cancelPendingInvitesForPatient(patientId: string): void {
  const invites = loadPatientInvites();
  let changed = false;
  const updated = invites.map((inv) => {
    if (
      inv.patientId === patientId &&
      inv.inviteStatus === 'Pending'
    ) {
      changed = true;
      return { ...inv, inviteStatus: 'Cancelled' as InviteStatus };
    }
    return inv;
  });
  if (changed) {
    savePatientInvites(updated);
  }
}

export function findInviteByToken(token: string): PatientInvite | null {
  const invites = loadPatientInvites();
  return invites.find((inv) => inv.inviteToken === token) ?? null;
}

export function markInviteUsed(inviteId: string): PatientInvite | null {
  const invites = loadPatientInvites();
  const idx = invites.findIndex((inv) => inv.inviteId === inviteId);
  if (idx === -1) return null;

  invites[idx] = {
    ...invites[idx],
    inviteStatus: 'Used',
    usedAt: getNowISO(),
  };
  savePatientInvites(invites);
  return invites[idx];
}

/* ── Telegram Link Business Logic ── */

export function getActiveLinkForPatient(
  links: TelegramLink[],
  patientId: string,
): TelegramLink | null {
  return (
    links.find(
      (link) =>
        link.patientId === patientId && link.linkStatus === 'Active',
    ) ?? null
  );
}

export function getActiveLinkByTelegramUserId(
  links: TelegramLink[],
  telegramUserId: string,
  excludePatientId?: string,
): TelegramLink | null {
  return (
    links.find((link) => {
      if (link.linkStatus !== 'Active') return false;
      if (excludePatientId && link.patientId === excludePatientId)
        return false;
      return link.telegramUserId === telegramUserId;
    }) ?? null
  );
}

export interface MockLinkParams {
  telegramUserId: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
}

export function performMockLink(
  patientId: string,
  inviteId: string,
  params: MockLinkParams,
): { success: boolean; error?: string; link?: TelegramLink } {
  // Validate invite
  const invites = loadPatientInvites();
  const invite = invites.find((inv) => inv.inviteId === inviteId);
  if (!invite) {
    return { success: false, error: 'Invitation not found.' };
  }
  if (invite.inviteStatus !== 'Pending') {
    return {
      success: false,
      error: `Invitation is ${invite.inviteStatus} and cannot be used.`,
    };
  }
  if (isExpired(invite.expiresAt)) {
    markInviteExpired(inviteId);
    return { success: false, error: 'Invitation has expired.' };
  }

  // Validate Telegram User ID
  if (!params.telegramUserId.trim()) {
    return { success: false, error: 'Telegram User ID is required.' };
  }

  // Check patient doesn't already have an Active link
  const links = loadTelegramLinks();
  const existingPatientLink = getActiveLinkForPatient(links, patientId);
  if (existingPatientLink) {
    return {
      success: false,
      error:
        'This patient already has an active Telegram link. Unlink it first.',
    };
  }

  // Check Telegram User ID isn't already linked to another active patient
  const duplicateTelegram = getActiveLinkByTelegramUserId(
    links,
    params.telegramUserId,
  );
  if (duplicateTelegram) {
    const otherPatient = patientRecords.find(
      (p) => p.id === duplicateTelegram.patientId,
    );
    return {
      success: false,
      error: `Telegram User ID ${params.telegramUserId} is already actively linked to ${otherPatient?.fullName ?? 'another patient'}.`,
    };
  }

  // Mark invite used
  markInviteUsed(inviteId);

  // Create Telegram link
  const now = getNowISO();
  const link: TelegramLink = {
    telegramLinkId: generateId('tg_link'),
    patientId,
    telegramUserId: params.telegramUserId.trim(),
    telegramUsername: params.telegramUsername?.trim() || null,
    firstName: params.firstName?.trim() || null,
    lastName: params.lastName?.trim() || null,
    photoUrl: null,
    linkStatus: 'Active',
    linkedAt: now,
    lastLoginAt: now,
  };

  links.push(link);
  saveTelegramLinks(links);

  return { success: true, link };
}

function markInviteExpired(inviteId: string): void {
  const invites = loadPatientInvites();
  const idx = invites.findIndex((inv) => inv.inviteId === inviteId);
  if (idx === -1) return;
  invites[idx] = { ...invites[idx], inviteStatus: 'Expired' };
  savePatientInvites(invites);
}

export function unlinkTelegramAccount(
  telegramLinkId: string,
): TelegramLink | null {
  const links = loadTelegramLinks();
  const idx = links.findIndex(
    (link) => link.telegramLinkId === telegramLinkId,
  );
  if (idx === -1) return null;

  links[idx] = { ...links[idx], linkStatus: 'Unlinked' };
  saveTelegramLinks(links);
  return links[idx];
}

export function getTelegramLinksForPatient(
  patientId: string,
): TelegramLink[] {
  return loadTelegramLinks().filter(
    (link) => link.patientId === patientId,
  );
}