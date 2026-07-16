export type PatientStatus = 'Active' | 'Inactive';
export type PatientGender = 'Male' | 'Female' | 'Other';
export type ConsentStatus = 'Accepted' | 'Pending' | 'Declined';
export type TelegramStatus = 'Linked' | 'Not Linked';
export type PreferredContactMethod = 'Phone' | 'Telegram' | 'Email' | 'SMS';

export interface PatientAppointment {
  id: string;
  date: string;
  type: string;
  dentist: string;
  status: 'Completed' | 'Upcoming' | 'Cancelled';
}

export interface PatientInvoice {
  id: string;
  amount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  date: string;
}

export interface PatientFile {
  id: string;
  name: string;
  type: 'X-ray' | 'Clinical Photo' | 'Document';
  date: string;
}

export interface Patient {
  id: string;
  patientCode: string;
  fullName: string;
  gender: PatientGender;
  phone: string;
  email: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedication: string[];
  status: PatientStatus;
  lastVisit: string;
  upcomingAppointment: string;
  outstandingBalance: number;
  consentStatus: ConsentStatus;
  telegramStatus: TelegramStatus;
  preferredContactMethod: PreferredContactMethod;
  avatarTone: string;
  appointments: PatientAppointment[];
  invoices: PatientInvoice[];
  payments: PatientInvoice[];
  files: PatientFile[];
}

export const patientRecords: Patient[] = [
  {
    id: 'pt-001',
    patientCode: 'PC-1001',
    fullName: 'Ariana Lopez',
    gender: 'Female',
    phone: '+1 (555) 014-2210',
    email: 'ariana.lopez@example.com',
    dateOfBirth: '1991-04-12',
    address: '129 Harbor Street, Suite 4B, San Diego, CA',
    emergencyContact: 'Marco Lopez',
    emergencyPhone: '+1 (555) 014-9912',
    allergies: ['Penicillin'],
    medicalConditions: ['Mild asthma'],
    currentMedication: ['Albuterol inhaler'],
    status: 'Active',
    lastVisit: 'Jul 14, 2026',
    upcomingAppointment: 'Jul 21, 2026 - Hygiene',
    outstandingBalance: 0,
    consentStatus: 'Accepted',
    telegramStatus: 'Linked',
    preferredContactMethod: 'Telegram',
    avatarTone: 'from-sky-400 to-cyan-400',
    appointments: [
      { id: 'ap-1001', date: 'Jul 14, 2026', type: 'Hygiene Visit', dentist: 'Dr. Sarah', status: 'Completed' },
      { id: 'ap-1002', date: 'Jul 21, 2026', type: 'Polish Review', dentist: 'Dr. Sarah', status: 'Upcoming' },
    ],
    invoices: [
      { id: 'INV-2044', amount: 180, status: 'Paid', date: 'Jul 14, 2026' },
    ],
    payments: [
      { id: 'PAY-8831', amount: 180, status: 'Paid', date: 'Jul 14, 2026' },
    ],
    files: [
      { id: 'file-1', name: 'Bitewing X-ray', type: 'X-ray', date: 'Jul 14, 2026' },
      { id: 'file-2', name: 'Clinical Photo Set', type: 'Clinical Photo', date: 'Jul 14, 2026' },
    ],
  },
  {
    id: 'pt-002',
    patientCode: 'PC-1002',
    fullName: 'Daniel Kim',
    gender: 'Male',
    phone: '+1 (555) 019-1174',
    email: 'daniel.kim@example.com',
    dateOfBirth: '1987-11-05',
    address: '76 Silver Avenue, Irvine, CA',
    emergencyContact: 'Hannah Kim',
    emergencyPhone: '+1 (555) 019-7002',
    allergies: ['None recorded'],
    medicalConditions: ['Hypertension'],
    currentMedication: ['Amlodipine'],
    status: 'Active',
    lastVisit: 'Jul 13, 2026',
    upcomingAppointment: 'Aug 02, 2026 - Crown Fit',
    outstandingBalance: 240,
    consentStatus: 'Accepted',
    telegramStatus: 'Not Linked',
    preferredContactMethod: 'Phone',
    avatarTone: 'from-emerald-400 to-teal-400',
    appointments: [
      { id: 'ap-2001', date: 'Jul 13, 2026', type: 'Crown Preparation', dentist: 'Dr. Sarah', status: 'Completed' },
      { id: 'ap-2002', date: 'Aug 02, 2026', type: 'Crown Fit', dentist: 'Dr. Sarah', status: 'Upcoming' },
    ],
    invoices: [
      { id: 'INV-2048', amount: 760, status: 'Partial', date: 'Jul 13, 2026' },
    ],
    payments: [
      { id: 'PAY-8840', amount: 520, status: 'Paid', date: 'Jul 13, 2026' },
    ],
    files: [
      { id: 'file-3', name: 'Crown Shade Photo', type: 'Clinical Photo', date: 'Jul 13, 2026' },
    ],
  },
  {
    id: 'pt-003',
    patientCode: 'PC-1003',
    fullName: 'Sofia Martin',
    gender: 'Female',
    phone: '+1 (555) 018-4208',
    email: 'sofia.martin@example.com',
    dateOfBirth: '1998-02-23',
    address: '314 Palm Court, Pasadena, CA',
    emergencyContact: 'Elena Martin',
    emergencyPhone: '+1 (555) 018-3100',
    allergies: ['Latex'],
    medicalConditions: ['None recorded'],
    currentMedication: ['None recorded'],
    status: 'Active',
    lastVisit: 'Jul 12, 2026',
    upcomingAppointment: 'Jul 29, 2026 - Filling',
    outstandingBalance: 90,
    consentStatus: 'Pending',
    telegramStatus: 'Linked',
    preferredContactMethod: 'Telegram',
    avatarTone: 'from-violet-400 to-fuchsia-400',
    appointments: [
      { id: 'ap-3001', date: 'Jul 12, 2026', type: 'New Patient Exam', dentist: 'Dr. Sarah', status: 'Completed' },
      { id: 'ap-3002', date: 'Jul 29, 2026', type: 'Composite Filling', dentist: 'Dr. Sarah', status: 'Upcoming' },
    ],
    invoices: [
      { id: 'INV-2051', amount: 210, status: 'Partial', date: 'Jul 12, 2026' },
    ],
    payments: [
      { id: 'PAY-8845', amount: 120, status: 'Paid', date: 'Jul 12, 2026' },
    ],
    files: [
      { id: 'file-4', name: 'Medical History Form', type: 'Document', date: 'Jul 12, 2026' },
    ],
  },
  {
    id: 'pt-004',
    patientCode: 'PC-1004',
    fullName: 'Michael Brown',
    gender: 'Male',
    phone: '+1 (555) 011-9088',
    email: 'michael.brown@example.com',
    dateOfBirth: '1979-09-17',
    address: '42 Redwood Lane, Sacramento, CA',
    emergencyContact: 'Lena Brown',
    emergencyPhone: '+1 (555) 011-7750',
    allergies: ['Codeine'],
    medicalConditions: ['Diabetes Type II'],
    currentMedication: ['Metformin'],
    status: 'Active',
    lastVisit: 'Jul 10, 2026',
    upcomingAppointment: 'Jul 18, 2026 - Root Canal',
    outstandingBalance: 480,
    consentStatus: 'Accepted',
    telegramStatus: 'Linked',
    preferredContactMethod: 'Phone',
    avatarTone: 'from-orange-400 to-amber-400',
    appointments: [
      { id: 'ap-4001', date: 'Jul 10, 2026', type: 'Emergency Exam', dentist: 'Dr. Sarah', status: 'Completed' },
      { id: 'ap-4002', date: 'Jul 18, 2026', type: 'Root Canal', dentist: 'Dr. Sarah', status: 'Upcoming' },
    ],
    invoices: [
      { id: 'INV-2054', amount: 480, status: 'Unpaid', date: 'Jul 10, 2026' },
    ],
    payments: [],
    files: [
      { id: 'file-5', name: 'Periapical X-ray', type: 'X-ray', date: 'Jul 10, 2026' },
    ],
  },
  {
    id: 'pt-005',
    patientCode: 'PC-1005',
    fullName: 'Emily Johnson',
    gender: 'Female',
    phone: '+1 (555) 012-4430',
    email: 'emily.johnson@example.com',
    dateOfBirth: '1993-06-30',
    address: '812 Garden View Road, Oakland, CA',
    emergencyContact: 'Patrick Johnson',
    emergencyPhone: '+1 (555) 012-5591',
    allergies: ['None recorded'],
    medicalConditions: ['Pregnancy alert'],
    currentMedication: ['Prenatal vitamins'],
    status: 'Active',
    lastVisit: 'Jul 09, 2026',
    upcomingAppointment: 'No appointment',
    outstandingBalance: 0,
    consentStatus: 'Accepted',
    telegramStatus: 'Not Linked',
    preferredContactMethod: 'Email',
    avatarTone: 'from-rose-400 to-pink-400',
    appointments: [
      { id: 'ap-5001', date: 'Jul 09, 2026', type: 'Cleaning & Scale', dentist: 'Dr. Sarah', status: 'Completed' },
    ],
    invoices: [
      { id: 'INV-2058', amount: 160, status: 'Paid', date: 'Jul 09, 2026' },
    ],
    payments: [
      { id: 'PAY-8852', amount: 160, status: 'Paid', date: 'Jul 09, 2026' },
    ],
    files: [
      { id: 'file-6', name: 'Consent Form', type: 'Document', date: 'Jul 09, 2026' },
    ],
  },
  {
    id: 'pt-006',
    patientCode: 'PC-1006',
    fullName: 'Robert Wilson',
    gender: 'Male',
    phone: '+1 (555) 017-6549',
    email: 'robert.wilson@example.com',
    dateOfBirth: '1968-01-14',
    address: '904 Mesa Drive, Phoenix, AZ',
    emergencyContact: 'Nora Wilson',
    emergencyPhone: '+1 (555) 017-2104',
    allergies: ['Ibuprofen'],
    medicalConditions: ['Heart murmur'],
    currentMedication: ['Aspirin'],
    status: 'Inactive',
    lastVisit: 'Jun 28, 2026',
    upcomingAppointment: 'No appointment',
    outstandingBalance: 60,
    consentStatus: 'Declined',
    telegramStatus: 'Not Linked',
    preferredContactMethod: 'Phone',
    avatarTone: 'from-slate-400 to-zinc-500',
    appointments: [
      { id: 'ap-6001', date: 'Jun 28, 2026', type: 'Filling', dentist: 'Dr. Sarah', status: 'Completed' },
    ],
    invoices: [
      { id: 'INV-2032', amount: 60, status: 'Unpaid', date: 'Jun 28, 2026' },
    ],
    payments: [],
    files: [
      { id: 'file-7', name: 'Treatment Consent Declined', type: 'Document', date: 'Jun 28, 2026' },
    ],
  },
  {
    id: 'pt-007',
    patientCode: 'PC-1007',
    fullName: 'Amanda White',
    gender: 'Female',
    phone: '+1 (555) 016-8722',
    email: 'amanda.white@example.com',
    dateOfBirth: '1985-05-07',
    address: '500 Lake Terrace, Denver, CO',
    emergencyContact: 'Ryan White',
    emergencyPhone: '+1 (555) 016-1022',
    allergies: ['None recorded'],
    medicalConditions: ['None recorded'],
    currentMedication: ['None recorded'],
    status: 'Active',
    lastVisit: 'Jun 25, 2026',
    upcomingAppointment: 'Today - Recall',
    outstandingBalance: 0,
    consentStatus: 'Pending',
    telegramStatus: 'Linked',
    preferredContactMethod: 'Telegram',
    avatarTone: 'from-cyan-400 to-blue-500',
    appointments: [
      { id: 'ap-7001', date: 'Jun 25, 2026', type: 'Whitening Consult', dentist: 'Dr. Sarah', status: 'Completed' },
      { id: 'ap-7002', date: 'Today', type: 'Recall Visit', dentist: 'Dr. Sarah', status: 'Upcoming' },
    ],
    invoices: [
      { id: 'INV-2028', amount: 120, status: 'Paid', date: 'Jun 25, 2026' },
    ],
    payments: [
      { id: 'PAY-8802', amount: 120, status: 'Paid', date: 'Jun 25, 2026' },
    ],
    files: [
      { id: 'file-8', name: 'Whitening Before Photo', type: 'Clinical Photo', date: 'Jun 25, 2026' },
    ],
  },
  {
    id: 'pt-008',
    patientCode: 'PC-1008',
    fullName: 'Christopher Lee',
    gender: 'Male',
    phone: '+1 (555) 013-4408',
    email: 'christopher.lee@example.com',
    dateOfBirth: '1974-08-19',
    address: '216 King Street, Seattle, WA',
    emergencyContact: 'Mina Lee',
    emergencyPhone: '+1 (555) 013-9098',
    allergies: ['Sulfa drugs'],
    medicalConditions: ['Sleep apnea'],
    currentMedication: ['CPAP therapy'],
    status: 'Active',
    lastVisit: 'Jun 17, 2026',
    upcomingAppointment: 'Tomorrow - Cleaning',
    outstandingBalance: 130,
    consentStatus: 'Accepted',
    telegramStatus: 'Not Linked',
    preferredContactMethod: 'SMS',
    avatarTone: 'from-lime-400 to-green-500',
    appointments: [
      { id: 'ap-8001', date: 'Jun 17, 2026', type: 'Annual Exam', dentist: 'Dr. Sarah', status: 'Completed' },
      { id: 'ap-8002', date: 'Tomorrow', type: 'Cleaning', dentist: 'Dr. Sarah', status: 'Upcoming' },
    ],
    invoices: [
      { id: 'INV-2019', amount: 130, status: 'Unpaid', date: 'Jun 17, 2026' },
    ],
    payments: [],
    files: [
      { id: 'file-9', name: 'Annual Exam X-ray', type: 'X-ray', date: 'Jun 17, 2026' },
    ],
  },
  {
    id: 'pt-009',
    patientCode: 'PC-1009',
    fullName: 'Jessica Harris',
    gender: 'Female',
    phone: '+1 (555) 015-8129',
    email: 'jessica.harris@example.com',
    dateOfBirth: '2000-12-03',
    address: '31 Pine Row, Portland, OR',
    emergencyContact: 'Tara Harris',
    emergencyPhone: '+1 (555) 015-3154',
    allergies: ['None recorded'],
    medicalConditions: ['Anxiety with dental visits'],
    currentMedication: ['None recorded'],
    status: 'Active',
    lastVisit: 'Jun 11, 2026',
    upcomingAppointment: 'No appointment',
    outstandingBalance: 0,
    consentStatus: 'Accepted',
    telegramStatus: 'Linked',
    preferredContactMethod: 'Telegram',
    avatarTone: 'from-blue-400 to-indigo-500',
    appointments: [
      { id: 'ap-9001', date: 'Jun 11, 2026', type: 'Follow-up Check', dentist: 'Dr. Sarah', status: 'Completed' },
    ],
    invoices: [
      { id: 'INV-2010', amount: 85, status: 'Paid', date: 'Jun 11, 2026' },
    ],
    payments: [
      { id: 'PAY-8784', amount: 85, status: 'Paid', date: 'Jun 11, 2026' },
    ],
    files: [
      { id: 'file-10', name: 'Sedation Consent', type: 'Document', date: 'Jun 11, 2026' },
    ],
  },
  {
    id: 'pt-010',
    patientCode: 'PC-1010',
    fullName: 'Mark Thompson',
    gender: 'Other',
    phone: '+1 (555) 010-6068',
    email: 'mark.thompson@example.com',
    dateOfBirth: '1990-10-27',
    address: '18 Birch Plaza, Austin, TX',
    emergencyContact: 'Jamie Thompson',
    emergencyPhone: '+1 (555) 010-4429',
    allergies: ['Shellfish'],
    medicalConditions: ['None recorded'],
    currentMedication: ['None recorded'],
    status: 'Active',
    lastVisit: 'Jun 02, 2026',
    upcomingAppointment: 'Jul 30, 2026 - Consult',
    outstandingBalance: 0,
    consentStatus: 'Pending',
    telegramStatus: 'Not Linked',
    preferredContactMethod: 'Email',
    avatarTone: 'from-teal-400 to-cyan-500',
    appointments: [
      { id: 'ap-10001', date: 'Jun 02, 2026', type: 'Root Canal Review', dentist: 'Dr. Sarah', status: 'Completed' },
      { id: 'ap-10002', date: 'Jul 30, 2026', type: 'Implant Consult', dentist: 'Dr. Sarah', status: 'Upcoming' },
    ],
    invoices: [
      { id: 'INV-1998', amount: 300, status: 'Paid', date: 'Jun 02, 2026' },
    ],
    payments: [
      { id: 'PAY-8765', amount: 300, status: 'Paid', date: 'Jun 02, 2026' },
    ],
    files: [
      { id: 'file-11', name: 'Implant Referral Letter', type: 'Document', date: 'Jun 02, 2026' },
    ],
  },
];

export function getPatientInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
