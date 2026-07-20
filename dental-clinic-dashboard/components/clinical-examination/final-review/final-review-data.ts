'use client';

import { dummyDiagnoses } from '../diagnosis/diagnosis-data';
import { dummyTreatmentPlan } from '../treatment/treatment-data';
import { dummyPrescriptions } from '../prescription/prescription-data';
import { dummyProgressNotes } from '../progress-notes/progress-notes-data';
import { dummyImages } from '../xray-images/image-data';

export type ExamTab = 'odontogram' | 'xrays' | 'diagnosis' | 'treatment' | 'prescription' | 'progress';
export type ExaminationStatus = 'In Progress' | 'Completed';
export type ReviewSectionKey = 'clinical' | 'odontogram' | 'xrays' | 'diagnosis' | 'treatment' | 'prescription' | 'progress';
export type SectionCompletionStatus = 'Complete' | 'Optional' | 'Incomplete';
export type IssueLevel = 'blocking' | 'recommendation';

export const NEEDS_TREATMENT_CONDITIONS = ['Caries', 'Root Canal', 'Extracted', 'Fracture', 'Periapical Lesion', 'Abscess', 'Gingivitis', 'Periodontitis', 'Sensitivity'];
export const XRAY_TYPES = new Set(['Periapical', 'Bitewing', 'Panoramic', 'CBCT']);

export interface OdontogramRecordLite { condition: string; }

export interface SectionSummary {
  key: ReviewSectionKey;
  title: string;
  targetTab: ExamTab;
  status: SectionCompletionStatus;
  summary: string;
  warning?: string;
}

export interface ValidationIssue {
  id: string;
  level: IssueLevel;
  message: string;
  detail: string;
  targetTab?: ExamTab;
}

export interface StatusLogEvent {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
}

export interface AmendmentRecord {
  id: string;
  reason: string;
  notes: string;
  date: string;
  author: string;
}

export interface ReviewModel {
  sections: SectionSummary[];
  issues: ValidationIssue[];
  readyToComplete: boolean;
  counts: {
    diagnoses: number;
    activeDiagnoses: number;
    urgentDiagnoses: number;
    emergencyDiagnoses: number;
    resolvedDiagnoses: number;
    treatmentProcedures: number;
    estimatedCost: number;
    approvedAmount: number;
    prescriptions: number;
    progressNotes: number;
  };
}

function today() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function buildReviewModel(args: { odontogramRecords: Record<number, OdontogramRecordLite>; noClinicalProblem: boolean; noTreatmentRequired: boolean }): ReviewModel {
  const { odontogramRecords, noClinicalProblem, noTreatmentRequired } = args;
  const teethCharted = Object.keys(odontogramRecords).length;
  const teethNeedingTreatment = Object.values(odontogramRecords).filter(r => NEEDS_TREATMENT_CONDITIONS.includes(r.condition)).length;
  const totalImages = dummyImages.length;
  const xrayCount = dummyImages.filter(i => XRAY_TYPES.has(i.type)).length;
  const clinicalPhotoCount = totalImages - xrayCount;
  const imagesRequiringReview = dummyImages.filter(i => i.tags.includes('Requires Review')).length;
  const totalDx = dummyDiagnoses.length;
  const activeDx = dummyDiagnoses.filter(d => d.status === 'Active').length;
  const urgentDx = dummyDiagnoses.filter(d => d.priority === 'Urgent').length;
  const emergencyDx = dummyDiagnoses.filter(d => d.priority === 'Emergency').length;
  const resolvedDx = dummyDiagnoses.filter(d => d.status === 'Resolved').length;
  const plan = dummyTreatmentPlan;
  const procCount = plan.items.length;
  const estCost = plan.estimatedTotal;
  const approvedAmt = plan.approvedAmount;
  const rxCount = dummyPrescriptions.length;
  const pnCount = dummyProgressNotes.length;

  const sections: SectionSummary[] = [
    { key: 'clinical', title: 'Clinical Examination', targetTab: 'odontogram', status: 'Complete', summary: 'Chief Complaint: Pain while chewing on upper left molar.\nClinical Findings: Deep caries on tooth 26.\nMedical history reviewed.', warning: undefined },
    { key: 'odontogram', title: 'Dental Chart / Odontogram', targetTab: 'odontogram', status: 'Complete', summary: `Teeth Charted: ${teethCharted}\nConditions: ${teethCharted}\nNeeds Treatment: ${teethNeedingTreatment}`, warning: undefined },
    { key: 'xrays', title: 'X-rays & Clinical Images', targetTab: 'xrays', status: totalImages > 0 ? 'Complete' : 'Optional', summary: totalImages > 0 ? `Total: ${totalImages}\nX-rays: ${xrayCount}\nClinical Photos: ${clinicalPhotoCount}\nRequires Review: ${imagesRequiringReview}` : 'No diagnostic images attached.', warning: undefined },
    { key: 'diagnosis', title: 'Diagnosis & Problem List', targetTab: 'diagnosis', status: noClinicalProblem ? 'Complete' : (totalDx > 0 ? 'Complete' : 'Incomplete'), summary: noClinicalProblem ? 'No Clinical Problem Found.' : `Total: ${totalDx}\nActive: ${activeDx}\nUrgent: ${urgentDx}\nEmergency: ${emergencyDx}\nResolved: ${resolvedDx}`, warning: undefined },
    { key: 'treatment', title: 'Treatment Plan & Cost Estimate', targetTab: 'treatment', status: noTreatmentRequired ? 'Optional' : (procCount > 0 ? 'Complete' : 'Incomplete'), summary: noTreatmentRequired ? 'No Treatment Required' : `Plan: ${plan.planName}\nStatus: ${plan.status}\nProcedures: ${procCount}\nEstimated Cost: $${estCost}\nApproved Amount: $${approvedAmt}`, warning: undefined },
    { key: 'prescription', title: 'Prescription', targetTab: 'prescription', status: rxCount > 0 ? 'Complete' : 'Optional', summary: rxCount > 0 ? `${rxCount} Prescription(s)\n${dummyPrescriptions[0]?.status ?? ''}` : 'No prescription required.', warning: undefined },
    { key: 'progress', title: 'Progress Notes', targetTab: 'progress', status: pnCount > 0 ? 'Complete' : 'Incomplete', summary: pnCount > 0 ? `${pnCount} Notes\nLast Updated: ${dummyProgressNotes[pnCount - 1]?.time ?? ''}\nAuthor: ${dummyProgressNotes[pnCount - 1]?.author ?? ''}` : 'No progress notes.', warning: undefined },
  ];

  const issues: ValidationIssue[] = [];
  if (!noClinicalProblem && totalDx === 0) {
    issues.push({ id: 'v-1', level: 'blocking', message: 'Missing Diagnosis', detail: 'Add a diagnosis or mark "No Clinical Problem Found".', targetTab: 'diagnosis' });
  }
  if (noTreatmentRequired) {
    (sections.find(s => s.key === 'treatment') ?? sections[4]).warning = 'No treatment recommended. Optional note recommended.';
  }
  issues.push({ id: 'v-2', level: 'recommendation', message: 'Treatment Plan is Draft', detail: 'Consider finalizing the treatment plan before completing.', targetTab: 'treatment' });

  const readyToComplete = issues.filter(i => i.level === 'blocking').length === 0;

  return {
    sections,
    issues,
    readyToComplete,
    counts: {
      diagnoses: totalDx,
      activeDiagnoses: activeDx,
      urgentDiagnoses: urgentDx,
      emergencyDiagnoses: emergencyDx,
      resolvedDiagnoses: resolvedDx,
      treatmentProcedures: procCount,
      estimatedCost: estCost,
      approvedAmount: approvedAmt,
      prescriptions: rxCount,
      progressNotes: pnCount,
    },
  };
}

export function createSeedStatusLog(): StatusLogEvent[] {
  return [
    { id: 'sl-1', date: '18 Jul 2026', time: '09:15', user: 'Reception', action: 'Examination Created' },
    { id: 'sl-2', date: '18 Jul 2026', time: '09:30', user: 'Dr. Maya', action: 'Examination Started' },
    { id: 'sl-3', date: '18 Jul 2026', time: '09:45', user: 'Dr. Maya', action: 'Clinical Exam Saved' },
    { id: 'sl-4', date: '18 Jul 2026', time: '10:00', user: 'Dr. Maya', action: 'Odontogram Updated' },
    { id: 'sl-5', date: '18 Jul 2026', time: '10:30', user: 'Dr. Maya', action: 'X-rays Uploaded' },
    { id: 'sl-6', date: '18 Jul 2026', time: '10:45', user: 'Dr. Maya', action: 'Diagnosis Added' },
    { id: 'sl-7', date: '18 Jul 2026', time: '10:58', user: 'Dr. Maya', action: 'Treatment Plan Created' },
    { id: 'sl-8', date: '18 Jul 2026', time: '11:10', user: 'Dr. Maya', action: 'Prescription Finalized' },
    { id: 'sl-9', date: '18 Jul 2026', time: '11:12', user: 'Dr. Maya', action: 'Progress Note Added' },
  ];
}