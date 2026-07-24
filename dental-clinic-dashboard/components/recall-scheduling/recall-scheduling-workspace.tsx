'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Save,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

/* ── Inline helpers ── */

function getTodayDateValue(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addMonths(dateValue: string, months: number): string {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  date.setMonth(date.getMonth() + months);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(dateValue: string): string {
  if (!dateValue) return 'Not selected';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Not selected';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function isPastDate(dateValue: string, todayValue: string): boolean {
  if (!dateValue) return false;
  return dateValue < todayValue;
}

/* ── Inline mock constants ── */

const recallTypes = [
  'Routine Check-up',
  'Treatment Follow-up',
  'Orthodontic Review',
  'Periodontal Maintenance',
  'Preventive Cleaning',
  'Other',
] as const;

const reminderMethods = ['Telegram', 'SMS', 'Phone', 'Email'] as const;

interface QuickInterval {
  label: string;
  months: number;
}

const quickIntervals: QuickInterval[] = [
  { label: '1 Month', months: 1 },
  { label: '3 Months', months: 3 },
  { label: '6 Months', months: 6 },
  { label: '12 Months', months: 12 },
];

const mockPatient = {
  fullName: 'Sopheak Chan',
  patientCode: 'PT000015',
  phone: '012 345 678',
  dentist: 'Dr. Dara Sok',
  lastVisit: 'July 24, 2026',
  completedTreatment: 'Root Canal Treatment',
  tooth: '36',
};

const mockRecallRecommendation = {
  recommended: true,
  recommendedType: 'Treatment Follow-up' as const,
  recommendedInterval: '6 months',
  suggestedDueDate: 'January 24, 2027',
  recommendation:
    'Routine review and preventive examination.',
};

type FieldError = Partial<
  Record<'recallType' | 'dueDate' | 'reminderMethod', string>
>;

/* ── Sub-components ── */

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

/* ── Main Workspace ── */

export function RecallSchedulingWorkspace() {
  const router = useRouter();
  const todayValue = getTodayDateValue();
  const defaultDueDate = addMonths(todayValue, 6);

  const [recallType, setRecallType] = useState('');
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [reminderMethod, setReminderMethod] = useState('Telegram');
  const [notes, setNotes] = useState(
    'Routine 6-month review. Check tooth 36 and overall oral health.'
  );
  const [errors, setErrors] = useState<FieldError>({});
  const [saved, setSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const nextErrors: FieldError = {};
    if (!recallType.trim()) nextErrors.recallType = 'Select a recall type.';
    if (!dueDate.trim()) {
      nextErrors.dueDate = 'Select a recall due date.';
    } else if (isPastDate(dueDate, todayValue)) {
      nextErrors.dueDate = 'The due date cannot be in the past.';
    }
    if (!reminderMethod.trim()) nextErrors.reminderMethod = 'Select a reminder method.';
    return nextErrors;
  };

  const handleCreateRecall = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaved(true);
    setSuccessMessage('Recall scheduled successfully.');
  };

  const handleCancel = () => {
    router.push('/visit-completion');
  };

  const validationSummary = Object.values(errors).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
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

      {/* ── Success message ── */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {successMessage}
            </p>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-300">
              The recall has been saved as Pending.
            </p>
          </div>
        </div>
      )}

      {/* ── Validation errors ── */}
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

      {/* ── Patient Info Banner ── */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">
                {mockPatient.fullName}
              </h2>
              <span className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {mockPatient.patientCode}
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
            <Field label="Last Visit" value={mockPatient.lastVisit} />
            <Field label="Treating Dentist" value={mockPatient.dentist} />
            <Field
              label="Completed Treatment"
              value={`${mockPatient.completedTreatment} (Tooth ${mockPatient.tooth})`}
            />
            <Field
              label="Preferred Contact"
              value={
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  Telegram
                </span>
              }
            />
          </div>
        </div>

        {mockRecallRecommendation.recommended && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 dark:border-primary/30 dark:bg-primary/10">
            <div className="flex items-start gap-2">
              <Bell className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Recall Recommendation
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {mockRecallRecommendation.recommendedType} recommended
                  every {mockRecallRecommendation.recommendedInterval}.
                  Suggested due date:{' '}
                  <span className="font-semibold">
                    {mockRecallRecommendation.suggestedDueDate}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {mockRecallRecommendation.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Main grid ── */}
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {/* ── Left: Form ── */}
        <SectionCard
          icon={<Bell className="size-5" />}
          title="Recall Details"
          subtitle="Configure the recall reminder for this patient."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Recall Type */}
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Recall Type
              <select
                value={recallType}
                onChange={(event) => setRecallType(event.target.value)}
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

            {/* Reminder Method */}
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

            {/* Due Date */}
            <label className="space-y-1.5 text-sm font-semibold text-foreground sm:col-span-2">
              Due Date
              <input
                type="date"
                value={dueDate}
                min={todayValue}
                onChange={(event) => setDueDate(event.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.dueDate
                    ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20'
                    : 'border-border'
                }`}
              />
              <ErrorText message={errors.dueDate} />
            </label>
          </div>

          {/* Quick interval buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="self-center text-xs font-semibold text-muted-foreground">
              Quick select:
            </span>
            {quickIntervals.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDueDate(addMonths(todayValue, preset.months))}
                className="rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Notes */}
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

          {/* Buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={handleCreateRecall}
              disabled={saved}
              className="h-11 min-w-52 px-5 text-sm font-semibold shadow-lg shadow-primary/20"
            >
              <Save className="mr-2 size-4" />
              {saved ? 'Scheduled' : 'Create Recall'}
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

        {/* ── Right: Sidebar ── */}
        <div className="space-y-5">
          {/* Recall Preview */}
          <SectionCard
            icon={<Clock3 className="size-5" />}
            title="Recall Preview"
            subtitle="This preview updates as you fill in the form."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Patient
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {mockPatient.fullName}
                </p>
              </div>
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
                  {formatDateDisplay(dueDate)}
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
                    {saved ? 'Scheduled' : 'Pending'}
                  </span>
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Dentist Recommendation */}
          <SectionCard
            icon={<CalendarDays className="size-5" />}
            title="Dentist Recommendation"
            subtitle="Based on the completed visit."
          >
            <div className="grid gap-3">
              <Field
                label="Recommended Interval"
                value={mockRecallRecommendation.recommendedInterval}
              />
              <Field
                label="Suggested Due Date"
                value={mockRecallRecommendation.suggestedDueDate}
              />
              <Field
                label="Recommendation"
                value={mockRecallRecommendation.recommendation}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}