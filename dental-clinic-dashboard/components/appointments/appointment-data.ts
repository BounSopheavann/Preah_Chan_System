export const todayDateValue = '2026-07-16';
export const todayDateLabel = 'Jul 16, 2026';

export const appointmentStatuses = [
  'Booked',
  'Confirmed',
  'Checked-in',
  'In Chair',
  'Completed',
  'Cancelled',
  'No-show',
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const appointmentTypes = [
  'Hygiene Visit',
  'Crown Fit',
  'Composite Filling',
  'Root Canal',
  'Follow-up',
  'Emergency Exam',
  'Whitening Consult',
  'Recall Visit',
  'Periodontal Review',
  'Denture Follow-up',
  'Implant Consult',
] as const;

export type AppointmentType = (typeof appointmentTypes)[number];

export const dentistOptions = ['Dr. Sarah', 'Dr. Maya', 'Dr. Chen'] as const;

export type DentistName = (typeof dentistOptions)[number];

export interface AppointmentRecord {
  id: string;
  appointmentId: string;
  patientName: string;
  patientCode: string;
  phone: string;
  dentist: DentistName;
  appointmentType: AppointmentType;
  scheduledAt: string;
  dateLabel: string;
  timeLabel: string;
  status: AppointmentStatus;
  checkInLabel: string;
  balance: number;
  avatarTone: string;
}

export const appointmentRecords: AppointmentRecord[] = [
  {
    id: 'ap-260716-001',
    appointmentId: 'AP-260716-001',
    patientName: 'Ariana Lopez',
    patientCode: 'PC-1001',
    phone: '+1 (555) 014-2210',
    dentist: 'Dr. Sarah',
    appointmentType: 'Hygiene Visit',
    scheduledAt: '2026-07-16T08:30:00',
    dateLabel: 'Jul 16, 2026',
    timeLabel: '08:30 AM',
    status: 'Booked',
    checkInLabel: 'Pending',
    balance: 0,
    avatarTone: 'from-sky-400 to-cyan-400',
  },
  {
    id: 'ap-260716-002',
    appointmentId: 'AP-260716-002',
    patientName: 'Daniel Kim',
    patientCode: 'PC-1002',
    phone: '+1 (555) 019-1174',
    dentist: 'Dr. Sarah',
    appointmentType: 'Crown Fit',
    scheduledAt: '2026-07-16T08:55:00',
    dateLabel: 'Jul 16, 2026',
    timeLabel: '08:55 AM',
    status: 'Confirmed',
    checkInLabel: 'Pending',
    balance: 240,
    avatarTone: 'from-emerald-400 to-teal-400',
  },
  {
    id: 'ap-260716-003',
    appointmentId: 'AP-260716-003',
    patientName: 'Sofia Martin',
    patientCode: 'PC-1003',
    phone: '+1 (555) 018-4208',
    dentist: 'Dr. Maya',
    appointmentType: 'Composite Filling',
    scheduledAt: '2026-07-16T09:20:00',
    dateLabel: 'Jul 16, 2026',
    timeLabel: '09:20 AM',
    status: 'Checked-in',
    checkInLabel: '09:08 AM',
    balance: 90,
    avatarTone: 'from-violet-400 to-fuchsia-400',
  },
  {
    id: 'ap-260716-004',
    appointmentId: 'AP-260716-004',
    patientName: 'Michael Brown',
    patientCode: 'PC-1004',
    phone: '+1 (555) 011-9088',
    dentist: 'Dr. Chen',
    appointmentType: 'Root Canal',
    scheduledAt: '2026-07-16T09:50:00',
    dateLabel: 'Jul 16, 2026',
    timeLabel: '09:50 AM',
    status: 'In Chair',
    checkInLabel: '09:36 AM',
    balance: 480,
    avatarTone: 'from-orange-400 to-amber-400',
  },
  {
    id: 'ap-260716-005',
    appointmentId: 'AP-260716-005',
    patientName: 'Emily Johnson',
    patientCode: 'PC-1005',
    phone: '+1 (555) 012-4430',
    dentist: 'Dr. Sarah',
    appointmentType: 'Follow-up',
    scheduledAt: '2026-07-16T10:20:00',
    dateLabel: 'Jul 16, 2026',
    timeLabel: '10:20 AM',
    status: 'Completed',
    checkInLabel: '09:58 AM',
    balance: 0,
    avatarTone: 'from-rose-400 to-pink-400',
  },
  {
    id: 'ap-260716-006',
    appointmentId: 'AP-260716-006',
    patientName: 'Robert Wilson',
    patientCode: 'PC-1006',
    phone: '+1 (555) 017-6549',
    dentist: 'Dr. Maya',
    appointmentType: 'Emergency Exam',
    scheduledAt: '2026-07-16T10:45:00',
    dateLabel: 'Jul 16, 2026',
    timeLabel: '10:45 AM',
    status: 'Cancelled',
    checkInLabel: 'Cancelled',
    balance: 60,
    avatarTone: 'from-slate-400 to-zinc-500',
  },
  {
    id: 'ap-260716-007',
    appointmentId: 'AP-260716-007',
    patientName: 'Amanda White',
    patientCode: 'PC-1007',
    phone: '+1 (555) 016-8722',
    dentist: 'Dr. Chen',
    appointmentType: 'Whitening Consult',
    scheduledAt: '2026-07-16T11:15:00',
    dateLabel: 'Jul 16, 2026',
    timeLabel: '11:15 AM',
    status: 'No-show',
    checkInLabel: 'No check-in',
    balance: 0,
    avatarTone: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'ap-260716-008',
    appointmentId: 'AP-260716-008',
    patientName: 'Christopher Lee',
    patientCode: 'PC-1008',
    phone: '+1 (555) 013-4408',
    dentist: 'Dr. Sarah',
    appointmentType: 'Recall Visit',
    scheduledAt: '2026-07-16T11:40:00',
    dateLabel: 'Jul 16, 2026',
    timeLabel: '11:40 AM',
    status: 'Confirmed',
    checkInLabel: 'Pending',
    balance: 130,
    avatarTone: 'from-lime-400 to-green-500',
  },
  {
    id: 'ap-260715-009',
    appointmentId: 'AP-260715-009',
    patientName: 'Jessica Harris',
    patientCode: 'PC-1009',
    phone: '+1 (555) 015-8129',
    dentist: 'Dr. Maya',
    appointmentType: 'Implant Consult',
    scheduledAt: '2026-07-15T15:00:00',
    dateLabel: 'Jul 15, 2026',
    timeLabel: '03:00 PM',
    status: 'Completed',
    checkInLabel: '02:42 PM',
    balance: 0,
    avatarTone: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'ap-260717-010',
    appointmentId: 'AP-260717-010',
    patientName: 'Mark Thompson',
    patientCode: 'PC-1010',
    phone: '+1 (555) 010-6068',
    dentist: 'Dr. Chen',
    appointmentType: 'Denture Follow-up',
    scheduledAt: '2026-07-17T09:00:00',
    dateLabel: 'Jul 17, 2026',
    timeLabel: '09:00 AM',
    status: 'Booked',
    checkInLabel: 'Pending',
    balance: 0,
    avatarTone: 'from-teal-400 to-cyan-500',
  },
  {
    id: 'ap-260720-011',
    appointmentId: 'AP-260720-011',
    patientName: 'Ariana Lopez',
    patientCode: 'PC-1001',
    phone: '+1 (555) 014-2210',
    dentist: 'Dr. Sarah',
    appointmentType: 'Periodontal Review',
    scheduledAt: '2026-07-20T14:30:00',
    dateLabel: 'Jul 20, 2026',
    timeLabel: '02:30 PM',
    status: 'Booked',
    checkInLabel: 'Pending',
    balance: 0,
    avatarTone: 'from-sky-400 to-cyan-400',
  },
  {
    id: 'ap-260721-012',
    appointmentId: 'AP-260721-012',
    patientName: 'Daniel Kim',
    patientCode: 'PC-1002',
    phone: '+1 (555) 019-1174',
    dentist: 'Dr. Maya',
    appointmentType: 'Crown Fit',
    scheduledAt: '2026-07-21T15:15:00',
    dateLabel: 'Jul 21, 2026',
    timeLabel: '03:15 PM',
    status: 'Confirmed',
    checkInLabel: 'Pending',
    balance: 240,
    avatarTone: 'from-emerald-400 to-teal-400',
  },
];

