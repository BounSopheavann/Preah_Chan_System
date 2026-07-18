export type DiagnosisSeverity = 'Mild' | 'Moderate' | 'Severe';
export type DiagnosisPriority = 'Routine' | 'Recommended' | 'Urgent' | 'Emergency';
export type DiagnosisStatus = 'Active' | 'Monitored' | 'Resolved';
export type DiagnosisSource = 'Clinical Exam' | 'Odontogram' | 'X-ray' | 'Clinical Image' | 'Manual Entry';

export interface DiagnosisRecord {
  id: string;
  diagnosisName: string;
  diagnosisCode: string;
  toothNumber: string;
  toothSurface: string[];
  severity: DiagnosisSeverity;
  priority: DiagnosisPriority;
  status: DiagnosisStatus;
  source: DiagnosisSource;
  dateIdentified: string;
  diagnosedBy: string;
  clinicalNotes: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  linkedOdontogramFinding?: string;
  linkedXrayImage?: string;
  linkedClinicalFinding?: string;
}

export const diagnosisSeverities: DiagnosisSeverity[] = ['Mild', 'Moderate', 'Severe'];
export const diagnosisPriorities: DiagnosisPriority[] = ['Routine', 'Recommended', 'Urgent', 'Emergency'];
export const diagnosisStatuses: DiagnosisStatus[] = ['Active', 'Monitored', 'Resolved'];
export const diagnosisSources: DiagnosisSource[] = ['Clinical Exam', 'Odontogram', 'X-ray', 'Clinical Image', 'Manual Entry'];

export const diagnosisSuggestions = [
  'Dental Caries',
  'Deep Dental Caries',
  'Reversible Pulpitis',
  'Irreversible Pulpitis',
  'Pulp Necrosis',
  'Periapical Abscess',
  'Periodontitis',
  'Gingivitis',
  'Tooth Fracture',
  'Tooth Sensitivity',
  'Impacted Tooth',
  'Missing Tooth',
  'Dental Erosion',
  'Attrition',
  'Abrasion',
  'Periapical Lesion',
  'Calculus Buildup',
  'Enamel Hypoplasia',
  'Bruxism',
  'TMJ Disorder',
];

export const dummyDiagnoses: DiagnosisRecord[] = [
  {
    id: 'dx-001',
    diagnosisName: 'Deep Dental Caries',
    diagnosisCode: 'K02.9',
    toothNumber: '26',
    toothSurface: ['Occlusal', 'Distal'],
    severity: 'Severe',
    priority: 'Urgent',
    status: 'Active',
    source: 'Odontogram',
    dateIdentified: '18 Jul 2026',
    diagnosedBy: 'Dr. Maya',
    clinicalNotes: 'Deep carious lesion on tooth 26 extending close to the pulp. Patient reports sharp pain while chewing. Periapical radiograph reviewed.',
    linkedOdontogramFinding: 'Tooth 26 - Occlusal + Distal Caries',
    linkedXrayImage: 'PA Tooth 26',
    linkedClinicalFinding: 'Positive percussion test',
  },
  {
    id: 'dx-002',
    diagnosisName: 'Reversible Pulpitis',
    diagnosisCode: 'K04.0',
    toothNumber: '16',
    toothSurface: ['Occlusal'],
    severity: 'Moderate',
    priority: 'Recommended',
    status: 'Active',
    source: 'Clinical Exam',
    dateIdentified: '18 Jul 2026',
    diagnosedBy: 'Dr. Maya',
    clinicalNotes: 'Moderate sensitivity to cold stimulus on tooth 16. Pain subsides within seconds. No spontaneous pain reported.',
    linkedOdontogramFinding: 'Tooth 16 - Composite Filling',
    linkedXrayImage: 'Bitewing Left',
    linkedClinicalFinding: 'Cold test positive, resolves quickly',
  },
  {
    id: 'dx-003',
    diagnosisName: 'Chronic Gingivitis',
    diagnosisCode: 'K05.1',
    toothNumber: 'General',
    toothSurface: [],
    severity: 'Mild',
    priority: 'Routine',
    status: 'Monitored',
    source: 'Clinical Exam',
    dateIdentified: '18 Jul 2026',
    diagnosedBy: 'Dr. Maya',
    clinicalNotes: 'Generalized gingival inflammation with bleeding on probing. Moderate calculus buildup noted. Patient advised on improved oral hygiene.',
    linkedOdontogramFinding: 'Generalized calculus buildup',
    linkedXrayImage: '',
    linkedClinicalFinding: 'BOP positive at multiple sites',
  },
  {
    id: 'dx-004',
    diagnosisName: 'Periapical Lesion',
    diagnosisCode: 'K04.7',
    toothNumber: '26',
    toothSurface: ['Apical'],
    severity: 'Severe',
    priority: 'Urgent',
    status: 'Active',
    source: 'X-ray',
    dateIdentified: '18 Jul 2026',
    diagnosedBy: 'Dr. Maya',
    clinicalNotes: 'Radiolucency visible at apex of tooth 26 on periapical radiograph. Consistent with periapical pathology. Urgent endodontic evaluation recommended.',
    linkedOdontogramFinding: 'Tooth 26 - Caries',
    linkedXrayImage: 'PA Tooth 26',
    linkedClinicalFinding: 'Tenderness to percussion',
  },
];

export const severityBadgeColor: Record<DiagnosisSeverity, string> = {
  Mild: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Moderate: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Severe: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
};

export const priorityBadgeColor: Record<DiagnosisPriority, string> = {
  Routine: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Recommended: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  Urgent: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Emergency: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
};

export const statusBadgeColor: Record<DiagnosisStatus, string> = {
  Active: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Monitored: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Resolved: 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const sourceBadgeColor: Record<DiagnosisSource, string> = {
  'Clinical Exam': 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  Odontogram: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
  'X-ray': 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  'Clinical Image': 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
  'Manual Entry': 'border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200',
};