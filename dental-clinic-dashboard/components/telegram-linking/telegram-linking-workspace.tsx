'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Link,
  Link2Off,
  Loader2,
  MessageCircle,
  QrCode,
  RefreshCw,
  Search,
  Smartphone,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  formatDateTime,
  formatDateOnly,
  generatePatientInvite,
  resolveBestPatientContext,
  performMockLink,
  type PatientInvite,
  type TelegramLink,
} from './telegram-linking-store';
import { patientRecords, type Patient } from '@/components/patients/patient-data';

/* ── Helpers ── */

function getTelegramStatusBadge(link: TelegramLink | null, hasPendingInvite: boolean): {
  label: string;
  class: string;
  icon: ReactNode;
} {
  if (link?.linkStatus === 'Active') {
    return {
      label: 'Linked',
      class: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
      icon: <BadgeCheck className="size-3.5" />,
    };
  }
  if (hasPendingInvite) {
    return {
      label: 'Invite Pending',
      class: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
      icon: <Loader2 className="size-3.5 animate-spin" />,
    };
  }
  return {
    label: 'Not Linked',
    class: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
    icon: <Link2Off className="size-3.5" />,
  };
}

/* ── Sub-components ── */

function SectionCard({ icon, title, subtitle, children }: {
  icon: ReactNode; title: string; subtitle?: string; children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm theme-surface-shadow">
      <div className="mb-4 flex items-start gap-3 border-b border-border/60 pb-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function EmptyState({ icon, title, message, action }: {
  icon: ReactNode; title: string; message: string; action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted/40">{icon}</div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function InfoBanner({ type, title, message }: { type: 'success' | 'error' | 'info'; title: string; message: string }) {
  const borders = {
    success: 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10',
    error: 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10',
    info: 'border-blue-200 bg-blue-50/80 dark:border-blue-500/20 dark:bg-blue-500/10',
  };
  const icons = {
    success: <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />,
    error: <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-300" />,
    info: <AlertCircle className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-300" />,
  };
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${borders[type]}`}>
      {icons[type]}
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/* ── QR placeholder ── */

function QRPlaceholder({ token }: { token: string }) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-4" style={{ width: 200, height: 200 }}>
        <div className="text-center">
          <QrCode className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-1 text-[10px] text-muted-foreground">QR Preview</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">Scan to link Telegram account</p>
    </div>
  );
}

/* ── Mock Linking Dialog ── */

function MockLinkDialog({ open, onClose, onLink }: {
  open: boolean; onClose: () => void;
  onLink: (params: { telegramUserId: string; telegramUsername?: string; firstName?: string; lastName?: string }) => void;
}) {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!userId.trim()) {
      setError('Telegram User ID is required.');
      return;
    }
    onLink({ telegramUserId: userId.trim(), telegramUsername: username.trim() || undefined, firstName: firstName.trim() || undefined, lastName: lastName.trim() || undefined });
  };

  const handleClose = () => {
    setUserId(''); setUsername(''); setFirstName(''); setLastName(''); setError(''); onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Simulate Telegram Linking</h3>
            <p className="mt-1 text-xs text-muted-foreground">Development-only mock. Enter mock Telegram identity.</p>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <XCircle className="size-5" />
          </button>
        </div>
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-foreground">Telegram User ID <span className="text-rose-500">*</span></span>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. 123456789"
              className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${error ? 'border-rose-300 ring-2 ring-rose-200/60' : 'border-border'}`} />
            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-foreground">Username <span className="text-xs font-normal text-muted-foreground">(optional)</span></span>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username"
              className="h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-foreground">First Name <span className="text-xs font-normal text-muted-foreground">(optional)</span></span>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
                className="h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-foreground">Last Name <span className="text-xs font-normal text-muted-foreground">(optional)</span></span>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name"
                className="h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30" />
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="shadow-lg shadow-primary/20">
            <Link className="mr-1.5 size-4" /> Simulate Link
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Unlink Confirmation Dialog ── */

function UnlinkConfirmDialog({ open, patientName, onConfirm, onCancel }: {
  open: boolean; patientName: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
          <Link2Off className="size-6" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-foreground">Unlink Telegram Account</h3>
        <p className="mt-2 text-sm text-muted-foreground">Unlink this Telegram account from <strong>{patientName}</strong>?</p>
        <p className="mt-1 text-xs text-muted-foreground">The link record will be preserved but marked as Unlinked. A new invitation can be generated later.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Keep Linked</Button>
          <Button variant="outline" onClick={onConfirm}
            className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20">
            <Link2Off className="mr-1.5 size-4" /> Unlink
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Patient Search (for direct navigation without context) ── */

function PatientSearchSelector({ onSelect }: { onSelect: (patient: Patient) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (!value.trim()) { setResults([]); return; }
    const lower = value.toLowerCase();
    setResults(patientRecords.filter((p) => p.fullName.toLowerCase().includes(lower) || p.patientCode.toLowerCase().includes(lower)).slice(0, 10));
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by patient name or code..."
          className="h-10 w-full rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30" autoFocus />
      </div>
      {results.length > 0 && (
        <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-sm">
          {results.map((patient) => (
            <button key={patient.id} onClick={() => onSelect(patient)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-muted">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${patient.avatarTone} text-sm font-bold text-white`}>
                {patient.fullName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{patient.fullName}</p>
                <p className="text-xs text-muted-foreground">{patient.patientCode} · {patient.phone}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {query.trim() && results.length === 0 && (
        <p className="text-center text-xs text-muted-foreground py-2">No patients found matching &ldquo;{query}&rdquo;</p>
      )}
    </div>
  );
}

/* ── Linked State Card ── */

function LinkedState({ link, onUnlink }: { link: TelegramLink; onUnlink: () => void }) {
  return (
    <SectionCard icon={<MessageCircle className="size-5" />} title="Linked Telegram Account" subtitle="Permanent patient-to-Telegram connection established.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" value={
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <BadgeCheck className="size-3.5" /> Linked
          </span>
        } />
        <Field label="Telegram Username" value={link.telegramUsername ? `@${link.telegramUsername}` : 'Not set'} />
        <Field label="Telegram User ID" value={link.telegramUserId} />
        <Field label="Name" value={[link.firstName, link.lastName].filter(Boolean).join(' ') || 'Not provided'} />
        <Field label="Linked Date" value={formatDateOnly(link.linkedAt)} />
        <Field label="Last Login" value={link.lastLoginAt ? formatDateTime(link.lastLoginAt) : 'N/A'} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" onClick={onUnlink}
          className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20">
          <Link2Off className="mr-1.5 size-4" /> Unlink Account
        </Button>
      </div>
    </SectionCard>
  );
}

/* ── Not Linked State ── */

function NotLinkedState({ activeInvite, onGenerateInvite, onCancelInvite, onRegenerateInvite, onCopyToken, onOpenMockDialog, copied }: {
  activeInvite: PatientInvite | null;
  onGenerateInvite: () => void;
  onCancelInvite: () => void;
  onRegenerateInvite: () => void;
  onCopyToken: () => void;
  onOpenMockDialog: () => void;
  copied: boolean;
}) {
  if (!activeInvite) {
    return (
      <SectionCard icon={<QrCode className="size-5" />} title="Secure Patient Invite" subtitle="Generate a secure invitation for the patient.">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex size-24 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20">
            <Smartphone className="size-10 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">No Active Invitation</p>
            <p className="mt-1 text-xs text-muted-foreground">Generate a QR code and secure token to start the linking process.</p>
          </div>
          <Button onClick={onGenerateInvite} className="shadow-lg shadow-primary/20">
            <QrCode className="mr-1.5 size-4" /> Generate QR / Invite
          </Button>
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 text-blue-600 dark:text-blue-300" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Development Mock</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">No real Telegram Bot configured yet. Generate an invite first, then use the mock simulator to test the linking flow.</p>
        </div>
      </SectionCard>
    );
  }

  const token = activeInvite.inviteToken;
  const truncatedToken = token.length > 16 ? `${token.substring(0, 8)}...${token.substring(token.length - 6)}` : token;

  return (
    <SectionCard icon={<QrCode className="size-5" />} title="Secure Patient Invite" subtitle="Share this QR / token with the patient.">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center gap-3">
          <QRPlaceholder token={token} />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Invite Status" value={
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Loader2 className="size-3.5 animate-spin" /> Pending
              </span>
            } />
            <Field label="Expiration" value="30 minutes" />
            <Field label="Created" value={formatDateTime(activeInvite.createdAt)} />
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Invite Token</div>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-background/70 px-2 py-1 text-xs font-mono text-foreground">{truncatedToken}</code>
              <Button variant="outline" size="sm" onClick={onCopyToken} className="shrink-0">
                <Copy className="mr-1 size-3.5" /> {copied ? 'Copied!' : 'Copy Token'}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onRegenerateInvite} variant="outline" size="sm">
              <RefreshCw className="mr-1.5 size-4" /> Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={onCancelInvite}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10">
              <XCircle className="mr-1.5 size-4" /> Cancel Invite
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 text-blue-600 dark:text-blue-300" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Development Mock — Simulate Telegram Linking</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">This simulates a successful Telegram authentication for testing.</p>
          </div>
          <Button size="sm" variant="outline" onClick={onOpenMockDialog}
            className="shrink-0 border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            <Smartphone className="mr-1.5 size-4" /> Simulate Telegram Link
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ── Main Workspace ── */

export function TelegramLinkingWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeInvite, setActiveInvite] = useState<PatientInvite | null>(null);
  const [activeLink, setActiveLink] = useState<TelegramLink | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);
  const [mockDialogOpen, setMockDialogOpen] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const queryPatientCode = searchParams.get('patientCode');
    const queryPatientName = searchParams.get('patientName');
    let resolvedPatient: Patient | null = null;

    if (queryPatientCode || queryPatientName) {
      const identifiers = [queryPatientCode, queryPatientName].filter(Boolean).map((v) => String(v).toLowerCase());
      resolvedPatient = patientRecords.find((p) => identifiers.includes(p.patientCode.toLowerCase()) || identifiers.includes(p.fullName.toLowerCase())) ?? null;
    }

    if (!resolvedPatient) {
      resolvedPatient = resolveBestPatientContext();
    }

    setPatient(resolvedPatient);
    setHydrated(true);
  }, [searchParams]);

  const clearBanner = useCallback(() => setBanner(null), []);

  const handleGenerateInvite = useCallback(() => {
    if (!patient) return;
    const invite = generatePatientInvite(patient.id);
    setActiveInvite(invite);
    setActiveLink(null);
    setBanner({ type: 'success', title: 'Invitation Generated', message: 'The QR code and token are ready.' });
    setTimeout(clearBanner, 4000);
  }, [patient, clearBanner]);

  const handleCancelInvite = useCallback(() => {
    setActiveInvite(null);
    setBanner({ type: 'info', title: 'Invitation Cancelled', message: 'The pending invitation has been cancelled.' });
    setTimeout(clearBanner, 4000);
  }, [clearBanner]);

  const handleRegenerateInvite = useCallback(() => {
    if (!patient) return;
    const invite = generatePatientInvite(patient.id);
    setActiveInvite(invite);
    setBanner({ type: 'success', title: 'Invitation Regenerated', message: 'A new secure token has been generated.' });
    setTimeout(clearBanner, 4000);
  }, [patient, clearBanner]);

  const handleCopyToken = useCallback(async () => {
    if (!activeInvite) return;
    try {
      await navigator.clipboard.writeText(activeInvite.inviteToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setBanner({ type: 'success', title: 'Invite token copied.', message: '' });
      setTimeout(clearBanner, 2000);
    } catch {
      setBanner({ type: 'error', title: 'Clipboard copy failed.', message: '' });
      setTimeout(clearBanner, 4000);
    }
  }, [activeInvite, clearBanner]);

  const handleMockLink = useCallback((params: { telegramUserId: string; telegramUsername?: string; firstName?: string; lastName?: string }) => {
    if (!patient) return;
    const result = performMockLink(patient.id, activeInvite?.inviteId ?? '', params);
    if (!result.success) {
      setBanner({ type: 'error', title: 'Linking Failed', message: result.error ?? '' });
      setTimeout(clearBanner, 6000);
      return;
    }
    setActiveInvite(null);
    setActiveLink(result.link ?? null);
    setMockDialogOpen(false);
    setBanner({ type: 'success', title: 'Telegram Account Linked Successfully', message: '' });
    setTimeout(clearBanner, 4000);
  }, [patient, activeInvite, clearBanner]);

  const handleUnlinkConfirm = useCallback(() => {
    setActiveLink(null);
    setUnlinkDialogOpen(false);
    setBanner({ type: 'info', title: 'Telegram Account Unlinked', message: 'The link record has been preserved but marked as Unlinked.' });
    setTimeout(clearBanner, 4000);
  }, [clearBanner]);

  const handlePatientSelect = useCallback((selectedPatient: Patient) => {
    setPatient(selectedPatient);
    setActiveInvite(null);
    setActiveLink(null);
    setBanner(null);
  }, []);

  const statusBadge = useMemo(() => getTelegramStatusBadge(activeLink, activeInvite !== null), [activeLink, activeInvite]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading Telegram Linking workspace...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/visit-completion')} className="-ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 size-4" /> Back to Visit Completion
          </Button>
        </div>
        <EmptyState icon={<MessageCircle className="size-8 text-muted-foreground" />} title="Select a Patient"
          message="This workspace requires an existing patient. Search and select a patient from the clinic records."
          action={<PatientSearchSelector onSelect={handlePatientSelect} />} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/visit-completion')} className="-ml-2 w-fit text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 size-4" /> Back to Visit Completion
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Telegram Linking</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Securely connect a patient profile to a Telegram account.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge.class}`}>
            {statusBadge.icon} {statusBadge.label}
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {patient.patientCode}
          </span>
        </div>
      </div>

      {banner && <InfoBanner type={banner.type} title={banner.title} message={banner.message} />}

      {/* Patient Summary */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{patient.fullName}</h2>
              <span className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{patient.patientCode}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Account linking workspace — no clinical details shown.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[380px]">
            <Field label="Phone" value={patient.phone} />
            <Field label="Preferred Contact" value={patient.preferredContactMethod} />
            <Field label="Telegram Link" value={
              <span className={`inline-flex items-center gap-1 ${statusBadge.class.split(' ').slice(1).join(' ')}`}>
                {statusBadge.icon} {statusBadge.label}
              </span>
            } />
            <Field label="Consent Status" value={
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${
                patient.consentStatus === 'Accepted'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : patient.consentStatus === 'Pending'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
              }`}>
                {patient.consentStatus}
              </span>
            } />
          </div>
        </div>
      </section>

      {/* Linked / Not Linked State */}
      {activeLink && activeLink.linkStatus === 'Active' ? (
        <LinkedState link={activeLink} onUnlink={() => setUnlinkDialogOpen(true)} />
      ) : (
        <NotLinkedState
          activeInvite={activeInvite}
          onGenerateInvite={handleGenerateInvite}
          onCancelInvite={handleCancelInvite}
          onRegenerateInvite={handleRegenerateInvite}
          onCopyToken={handleCopyToken}
          onOpenMockDialog={() => setMockDialogOpen(true)}
          copied={copied}
        />
      )}

      {/* Security note */}
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground dark:bg-background/20">
        <p><strong className="text-foreground">Security & Privacy:</strong> The QR code and invite token contain only a secure identifier — no patient name, medical data, or personal information.</p>
      </div>

      <MockLinkDialog open={mockDialogOpen} onClose={() => setMockDialogOpen(false)} onLink={handleMockLink} />
      <UnlinkConfirmDialog open={unlinkDialogOpen} patientName={patient.fullName} onConfirm={handleUnlinkConfirm} onCancel={() => setUnlinkDialogOpen(false)} />
    </div>
  );
}