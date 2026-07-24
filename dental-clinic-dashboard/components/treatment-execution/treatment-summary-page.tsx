'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Pill,
  Printer,
  Stethoscope,
  User,
  Syringe,
  Package,
  DollarSign,
  ClipboardList,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PatientContextHeader } from './patient-context-header';
import type { TreatmentSession } from './treatment-execution-data';

/* ────────────────────────────────────────────
   MOCK DATA
   ──────────────────────────────────────────── */

const MOCK_SESSION: TreatmentSession = {
  id: 'SES-20260724-0042',
  patientName: 'Sok Dara',
  patientId: 'PT000124',
  appointmentDate: '2026-07-24',
  appointmentTime: '09:00 AM',
  dentist: 'Dr. Chan Vireak',
  status: 'Completed',
  plannedItems: [],
  completedProcedures: [],
  inProgressProcedure: null,
  summary: {
    completedProcedures: [],
    inProgressProcedures: [],
    remainingPlanned: [],
    dentist: 'Dr. Chan Vireak',
    totalDuration: '65 minutes',
    finalNotes:
      'Composite restoration completed on tooth #16. Scaling completed successfully. Patient tolerated treatment well with no complications.',
    recommendations:
      'Avoid chewing hard food on the treated tooth for 24 hours. Maintain regular brushing and flossing. Return if sensitivity becomes severe or persistent. Schedule crown review for tooth #26.',
    postOpInstructions:
      'Do not eat or drink for 30 minutes after procedure. If bleeding occurs, bite on gauze for 20 minutes. Use prescribed mouthwash as directed. Apply ice pack if swelling occurs.',
    createdAt: '2026-07-24T10:35:00Z',
  },
};

interface MockCompletedProcedure {
  id: string;
  procedure: string;
  toothNumber: string;
  toothSurface: string[];
  dentist: string;
  duration: string;
  startTime: string;
  endTime: string;
  clinicalNotes: string;
  status: 'Completed';
  anesthesiaUsed: boolean;
  anesthesia: {
    drug: string;
    dosage: string;
    quantity: string;
    injectionSite: string;
  } | null;
  consumables: { id: string; material: string; quantityUsed: number; unit: string }[];
  prescriptions: {
    id: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  attachments: { id: string; fileName: string; type: string; uploadedBy: string; uploadedAt: string }[];
  price: number;
}

interface MockRemainingProcedure {
  id: string;
  procedure: string;
  toothArea: string;
  toothSurface: string[];
  estimatedDuration: string;
  priority: string;
  status: string;
  recommendation: string;
}

const MOCK_COMPLETED_PROCEDURES: MockCompletedProcedure[] = [
  {
    id: 'proc-001',
    procedure: 'Composite Filling',
    toothNumber: '#16',
    toothSurface: ['Occlusal'],
    dentist: 'Dr. Chan Vireak',
    duration: '35 minutes',
    startTime: '09:15 AM',
    endTime: '09:50 AM',
    clinicalNotes: 'Class I carious lesion on occlusal surface. Caries removed, cavity prepared, etched, bonded, and restored with composite resin. Occlusion checked and adjusted.',
    status: 'Completed',
    anesthesiaUsed: true,
    anesthesia: {
      drug: 'Lidocaine 2%',
      dosage: '1.8 ml',
      quantity: '1 cartridge',
      injectionSite: 'Buccal infiltration',
    },
    consumables: [
      { id: 'mat-001', material: 'Composite Resin (A3)', quantityUsed: 1, unit: 'unit' },
      { id: 'mat-002', material: 'Etching Gel (37% PA)', quantityUsed: 1, unit: 'unit' },
      { id: 'mat-003', material: 'Bonding Agent', quantityUsed: 1, 'unit': 'unit' },
      { id: 'mat-004', material: 'Cotton Roll', quantityUsed: 2, 'unit': 'units' },
    ],
    prescriptions: [
      {
        id: 'rx-001',
        medicineName: 'Ibuprofen',
        dosage: '400 mg',
        frequency: 'Every 8 hours',
        duration: '3 days',
        instructions: 'Take after food',
      },
    ],
    attachments: [
      { id: 'att-001', fileName: 'pre-op-xray-16.png', type: 'X-Ray', uploadedBy: 'Dr. Chan Vireak', uploadedAt: '09:10 AM' },
      { id: 'att-002', fileName: 'post-op-photo-16.png', type: 'Photo', uploadedBy: 'Dr. Chan Vireak', uploadedAt: '09:55 AM' },
    ],
    price: 35.0,
  },
  {
    id: 'proc-002',
    procedure: 'Scaling',
    toothNumber: 'Full Mouth',
    toothSurface: ['All'],
    dentist: 'Dr. Chan Vireak',
    duration: '30 minutes',
    startTime: '10:00 AM',
    endTime: '10:30 AM',
    clinicalNotes: 'Full mouth scaling completed. Moderate calculus deposits removed. Patient tolerated well. Oral hygiene instructions reinforced.',
    status: 'Completed',
    anesthesiaUsed: false,
    anesthesia: null,
    consumables: [
      { id: 'mat-005', material: 'Scaling Tip', quantityUsed: 1, unit: 'unit' },
      { id: 'mat-006', material: 'Polishing Paste', quantityUsed: 1, unit: 'unit' },
    ],
    prescriptions: [],
    attachments: [],
    price: 25.0,
  },
];

const MOCK_REMAINING_PROCEDURES: MockRemainingProcedure[] = [
  {
    id: 'plan-001',
    procedure: 'Crown Review',
    toothArea: '#26',
    toothSurface: ['Full'],
    estimatedDuration: '20 minutes',
    priority: 'Medium',
    status: 'Planned',
    recommendation: 'Next visit',
  },
];

const MOCK_CLINICAL_SUMMARY = {
  finalNotes:
    'Composite restoration completed on tooth #16. Scaling completed successfully. Patient tolerated treatment well with no complications.',
  recommendations:
    'Avoid chewing hard food on the treated tooth for 24 hours. Maintain regular brushing and flossing. Return if sensitivity becomes severe or persistent. Schedule crown review for tooth #26.',
  postOpInstructions:
    'Do not eat or drink for 30 minutes after procedure. If bleeding occurs, bite on gauze for 20 minutes. Use prescribed mouthwash as directed. Apply ice pack if swelling occurs.',
};

const MOCK_BILLABLE = {
  items: [
    { procedure: 'Composite Filling', price: 35.0 },
    { procedure: 'Scaling', price: 25.0 },
  ],
  total: 60.0,
};

/* ────────────────────────────────────────────
   BADGE COLOR HELPERS (inline, no external dep)
   ──────────────────────────────────────────── */

const statusBadgeCompleted =
  'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300';
const statusBadgeInProgress =
  'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300';
const statusBadgePlanned =
  'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

/* ────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────── */

export function TreatmentSummaryPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleReturnToTreatment = useCallback(() => {
    router.push('/treatment-execution');
  }, [router]);

  const handleContinueToBilling = useCallback(() => {
    router.push('/billing');
  }, [router]);

  const handlePrintSummary = useCallback(() => {
    window.print();
  }, []);

  const completedCount = MOCK_COMPLETED_PROCEDURES.length;
  const remainingCount = MOCK_REMAINING_PROCEDURES.length;

  /* Collect all unique prescriptions */
  const allPrescriptions = MOCK_COMPLETED_PROCEDURES.flatMap((p) => p.prescriptions);

  /* Collect all unique attachments */
  const allAttachments = MOCK_COMPLETED_PROCEDURES.flatMap((p) => p.attachments);

  /* Has anesthesia */
  const hasAnesthesia = MOCK_COMPLETED_PROCEDURES.some((p) => p.anesthesiaUsed && p.anesthesia);

  /* Has consumables */
  const hasConsumables = MOCK_COMPLETED_PROCEDURES.some((p) => p.consumables.length > 0);

  const textareaClass =
    'min-h-20 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60';

  return (
    <div className="space-y-4 mx-[100px]">
      {/* Toast notification */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 animate-in slide-in-from-right-2 fade-in rounded-xl border border-border bg-card/95 px-5 py-3 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-semibold text-foreground">{toast}</p>
        </div>
      )}

      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReturnToTreatment}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Treatment Execution
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Treatment Summary</h1>
          <p className="text-sm text-muted-foreground">
            Final clinical review for {MOCK_SESSION.patientName} · {MOCK_SESSION.appointmentDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrintSummary}>
            <Printer className="size-4" />
            Print Summary
          </Button>
          <Button variant="outline" onClick={handleReturnToTreatment}>
            <ArrowRight className="size-4 rotate-180" />
            Return to Treatment
          </Button>
          <Button onClick={handleContinueToBilling}>
            <DollarSign className="size-4" />
            Continue to Billing
          </Button>
        </div>
      </div>

      {/* Patient / Visit Header */}
      <PatientContextHeader session={MOCK_SESSION} />

      {/* Visit Status Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-lg font-bold">{completedCount}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {completedCount === 1 ? 'Procedure' : 'Procedures'} Completed
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-lg font-bold">{remainingCount}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Remaining / Planned
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <DollarSign className="h-5 w-5" />
            <span className="text-lg font-bold">${MOCK_BILLABLE.total.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Estimated Billing Total
          </p>
        </div>
      </div>

      {/* Completed Procedures */}
      {completedCount > 0 && (
        <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Completed Procedures
          </h3>
          <div className="space-y-2">
            {MOCK_COMPLETED_PROCEDURES.map((proc) => (
              <div
                key={proc.id}
                className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{proc.procedure}</p>
                    <p className="text-xs text-muted-foreground">
                      Tooth {proc.toothNumber}
                      {proc.toothSurface.length > 0 && ` · ${proc.toothSurface.join(', ')}`}
                      {proc.duration && ` · ${proc.duration}`}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${statusBadgeCompleted}`}
                  >
                    Completed
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {proc.dentist}
                  </span>
                  {proc.startTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {proc.startTime}
                      {proc.endTime && ` - ${proc.endTime}`}
                    </span>
                  )}
                </div>
                {proc.clinicalNotes && (
                  <p className="mt-0.5 text-xs text-muted-foreground/80 line-clamp-2 border-t border-border/50 pt-1.5">
                    {proc.clinicalNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remaining / Planned Procedures */}
      {remainingCount > 0 && (
        <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <AlertTriangle className="size-4 text-slate-400" />
            Remaining / Planned Procedures
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            These procedures were not completed during this visit and remain available for future treatment.
          </p>
          <div className="space-y-2">
            {MOCK_REMAINING_PROCEDURES.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.procedure}</p>
                  <p className="text-xs text-muted-foreground">
                    Tooth {item.toothArea}
                    {item.toothSurface.length > 0 && ` · ${item.toothSurface.join(', ')}`}
                    {item.estimatedDuration && ` · ${item.estimatedDuration}`}
                    {item.priority && ` · ${item.priority} priority`}
                    {item.recommendation && ` · ${item.recommendation}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${statusBadgePlanned}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Record Summary */}
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <FileText className="size-4" />
          Clinical Record Summary
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Clinical Notes */}
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <FileText className="size-3.5" />
              Clinical Notes
            </div>
            {MOCK_COMPLETED_PROCEDURES.some((p) => p.clinicalNotes) ? (
              <div className="space-y-1.5">
                {MOCK_COMPLETED_PROCEDURES.filter((p) => p.clinicalNotes).map((p) => (
                  <p key={p.id} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{p.procedure}:</span>{' '}
                    {p.clinicalNotes}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No clinical notes recorded.</p>
            )}
          </div>

          {/* Anesthesia */}
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Syringe className="size-3.5" />
              Anesthesia
            </div>
            {hasAnesthesia ? (
              <div className="space-y-1.5">
                {MOCK_COMPLETED_PROCEDURES.filter((p) => p.anesthesiaUsed && p.anesthesia).map(
                  (p) => (
                    <div key={p.id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{p.procedure}:</span>{' '}
                      {p.anesthesia!.drug} ({p.anesthesia!.dosage})
                      {p.anesthesia!.injectionSite && ` · ${p.anesthesia!.injectionSite}`}
                      {p.anesthesia!.quantity && ` · ${p.anesthesia!.quantity}`}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No anesthesia recorded.</p>
            )}
          </div>

          {/* Consumables / Materials */}
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Package className="size-3.5" />
              Consumables / Materials
            </div>
            {hasConsumables ? (
              <div className="space-y-1">
                {MOCK_COMPLETED_PROCEDURES.filter((p) => p.consumables.length > 0)
                  .flatMap((p) =>
                    p.consumables.map((c) => (
                      <p key={c.id} className="text-xs text-muted-foreground">
                        {c.material} × {c.quantityUsed} {c.unit}
                      </p>
                    ))
                  )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No consumables recorded.</p>
            )}
          </div>

          {/* Prescriptions */}
          <div className="rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Pill className="size-3.5" />
              Prescriptions
            </div>
            {allPrescriptions.length > 0 ? (
              <div className="space-y-1">
                {allPrescriptions.map((rx) => (
                  <p key={rx.id} className="text-xs text-muted-foreground">
                    {rx.medicineName} {rx.dosage} · {rx.frequency} · {rx.duration}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">No prescriptions recorded.</p>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="mt-3 rounded-xl border border-border bg-muted/30 px-3.5 py-3 dark:bg-background/20">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <ClipboardList className="size-3.5" />
            Clinical Attachments
          </div>
          {allAttachments.length > 0 ? (
            <div className="space-y-1">
              {allAttachments.map((att) => (
                <p key={att.id} className="text-xs text-muted-foreground">
                  {att.fileName} ({att.type}) · Uploaded by {att.uploadedBy} at {att.uploadedAt}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">No clinical attachments.</p>
          )}
        </div>
      </div>

      {/* Final Clinical Review - Read-only Display */}
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <Stethoscope className="size-4" />
          Final Clinical Review
        </h3>

        {/* Final Notes */}
        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <FileText className="size-3.5" />
            Final Notes
          </label>
          <textarea
            value={MOCK_CLINICAL_SUMMARY.finalNotes}
            readOnly
            className={textareaClass}
          />
        </div>

        {/* Recommendations */}
        <div className="mb-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Stethoscope className="size-3.5" />
            Recommendations
          </label>
          <textarea
            value={MOCK_CLINICAL_SUMMARY.recommendations}
            readOnly
            className={textareaClass}
          />
        </div>

        {/* Post-Operative Instructions */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <AlertTriangle className="size-3.5" />
            Post-Operative / Home Care Instructions
          </label>
          <textarea
            value={MOCK_CLINICAL_SUMMARY.postOpInstructions}
            readOnly
            className={textareaClass}
          />
        </div>
      </div>

      {/* Billable Procedures Summary */}
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <DollarSign className="size-4 text-emerald-500" />
          Billable Procedures Summary
        </h3>
        <div className="space-y-2">
          {MOCK_BILLABLE.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-background/20"
            >
              <span className="text-sm font-medium text-foreground">{item.procedure}</span>
              <span className="text-sm font-bold text-foreground">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <span className="text-sm font-bold text-foreground">Total Billable Procedures: {MOCK_BILLABLE.items.length}</span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            ${MOCK_BILLABLE.total.toFixed(2)}
          </span>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground/60 italic">
          This is display data only. Not connected to the real Billing Workspace.
        </p>
      </div>

      {/* Visit Status */}
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
          <CheckCircle2 className="size-4 text-emerald-500" />
          Visit Status
        </h3>
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Treatment Completed
            </p>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {completedCount} procedure{completedCount !== 1 ? 's' : ''} completed.
              {remainingCount > 0 &&
                ` ${remainingCount} planned procedure${remainingCount !== 1 ? 's' : ''} remain for future visits.`}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="size-3.5" />
          Responsible Dentist:{' '}
          <strong className="text-foreground">{MOCK_SESSION.dentist}</strong>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrintSummary}>
            <Printer className="size-4" />
            Print Summary
          </Button>
          <Button variant="outline" onClick={handleReturnToTreatment}>
            <ArrowRight className="mr-1 size-4 rotate-180" />
            Return to Treatment
          </Button>
          <Button onClick={handleContinueToBilling}>
            <DollarSign className="size-4" />
            Continue to Billing
          </Button>
        </div>
      </div>
    </div>
  );
}