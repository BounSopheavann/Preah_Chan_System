'use client';

import { useState } from 'react';
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
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/components/billing/billing-data';

/* ── Mock Data ── */

const mockPatient = {
  fullName: 'Sok Dara',
  patientCode: 'PT000124',
  age: 34,
  gender: 'Male',
  phone: '012 345 678',
};

const mockAppointment = {
  appointmentId: 'APT-2026-0124',
  dentist: 'Dr. Chan Vireak',
  appointmentType: 'Restorative Treatment',
  date: new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  chair: 'Chair 02',
  status: 'Completed',
};

const mockCompletedProcedures = [
  {
    id: 'proc-1',
    procedure: 'Composite Filling',
    toothNumber: '#16',
    status: 'Completed',
    startTime: '09:00 AM',
    endTime: '09:45 AM',
    duration: '45 min',
  },
  {
    id: 'proc-2',
    procedure: 'Scaling',
    toothNumber: 'Full Mouth',
    status: 'Completed',
    startTime: '09:50 AM',
    endTime: '10:30 AM',
    duration: '40 min',
  },
];

const mockRemainingTreatment = [
  {
    id: 'remaining-1',
    procedure: 'Crown Review',
    toothNumber: '#26',
    status: 'Planned',
    recommended: 'Future Visit',
  },
];

const mockClinicalNotes = {
  finalNotes:
    'Composite restoration on tooth #16 and full-mouth scaling completed successfully. Patient tolerated treatment well with no complications.',
  postOpInstructions:
    '• Avoid chewing hard foods on the treated tooth for 24 hours.\n• Maintain regular brushing and flossing.\n• Take prescribed medication as instructed.\n• Contact the clinic if severe pain or swelling develops.',
};

const mockMedication = {
  medicineName: 'Ibuprofen',
  dosage: '400 mg',
  frequency: 'Every 8 hours',
  duration: '3 days',
  instructions: 'Take after food',
};

const mockFinancialSummary = {
  invoiceNumber: 'INV-2026-00124',
  receiptNumber: 'REC-2026-00124',
  currentVisitTotal: 55.0,
  amountPaid: 55.0,
  currentInvoiceBalance: 0.0,
  paymentStatus: 'Paid' as const,
  previousOutstandingBalance: 20.0,
};

const mockFollowUp = {
  recommended: true,
  reason: 'Crown Review — Tooth #26',
  recommendedTime: '2 weeks',
  recall: '6-month routine examination and cleaning',
};

/* ── Helper Components ── */

function getCompletedBadgeClass() {
  return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';
}

function getPlannedBadgeClass() {
  return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300';
}

function getPaymentBadgeClass(status: string) {
  const map: Record<string, string> = {
    Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    'Partially Paid': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    Unpaid: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    Draft: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  };
  return map[status] ?? map.Draft;
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
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

/* ── Completion Modal ── */

function CompletionModal({
  open,
  onClose,
  onBookFollowUp,
}: {
  open: boolean;
  onClose: () => void;
  onBookFollowUp: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Visit Completed</h2>
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
              <span className="text-muted-foreground">Patient</span>
              <span className="font-semibold text-foreground">{mockPatient.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
              <span className="text-muted-foreground">Appointment</span>
              <span className="font-semibold text-foreground">{mockAppointment.appointmentId}</span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                Closed
              </span>
            </div>
            <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                Paid
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Action</span>
              <span className="font-semibold text-foreground">Follow-up recommended</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onBookFollowUp}>
            <CalendarPlus className="mr-1.5 size-4" />
            Book Follow-up
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */

export function VisitCompletionWorkspace() {
  const router = useRouter();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    setToast('PDF download started — Visit-Summary-REC-2026-00124.pdf');
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewReceipt = () => router.push('/receipt');

  const handleBookFollowUp = () => router.push('/follow-up-appointment');

  const handleCreateRecall = () => router.push('/recall-scheduling');

  const handleFinishVisit = () => setShowCompletionModal(true);

  const handleCloseModal = () => setShowCompletionModal(false);

  const handleReturnDashboard = () => router.push('/dashboard');

  const handleStartNewVisit = () => router.push('/appointments');

  return (
    <div className="visit-completion-page space-y-5 mx-[100px] pb-8">
      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 animate-in fade-in slide-in-from-top-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700 shadow-lg dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {toast}
        </div>
      )}

      {/* Completion Modal */}
      <CompletionModal
        open={showCompletionModal}
        onClose={handleCloseModal}
        onBookFollowUp={() => {
          handleCloseModal();
          handleBookFollowUp();
        }}
      />

      {/* Back / Action Bar */}
      <div className="no-print flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReturnDashboard}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Dashboard
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

      {/* Visit Status Banner */}
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
            <Field label="Patient Name" value={mockPatient.fullName} />
            <Field label="Visit Date" value={mockAppointment.date} />
            <Field label="Appointment ID" value={mockAppointment.appointmentId} />
            <Field label="Treating Dentist" value={mockAppointment.dentist} />
          </div>
        </div>
      </section>

      {/* Patient + Appointment Info */}
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          icon={<User className="size-5" />}
          title="Patient Information"
          subtitle="Read-only patient record details"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Patient Name" value={mockPatient.fullName} />
            <Field label="Patient ID" value={mockPatient.patientCode} />
            <Field label="Gender" value={mockPatient.gender} />
            <Field label="Age" value={mockPatient.age} />
            <Field label="Phone" value={mockPatient.phone} />
          </div>
        </SectionCard>

        <SectionCard
          icon={<CalendarDays className="size-5" />}
          title="Appointment Information"
          subtitle="Final visit schedule details"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Appointment Date" value={mockAppointment.date} />
            <Field label="Appointment ID" value={mockAppointment.appointmentId} />
            <Field label="Visit Type" value={mockAppointment.appointmentType} />
            <Field label="Chair" value={mockAppointment.chair} />
            <Field label="Dentist" value={mockAppointment.dentist} />
            <Field
              label="Status"
              value={
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getCompletedBadgeClass()}`}
                >
                  Completed
                </span>
              }
            />
          </div>
        </SectionCard>
      </div>

      {/* Completed Procedures */}
      <SectionCard
        icon={<ClipboardList className="size-5" />}
        title="Treatment Summary"
        subtitle={`Completed procedures: ${mockCompletedProcedures.length}`}
      >
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
              {mockCompletedProcedures.map((procedure) => (
                <tr key={procedure.id} className="border-b border-border/60 last:border-b-0">
                  <td className="px-3 py-3 font-semibold text-foreground">{procedure.procedure}</td>
                  <td className="px-3 py-3 text-muted-foreground">{procedure.toothNumber}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getCompletedBadgeClass()}`}
                    >
                      {procedure.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{procedure.startTime}</td>
                  <td className="px-3 py-3 text-muted-foreground">{procedure.endTime}</td>
                  <td className="px-3 py-3 text-muted-foreground">{procedure.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Remaining Treatment */}
      <SectionCard
        icon={<AlertTriangle className="size-5" />}
        title="Remaining Treatment"
        subtitle={`${mockRemainingTreatment.length} procedure(s) still planned`}
      >
        {mockRemainingTreatment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="px-3 py-2">Procedure Name</th>
                  <th className="px-3 py-2">Tooth Number</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {mockRemainingTreatment.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-3 py-3 font-semibold text-foreground">{item.procedure}</td>
                    <td className="px-3 py-3 text-muted-foreground">{item.toothNumber}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getPlannedBadgeClass()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{item.recommended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyCopy title="No remaining treatment." message="All planned procedures have been completed." />
        )}
      </SectionCard>

      {/* Clinical Notes + Post-Op Instructions */}
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          icon={<FileText className="size-5" />}
          title="Final Clinical Notes"
          subtitle="Clinical summary from the completed visit"
        >
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
            <p className="text-sm text-foreground">{mockClinicalNotes.finalNotes}</p>
          </div>
        </SectionCard>

        <SectionCard
          icon={<Stethoscope className="size-5" />}
          title="Post-Operative Instructions"
          subtitle="Self-care guidance after treatment"
        >
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
            <p className="whitespace-pre-line text-sm text-foreground">{mockClinicalNotes.postOpInstructions}</p>
          </div>
        </SectionCard>
      </div>

      {/* Medication Instructions */}
      <SectionCard
        icon={<Pill className="size-5" />}
        title="Medication Instructions"
        subtitle="Prescribed medications for this visit"
      >
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {mockMedication.medicineName} {mockMedication.dosage}
              </p>
              <p className="text-xs text-muted-foreground">
                {mockMedication.frequency} · {mockMedication.duration}
              </p>
            </div>
            <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              Take after food
            </span>
          </div>
          {mockMedication.instructions && (
            <p className="mt-2 text-xs text-muted-foreground">{mockMedication.instructions}</p>
          )}
        </div>
      </SectionCard>

      {/* Financial Summary */}
      <SectionCard
        icon={<Receipt className="size-5" />}
        title="Billing Summary"
        subtitle={`Invoice ${mockFinancialSummary.invoiceNumber}`}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Invoice Number" value={mockFinancialSummary.invoiceNumber} />
          <Field label="Receipt Number" value={mockFinancialSummary.receiptNumber} />
          <Field label="Current Visit Total" value={formatCurrency(mockFinancialSummary.currentVisitTotal)} />
          <Field label="Amount Paid" value={formatCurrency(mockFinancialSummary.amountPaid)} />
          <Field label="Current Invoice Balance" value={formatCurrency(mockFinancialSummary.currentInvoiceBalance)} />
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Payment Status
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getPaymentBadgeClass(mockFinancialSummary.paymentStatus)}`}
              >
                {mockFinancialSummary.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Previous Outstanding Balance - visually separate */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Previous Outstanding Balance
          </div>
          <div className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
            {formatCurrency(mockFinancialSummary.previousOutstandingBalance)}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This balance is separate from the current completed invoice.
          </p>
        </div>
      </SectionCard>

      {/* Follow-up + Recall */}
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          icon={<CalendarPlus className="size-5" />}
          title="Follow-up Recommendation"
          subtitle="Suggested return visit"
        >
          {mockFollowUp.recommended ? (
            <div className="space-y-3">
              <Field label="Recommended Follow-up" value={mockFollowUp.reason} />
              <Field label="Recommended Time" value={mockFollowUp.recommendedTime} />
              <Field
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getPlannedBadgeClass()}`}
                  >
                    Planned
                  </span>
                }
              />
            </div>
          ) : (
            <EmptyCopy title="No follow-up required." message="There is no follow-up appointment recommendation on file." />
          )}
        </SectionCard>

        <SectionCard
          icon={<CalendarDays className="size-5" />}
          title="Recall Recommendation"
          subtitle="Routine maintenance schedule"
        >
          <div className="space-y-3">
            <Field label="Recommended Recall" value={mockFollowUp.recall} />
            <Field
              label="Status"
              value={
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${getPlannedBadgeClass()}`}
                >
                  Scheduled
                </span>
              }
            />
          </div>
        </SectionCard>
      </div>

      {/* Visit Actions */}
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
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download className="mr-1.5 size-4" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewReceipt}>
              <Receipt className="mr-1.5 size-4" />
              View Receipt
            </Button>
            <Button variant="outline" size="sm" onClick={handleBookFollowUp}>
              <CalendarPlus className="mr-1.5 size-4" />
              Book Follow-up Appointment
            </Button>
            <Button variant="outline" size="sm" onClick={handleCreateRecall}>
              <CalendarDays className="mr-1.5 size-4" />
              Create Recall
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReturnDashboard}>
              <ArrowLeft className="mr-1.5 size-4" />
              Return Dashboard
            </Button>
            <Button size="sm" onClick={handleFinishVisit}>
              <CheckCircle2 className="mr-1.5 size-4" />
              Finish / Close Visit
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