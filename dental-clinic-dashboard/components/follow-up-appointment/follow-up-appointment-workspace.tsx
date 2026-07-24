'use client';

import { useState, type ReactNode } from 'react';
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

/* ── Mock Data ── */

const mockPatient = {
  fullName: 'Sopheak Chan',
  patientCode: 'PT000015',
  phone: '012 345 678',
  currentDentist: 'Dr. Dara Sok',
  completedTreatment: 'Root Canal Treatment',
  tooth: '36',
  visitStatus: 'Completed',
};

const mockFollowUpRecommendation = {
  required: true,
  reason: 'Root canal review',
  recommendedTimeframe: '7 days',
  dentistRecommendation: 'Review healing and evaluate tooth before final restoration.',
};

const dentistOptions = [
  'Dr. Dara Sok',
  'Dr. Chan Vireak',
  'Dr. Sopheak Chan',
  'Dr. Boun Sopheavann',
  'Dr. Kim Srey Pich',
];

const appointmentTypeOptions = [
  'Treatment Follow-up',
  'Root Canal Review',
  'Crown Fitting',
  'Suture Removal',
  'Orthodontic Review',
  'General Review',
];

const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
];

const mockTimeSlots = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
];

function getTodayDateString() {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getTodayValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ── Helper Components ── */

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

function Field({ label, value }: { label: string; value: ReactNode }) {
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

/* ── Main Component ── */

export function FollowUpAppointmentWorkspace() {
  const router = useRouter();
  const [dentist, setDentist] = useState(mockPatient.currentDentist);
  const [dateValue, setDateValue] = useState(getDefaultDate());
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [appointmentType, setAppointmentType] = useState(mockFollowUpRecommendation.reason);
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const todayValue = getTodayValue();

  const preview = {
    patient: mockPatient.fullName,
    dentist: dentist || mockPatient.currentDentist,
    date: dateValue ? formatDateDisplay(dateValue) : 'Not recorded',
    time: timeSlot || 'Not recorded',
    type: appointmentType || mockFollowUpRecommendation.reason,
    duration: durationOptions.find((d) => d.value === duration)?.label || 'Not recorded',
    status: saved ? 'Booked' : 'Ready to Schedule',
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!dentist.trim()) nextErrors.dentist = 'Select the dentist for the follow-up.';
    if (!dateValue.trim()) nextErrors.date = 'Select a follow-up date.';
    else if (dateValue < todayValue) nextErrors.date = 'The follow-up date cannot be in the past.';
    if (!timeSlot.trim()) nextErrors.time = 'Select a follow-up time.';
    if (!appointmentType.trim()) nextErrors.appointmentType = 'Choose an appointment type.';
    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaved(true);
    setSuccessMessage('Follow-up appointment scheduled successfully.');
  };

  const handleCancel = () => {
    router.push('/visit-completion');
  };

  const handleBack = () => {
    router.push('/visit-completion');
  };

  const validationSummary = Object.values(errors).filter(Boolean) as string[];

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
            Back to Visit Completion
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Follow-up Appointment</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Schedule the patient's next visit after the completed treatment.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {saved ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <BadgeCheck className="mr-1.5 size-3.5" />
              Booked
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Ready to Schedule
            </span>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{successMessage}</p>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-300">
              The appointment is saved locally. You can review it below.
            </p>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationSummary.length > 0 && (
        <div className="space-y-2">
          {validationSummary.map((message) => (
            <div
              key={message}
              className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-300" />
              <p className="text-sm text-rose-700 dark:text-rose-200">{message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Patient Banner */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{mockPatient.fullName}</h2>
              <span className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {mockPatient.patientCode}
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                {saved ? 'Next appointment booked' : 'New follow-up draft'}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Scheduling the patient's next appointment after the completed visit.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[440px]">
            <Field label="Completed Treatment" value={`${mockPatient.completedTreatment} (Tooth ${mockPatient.tooth})`} />
            <Field label="Current Dentist" value={mockPatient.currentDentist} />
            <Field label="Visit Status" value={mockPatient.visitStatus} />
            <Field label="Follow-up Reason" value={mockFollowUpRecommendation.reason} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Form */}
        <SectionCard
          icon={<CalendarDays className="size-5" />}
          title="Appointment Details"
          subtitle="Fill in the details for the patient's follow-up visit."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dentist */}
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Dentist
              <select
                value={dentist}
                onChange={(e) => setDentist(e.target.value)}
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

            {/* Date */}
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Follow-up Date
              <input
                type="date"
                value={dateValue}
                min={todayValue}
                onChange={(e) => setDateValue(e.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.date ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20' : 'border-border'
                }`}
              />
              <ErrorText message={errors.date} />
            </label>

            {/* Time Slot */}
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Time
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.time ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20' : 'border-border'
                }`}
              >
                <option value="">Select time slot</option>
                {mockTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <ErrorText message={errors.time} />
            </label>

            {/* Appointment Type */}
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Appointment Type
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className={`h-10 w-full rounded-xl border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 ${
                  errors.appointmentType ? 'border-rose-300 ring-2 ring-rose-200/60 dark:border-rose-500/40 dark:ring-rose-500/20' : 'border-border'
                }`}
              >
                <option value="">Select appointment type</option>
                {appointmentTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ErrorText message={errors.appointmentType} />
            </label>

            {/* Duration */}
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              Duration
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Notes */}
          <label className="mt-4 block space-y-1.5 text-sm font-semibold text-foreground">
            Appointment Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="min-h-24 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
              placeholder="Optional notes for the appointment..."
            />
          </label>

          {/* Buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={handleSave}
              disabled={saved}
              className="h-11 min-w-52 px-5 text-sm font-semibold shadow-lg shadow-primary/20"
            >
              <Save className="mr-2 size-4" />
              {saved ? 'Saved' : 'Save Follow-up'}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="h-11 px-5 text-sm font-semibold">
              <XCircle className="mr-2 size-4" />
              Cancel
            </Button>
          </div>
        </SectionCard>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Visit Context */}
          <SectionCard
            icon={<ClipboardList className="size-5" />}
            title="Visit Context"
            subtitle="Reference from the completed visit."
          >
            <div className="grid gap-3">
              <Field label="Patient" value={mockPatient.fullName} />
              <Field label="Patient ID" value={mockPatient.patientCode} />
              <Field label="Phone" value={mockPatient.phone} />
              <Field label="Completed Treatment" value={`${mockPatient.completedTreatment} (Tooth ${mockPatient.tooth})`} />
              <Field label="Current Dentist" value={mockPatient.currentDentist} />
              <Field label="Recommended Follow-up" value={mockFollowUpRecommendation.reason} />
            </div>
          </SectionCard>

          {/* Appointment Preview */}
          <SectionCard
            icon={<Clock3 className="size-5" />}
            title="Appointment Preview"
            subtitle="Updates as you edit the form."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Patient</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{preview.patient}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dentist</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{preview.dentist}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{preview.date}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{preview.time}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{preview.type}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{preview.duration}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
                    saved
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                  }`}
                >
                  {preview.status}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Dentist Recommendation */}
          <SectionCard
            icon={<Stethoscope className="size-5" />}
            title="Dentist Recommendation"
            subtitle="From the completed visit."
          >
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
              <p className="text-sm text-foreground">{mockFollowUpRecommendation.dentistRecommendation}</p>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground dark:bg-background/20">
              Recommended timeframe: {mockFollowUpRecommendation.recommendedTimeframe}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}