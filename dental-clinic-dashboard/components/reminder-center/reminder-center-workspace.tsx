'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  deriveRemindersFromRecalls,
  loadSavedReminders,
  sendReminderNow,
  retryFailedReminder,
  simulateFailedReminder,
  getReminderHistory,
  updateRecallReminderDate,
  getDueDateLabel,
  type ReminderRecord,
  type ReminderDeliveryStatus,
  type ReminderAttempt,
} from './reminder-center-store';

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
  const history = getReminderHistory(reminder.reminderId);

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

/* ── Tab type ── */

type ReminderTab = 'Upcoming' | 'Sent' | 'Failed';

/* ── Main Workspace ── */

export function ReminderCenterWorkspace() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ReminderTab>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<ReminderRecord | null>(null);

  // Load / derive reminders on mount
  useEffect(() => {
    const loaded = deriveRemindersFromRecalls();
    setReminders(loaded);
    setHydrated(true);
  }, []);

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
  const handleSendNow = useCallback(
    (reminder: ReminderRecord) => {
      const result = sendReminderNow(reminder.reminderId);
      if (result.success) {
        updateRecallReminderDate(reminder.recallId);
        setReminders(loadSavedReminders());
        setActionFeedback({
          type: 'success',
          message: `Reminder marked as sent for ${reminder.patientName}.`,
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error ?? 'Failed to send reminder.',
        });
      }
      window.setTimeout(clearFeedback, 4000);
    },
    [clearFeedback],
  );

  // Retry Failed
  const handleRetryFailed = useCallback(
    (reminder: ReminderRecord) => {
      const result = retryFailedReminder(reminder.reminderId);
      if (result.success) {
        updateRecallReminderDate(reminder.recallId);
        setReminders(loadSavedReminders());
        setActionFeedback({
          type: 'success',
          message: `Retry successful for ${reminder.patientName}. Reminder moved to Sent.`,
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: result.error ?? 'Failed to retry reminder.',
        });
      }
      window.setTimeout(clearFeedback, 4000);
    },
    [clearFeedback],
  );

  // View History
  const handleViewHistory = useCallback((reminder: ReminderRecord) => {
    setHistoryTarget(reminder);
  }, []);

  // Refresh
  const handleRefresh = useCallback(() => {
    const loaded = deriveRemindersFromRecalls();
    setReminders(loaded);
    setActionFeedback({ type: 'success', message: 'Reminder list refreshed.' });
    window.setTimeout(clearFeedback, 3000);
  }, [clearFeedback]);

  const handleBack = useCallback(() => {
    router.push('/recall-scheduling');
  }, [router]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading Reminder Center...</p>
        </div>
      </div>
    );
  }

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
            Recall reminders will appear here once you create them from the Recall Scheduling workspace.
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