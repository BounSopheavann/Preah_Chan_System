'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock,
  History,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Smartphone,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

/* ── Types ── */

type ReminderDeliveryStatus = 'Pending' | 'Sent' | 'Failed';

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

/* ── Sub-components ── */

function StatusBadge({ status }: { status: ReminderDeliveryStatus | 'Due Today' | 'Overdue' | 'Upcoming' }) {
  const styles: Record<string, string> = {
    Pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    Sent: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    Failed: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
    'Due Today': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    Overdue: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
    Upcoming: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700/30 dark:text-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
        styles[status] ?? styles.Upcoming
      }`}
    >
      {status}
    </span>
  );
}

function getMethodIcon(method: string) {
  switch (method) {
    case 'Telegram':
      return <Send className="size-3.5" />;
    case 'SMS':
      return <MessageSquare className="size-3.5" />;
    case 'Phone':
      return <Phone className="size-3.5" />;
    case 'Email':
      return <Mail className="size-3.5" />;
    default:
      return <Bell className="size-3.5" />;
  }
}

function getDueDateLabel(dueDate: string): string {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Due Today';
  if (diffDays < 0) return `Overdue (${Math.abs(diffDays)} days)`;
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return 'Due soon';
}

function StatCard({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/90 p-4 shadow-sm">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{count}</p>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function HistoryModal({
  reminder,
  onClose,
}: {
  reminder: ReminderRecord;
  onClose: () => void;
}) {
  const history = reminder.history;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Reminder History</h2>
            <p className="text-sm text-muted-foreground">
              {reminder.patientName} &middot; {reminder.recallType}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="size-4" />
          </Button>
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
            <History className="mx-auto mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm font-semibold text-foreground">No attempts recorded</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This reminder has not been attempted yet.
            </p>
          </div>
        ) : (
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {history.map((attempt, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      Attempt #{attempt.attemptNumber}
                    </span>
                    <StatusBadge status={attempt.status} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(attempt.attemptedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {attempt.failureReason && (
                  <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                    Reason: {attempt.failureReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Mock Data ── */

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
    history: [
      { attemptNumber: 1, attemptedAt: '2026-07-22T10:00:00.000Z', status: 'Sent' },
    ],
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
  {
    reminderId: 'rm-004',
    recallId: 'recall-004',
    patientId: 'pt-004',
    patientName: 'James Wilson',
    patientCode: 'PC-1004',
    recallType: 'Root Canal Follow-up',
    dueDate: '2026-07-29',
    dueDateLabel: 'July 29, 2026',
    reminderMethod: 'Phone',
    reminderStatus: 'Pending',
    sentAt: null,
    attemptCount: 0,
    lastAttemptAt: null,
    failureReason: null,
    history: [],
    createdAt: '2026-07-24T00:00:00.000Z',
    updatedAt: '2026-07-24T00:00:00.000Z',
  },
];

/* ── Main Workspace ── */

type ReminderTab = 'Upcoming' | 'Sent' | 'Failed';

export function ReminderCenterWorkspace() {
  const router = useRouter();
  const [reminders, setReminders] = useState<ReminderRecord[]>(MOCK_REMINDERS);
  const [activeTab, setActiveTab] = useState<ReminderTab>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<ReminderRecord | null>(null);

  // Filtered reminders by tab + search + method
  const filteredReminders = useMemo(() => {
    let list = reminders;

    // Tab filter
    if (activeTab === 'Upcoming') {
      list = list.filter((r) => r.reminderStatus === 'Pending');
    } else if (activeTab === 'Sent') {
      list = list.filter((r) => r.reminderStatus === 'Sent');
    } else if (activeTab === 'Failed') {
      list = list.filter((r) => r.reminderStatus === 'Failed');
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.patientCode.toLowerCase().includes(q),
      );
    }

    // Method filter
    if (methodFilter) {
      list = list.filter((r) => r.reminderMethod === methodFilter);
    }

    // Sort: Upcoming tab — most urgent first (overdue, due today, then nearest due date)
    if (activeTab === 'Upcoming') {
      list = [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    } else if (activeTab === 'Sent') {
      list = [...list].sort((a, b) => {
        if (!a.sentAt) return 1;
        if (!b.sentAt) return -1;
        return b.sentAt.localeCompare(a.sentAt);
      });
    } else {
      list = [...list].sort((a, b) => {
        if (!a.lastAttemptAt) return 1;
        if (!b.lastAttemptAt) return -1;
        return b.lastAttemptAt.localeCompare(a.lastAttemptAt);
      });
    }

    return list;
  }, [reminders, activeTab, searchQuery, methodFilter]);

  const counts = useMemo(() => {
    return {
      upcoming: reminders.filter((r) => r.reminderStatus === 'Pending').length,
      sent: reminders.filter((r) => r.reminderStatus === 'Sent').length,
      failed: reminders.filter((r) => r.reminderStatus === 'Failed').length,
    };
  }, [reminders]);

  const uniqueMethods = useMemo(() => {
    const methods = new Set(reminders.map((r) => r.reminderMethod));
    return Array.from(methods).sort();
  }, [reminders]);

  const clearFeedback = useCallback(() => {
    setActionFeedback(null);
  }, []);

  // Send Now
  const handleSendNow = useCallback((reminder: ReminderRecord) => {
    const now = new Date();
    const sentAt = now.toISOString();

    setReminders((prev) =>
      prev.map((r) =>
        r.reminderId === reminder.reminderId
          ? {
              ...r,
              reminderStatus: 'Sent' as ReminderDeliveryStatus,
              sentAt,
              attemptCount: r.attemptCount + 1,
              lastAttemptAt: sentAt,
              failureReason: null,
              updatedAt: sentAt,
              history: [
                ...r.history,
                {
                  attemptNumber: r.attemptCount + 1,
                  attemptedAt: sentAt,
                  status: 'Sent' as ReminderDeliveryStatus,
                },
              ],
            }
          : r,
      ),
    );

    setActionFeedback({
      type: 'success',
      message: `Reminder marked as sent for ${reminder.patientName}.`,
    });
  }, []);

  // Retry Failed
  const handleRetryFailed = useCallback((reminder: ReminderRecord) => {
    const now = new Date();
    const sentAt = now.toISOString();

    setReminders((prev) =>
      prev.map((r) =>
        r.reminderId === reminder.reminderId
          ? {
              ...r,
              reminderStatus: 'Sent' as ReminderDeliveryStatus,
              sentAt,
              attemptCount: r.attemptCount + 1,
              lastAttemptAt: sentAt,
              failureReason: null,
              updatedAt: sentAt,
              history: [
                ...r.history,
                {
                  attemptNumber: r.attemptCount + 1,
                  attemptedAt: sentAt,
                  status: 'Sent' as ReminderDeliveryStatus,
                },
              ],
            }
          : r,
      ),
    );

    setActionFeedback({
      type: 'success',
      message: `Retry successful for ${reminder.patientName}. Reminder moved to Sent.`,
    });
  }, []);

  // View History
  const handleViewHistory = useCallback((reminder: ReminderRecord) => {
    setHistoryTarget(reminder);
  }, []);

  // Refresh
  const handleRefresh = useCallback(() => {
    setReminders(MOCK_REMINDERS);
    setActionFeedback({ type: 'success', message: 'Reminder list refreshed.' });
  }, []);

  const handleBack = useCallback(() => {
    router.push('/recall-scheduling');
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Recall Scheduling
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reminder Center</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Manage upcoming, sent, and failed patient reminders.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-1.5 size-4" />
          Refresh
        </Button>
      </div>

      {/* Feedback banner */}
      {actionFeedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
            actionFeedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/10'
              : 'border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-300" />
          )}
          <p
            className={`text-sm font-semibold ${
              actionFeedback.type === 'success'
                ? 'text-emerald-800 dark:text-emerald-200'
                : 'text-rose-800 dark:text-rose-200'
            }`}
          >
            {actionFeedback.message}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFeedback}
            className="ml-auto shrink-0"
          >
            <XCircle className="size-4" />
          </Button>
        </div>
      )}

      {/* Summary stats */}
      {reminders.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={<BellRing className="size-5 text-amber-600 dark:text-amber-300" />}
            label="Upcoming"
            count={counts.upcoming}
            color="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
          />
          <StatCard
            icon={<CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />}
            label="Sent"
            count={counts.sent}
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
          />
          <StatCard
            icon={<AlertCircle className="size-5 text-rose-600 dark:text-rose-300" />}
            label="Failed"
            count={counts.failed}
            color="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
          />
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-card/60 p-1">
          {(['Upcoming', 'Sent', 'Failed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
              <span className="ml-1.5 text-xs opacity-70">
                ({counts[tab.toLowerCase() as keyof typeof counts]})
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient..."
              className="h-9 w-48 rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
            />
          </div>

          {/* Method filter */}
          {uniqueMethods.length > 0 && (
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-9 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
            >
              <option value="">All methods</option>
              {uniqueMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Empty states */}
      {reminders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/80 p-12 text-center">
          <BellOff className="mx-auto mb-4 size-12 text-muted-foreground/40" />
          <h2 className="text-xl font-bold text-foreground">No Reminders Yet</h2>
          <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
            Reminders will appear here once they are created from the Recall Scheduling workspace.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => router.push('/recall-scheduling')}>
              <ArrowLeft className="mr-1.5 size-4" />
              Go to Recall Scheduling
            </Button>
          </div>
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/80 p-12 text-center">
          <BellOff className="mx-auto mb-4 size-10 text-muted-foreground/40" />
          <h2 className="text-lg font-bold text-foreground">
            No {activeTab.toLowerCase()} reminders
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === 'Upcoming' && 'There are no upcoming reminders to display.'}
            {activeTab === 'Sent' && 'No sent reminders have been recorded yet.'}
            {activeTab === 'Failed' && 'No failed reminders to review.'}
          </p>
          {searchQuery && (
            <p className="mt-2 text-xs text-muted-foreground">
              Try adjusting your search or filter.
            </p>
          )}
        </div>
      ) : (
        /* Reminder list */
        <div className="space-y-3">
          {filteredReminders.map((reminder) => {
            const dueLabel = getDueDateLabel(reminder.dueDate);
            const isDueBadge =
              dueLabel === 'Due Today' || dueLabel === 'Overdue' || dueLabel.startsWith('Due');

            return (
              <div
                key={reminder.reminderId}
                className="rounded-2xl border border-border bg-card/90 p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: patient info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {reminder.patientName}
                      </h3>
                      <span className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {reminder.patientCode}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Smartphone className="size-3.5" />
                        {reminder.recallType}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {reminder.dueDateLabel}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        {getMethodIcon(reminder.reminderMethod)}
                        {reminder.reminderMethod}
                      </span>
                      {reminder.sentAt && activeTab === 'Sent' && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="size-3.5" />
                          Sent{' '}
                          {new Date(reminder.sentAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                      {reminder.lastAttemptAt && activeTab === 'Failed' && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="size-3.5" />
                          Last attempt{' '}
                          {new Date(reminder.lastAttemptAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    {reminder.failureReason && (
                      <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-300">
                        Reason: {reminder.failureReason}
                      </p>
                    )}
                  </div>

                  {/* Center: status badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={reminder.reminderStatus} />
                    {activeTab === 'Upcoming' && isDueBadge && (
                      <StatusBadge status={dueLabel as 'Due Today' | 'Overdue'} />
                    )}
                    {reminder.attemptCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {reminder.attemptCount} attempt{reminder.attemptCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                    {activeTab === 'Upcoming' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendNow(reminder)}
                      >
                        <Send className="mr-1.5 size-3.5" />
                        Send Now
                      </Button>
                    )}
                    {activeTab === 'Failed' && (
                      <Button
                        size="sm"
                        onClick={() => handleRetryFailed(reminder)}
                      >
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Retry Failed
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewHistory(reminder)}
                    >
                      <History className="mr-1.5 size-3.5" />
                      View History
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History modal */}
      {historyTarget && (
        <HistoryModal
          reminder={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}