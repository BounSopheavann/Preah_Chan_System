export interface XrayImage {
  id: string;
  name: string;
  type: ImageType;
  patientName: string;
  toothNumber: string | null;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  resolution: string;
  notes: string;
  status: ImageStatus;
  tags: ImageTag[];
  isFavorite: boolean;
  src: string;
  thumbnailColor: string;
}

export type ImageType =
  | 'Periapical'
  | 'Bitewing'
  | 'Panoramic'
  | 'CBCT'
  | 'Clinical Photo'
  | 'Intraoral Photo'
  | 'Extraoral Photo'
  | 'Before'
  | 'After';

export type ImageStatus = 'Final' | 'Preliminary' | 'Review';

export type ImageTag = 'Urgent' | 'Requires Review' | 'Treatment Complete' | 'Archived';

export const imageTypeOptions: ImageType[] = [
  'Periapical',
  'Bitewing',
  'Panoramic',
  'CBCT',
  'Clinical Photo',
  'Intraoral Photo',
  'Extraoral Photo',
  'Before',
  'After',
];

export const imageStatuses: ImageStatus[] = ['Final', 'Preliminary', 'Review'];

export const imageTagOptions: ImageTag[] = [
  'Urgent',
  'Requires Review',
  'Treatment Complete',
  'Archived',
];

const thumbnailColors = [
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
  'from-fuchsia-400 to-violet-500',
  'from-lime-400 to-emerald-500',
  'from-indigo-400 to-blue-600',
];

export const dummyImages: XrayImage[] = [
  {
    id: 'img-001',
    name: 'PA_Tooth_26_July2026',
    type: 'Periapical',
    patientName: 'Sofia Martin',
    toothNumber: '26',
    uploadDate: 'Today, 10:30 AM',
    uploadedBy: 'Dr. Maya',
    fileSize: '2.4 MB',
    resolution: '2048 × 1536',
    notes: 'Radiolucency visible around apex. Recommend root canal treatment.',
    status: 'Final',
    tags: ['Requires Review'],
    isFavorite: true,
    src: '/placeholder.jpg',
    thumbnailColor: thumbnailColors[0],
  },
  {
    id: 'img-002',
    name: 'Bitewing_Left_July2026',
    type: 'Bitewing',
    patientName: 'Sofia Martin',
    toothNumber: '24-27',
    uploadDate: 'Today, 10:25 AM',
    uploadedBy: 'Dr. Maya',
    fileSize: '1.8 MB',
    resolution: '1920 × 1440',
    notes: 'Moderate interproximal caries detected between 25 and 26.',
    status: 'Final',
    tags: ['Urgent'],
    isFavorite: false,
    src: '/placeholder.jpg',
    thumbnailColor: thumbnailColors[1],
  },
  {
    id: 'img-003',
    name: 'Panoramic_July2026',
    type: 'Panoramic',
    patientName: 'Sofia Martin',
    toothNumber: null,
    uploadDate: 'Yesterday, 3:15 PM',
    uploadedBy: 'Dr. Maya',
    fileSize: '5.2 MB',
    resolution: '3840 × 1080',
    notes: 'Full arch overview. Impacted wisdom teeth noted in lower quadrants.',
    status: 'Final',
    tags: [],
    isFavorite: true,
    src: '/placeholder.jpg',
    thumbnailColor: thumbnailColors[2],
  },
  {
    id: 'img-004',
    name: 'Clinical_Smile_July2026',
    type: 'Clinical Photo',
    patientName: 'Sofia Martin',
    toothNumber: null,
    uploadDate: 'Yesterday, 2:45 PM',
    uploadedBy: 'Dr. Maya',
    fileSize: '3.1 MB',
    resolution: '3024 × 3024',
    notes: 'Pre-treatment smile photograph for aesthetic evaluation.',
    status: 'Final',
    tags: [],
    isFavorite: false,
    src: '/placeholder.jpg',
    thumbnailColor: thumbnailColors[3],
  },
  {
    id: 'img-005',
    name: 'Intraoral_Upper_Arch',
    type: 'Intraoral Photo',
    patientName: 'Sofia Martin',
    toothNumber: '11-28',
    uploadDate: '2 weeks ago',
    uploadedBy: 'Dr. Maya',
    fileSize: '2.9 MB',
    resolution: '2560 × 1920',
    notes: 'Upper arch overview. Note generalized calculus buildup.',
    status: 'Final',
    tags: ['Treatment Complete'],
    isFavorite: false,
    src: '/placeholder.jpg',
    thumbnailColor: thumbnailColors[4],
  },
  {
    id: 'img-006',
    name: 'CBCT_Lower_Quadrant',
    type: 'CBCT',
    patientName: 'Sofia Martin',
    toothNumber: '36-38',
    uploadDate: '2 weeks ago',
    uploadedBy: 'Dr. Maya',
    fileSize: '12.8 MB',
    resolution: '5120 × 5120',
    notes: '3D reconstruction shows impacted 38 with proximity to inferior alveolar nerve.',
    status: 'Preliminary',
    tags: ['Requires Review'],
    isFavorite: true,
    src: '/placeholder.jpg',
    thumbnailColor: thumbnailColors[5],
  },
  {
    id: 'img-007',
    name: 'Extraoral_Frontal',
    type: 'Extraoral Photo',
    patientName: 'Sofia Martin',
    toothNumber: null,
    uploadDate: '2 weeks ago',
    uploadedBy: 'Dr. Maya',
    fileSize: '2.1 MB',
    resolution: '2048 × 2048',
    notes: 'Frontal extraoral view. Facial symmetry within normal limits.',
    status: 'Final',
    tags: [],
    isFavorite: false,
    src: '/placeholder.jpg',
    thumbnailColor: thumbnailColors[6],
  },
  {
    id: 'img-008',
    name: 'PA_Tooth_16_July2026',
    type: 'Periapical',
    patientName: 'Sofia Martin',
    toothNumber: '16',
    uploadDate: '2 weeks ago',
    uploadedBy: 'Dr. Maya',
    fileSize: '2.2 MB',
    resolution: '2048 × 1536',
    notes: 'Existing composite restoration appears intact. No periapical pathology.',
    status: 'Final',
    tags: ['Archived'],
    isFavorite: false,
    src: '/placeholder.jpg',
    thumbnailColor: thumbnailColors[7],
  },
];

export const recentUploads = dummyImages.slice(0, 5);

export const imageTypeBadgeColor: Record<ImageType, string> = {
  Periapical: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  Bitewing: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  Panoramic: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  CBCT: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  'Clinical Photo': 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  'Intraoral Photo': 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
  'Extraoral Photo': 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
  Before: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
  After: 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300',
};

export const imageTagBadgeColor: Record<ImageTag, string> = {
  Urgent: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  'Requires Review': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  'Treatment Complete': 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  Archived: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
};