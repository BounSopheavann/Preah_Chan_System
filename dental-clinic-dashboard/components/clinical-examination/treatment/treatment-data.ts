export type PlanStatus =
  | 'Draft'
  | 'Proposed'
  | 'Approved'
  | 'Partially Approved'
  | 'Declined'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type TreatmentItemStatus =
  | 'Planned'
  | 'Proposed'
  | 'Approved'
  | 'Declined'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type TreatmentPriority = 'Emergency' | 'Urgent' | 'Recommended' | 'Optional';

export type TreatmentPhase =
  | 'Emergency Phase'
  | 'Disease Control Phase'
  | 'Restorative Phase'
  | 'Surgical Phase'
  | 'Prosthetic Phase'
  | 'Maintenance Phase'
  | '';

export interface TreatmentItem {
  id: string;
  sequence: number;
  procedure: string;
  procedureCode: string;
  linkedDiagnosis: string;
  linkedDiagnosisId: string;
  toothArea: string;
  toothSurface: string[];
  archQuadrant: string;
  priority: TreatmentPriority;
  treatmentPhase: TreatmentPhase;
  estimatedDuration: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  status: TreatmentItemStatus;
  dentist: string;
  notes: string;
  linkedOdontogramFinding?: string;
  linkedXrayImage?: string;
  linkedClinicalImage?: string;
}

export interface TreatmentPlanData {
  planName: string;
  planId: string;
  planDate: string;
  createdBy: string;
  patient: string;
  linkedExamination: string;
  status: PlanStatus;
  items: TreatmentItem[];
  insuranceEstimate: number;
  patientShare: number;
  approvedAmount: number;
  remainingEstimate: number;
  subtotal: number;
  discount: number;
  estimatedTotal: number;
  patientDecision?: PatientDecision;
}

export interface PatientDecision {
  type: 'Approve All' | 'Approve Selected' | 'Request Changes' | 'Decline Plan';
  date: string;
  notes: string;
  declineReason?: string;
}

export const planStatuses: PlanStatus[] = [
  'Draft', 'Proposed', 'Approved', 'Partially Approved', 'Declined', 'In Progress', 'Completed', 'Cancelled',
];

export const treatmentItemStatuses: TreatmentItemStatus[] = [
  'Planned', 'Proposed', 'Approved', 'Declined', 'Scheduled', 'In Progress', 'Completed', 'Cancelled',
];

export const treatmentPriorities: TreatmentPriority[] = ['Emergency', 'Urgent', 'Recommended', 'Optional'];

export const treatmentPhases: TreatmentPhase[] = [
  'Emergency Phase', 'Disease Control Phase', 'Restorative Phase', 'Surgical Phase', 'Prosthetic Phase', 'Maintenance Phase',
];

export const procedureOptions = [
  'Dental Examination', 'Scaling & Cleaning', 'Composite Filling', 'Amalgam Filling',
  'Root Canal Treatment', 'Tooth Extraction', 'Surgical Extraction', 'Dental Crown',
  'Bridge', 'Dental Implant', 'Denture', 'Periodontal Therapy', 'Whitening',
  'Fluoride Treatment', 'Sealant', 'Emergency Treatment',
];

export const dummyTreatmentPlan: TreatmentPlanData = {
  planName: 'Comprehensive Treatment Plan',
  planId: 'TP-2026-00124',
  planDate: '18 Jul 2026',
  createdBy: 'Dr. Maya',
  patient: 'Sofia Martin',
  linkedExamination: 'EX-2026-0082',
  status: 'Draft',
  insuranceEstimate: 200,
  patientShare: 620,
  approvedAmount: 520,
  remainingEstimate: 300,
  subtotal: 850,
  discount: 30,
  estimatedTotal: 820,
  items: [
    {
      id: 'tx-001',
      sequence: 1,
      procedure: 'Root Canal Treatment',
      procedureCode: 'RCT-001',
      linkedDiagnosis: 'Deep Dental Caries',
      linkedDiagnosisId: 'dx-001',
      toothArea: '26',
      toothSurface: ['Occlusal', 'Distal'],
      archQuadrant: 'Upper Right',
      priority: 'Urgent',
      treatmentPhase: 'Emergency Phase',
      estimatedDuration: '90 min',
      quantity: 1,
      unitPrice: 300,
      discount: 0,
      total: 300,
      status: 'Proposed',
      dentist: 'Dr. Maya',
      notes: 'Deep carious lesion extending close to pulp.',
      linkedOdontogramFinding: 'Tooth 26 - Occlusal + Distal Caries',
      linkedXrayImage: 'PA Tooth 26',
    },
    {
      id: 'tx-002',
      sequence: 2,
      procedure: 'Dental Crown',
      procedureCode: 'CRN-001',
      linkedDiagnosis: 'Deep Dental Caries',
      linkedDiagnosisId: 'dx-001',
      toothArea: '26',
      toothSurface: ['Full'],
      archQuadrant: 'Upper Right',
      priority: 'Recommended',
      treatmentPhase: 'Restorative Phase',
      estimatedDuration: '60 min',
      quantity: 1,
      unitPrice: 220,
      discount: 0,
      total: 220,
      status: 'Proposed',
      dentist: 'Dr. Maya',
      notes: 'Full coverage crown for endodontically treated tooth.',
      linkedOdontogramFinding: 'Tooth 26 - Caries',
    },
    {
      id: 'tx-003',
      sequence: 3,
      procedure: 'Composite Filling',
      procedureCode: 'FIL-001',
      linkedDiagnosis: 'Reversible Pulpitis',
      linkedDiagnosisId: 'dx-002',
      toothArea: '16',
      toothSurface: ['Occlusal'],
      archQuadrant: 'Upper Left',
      priority: 'Recommended',
      treatmentPhase: 'Restorative Phase',
      estimatedDuration: '45 min',
      quantity: 1,
      unitPrice: 120,
      discount: 0,
      total: 120,
      status: 'Proposed',
      dentist: 'Dr. Maya',
      notes: 'Composite restoration to address sensitivity.',
      linkedOdontogramFinding: 'Tooth 16 - Composite Filling',
    },
    {
      id: 'tx-004',
      sequence: 4,
      procedure: 'Scaling & Cleaning',
      procedureCode: 'CLN-001',
      linkedDiagnosis: 'Chronic Gingivitis',
      linkedDiagnosisId: 'dx-003',
      toothArea: 'Full Mouth',
      toothSurface: [],
      archQuadrant: 'All',
      priority: 'Recommended',
      treatmentPhase: 'Disease Control Phase',
      estimatedDuration: '45 min',
      quantity: 1,
      unitPrice: 50,
      discount: 30,
      total: 50,
      status: 'Proposed',
      dentist: 'Dr. Maya',
      notes: 'Generalized scaling and polishing.',
    },
  ],
};

export const planStatusBadgeColor: Record<PlanStatus, string> = {
  Draft: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Proposed: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  Approved: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  'Partially Approved': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Declined: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  'In Progress': 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Cancelled: 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const treatmentStatusBadgeColor: Record<TreatmentItemStatus, string> = {
  Planned: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Proposed: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  Approved: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Declined: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  Scheduled: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Cancelled: 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const priorityBadgeColor: Record<TreatmentPriority, string> = {
  Emergency: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  Urgent: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Recommended: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  Optional: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
};