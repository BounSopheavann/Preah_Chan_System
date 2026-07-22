'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Save,
  Stethoscope,
  XCircle,
  Bell,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  buildRecallRecord,
  buildRecallWorkspaceContext,
  findDuplicateRecall,
  getTodayDateValue,
  isPastDate,
  addMonths,
  recallTypes,
  reminderMethods,
  saveRecall,
  type RecallRecord,
  type RecallType,
  type RecallWorkspaceContext,
  type ReminderMethod,
} from './recall-scheduling-store';

type FieldError = Partial<
  Record<'recallType' | 'dueDate' | 'reminderMethod' | 'context', string>
>;

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm theme-surface-shadow">
      <div className="mb-4 flex items-start gap-3 border-b border-border/60 pb-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">
      {message}
    </p>
  );
}

export function RecallSchedulingWorkspace() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [context, setContext] = useState<RecallWorkspaceContext | null>(null);
  const [recallType, setRecallType] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderMethod, setReminderMethod] = useState('Telegram');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FieldError>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    const workspaceContext = buildRecallWorkspaceContext();
    if (!workspaceContext) {
      setHydrated(true);
      return;
    }

    const today = getTodayDateValue();
    const defaultDueDate = addMonths(today, 6);

    setContext(workspaceContext);
    setDueDate(defaultDueDate);
    setHydrated(true);
  }, []);

  const todayValue = useMemo(() => getTodayDateValue(), []);

  const completedProcedures =
    context?.session?.completedProcedures ??
    context?.summary?.completedProcedures ??
    [];
  const completedTreatment =
    context?.completedTreatmentLabel || 'Not recorded';

  const validate = () => {
    const nextErrors: FieldError = {};

    if (!context) {
      nextErrors.context =
        'The completed visit context is missing. Open Visit Completion first.';
      return nextErrors;
    }

    if (!recallType.trim()) {
      nextErrors.recallType = 'Select a recall type.';
    }

    if (!dueDate.trim()) {
      nextErrors.dueDate = 'Select a recall due date.';
    } else if (isPastDate(dueDate, todayValue)) {
      nextErrors.dueDate = 'The due date cannot be in the past.';
    }

    if (!reminderMethod.trim()) {
      nextErrors.reminderMethod = 'Select a reminder method.';
    }

    return nextErrors;
  };

  const handleCreateRecall = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    setDuplicateWarning(null);

    if (Object.keys(nextErrors).length > 0 || !context) {
      return;
    }

    // Duplicate check
    const duplicate = findDuplicateRecall(
      context.patient.patientCode,
      recallType as RecallType,
      dueDate,
    );
    if (duplicate) {
      setDuplicateWarning(
        `A Pending "${recallType}" recall for ${context.patient.fullName} already exists with the same due date (${duplicate.dueDateLabel}).`,
      );
      return;
    }

    setIsSaving(true);
    const record = buildRecallRecord({
      context,
      recallType: recallType as RecallType,
      dueDate,
      reminderMethod: reminderMethod as ReminderMethod,
      notes,
    });

    saveRecall(record);

    setSuccessMessage(
      'Recall created successfully. Redirecting to Reminder Center...',
    );

    window.setTimeout(() => {
      setIsSaving(false);
      router.replace('/reminder-center');
    }, 900);
  };

  const handleCancel = () => {
    router.push('/visit-completion');
  };

  const handleContextRecovery = () => {
    router.push('/visit-completion');
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Loading recall scheduling workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/20">
            <XCircle className="size-8 text-rose-600 dark:text-rose-300" />
          </div>
          <h1 className="text-xl font-bold text-rose-800 dark:text-rose-200">
            No Completed Visit Found
          </h1>
          <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
            The recall scheduling workspace needs a completed visit before it
            can schedule a future recall.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={handleContextRecovery}>
              <ArrowLeft className="mr-1.5 size-4" />
              Return to Visit Completion
            </Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const validationSummary = Object.values(errors).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Visit Completion
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Recall Scheduling
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Schedule a future recall reminder for the patient. This is not an
              appointment booking — it creates a reminder to contact the patient
              later.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <Bell className="mr-1.5 size-3.5" />
            Recall
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            Same patient
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {successMessage}
            </p>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-300">
              The completed visit stays closed and the recall is saved as
              Pending.
            </p>
          </div>
        </div>
      )}

      {duplicateWarning && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Duplicate Recall Detected
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
              {duplicateWarning}
            </p>
          </div>
        </div>
      )}

      {validationSummary.length > 0 && (
        <div className="space-y-2">
          {validationSummary.map((message) => (
            <div
              key={message}
              className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-300" />
              <p className="text-sm text-rose-700 dark:text-rose-200">
                {message}
              </p>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">
                {context.patient.fullName}
              </h2>
              <span className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {context.patient.patientCode}
              </span>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                New recall draft
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Scheduling a future recall reminder for the patient after the
              completed visit.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[440px]">
            <Field label="Completed Visit" value={context.completedVisitLabel} />
            <Field label="Treating Dentist" value={context.suggestedDentist} />
            <Field label="Completed Treatment" value={completedTreatment} />
            <Field
              label="Telegram"
              value={
                context.patient.telegramStatus === 'Linked' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck className="size-3.5" />
                    Linked
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not linked</span>
                )
              }
            />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          icon={<Bell className="size-5" />}
          title="Recall Details"
          subtitle="Configure the recall reminder for this patient."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Recall Type
              <select
                value={recallType}
                onChange={(event) => {
                  setRecallType(event.target.value);
                  setDuplicateWarning(null);
                }}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.recallType
                    ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20'
                    : 'border-border'
                }`}
              >
                <option value="">Select recall type</option>
                {recallTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ErrorText message={errors.recallType} />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Reminder Method
              <select
                value={reminderMethod}
                onChange={(event) => setReminderMethod(event.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.reminderMethod
                    ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20'
                    : 'border-border'
                }`}
              >
                {reminderMethods.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ErrorText message={errors.reminderMethod} />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-foreground sm:col-span-2">
              Due Date
              <input
                type="date"
                value={dueDate}
                min={todayValue}
                onChange={(event) => {
                  setDueDate(event.target.value);
                  setDuplicateWarning(null);
                }}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.dueDate
                    ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20'
                    : 'border-border'
                }`}
              />
              <ErrorText message={errors.dueDate} />
            </label>
          </div>

          {/* Quick date presets */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-muted-foreground self-center">
              Quick select:
            </span>
            {[
              { label: '3 Months', months: 3 },
              { label: '6 Months', months: 6 },
              { label: '12 Months', months: 12 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setDueDate(addMonths(todayValue, preset.months));
                  setDuplicateWarning(null);
                }}
                className="rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label className="mt-4 block space-y-1.5 text-sm font-semibold text-foreground">
            Notes
            <span className="text-xs font-normal text-muted-foreground">
              {' '}
              (optional)
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="min-h-24 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
              placeholder="Optional notes about this recall..."
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={handleCreateRecall}
              disabled={isSaving}
              className="h-11 min-w-52 px-5 text-sm font-semibold shadow-lg shadow-primary/20"
            >
              <Save className="mr-2 size-4" />
              {isSaving ? 'Creating...' : 'Create Recall'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="h-11 px-5 text-sm font-semibold"
            >
              <XCircle className="mr-2 size-4" />
              Cancel
            </Button>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard
            icon={<ClipboardList className="size-5" />}
            title="Patient / Visit Context"
            subtitle="Current patient and completed visit details."
          >
            <div className="grid gap-3">
              <Field label="Patient" value={context.patient.fullName} />
              <Field label="Patient ID" value={context.patient.patientCode} />
              <Field
                label="Completed Visit"
                value={context.completedVisitLabel}
              />
              <Field
                label="Treating Dentist"
                value={context.suggestedDentist}
              />
              <Field
                label="Completed Treatment"
                value={completedTreatment}
              />
              <Field
                label="Procedures Completed"
                value={
                  completedProcedures.length > 0
                    ? `${completedProcedures.length} procedure${completedProcedures.length === 1 ? '' : 's'}`
                    : 'Not recorded'
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={<Clock3 className="size-5" />}
            title="Recall Preview"
            subtitle="This preview updates as you fill in the form."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Recall Type
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {recallType || 'Not selected'}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Due Date
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {dueDate
                    ? new Intl.DateTimeFormat('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(new Date(`${dueDate}T00:00:00`))
                    : 'Not selected'}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Reminder Method
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {reminderMethod || 'Not selected'}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                    Pending
                  </span>
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Stethoscope className="size-5" />}
            title="Completed Visit Snapshot"
            subtitle="Reference only. The previous appointment stays completed."
          >
            <div className="grid gap-3">
              <Field
                label="Visit Date"
                value={context.completedVisitLabel}
              />
              <Field
                label="Treating Dentist"
                value={context.suggestedDentist}
              />
              <Field
                label="Completed Treatment"
                value={completedTreatment}
              />
              <Field
                label="Procedures Completed"
                value={
                  completedProcedures.length > 0
                    ? `${completedProcedures.length} procedure${completedProcedures.length === 1 ? '' : 's'}`
                    : 'Not recorded'
                }
              />
            </div>
            <div className="mt-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground dark:bg-background/20">
              The recall is saved separately from the completed visit and does
              not create an appointment.
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}