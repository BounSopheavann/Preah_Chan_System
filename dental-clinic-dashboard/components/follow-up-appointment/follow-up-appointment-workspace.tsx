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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { appointmentTypes, dentistOptions } from '@/components/appointments/appointment-data';
import {
  buildFollowUpAppointmentRecord,
  buildFollowUpWorkspaceContext,
  formatFollowUpSummary,
  getTodayDateValue,
  isPastDate,
  loadSavedFollowUpAppointment,
  saveFollowUpAppointment,
  type FollowUpAppointmentRecord,
  type FollowUpWorkspaceContext,
} from './follow-up-appointment-store';

type FieldError = Partial<Record<'dentist' | 'date' | 'time' | 'appointmentType' | 'context', string>>;

function formatCompactDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDisplayTimeLabel(timeValue: string) {
  const [hoursRaw, minutesRaw] = timeValue.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 'Not recorded';
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

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
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">{message}</p>;
}

function formatAppointmentSummary(record: FollowUpAppointmentRecord | null) {
  if (!record) {
    return null;
  }

  return formatFollowUpSummary(record);
}

export function FollowUpAppointmentWorkspace() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [context, setContext] = useState<FollowUpWorkspaceContext | null>(null);
  const [savedAppointment, setSavedAppointment] = useState<FollowUpAppointmentRecord | null>(null);
  const [dentist, setDentist] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<FieldError>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const workspaceContext = buildFollowUpWorkspaceContext();

    if (!workspaceContext) {
      setHydrated(true);
      return;
    }

    const storedAppointment = loadSavedFollowUpAppointment();
    const matchesCurrentPatient = storedAppointment?.patientCode === workspaceContext.patient.patientCode;
    const currentDateValue = getTodayDateValue();
    const defaultDateValue = addDays(currentDateValue, 7);
    const initialDateValue = matchesCurrentPatient && storedAppointment ? storedAppointment.scheduledAt.slice(0, 10) : defaultDateValue;
    const initialTimeValue = matchesCurrentPatient && storedAppointment ? storedAppointment.scheduledAt.slice(11, 16) : '10:00';

    setContext(workspaceContext);
    setSavedAppointment(matchesCurrentPatient ? storedAppointment : null);
    setDentist(matchesCurrentPatient && storedAppointment ? storedAppointment.dentist : workspaceContext.suggestedDentist);
    setDateValue(initialDateValue);
    setTimeValue(initialTimeValue);
    setAppointmentType(matchesCurrentPatient && storedAppointment ? storedAppointment.appointmentType : workspaceContext.suggestedAppointmentType);
    setReason(matchesCurrentPatient && storedAppointment ? storedAppointment.reason : workspaceContext.recommendedReason);
    setHydrated(true);
  }, []);

  const todayValue = useMemo(() => getTodayDateValue(), []);

  const bookedSummary = useMemo(() => formatAppointmentSummary(savedAppointment), [savedAppointment]);

  const currentPreview = useMemo(() => {
    if (!context) {
      return null;
    }

    return {
      date: dateValue ? formatCompactDate(dateValue) : 'Not recorded',
      time: timeValue ? getDisplayTimeLabel(timeValue) : 'Not recorded',
      dentist: dentist || context.suggestedDentist,
      appointmentType: appointmentType || context.suggestedAppointmentType,
      reason: reason.trim() || context.recommendedReason,
    };
  }, [appointmentType, context, dateValue, dentist, reason, timeValue]);

  const completedProcedures: never[] = [];
  const completedTreatment = context?.completedTreatmentLabel || 'Not recorded';

  const validate = () => {
    const nextErrors: FieldError = {};

    if (!context) {
      nextErrors.context = 'The completed visit context is missing. Open Visit Completion first.';
      return nextErrors;
    }

    if (!dentist.trim()) {
      nextErrors.dentist = 'Select the dentist for the follow-up.';
    }

    if (!dateValue.trim()) {
      nextErrors.date = 'Select a follow-up date.';
    } else if (isPastDate(dateValue, todayValue)) {
      nextErrors.date = 'The follow-up date cannot be in the past.';
    }

    if (!timeValue.trim()) {
      nextErrors.time = 'Select a follow-up time.';
    }

    if (!appointmentType.trim()) {
      nextErrors.appointmentType = 'Choose an appointment type.';
    }

    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !context) {
      return;
    }

    setIsSaving(true);
    const record = buildFollowUpAppointmentRecord({
      context,
      dateValue,
      timeValue,
      dentist: dentist.trim(),
      appointmentType: appointmentType.trim(),
      reason: reason.trim() || context.recommendedReason,
    });

    saveFollowUpAppointment(record);
    setSavedAppointment(record);
    setSuccessMessage('Follow-up appointment saved successfully. Returning to Visit Completion...');

    window.setTimeout(() => {
      setIsSaving(false);
      router.replace('/visit-completion');
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
          <p className="text-sm text-muted-foreground">Loading follow-up workspace...</p>
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
          <h1 className="text-xl font-bold text-rose-800 dark:text-rose-200">Missing Visit Context</h1>
          <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
            The follow-up workspace needs a completed visit before it can book the next appointment.
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
          <Button variant="ghost" size="sm" onClick={handleCancel} className="-ml-2 w-fit text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 size-4" />
            Back to Visit Completion
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Follow-up Appointment Workspace</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Book the patient&apos;s next visit after the completed treatment without re-searching the patient record.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <BadgeCheck className="mr-1.5 size-3.5" />
            Booked status
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
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{successMessage}</p>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-300">The completed visit stays closed and the new appointment is saved as Booked.</p>
          </div>
        </div>
      )}

      {validationSummary.length > 0 && (
        <div className="space-y-2">
          {validationSummary.map((message) => (
            <div key={message} className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-300" />
              <p className="text-sm text-rose-700 dark:text-rose-200">{message}</p>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{context.patient.fullName}</h2>
              <span className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {context.patient.patientCode}
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                {savedAppointment ? 'Next appointment already booked' : 'New follow-up draft'}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Scheduling the patient&apos;s next appointment after the completed visit.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[440px]">
            <Field label="Completed Visit" value={context.completedVisitLabel} />
            <Field label="Treating Dentist" value={context.suggestedDentist} />
            <Field label="Completed Treatment" value={completedTreatment} />
            <Field label="Follow-up Reason" value={context.recommendedReason} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          icon={<CalendarDays className="size-5" />}
          title="Appointment Details"
          subtitle="Use the current patient and the normal Booked appointment flow."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Dentist
              <select
                value={dentist}
                onChange={(event) => setDentist(event.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.dentist ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20' : 'border-border'
                }`}
              >
                <option value="">Select dentist</option>
                {dentistOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ErrorText message={errors.dentist} />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Date
              <input
                type="date"
                value={dateValue}
                min={todayValue}
                onChange={(event) => setDateValue(event.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.date ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20' : 'border-border'
                }`}
              />
              <ErrorText message={errors.date} />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Time
              <input
                type="time"
                value={timeValue}
                onChange={(event) => setTimeValue(event.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.time ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20' : 'border-border'
                }`}
              />
              <ErrorText message={errors.time} />
            </label>

            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Appointment Type
              <select
                value={appointmentType}
                onChange={(event) => setAppointmentType(event.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.appointmentType ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20' : 'border-border'
                }`}
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ErrorText message={errors.appointmentType} />
            </label>
          </div>

          <label className="mt-4 block space-y-1.5 text-sm font-semibold text-foreground">
            Reason / Notes
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={5}
              className="min-h-28 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
              placeholder="Describe the follow-up reason or any notes for the receptionist..."
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 min-w-52 px-5 text-sm font-semibold shadow-lg shadow-primary/20"
            >
              <Save className="mr-2 size-4" />
              {isSaving ? 'Saving...' : 'Save Follow-up Appointment'}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="h-11 px-5 text-sm font-semibold">
              <XCircle className="mr-2 size-4" />
              Cancel
            </Button>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard
            icon={<ClipboardList className="size-5" />}
            title="Visit Context"
            subtitle="Everything needed to book the next visit is already loaded."
          >
            <div className="grid gap-3">
              <Field label="Patient" value={context.patient.fullName} />
              <Field label="Patient ID" value={context.patient.patientCode} />
              <Field label="Completed Visit" value={context.completedVisitLabel} />
              <Field label="Treating Dentist" value={context.suggestedDentist} />
              <Field label="Completed Treatment / Procedure" value={completedTreatment} />
              <Field label="Recommended Follow-up Reason" value={context.recommendedReason} />
            </div>
          </SectionCard>

          <SectionCard
            icon={<Clock3 className="size-5" />}
            title="Next Appointment Preview"
            subtitle="This preview updates as the receptionist edits the form."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{currentPreview?.date ?? 'Not recorded'}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{currentPreview?.time ?? 'Not recorded'}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dentist</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{currentPreview?.dentist ?? 'Not recorded'}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Appointment Type</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{currentPreview?.appointmentType || 'Not recorded'}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reason / Notes</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{currentPreview?.reason || 'Not recorded'}</p>
              </div>
            </div>
          </SectionCard>

          {savedAppointment && (
            <SectionCard
              icon={<CheckCircle2 className="size-5" />}
              title="Saved Next Appointment"
              subtitle="The follow-up appointment already exists in local storage."
            >
              {bookedSummary && (
                <div className="space-y-3">
                  <Field label="Next Appointment" value={bookedSummary.nextAppointmentLabel} />
                  <Field label="Dentist" value={bookedSummary.dentist} />
                  <Field label="Appointment Type" value={bookedSummary.appointmentType} />
                  <Field label="Reason" value={bookedSummary.reason} />
                </div>
              )}
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                Saving again updates this same booked follow-up instead of creating a duplicate visit.
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={<Stethoscope className="size-5" />}
            title="Completed Visit Snapshot"
            subtitle="Reference only. The previous appointment stays completed."
          >
            <div className="grid gap-3">
              <Field label="Visit Date" value={context.completedVisitLabel} />
              <Field label="Treating Dentist" value={context.suggestedDentist} />
              <Field label="Completed Treatment" value={completedTreatment} />
              <Field label="Procedures Completed" value={completedProcedures.length > 0 ? `${completedProcedures.length} procedure${completedProcedures.length === 1 ? '' : 's'}` : 'Not recorded'} />
            </div>
            <div className="mt-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground dark:bg-background/20">
              The follow-up appointment is saved separately from the completed visit and uses the normal Booked appointment status.
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
