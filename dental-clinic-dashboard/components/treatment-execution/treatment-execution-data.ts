'use client';

import { PATIENT, CURRENT_USER, todayLabel, nowTime } from '@/components/clinical-examination/patient-context';

/* ── Types ── */

export type ProcedureExecutionStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Interrupted'
  | 'Cancelled';

export type InterruptionReason =
  | 'Patient Pain'
  | 'Medical Emergency'
  | 'Time Limit'
  | 'Equipment Issue'
  | 'Patient Requested Stop'
  | 'Other';

export interface AnesthesiaRecord {
  drug: string;
  dosage: string;
  quantity: number;
  injectionSite: string;
  notes: string;
}

export interface ConsumableRecord {
  id: string;
  material: string;
  quantityUsed: number;
  unit?: string;
  batchLot: string;
  notes: string;
}

export interface ProcedureAttachment {
  id: string;
  type: 'Clinical Image' | 'X-ray';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ProcedurePrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ProcedureExecution {
  id: string;
  treatmentItemId: string;
  procedure: string;
  procedureCode?: string;
  toothNumber: string;
  toothSurface: string[];
  dentist: string;
  assistant?: string;
  startTime: string;
  startedAtMs?: number;
  endTime?: string;
  status: ProcedureExecutionStatus;
  clinicalNotes: string;
  complications: string;
  quantity: number;
  duration: string;
  anesthesiaUsed: boolean;
  anesthesia?: AnesthesiaRecord;
  consumables: ConsumableRecord[];
  attachments: ProcedureAttachment[];
  prescriptions: ProcedurePrescriptionItem[];
  interruptionReason?: InterruptionReason;
  interruptionNotes?: string;
  billingEligible?: boolean;
}

export interface TreatmentSession {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  dentist: string;
  assistant?: string;
  status: 'In Chair' | 'In Treatment' | 'Completed';
  plannedItems: PlannedTreatmentItem[];
  completedProcedures: ProcedureExecution[];
  inProgressProcedure: ProcedureExecution | null;
  summary?: TreatmentSummary;
  lastCompletedItemId?: string | null;
}

export interface PlannedTreatmentItem {
  id: string;
  sequence: number;
  procedure: string;
  procedureCode: string;
  toothArea: string;
  toothSurface: string[];
  priority: string;
  estimatedPrice: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Postponed' | 'Declined';
  linkedDiagnosis: string;
  estimatedDuration: string;
}

export interface TreatmentSummary {
  completedProcedures: ProcedureExecution[];
  inProgressProcedures: ProcedureExecution[];
  remainingPlanned: PlannedTreatmentItem[];
  dentist: string;
  totalDuration: string;
  finalNotes: string;
  recommendations: string;
  postOpInstructions: string;
  createdAt: string;
}

/* ── Dummy Data ── */

export const consumableOptions = [
  'Composite Resin A2',
  'Composite Resin A3',
  'Bonding Agent',
  'Etching Gel',
  'Lidocaine 2% with Epinephrine',
  'Articaine 4%',
  'Saline Solution',
  'Gauze Pads',
  'Rubber Dam',
  'Matrix Band',
  'Wedges',
  'Suture 3-0 Silk',
  'Suture 4-0 Vicryl',
  'Dental Floss',
  'Polishing Paste',
  'Fluoride Varnish',
  'Temporary Filling Material',
  'Cotton Rolls',
  'Suction Tip',
  'Gloves',
];

export const anesthesiaOptions = [
  { drug: 'Lidocaine 2% with Epinephrine 1:100,000', dosage: '1.8 mL per cartridge' },
  { drug: 'Articaine 4% with Epinephrine 1:100,000', dosage: '1.7 mL per cartridge' },
  { drug: 'Mepivacaine 3% Plain', dosage: '1.8 mL per cartridge' },
  { drug: 'Bupivacaine 0.5% with Epinephrine 1:200,000', dosage: '1.8 mL per cartridge' },
  { drug: 'Prilocaine 4% Plain', dosage: '1.8 mL per cartridge' },
];

export const injectionSites = [
  'Infraorbital Nerve Block',
  'Posterior Superior Alveolar Block',
  'Middle Superior Alveolar Block',
  'Anterior Superior Alveolar Block',
  'Nasopalatine Block',
  'Greater Palatine Block',
  'Inferior Alveolar Nerve Block',
  'Buccal Nerve Block',
  'Mental Nerve Block',
  'Incisive Nerve Block',
  'Gow-Gates Block',
  'Vazirani-Akinosi Block',
  'Intraligamentary Injection',
  'Intrapulpal Injection',
  'Local Infiltration',
  'Topical Application',
];

export const dummyPlannedItems: PlannedTreatmentItem[] = [
  {
    id: 'plan-001',
    sequence: 1,
    procedure: 'Root Canal Treatment',
    procedureCode: 'RCT-001',
    toothArea: '26',
    toothSurface: ['Occlusal', 'Distal'],
    priority: 'Urgent',
    estimatedPrice: 300,
    status: 'Planned',
    linkedDiagnosis: 'Deep Dental Caries',
    estimatedDuration: '90 min',
  },
  {
    id: 'plan-002',
    sequence: 2,
    procedure: 'Dental Crown',
    procedureCode: 'CRN-001',
    toothArea: '26',
    toothSurface: ['Full'],
    priority: 'Recommended',
    estimatedPrice: 220,
    status: 'Planned',
    linkedDiagnosis: 'Deep Dental Caries',
    estimatedDuration: '60 min',
  },
  {
    id: 'plan-003',
    sequence: 3,
    procedure: 'Composite Filling',
    procedureCode: 'FIL-001',
    toothArea: '16',
    toothSurface: ['Occlusal'],
    priority: 'Recommended',
    estimatedPrice: 120,
    status: 'Planned',
    linkedDiagnosis: 'Reversible Pulpitis',
    estimatedDuration: '45 min',
  },
  {
    id: 'plan-004',
    sequence: 4,
    procedure: 'Scaling & Cleaning',
    procedureCode: 'CLN-001',
    toothArea: 'Full Mouth',
    toothSurface: [],
    priority: 'Recommended',
    estimatedPrice: 50,
    status: 'Planned',
    linkedDiagnosis: 'Chronic Gingivitis',
    estimatedDuration: '45 min',
  },
];

export const dummySession: TreatmentSession = {
  id: 'TS-2026-001',
  patientId: PATIENT.code,
  patientName: PATIENT.name,
  appointmentDate: todayLabel(),
  appointmentTime: '10:30 AM',
  dentist: CURRENT_USER,
  assistant: 'Nurse Lina',
  status: 'In Chair',
  plannedItems: dummyPlannedItems,
  completedProcedures: [],
  inProgressProcedure: null,
  lastCompletedItemId: null,
};

export const procedureStatusBadgeColor: Record<ProcedureExecutionStatus, string> = {
  'Not Started': 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Interrupted: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  Cancelled: 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const planItemStatusBadgeColor: Record<string, string> = {
  Planned: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Postponed: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  Declined: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
};
