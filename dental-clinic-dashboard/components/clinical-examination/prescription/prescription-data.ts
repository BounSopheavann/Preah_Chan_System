'use client';

export type PrescriptionStatus = 'Draft' | 'Finalized' | 'Amended' | 'Cancelled';

export type MedicationRoute = 'Oral' | 'Topical' | 'Mouth Rinse' | 'Other';

export type FrequencyOption =
  | 'Once daily'
  | 'Twice daily'
  | 'Three times daily'
  | 'Four times daily'
  | 'As needed'
  | 'Custom';

export interface PrescriptionMedication {
  id: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  strength: string;
  frequency: string;
  route: MedicationRoute;
  duration: string;
  quantity: string;
  refills: string;
  instructions: string;
}

export interface PrescriptionAmendment {
  amendedBy: string;
  amendmentDate: string;
  reason: string;
  content: string;
}

export interface PrescriptionRecord {
  id: string;
  prescriptionDate: string;
  patientName: string;
  patientCode: string;
  prescriber: string;
  linkedDiagnosis: string;
  linkedTreatment: string;
  status: PrescriptionStatus;
  clinicalNotes?: string;
  medications: PrescriptionMedication[];
  amendments: PrescriptionAmendment[];
}

/* Dummy medication catalog for UI demonstration only — not medical advice. */
export interface MedicationCatalogItem {
  name: string;
  genericName: string;
  defaultStrength: string;
  defaultRoute: MedicationRoute;
  allergyConflict?: string[];
  commonNote: string;
}

export const medicationCatalog: MedicationCatalogItem[] = [
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    defaultStrength: '500 mg',
    defaultRoute: 'Oral',
    allergyConflict: ['Penicillin'],
    commonNote: 'Antibiotic for dental infections. Avoid in penicillin allergy.',
  },
  {
    name: 'Azithromycin',
    genericName: 'Azithromycin',
    defaultStrength: '250 mg',
    defaultRoute: 'Oral',
    commonNote: 'Alternative antibiotic when beta-lactams are contraindicated.',
  },
  {
    name: 'Clindamycin',
    genericName: 'Clindamycin',
    defaultStrength: '300 mg',
    defaultRoute: 'Oral',
    commonNote: 'Alternative antibiotic for penicillin-allergic patients.',
  },
  {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    defaultStrength: '400 mg',
    defaultRoute: 'Oral',
    commonNote: 'NSAID for pain and inflammation. Take with food.',
  },
  {
    name: 'Acetaminophen',
    genericName: 'Paracetamol',
    defaultStrength: '500 mg',
    defaultRoute: 'Oral',
    commonNote: 'Analgesic for mild to moderate pain.',
  },
  {
    name: 'Chlorhexidine Mouthwash',
    genericName: 'Chlorhexidine Gluconate 0.2%',
    defaultStrength: '0.2%',
    defaultRoute: 'Mouth Rinse',
    commonNote: 'Antiseptic mouth rinse. Do not swallow.',
  },
];

export const frequencyOptions: FrequencyOption[] = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'As needed',
  'Custom',
];

export const routeOptions: MedicationRoute[] = ['Oral', 'Topical', 'Mouth Rinse', 'Other'];

export const prescriptionStatusBadgeColor: Record<PrescriptionStatus, string> = {
  Draft: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Finalized: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Amended: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Cancelled: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
};

export const dummyPrescriptions: PrescriptionRecord[] = [
  {
    id: 'RX-2026-0341',
    prescriptionDate: '18 Jul 2026',
    patientName: 'Sofia Martin',
    patientCode: 'PC-1003',
    prescriber: 'Dr. Maya',
    linkedDiagnosis: 'Deep Dental Caries',
    linkedTreatment: 'Root Canal Treatment',
    status: 'Finalized',
    clinicalNotes: 'Prescribed for post-operative pain and infection prophylaxis.',
    medications: [
      {
        id: 'med-1',
        medicationName: 'Ibuprofen',
        genericName: 'Ibuprofen',
        dosage: '1 tablet',
        strength: '400 mg',
        frequency: 'As needed',
        route: 'Oral',
        duration: '5 Days',
        quantity: '15 tablets',
        refills: '0',
        instructions: 'Take one tablet every 6 hours as needed for pain. Take with food.',
      },
    ],
    amendments: [],
  },
];