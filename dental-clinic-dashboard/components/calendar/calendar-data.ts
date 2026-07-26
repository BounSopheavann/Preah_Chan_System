export const calendarDentists = [
  'All Dentists',
  'Dr. Dara Sok',
  'Dr. Lina Chea',
  'Dr. Vannak Lim',
] as const;

export type CalendarDentist = (typeof calendarDentists)[number];

export type CalendarAppointmentStatus =
  | 'Booked'
  | 'Confirmed'
  | 'Checked-in'
  | 'In Chair'
  | 'Completed'
  | 'Cancelled'
  | 'No-show';

export interface CalendarAppointment {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  dentist: string;
  appointmentType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: CalendarAppointmentStatus;
  notes?: string;
}

const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, '0');
const d = String(today.getDate()).padStart(2, '0');
const todayStr = `${y}-${m}-${d}`;

// Helper to get a date string relative to today
function dateStr(offset: number): string {
  const date = new Date(y, today.getMonth(), today.getDate() + offset);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export const calendarAppointments: CalendarAppointment[] = [
  // Today's appointments
  {
    id: 'cal-001',
    patientName: 'Sopheak Chan',
    patientId: 'PC-2001',
    phone: '+1 (555) 014-2210',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Root Canal Review',
    date: todayStr,
    startTime: '09:00',
    endTime: '09:30',
    status: 'Confirmed',
  },
  {
    id: 'cal-002',
    patientName: 'Lina Touch',
    patientId: 'PC-2002',
    phone: '+1 (555) 019-1174',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Cleaning',
    date: todayStr,
    startTime: '10:00',
    endTime: '11:00',
    status: 'Checked-in',
  },
  {
    id: 'cal-003',
    patientName: 'Vannak Heng',
    patientId: 'PC-2003',
    phone: '+1 (555) 018-4208',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Consultation',
    date: todayStr,
    startTime: '11:30',
    endTime: '12:00',
    status: 'Booked',
  },
  {
    id: 'cal-004',
    patientName: 'Pisey Kim',
    patientId: 'PC-2004',
    phone: '+1 (555) 011-9088',
    dentist: 'Dr. Vannak Lim',
    appointmentType: 'Crown Fitting',
    date: todayStr,
    startTime: '13:30',
    endTime: '14:30',
    status: 'In Chair',
  },
  {
    id: 'cal-005',
    patientName: 'Chantha Meas',
    patientId: 'PC-2005',
    phone: '+1 (555) 012-4430',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Orthodontic Review',
    date: todayStr,
    startTime: '15:00',
    endTime: '15:30',
    status: 'Confirmed',
  },
  {
    id: 'cal-006',
    patientName: 'Dara Lim',
    patientId: 'PC-2006',
    phone: '+1 (555) 017-6549',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Emergency',
    date: todayStr,
    startTime: '16:00',
    endTime: '16:30',
    status: 'Booked',
  },
  // Additional today appointments
  {
    id: 'cal-007',
    patientName: 'Srey Mom',
    patientId: 'PC-2007',
    phone: '+1 (555) 016-8722',
    dentist: 'Dr. Vannak Lim',
    appointmentType: 'Hygiene Visit',
    date: todayStr,
    startTime: '08:00',
    endTime: '08:30',
    status: 'Completed',
  },
  {
    id: 'cal-008',
    patientName: 'Rithy Phan',
    patientId: 'PC-2008',
    phone: '+1 (555) 013-4408',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Composite Filling',
    date: todayStr,
    startTime: '08:30',
    endTime: '09:30',
    status: 'Completed',
  },
  {
    id: 'cal-009',
    patientName: 'Sokha Chey',
    patientId: 'PC-2009',
    phone: '+1 (555) 015-8129',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Follow-up',
    date: todayStr,
    startTime: '10:00',
    endTime: '10:30',
    status: 'Completed',
  },
  {
    id: 'cal-010',
    patientName: 'Borey Khun',
    patientId: 'PC-2010',
    phone: '+1 (555) 010-6068',
    dentist: 'Dr. Vannak Lim',
    appointmentType: 'Implant Consult',
    date: todayStr,
    startTime: '11:00',
    endTime: '11:30',
    status: 'Confirmed',
  },
  {
    id: 'cal-011',
    patientName: 'Sreynich Nov',
    patientId: 'PC-2011',
    phone: '+1 (555) 021-3344',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Periodontal Review',
    date: todayStr,
    startTime: '14:00',
    endTime: '14:30',
    status: 'Booked',
  },
  {
    id: 'cal-012',
    patientName: 'Visal Kong',
    patientId: 'PC-2012',
    phone: '+1 (555) 022-5566',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Whitening Consult',
    date: todayStr,
    startTime: '15:00',
    endTime: '15:30',
    status: 'Cancelled',
  },
  // Tomorrow's appointments
  {
    id: 'cal-013',
    patientName: 'Sophea Meas',
    patientId: 'PC-2013',
    phone: '+1 (555) 023-7788',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Root Canal',
    date: dateStr(1),
    startTime: '09:00',
    endTime: '10:00',
    status: 'Confirmed',
  },
  {
    id: 'cal-014',
    patientName: 'Ratanak Vong',
    patientId: 'PC-2014',
    phone: '+1 (555) 024-9900',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Cleaning',
    date: dateStr(1),
    startTime: '10:30',
    endTime: '11:30',
    status: 'Booked',
  },
  {
    id: 'cal-015',
    patientName: 'Sokunthea Yim',
    patientId: 'PC-2015',
    phone: '+1 (555) 025-1122',
    dentist: 'Dr. Vannak Lim',
    appointmentType: 'Crown Fitting',
    date: dateStr(1),
    startTime: '14:00',
    endTime: '15:00',
    status: 'Confirmed',
  },
  {
    id: 'cal-016',
    patientName: 'Sovannara Kim',
    patientId: 'PC-2016',
    phone: '+1 (555) 026-3344',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Consultation',
    date: dateStr(1),
    startTime: '15:30',
    endTime: '16:00',
    status: 'Booked',
  },
  // Day after tomorrow
  {
    id: 'cal-017',
    patientName: 'Sreymom Chea',
    patientId: 'PC-2017',
    phone: '+1 (555) 027-5566',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Orthodontic Review',
    date: dateStr(2),
    startTime: '08:30',
    endTime: '09:30',
    status: 'Confirmed',
  },
  {
    id: 'cal-018',
    patientName: 'Sokly Hong',
    patientId: 'PC-2018',
    phone: '+1 (555) 028-7788',
    dentist: 'Dr. Vannak Lim',
    appointmentType: 'Hygiene Visit',
    date: dateStr(2),
    startTime: '10:00',
    endTime: '10:30',
    status: 'Booked',
  },
  {
    id: 'cal-019',
    patientName: 'Sopheap Prak',
    patientId: 'PC-2019',
    phone: '+1 (555) 029-9900',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Emergency',
    date: dateStr(2),
    startTime: '13:00',
    endTime: '13:30',
    status: 'Booked',
  },
  // Past days (for month view)
  {
    id: 'cal-020',
    patientName: 'Sokun Nop',
    patientId: 'PC-2020',
    phone: '+1 (555) 030-1122',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Follow-up',
    date: dateStr(-1),
    startTime: '09:00',
    endTime: '09:30',
    status: 'Completed',
  },
  {
    id: 'cal-021',
    patientName: 'Sreynich Khun',
    patientId: 'PC-2021',
    phone: '+1 (555) 031-3344',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Cleaning',
    date: dateStr(-1),
    startTime: '10:00',
    endTime: '11:00',
    status: 'Completed',
  },
  {
    id: 'cal-022',
    patientName: 'Visal Touch',
    patientId: 'PC-2022',
    phone: '+1 (555) 032-5566',
    dentist: 'Dr. Vannak Lim',
    appointmentType: 'Root Canal Review',
    date: dateStr(-1),
    startTime: '14:00',
    endTime: '14:30',
    status: 'Completed',
  },
  {
    id: 'cal-023',
    patientName: 'Rithy Meas',
    patientId: 'PC-2023',
    phone: '+1 (555) 033-7788',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Consultation',
    date: dateStr(-2),
    startTime: '11:00',
    endTime: '11:30',
    status: 'No-show',
  },
  {
    id: 'cal-024',
    patientName: 'Sokha Vong',
    patientId: 'PC-2024',
    phone: '+1 (555) 034-9900',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Composite Filling',
    date: dateStr(-2),
    startTime: '15:00',
    endTime: '16:00',
    status: 'Completed',
  },
  // Future days
  {
    id: 'cal-025',
    patientName: 'Borey Nov',
    patientId: 'PC-2025',
    phone: '+1 (555) 035-1122',
    dentist: 'Dr. Vannak Lim',
    appointmentType: 'Implant Consult',
    date: dateStr(3),
    startTime: '09:30',
    endTime: '10:30',
    status: 'Confirmed',
  },
  {
    id: 'cal-026',
    patientName: 'Sreymom Phan',
    patientId: 'PC-2026',
    phone: '+1 (555) 036-3344',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Periodontal Review',
    date: dateStr(4),
    startTime: '10:00',
    endTime: '10:30',
    status: 'Booked',
  },
  {
    id: 'cal-027',
    patientName: 'Sovannara Chey',
    patientId: 'PC-2027',
    phone: '+1 (555) 037-5566',
    dentist: 'Dr. Lina Chea',
    appointmentType: 'Whitening Consult',
    date: dateStr(5),
    startTime: '14:00',
    endTime: '14:30',
    status: 'Booked',
  },
  {
    id: 'cal-028',
    patientName: 'Sokunthea Kim',
    patientId: 'PC-2028',
    phone: '+1 (555) 038-7788',
    dentist: 'Dr. Dara Sok',
    appointmentType: 'Denture Follow-up',
    date: dateStr(6),
    startTime: '11:00',
    endTime: '11:30',
    status: 'Confirmed',
  },
];

export const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
];

export const statusColors: Record<CalendarAppointmentStatus, string> = {
  'Booked': 'bg-sky-100 border-sky-300 text-sky-700 dark:bg-sky-500/10 dark:border-sky-500/30 dark:text-sky-300',
  'Confirmed': 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300',
  'Checked-in': 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
  'In Chair': 'bg-violet-100 border-violet-300 text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/30 dark:text-violet-300',
  'Completed': 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300',
  'Cancelled': 'bg-red-100 border-red-300 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300',
  'No-show': 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-500/10 dark:border-gray-500/30 dark:text-gray-300',
};

export const statusDotColors: Record<CalendarAppointmentStatus, string> = {
  'Booked': 'bg-sky-500',
  'Confirmed': 'bg-blue-500',
  'Checked-in': 'bg-amber-500',
  'In Chair': 'bg-violet-500',
  'Completed': 'bg-emerald-500',
  'Cancelled': 'bg-red-500',
  'No-show': 'bg-gray-500',
};