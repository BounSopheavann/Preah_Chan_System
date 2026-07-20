'use client';

import { PATIENT } from '../patient-context';

export type NoteType =
  | 'Examination'
  | 'Procedure'
  | 'Treatment'
  | 'Follow-up'
  | 'Patient Communication'
  | 'Consultation'
  | 'Referral'
  | 'General';

export type AttachmentType = 'Image' | 'X-ray' | 'PDF' | 'Lab Result' | 'Referral Document' | 'Consent Form';

export interface NoteAttachment {
  id: string;
  type: AttachmentType;
  name: string;
}

export interface NoteAmendment {
  amendedBy: string;
  amendmentDate: string;
  reason: string;
  content: string;
}

export interface ProgressNote {
  id: string;
  type: NoteType;
  date: string;
  time: string;
  author: string;
  role: string;
  linkedExamination: string;
  linkedDiagnosis: string;
  linkedTreatment: string;
  content: string;
  attachments: NoteAttachment[];
  createdAt: string;
  createdBy: string;
  lastAmendedAt?: string;
  lastAmendedBy?: string;
  amendments: NoteAmendment[];
}

export const noteTypes: NoteType[] = [
  'Examination',
  'Procedure',
  'Treatment',
  'Follow-up',
  'Patient Communication',
  'Consultation',
  'Referral',
  'General',
];

export const attachmentTypes: AttachmentType[] = [
  'Image',
  'X-ray',
  'PDF',
  'Lab Result',
  'Referral Document',
  'Consent Form',
];

export const noteTypeBadgeColor: Record<NoteType, string> = {
  Examination: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
  Procedure: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  Treatment: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  'Follow-up': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  'Patient Communication': 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
  Consultation: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
  Referral: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  General: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

export const dummyProgressNotes: ProgressNote[] = [
  {
    id: 'note-001',
    type: 'Examination',
    date: '18 Jul 2026',
    time: '10:32 AM',
    author: 'Dr. Maya',
    role: 'Dentist',
    linkedExamination: 'EX-2026-0082',
    linkedDiagnosis: 'Deep Dental Caries',
    linkedTreatment: 'Root Canal Treatment',
    content:
      'Patient reports pain while chewing on upper left molar. Clinical examination shows deep caries on tooth 26. Percussion test positive. Reversible pulpitis suspected.',
    attachments: [
      { id: 'att-1', type: 'X-ray', name: 'PA Tooth 26' },
      { id: 'att-2', type: 'Image', name: 'Intraoral — Tooth 26' },
    ],
    createdAt: '18 Jul 2026, 10:32 AM',
    createdBy: 'Dr. Maya',
    amendments: [],
  },
  {
    id: 'note-002',
    type: 'Patient Communication',
    date: '18 Jul 2026',
    time: '10:45 AM',
    author: 'Dr. Maya',
    role: 'Dentist',
    linkedExamination: 'EX-2026-0082',
    linkedDiagnosis: 'Deep Dental Caries',
    linkedTreatment: 'Root Canal Treatment',
    content:
      'Treatment options and estimated costs discussed with patient. Patient consented to root canal treatment followed by crown restoration on tooth 26.',
    attachments: [{ id: 'att-3', type: 'Consent Form', name: 'RCT Consent — Signed' }],
    createdAt: '18 Jul 2026, 10:45 AM',
    createdBy: 'Dr. Maya',
    amendments: [],
  },
  {
    id: 'note-003',
    type: 'Treatment',
    date: '18 Jul 2026',
    time: '11:10 AM',
    author: 'Dr. Maya',
    role: 'Dentist',
    linkedExamination: 'EX-2026-0082',
    linkedDiagnosis: 'Deep Dental Caries',
    linkedTreatment: 'Root Canal Treatment',
    content:
      'Treatment plan prepared for root canal treatment followed by crown restoration on tooth 26. Prescription for post-operative analgesia issued.',
    attachments: [],
    createdAt: '18 Jul 2026, 11:10 AM',
    createdBy: 'Dr. Maya',
    amendments: [],
  },
];

export const recentActivitySeed = [
  { time: '11:10 AM', label: 'Progress Note Added', type: 'note' as const },
  { time: '10:58 AM', label: 'Treatment Plan Updated', type: 'treatment' as const },
  { time: '10:45 AM', label: 'Diagnosis Added', type: 'diagnosis' as const },
  { time: '10:30 AM', label: 'Odontogram Updated', type: 'odontogram' as const },
];

export const patientName = PATIENT.name;