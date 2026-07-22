'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  Receipt,
  Stethoscope,
  User,
  LogOut,
  Pill,
  ClipboardList,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  buildSummaryFromSession,
  loadFlowState,
  type TreatmentFlowState,
} from '@/components/treatment-execution/procedure-workspace-store';
import type {
  ProcedureExecution,
  TreatmentSession,
  TreatmentSummary,
} from '@/components/treatment-execution/treatment-execution-data';
import {
  buildReceiptFromInvoice,
  loadSavedInvoice,
  loadSavedReceipt,
} from '@/components/billing/billing-store';
import type { Invoice as BillingInvoice, Receipt as BillingReceipt } from '@/components/billing/billing-data';
import {
  calculateGrandTotal,
  calculateTotalDiscount,
  formatCurrency,
} from '@/components/billing/billing-data';
import { patientRecords, type Patient } from '@/components/patients/patient-data';
import { loadSavedFollowUpAppointment } from '@/components/follow-up-appointment/follow-up-appointment-store';
import type { ReactNode } from 'react';

type AppointmentKind = 'follow-up' | 'recall';

type AppointmentDraft = {
  kind: AppointmentKind;
  patientId: string;
  patientName: string;
  patientCode: string;
  dentist: string;
  appointmentType: string;
  preferredDate?: string;
  reason: string;
  source: string;
};

type ParsedUpcoming = {
  dateLabel: string;
  reason: string;
};

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
}

function parseUpcomingAppointment(upcomingAppointment?: string): ParsedUpcoming | null {
  const raw = upcomingAppointment?.trim();
  if (!raw || raw.toLowerCase() === 'no appointment') {
    return null;
  }

  const parts = raw.split(' - ');
  if (parts.length === 1) {
    return {
      dateLabel: parts[0],
      reason: 'Follow-up visit',
    };
  }

  return {
    dateLabel: parts[0],
    reason: parts.slice(1).join(' - ').trim() || 'Follow-up visit',
  };
}

function formatDurationLabel(procedures: ProcedureExecution[], summary: TreatmentSummary | null) {
  if (summary?.totalDuration) {
    return summary.totalDuration;
  }

  if (procedures.length === 0) {
    return 'Not recorded';
  }

  return procedures
    .map((procedure) => procedure.duration)
    .filter(Boolean)
    .join(', ') || 'Not recorded';
}

function getPaymentBadgeClass(status?: BillingReceipt['paymentStatus'] | BillingInvoice['status']) {
  const map: Record<string, string> = {
    Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    'Partially Paid': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    Unpaid: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    Draft: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  };

  return map[status ?? 'Draft'] ?? map.Draft;
}

function getCompletedBadgeClass() {
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';
}

function getFieldValue(value?: string | null) {
  return value?.trim() ? value.trim() : 'Not recorded';
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
    <section className="rounded-2xl border border-border bg-card/90 p-5 shadow-sm theme-surface-shadow">
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

function EmptyCopy({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function buildAppointmentDraft(args: {
  kind: AppointmentKind;
  patient: Patient | null;
  session: TreatmentSession | null;
  receipt: BillingReceipt | null;
  summary: TreatmentSummary | null;
}): AppointmentDraft | null {
  const { kind, patient, session, receipt, summary } = args;

  if (!patient && !session && !receipt) {
    return null;
  }

  const baseReason = kind === 'follow-up' ? 'Post-treatment review' : 'Routine recall';
  const parsedUpcoming = patient ? parseUpcomingAppointment(patient.upcomingAppointment) : null;

  return {
    kind,
    patientId: patient?.patientCode ?? receipt?.patientId ?? session?.patientId ?? '',
    patientName: patient?.fullName ?? receipt?.patientName ?? session?.patientName ?? 'Unknown patient',
    patientCode: patient?.patientCode ?? receipt?.patientId ?? session?.patientId ?? 'Not recorded',
    dentist: session?.dentist ?? receipt?.dentist ?? 'Not recorded',
    appointmentType: kind === 'follow-up' ? 'Follow-up' : 'Recall Visit',
    preferredDate:
      kind === 'follow-up'
        ? parsedUpcoming?.dateLabel ?? undefined
        : parsedUpcoming?.dateLabel ?? undefined,
    reason:
      kind === 'follow-up'
        ? parsedUpcoming && !/recall/i.test(parsedUpcoming.reason)
          ? parsedUpcoming.reason
          : baseReason
        : parsedUpcoming && /recall/i.test(parsedUpcoming.reason)
          ? parsedUpcoming.reason
          : baseReason,
    source: summary?.finalNotes ? 'Visit completion workspace' : 'Receipt handoff',
  };
}

export function VisitCompletionWorkspace() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [flow, setFlow] = useState<TreatmentFlowState | null>(null);
  const [invoice, setInvoice] = useState<BillingInvoice | null>(null);
  const [receipt, setReceipt] = useState<BillingReceipt | null>(null);

  useEffect(() => {
    const storedFlow = loadFlowState();
    const storedInvoice = loadSavedInvoice();
    const storedReceipt = loadSavedReceipt();

    setFlow(storedFlow);
    setInvoice(storedInvoice);

    if (storedReceipt) {
      setReceipt(storedReceipt);
    } else if (storedInvoice && storedInvoice.status !== 'Draft' && storedInvoice.finalizedAt) {
      setReceipt(buildReceiptFromInvoice(storedInvoice));
    }

    setHydrated(true);
  }, []);

  const session = flow?.session ?? null;
  const summary = useMemo<TreatmentSummary | null>(() => {
    if (!session) return null;
    return buildSummaryFromSession(session);
  }, [session]);

  const patient = useMemo<Patient | null>(() => {
    if (!session && !receipt && !invoice) {
      return null;
    }

    const identifiers = [
      session?.patientId,
      receipt?.patientId,
      invoice?.patientId,
      session?.patientName,
      receipt?.patientName,
      invoice?.patientName,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return (
      patientRecords.find((record) => {
        return identifiers.includes(record.patientCode.toLowerCase()) || identifiers.includes(record.fullName.toLowerCase());
      }) ?? null
    );
  }, [session, receipt, invoice]);

  const clinicalNotes = useMemo(() => {
    const completedProcedures = session?.completedProcedures ?? [];

    const clinicalFindingNotes = completedProcedures.map((procedure) => procedure.clinicalNotes.trim()).filter(Boolean);
    const examinationNotes = completedProcedures.map((procedure) => procedure.complications.trim()).filter(Boolean);

    return {
      diagnosis: summary?.recommendations?.trim() || '',
      clinicalFindings: clinicalFindingNotes.join(' • '),
      examinationNotes: examinationNotes.join(' • '),
      treatmentNotes: summary?.finalNotes?.trim() || '',
    };
  }, [session, summary]);

  const prescriptions = useMemo(() => {
    return (session?.completedProcedures ?? []).flatMap((procedure) => procedure.prescriptions);
  }, [session]);

  const completedProcedures = session?.completedProcedures ?? [];

  const paymentStatus = receipt?.paymentStatus ?? invoice?.status ?? 'Draft';
  const invoiceNumber = receipt?.invoiceNumber ?? invoice?.invoiceNumber ?? 'Not recorded';
  const invoiceTotal = receipt?.grandTotal ?? (invoice ? calculateGrandTotal(invoice.items) : 0);
  const totalDiscount = receipt?.totalDiscount ?? (invoice ? calculateTotalDiscount(invoice.items) : 0);
  const tax = 0;
  const amountPaid = receipt?.amountPaid ?? invoice?.payment.amountPaid ?? 0;
  const remainingBalance = receipt?.balanceDue ?? (invoice ? Math.max(0, calculateGrandTotal(invoice.items) - amountPaid) : 0);
  const paymentMethod = receipt?.paymentMethod ?? invoice?.payment.paymentMethod ?? 'Not recorded';

  const patientAge = patient ? calculateAge(patient.dateOfBirth) : null;
  const upcoming = patient ? parseUpcomingAppointment(patient.upcomingAppointment) : null;
  const recall = upcoming && /recall/i.test(upcoming.reason) ? upcoming : null;
  const followUp = upcoming && !/recall/i.test(upcoming.reason) ? upcoming : null;
  const savedFollowUp = useMemo(() => {
    if (!patient) {
      return null;
    }

    const record = loadSavedFollowUpAppointment();
    if (!record) {
      return null;
    }

    return record.patientCode.toLowerCase() === patient.patientCode.toLowerCase() ? record : null;
  }, [patient]);

  const appointmentDraft = useMemo(
    () =>
      buildAppointmentDraft({
        kind: 'follow-up',
        patient,
        session,
        receipt,
        summary,
      }),
    [patient, session, receipt, summary]
  );

  const recallDraft = useMemo(
    () =>
      buildAppointmentDraft({
        kind: 'recall',
        patient,
        session,
        receipt,
        summary,
      }),
    [patient, session, receipt, summary]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(() => {
    window.print();
  }, []);

  const handleOpenAppointments = useCallback(
    (kind?: AppointmentKind) => {
      if (kind === 'follow-up') {
        router.push('/follow-up-appointment');
        return;
      }

      if (kind === 'recall') {
        router.push('/recall-scheduling');
        return;
      }

      if (!patient && !session && !receipt) {
        router.push('/appointments');
        return;
      }

      const draft = recallDraft;
      if (!draft) {
        router.push('/appointments');
        return;
      }

      const params = new URLSearchParams({
        mode: 'create',
        kind: draft.kind,
        patientId: draft.patientId,
        patientName: draft.patientName,
        patientCode: draft.patientCode,
        dentist: draft.dentist,
        appointmentType: draft.appointmentType,
        reason: draft.reason,
        source: draft.source,
      });

      if (draft.preferredDate) {
        params.set('preferredDate', draft.preferredDate);
      }

      router.push(`/appointments?${params.toString()}`);
    },
    [recallDraft, patient, session, receipt, router]
  );

  const handleReturnDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const handleStartNewVisit = useCallback(() => {
    router.push('/appointments');
  }, [router]);

  if (!hydrated) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading visit completion...</p>
        </div>
      </div>
    );
  }

  if (!session && !receipt && !invoice) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-2xl border border-border bg-card/90 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted/50">
            <Receipt className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">No Completed Visit Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The completion workspace opens after receipt finalization. Load the finished visit and try again.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => router.push('/receipt')}>
              <ArrowLeft className="mr-1.5 size-4" />
              Back to Receipt
            </Button>
            <Button onClick={handleStartNewVisit}>
              <CalendarDays className="mr-1.5 size-4" />
              Start New Visit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="visit-completion-page space-y-5 mx-[100px] pb-8">
      <div className="no-print flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/receipt')}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Receipt
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 size-4" />
            Print Visit Summary
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="mr-1.5 size-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Visit Completed Successfully</h1>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getCompletedBadgeClass()}`}
                >
                  <BadgeCheck className="mr-1.5 size-3.5" />
                  Completed
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Final summary for the closed visit before the case is archived.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[430px]">
            <Field label="Patient Name" value={session?.patientName ?? receipt?.patientName ?? 'Not recorded'} />
            <Field label="Visit Date" value={session?.appointmentDate ?? receipt?.appointmentDate ?? 'Not recorded'} />
            <Field label="Appointment Time" value={session?.appointmentTime ?? 'Not recorded'} />
            <Field label="Treating Dentist" value={session?.dentist ?? receipt?.dentist ?? 'Not recorded'} />
          </div>
        </div>
      </section>

      {savedFollowUp && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Next Appointment Booked</h2>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <BadgeCheck className="mr-1.5 size-3.5" />
                  Booked
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                The patient already has a saved follow-up for this completed visit.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[430px]">
              <Field label="Next Visit Date" value={savedFollowUp.dateLabel} />
              <Field label="Next Visit Time" value={savedFollowUp.timeLabel} />
              <Field label="Dentist" value={savedFollowUp.dentist} />
              <Field label="Appointment Type" value={savedFollowUp.appointmentType} />
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          icon={<User className="size-5" />}
          title="Patient Information"
          subtitle="Read-only patient record details"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Patient Name" value={patient?.fullName ?? session?.patientName ?? receipt?.patientName ?? 'Not recorded'} />
            <Field label="Patient ID" value={patient?.patientCode ?? session?.patientId ?? receipt?.patientId ?? 'Not recorded'} />
            <Field label="Gender" value={patient?.gender ?? 'Not recorded'} />
            <Field label="Age" value={patientAge ?? 'Not recorded'} />
            <Field label="Phone" value={patient?.phone ?? 'Not recorded'} />
            <Field label="Email" value={patient?.email ?? 'Not recorded'} />
            <div className="sm:col-span-2">
              <Field label="Address" value={patient?.address ?? 'Not recorded'} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={<CalendarDays className="size-5" />}
          title="Appointment Information"
          subtitle="Final visit schedule details"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Appointment Date" value={session?.appointmentDate ?? receipt?.appointmentDate ?? 'Not recorded'} />
            <Field label="Appointment Time" value={session?.appointmentTime ?? 'Not recorded'} />
            <Field label="Visit Type" value={appointmentDraft?.appointmentType ?? 'Not recorded'} />
            <Field label="Chair" value="Not recorded" />
            <Field label="Dentist" value={session?.dentist ?? receipt?.dentist ?? 'Not recorded'} />
            <Field label="Duration" value={formatDurationLabel(completedProcedures, summary)} />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        icon={<ClipboardList className="size-5" />}
        title="Treatment Summary"
        subtitle={`Completed procedures: ${completedProcedures.length}`}
      >
        {completedProcedures.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="px-3 py-2">Procedure Name</th>
                  <th className="px-3 py-2">Tooth Number</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Start Time</th>
                  <th className="px-3 py-2">End Time</th>
                  <th className="px-3 py-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {completedProcedures.map((procedure) => (
                  <tr key={procedure.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-3 py-3 font-semibold text-foreground">{procedure.procedure}</td>
                    <td className="px-3 py-3 text-muted-foreground">{procedure.toothNumber}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getCompletedBadgeClass()}`}>
                        {procedure.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{procedure.startTime || 'Not recorded'}</td>
                    <td className="px-3 py-3 text-muted-foreground">{procedure.endTime || 'Not recorded'}</td>
                    <td className="px-3 py-3 text-muted-foreground">{procedure.duration || 'Not recorded'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyCopy
            title="No completed procedures."
            message="The visit summary will list finalized procedures once treatment has been completed."
          />
        )}
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          icon={<Stethoscope className="size-5" />}
          title="Clinical Summary"
          subtitle="Read-only overview from the recorded visit"
        >
          <div className="grid gap-3">
            <Field label="Diagnosis" value={getFieldValue(clinicalNotes.diagnosis)} />
            <Field label="Clinical Findings" value={getFieldValue(clinicalNotes.clinicalFindings)} />
            <Field label="Examination Notes" value={getFieldValue(clinicalNotes.examinationNotes)} />
            <Field label="Treatment Notes" value={getFieldValue(clinicalNotes.treatmentNotes)} />
          </div>
          {!clinicalNotes.diagnosis &&
            !clinicalNotes.clinicalFindings &&
            !clinicalNotes.examinationNotes &&
            !clinicalNotes.treatmentNotes && (
              <div className="mt-3">
                <EmptyCopy title="No clinical notes." message="No clinical summary was saved for this visit." />
              </div>
            )}
        </SectionCard>

        <SectionCard
          icon={<Pill className="size-5" />}
          title="Prescription Summary"
          subtitle={`${prescriptions.length} medication${prescriptions.length === 1 ? '' : 's'} recorded`}
        >
          {prescriptions.length > 0 ? (
            <div className="space-y-2">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {prescription.medicineName} {prescription.dosage}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {prescription.frequency} · {prescription.duration}
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      Read only
                    </span>
                  </div>
                  {prescription.instructions && (
                    <p className="mt-2 text-xs text-muted-foreground">{prescription.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyCopy
              title="No medications prescribed."
              message="This visit did not save a prescription summary."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        icon={<Receipt className="size-5" />}
        title="Billing Summary"
        subtitle={invoiceNumber ? `Invoice ${invoiceNumber}` : 'Read-only invoice snapshot'}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Invoice Number" value={invoiceNumber} />
          <Field label="Invoice Total" value={formatCurrency(invoiceTotal)} />
          <Field label="Discount" value={formatCurrency(totalDiscount)} />
          <Field label="Tax" value={formatCurrency(tax)} />
          <Field label="Amount Paid" value={formatCurrency(amountPaid)} />
          <Field label="Remaining Balance" value={formatCurrency(remainingBalance)} />
          <Field label="Payment Method" value={paymentMethod} />
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Payment Status
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getPaymentBadgeClass(paymentStatus)}`}
              >
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          icon={<Stethoscope className="size-5" />}
          title="Dentist Recommendations"
          subtitle="Recommendations captured during treatment"
        >
          {getFieldValue(summary?.recommendations) !== 'Not recorded' ? (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
              <p className="text-sm text-foreground">{summary?.recommendations}</p>
            </div>
          ) : (
            <EmptyCopy title="No recommendations." message="No dentist recommendations were saved for this visit." />
          )}
        </SectionCard>

        <SectionCard
          icon={<FileText className="size-5" />}
          title="Home Care Instructions"
          subtitle="Post-visit self-care guidance"
        >
          {getFieldValue(summary?.postOpInstructions) !== 'Not recorded' ? (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
              <p className="text-sm text-foreground">{summary?.postOpInstructions}</p>
            </div>
          ) : (
            <EmptyCopy
              title="No home care instructions."
              message="No home care instructions were recorded for this visit."
            />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          icon={<CalendarDays className="size-5" />}
          title="Recall Recommendation"
          subtitle="Suggested return date if one was recorded"
        >
          {recall ? (
            <div className="space-y-3">
              <Field label="Recommended Recall Date" value={recall.dateLabel} />
              <Field label="Reason" value={recall.reason} />
            </div>
          ) : (
            <EmptyCopy title="No recall recommended." message="There is no recall recommendation on file for this visit." />
          )}
        </SectionCard>

        <SectionCard
          icon={<CalendarPlus className="size-5" />}
          title="Follow-up Appointment"
          subtitle="Recommended return visit if one was recorded"
        >
          {savedFollowUp ? (
            <div className="space-y-3">
              <Field label="Next Appointment" value={`${savedFollowUp.dateLabel} - ${savedFollowUp.timeLabel}`} />
              <Field label="Reason" value={savedFollowUp.reason} />
              <Field
                label="Status"
                value={
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Booked
                  </span>
                }
              />
            </div>
          ) : followUp ? (
            <div className="space-y-3">
              <Field label="Recommended Follow-up Date" value={followUp.dateLabel} />
              <Field label="Reason" value={followUp.reason} />
              <Field
                label="Status"
                value={
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Planned
                  </span>
                }
              />
            </div>
          ) : (
            <EmptyCopy title="No follow-up required." message="There is no follow-up appointment recommendation on file." />
          )}
        </SectionCard>
      </div>

      <div className="no-print rounded-2xl border border-border bg-card/90 p-4 shadow-sm theme-surface-shadow">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LogOut className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Visit Actions</h3>
              <p className="text-xs text-muted-foreground">Close the workflow or continue with follow-up planning.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-1.5 size-4" />
              Print Visit Summary
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download className="mr-1.5 size-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleOpenAppointments('follow-up')}>
              <CalendarPlus className="mr-1.5 size-4" />
              Create Follow-up Appointment
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleOpenAppointments('recall')}>
              <CalendarDays className="mr-1.5 size-4" />
              Create Recall
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReturnDashboard}>
              <ArrowLeft className="mr-1.5 size-4" />
              Return Dashboard
            </Button>
            <Button size="sm" onClick={handleStartNewVisit}>
              <CalendarDays className="mr-1.5 size-4" />
              Start New Visit
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .visit-completion-page {
            margin: 0 !important;
            padding: 0 !important;
          }

          .mx-\\[100px\\] {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }

          .theme-surface-shadow {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
