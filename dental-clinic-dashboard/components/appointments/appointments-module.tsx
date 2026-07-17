'use client';

import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  Clock3,
  Edit3,
  Eye,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Printer,
  RotateCcw,
  Table2,
  TriangleAlert,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { PatientAvatar } from '../patients/patient-avatar';
import {
  appointmentRecords,
  appointmentStatuses,
  appointmentTypes,
  dentistOptions,
  todayDateValue,
  type AppointmentRecord,
  type AppointmentStatus,
} from './appointment-data';
import { AppointmentPagination } from './pagination';
import { AppointmentSearchBar } from './appointment-search-bar';
import {
  AppointmentStatusBadge,
  BalanceBadge,
  CheckInBadge,
} from './status-badge';

type SortKey =
  | 'appointmentId'
  | 'patientName'
  | 'patientCode'
  | 'dentist'
  | 'appointmentType'
  | 'date'
  | 'time'
  | 'status'
  | 'balance';

type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'calendar';

interface AppointmentFilterState {
  status: AppointmentStatus | 'All';
  dentist: string | 'All';
  type: string | 'All';
  date: string;
}

const initialFilters: AppointmentFilterState = {
  status: 'All',
  dentist: 'All',
  type: 'All',
  date: todayDateValue,
};

const statusOrder: Record<AppointmentStatus, number> = {
  Booked: 0,
  Confirmed: 1,
  'Checked-in': 2,
  'In Chair': 3,
  Completed: 4,
  Cancelled: 5,
  'No-show': 6,
};

function compareAppointments(a: AppointmentRecord, b: AppointmentRecord, key: SortKey) {
  if (key === 'balance') {
    return a.balance - b.balance;
  }

  if (key === 'date' || key === 'time') {
    return a.scheduledAt.localeCompare(b.scheduledAt);
  }

  if (key === 'status') {
    return statusOrder[a.status] - statusOrder[b.status];
  }

  return String(a[key]).localeCompare(String(b[key]));
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex w-full min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-muted-foreground md:max-w-44">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateFilter({
  value,
  onChange,
  onToday,
}: {
  value: string;
  onChange: (value: string) => void;
  onToday: () => void;
}) {
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-muted-foreground md:max-w-64">
      <span>Today / Date Picker</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-primary/10 px-3 text-sm font-semibold text-primary transition-all hover:bg-primary/15"
        >
          <CalendarClock className="size-4" />
          Today
        </button>
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
        />
      </div>
    </div>
  );
}

function HeaderCell({
  label,
  sortKey,
  activeSortKey,
  sortDirection,
  onSort,
  align = 'left',
}: {
  label: string;
  sortKey?: SortKey;
  activeSortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const alignClasses = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  };

  if (!sortKey) {
    return (
      <th className={`px-4 py-3 text-xs font-bold uppercase tracking-normal text-muted-foreground ${alignClasses[align]}`}>
        {label}
      </th>
    );
  }

  const isActive = sortKey === activeSortKey;

  return (
    <th className={`px-4 py-3 ${alignClasses[align]}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-normal transition-colors hover:text-foreground ${
          isActive ? 'text-foreground' : 'text-muted-foreground'
        } ${align === 'right' ? 'justify-end' : ''}`}
      >
        {label}
        {isActive ? (
          <ChevronDown className={`size-3.5 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
        ) : (
          <ChevronsUpDown className="size-3.5" />
        )}
      </button>
    </th>
  );
}

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-t border-border/60">
          {Array.from({ length: 11 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 animate-pulse rounded-full bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative mb-5 flex size-24 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary theme-strong-shadow">
        <CalendarDays className="size-10" aria-hidden="true" />
        <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="size-4" aria-hidden="true" />
        </span>
      </div>
      <h2 className="text-xl font-bold text-foreground">No appointments found.</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Create a new appointment or adjust your filters.
      </p>
      <button
        type="button"
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <Plus className="size-4" />
        New Appointment
      </button>
    </div>
  );
}

function formatCheckInLabel(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatWaitingTime(checkInAt: string | null | undefined, currentTime: Date) {
  if (!checkInAt) {
    return 'Pending';
  }

  const elapsedMinutes = Math.max(0, Math.floor((currentTime.getTime() - new Date(checkInAt).getTime()) / 60000));

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min`;
  }

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

function RowActions({ appointment, onCheckIn }: { appointment: AppointmentRecord; onCheckIn: (appointmentId: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const canCheckIn = appointment.status === 'Booked' || appointment.status === 'Confirmed';

  const actionClass =
    'inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30';

  const iconActionClass =
    'inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30';

  return (
    <div className="relative flex flex-wrap items-center justify-end gap-1.5">
      <button type="button" className={actionClass} title="View appointment">
        <Eye className="size-3.5" />
        View
      </button>
      <button type="button" className={actionClass} title="Edit appointment">
        <Edit3 className="size-3.5" />
        Edit
      </button>
      {canCheckIn && (
        <button
          type="button"
          onClick={() => onCheckIn(appointment.id)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
          title="Check in appointment"
        >
          <UserCheck className="size-3.5" />
          Check-in
        </button>
      )}
      <button
        type="button"
        className={iconActionClass}
        onClick={() => setMenuOpen((current) => !current)}
        title="More actions"
        aria-expanded={menuOpen}
      >
        <MoreHorizontal className="size-4" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 text-sm text-popover-foreground shadow-xl">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <XCircle className="size-4 text-red-500" />
            Cancel Appointment
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <CalendarDays className="size-4 text-primary" />
            Reschedule
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <Users className="size-4 text-primary" />
            View Patient
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
          >
            <Printer className="size-4 text-primary" />
            Print Appointment
          </button>
        </div>
      )}
    </div>
  );
}

function AppointmentCalendarPlaceholder({
  appointments,
}: {
  appointments: AppointmentRecord[];
}) {
  const monthStart = new Date(`${todayDateValue.slice(0, 7)}-01T00:00:00`);
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const startDay = monthStart.getDay();
  const appointmentCounts = useMemo(() => {
    const counts = new Map<number, number>();

    appointments.forEach((appointment) => {
      const day = Number(appointment.scheduledAt.slice(8, 10));
      counts.set(day, (counts.get(day) ?? 0) + 1);
    });

    return counts;
  }, [appointments]);

  const calendarCells = [
    ...Array.from({ length: startDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const focusAppointments = appointments.slice(0, 5);

  return (
    <div className="space-y-4 px-4 py-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/40 px-4 py-3 dark:bg-background/20">
        <div>
          <h3 className="text-sm font-bold text-foreground">Month View</h3>
          <p className="text-xs text-muted-foreground">July 2026 calendar preview</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1">
            <span className="size-2 rounded-full bg-sky-500" />
            Booked
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            Checked-in
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1">
            <span className="size-2 rounded-full bg-green-500" />
            Completed
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
        <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-foreground">July 2026</h4>
              <p className="text-sm text-muted-foreground">Clinic schedule overview</p>
            </div>
            <span className="rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              31 days
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day} className="py-2">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-24 rounded-2xl border border-dashed border-border/50 bg-muted/20" />;
              }

              const count = appointmentCounts.get(day) ?? 0;
              const isToday = todayDateValue.endsWith(`-${String(day).padStart(2, '0')}`);

              return (
                <div
                  key={day}
                  className={`min-h-24 rounded-2xl border p-2 text-left transition-colors ${
                    isToday
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-background/60 hover:bg-muted/50 dark:bg-background/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>{day}</span>
                    {count > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                        {count}
                      </span>
                    )}
                  </div>
                  {count > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-sky-500" />
                        {count} appointment{count === 1 ? '' : 's'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-foreground">Week View</h4>
              <p className="text-sm text-muted-foreground">Selected day activity</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Clock3 className="size-3.5" />
              UI only
            </span>
          </div>

          <div className="space-y-3">
            {focusAppointments.length > 0 ? (
              focusAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="grid grid-cols-[auto,minmax(0,1fr)] gap-3 rounded-2xl border border-border/60 bg-background/50 px-3 py-3 dark:bg-background/20"
                >
                  <div className="flex min-h-12 min-w-20 flex-col items-center justify-center rounded-xl border border-border bg-muted/60 px-3 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {appointment.timeLabel}
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground">{appointment.dentist}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h5 className="truncate text-sm font-semibold text-foreground">
                          {appointment.patientName}
                        </h5>
                        <p className="truncate text-xs text-muted-foreground">
                          {appointment.appointmentType} - {appointment.patientCode}
                        </p>
                      </div>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {appointment.checkInLabel === 'Pending'
                        ? 'Waiting for front desk check-in.'
                        : `Check-in ${appointment.checkInLabel}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 px-4 py-10 text-center">
                <CalendarDays className="mx-auto size-8 text-primary" />
                <p className="mt-3 text-sm font-semibold text-foreground">No appointments on this day.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pick another date or switch back to table view.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function WaitingQueueTable({
  appointments,
  currentTime,
  onCallPatient,
}: {
  appointments: AppointmentRecord[];
  currentTime: Date;
  onCallPatient: (appointmentId: string) => void;
}) {
  const priorityTone: Record<NonNullable<AppointmentRecord['priority']>, string> = {
    Normal: 'border-border bg-muted/70 text-muted-foreground dark:bg-muted/30',
    High: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    Emergency: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  };

  const waitingAppointments = useMemo(() => {
    return [...appointments]
      .filter((appointment) => appointment.status === 'Checked-in')
      .sort((a, b) => {
        const priorityOrder = { Emergency: 0, High: 1, Normal: 2 };
        const priorityDiff = (priorityOrder[a.priority ?? 'Normal'] ?? 2) - (priorityOrder[b.priority ?? 'Normal'] ?? 2);
        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        const appointmentTimeDiff = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        if (appointmentTimeDiff !== 0) {
          return appointmentTimeDiff;
        }

        const checkInTimeA = a.checkInAt ? new Date(a.checkInAt).getTime() : new Date(a.scheduledAt).getTime();
        const checkInTimeB = b.checkInAt ? new Date(b.checkInAt).getTime() : new Date(b.scheduledAt).getTime();
        return checkInTimeA - checkInTimeB;
      });
  }, [appointments]);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl theme-surface-shadow">
      <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Waiting Queue</h2>
          <p className="text-sm text-muted-foreground">Patients waiting for treatment.</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Waiting Queue ({waitingAppointments.length})
        </span>
      </div>

      {waitingAppointments.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="relative mb-5 flex size-24 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary theme-strong-shadow">
            <Users className="size-10" aria-hidden="true" />
            <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-xl bg-amber-500 text-amber-50 shadow-lg shadow-amber-500/20">
              <Clock3 className="size-4" aria-hidden="true" />
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground">No patients are currently waiting.</h3>
        </div>
      ) : (
        <>
          <div className="hidden overflow-auto lg:block">
            <table className="min-w-[1650px] w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Queue No.</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Patient Code</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Dentist</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Appointment Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Check-in Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Waiting Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Medical Alert</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-normal text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-normal text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitingAppointments.map((appointment, index) => (
                  <tr key={appointment.id} className="border-t border-border/60 transition-all hover:bg-primary/5">
                    <td className="px-4 py-4 text-sm font-bold text-foreground">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <PatientAvatar
                          patient={{
                            fullName: appointment.patientName,
                            avatarTone: appointment.avatarTone,
                          }}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{appointment.patientName}</p>
                          <p className="truncate text-xs text-muted-foreground">{appointment.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">{appointment.patientCode}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{appointment.dentist}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">{appointment.timeLabel}</td>
                    <td className="px-4 py-4 text-sm text-foreground">{appointment.checkInLabel}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">{formatWaitingTime(appointment.checkInAt, currentTime)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityTone[appointment.priority ?? 'Normal']}`}>
                        {appointment.priority ?? 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {appointment.medicalAlert ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                          title={appointment.medicalAlertTooltip ?? appointment.medicalAlert}
                        >
                          <TriangleAlert className="size-3.5" />
                          {appointment.medicalAlert}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <AppointmentStatusBadge status={appointment.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30">
                          <Eye className="size-3.5" />
                          View
                        </button>
                        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30">
                          <Edit3 className="size-3.5" />
                          Edit Patient
                        </button>
                        <button
                          type="button"
                          onClick={() => onCallPatient(appointment.id)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-xs font-semibold text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                        >
                          <UserCheck className="size-3.5" />
                          Call Patient
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {waitingAppointments.map((appointment, index) => (
              <div key={appointment.id} className="rounded-2xl border border-border bg-background/50 p-4 dark:bg-background/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{appointment.patientName}</p>
                        <p className="text-xs text-muted-foreground">{appointment.patientCode}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{appointment.dentist} • {appointment.timeLabel}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Check-in {appointment.checkInLabel}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priorityTone[appointment.priority ?? 'Normal']}`}>
                    {appointment.priority ?? 'Normal'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-border bg-muted/50 px-2.5 py-2">
                    <p className="text-muted-foreground">Waiting</p>
                    <p className="font-semibold text-foreground">{formatWaitingTime(appointment.checkInAt, currentTime)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/50 px-2.5 py-2">
                    <p className="text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                  </div>
                </div>

                {appointment.medicalAlert && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300" title={appointment.medicalAlertTooltip ?? appointment.medicalAlert}>
                    <TriangleAlert className="size-3.5" />
                    {appointment.medicalAlert}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30">
                    <Eye className="size-3.5" />
                    View
                  </button>
                  <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30">
                    <Edit3 className="size-3.5" />
                    Edit Patient
                  </button>
                  <button type="button" onClick={() => onCallPatient(appointment.id)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-xs font-semibold text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20">
                    <UserCheck className="size-3.5" />
                    Call Patient
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function AppointmentTable({
  appointments,
  isLoading,
  sortKey,
  sortDirection,
  onSort,
  onCheckIn,
}: {
  appointments: AppointmentRecord[];
  isLoading: boolean;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onCheckIn: (appointmentId: string) => void;
}) {
  return (
    <div className="max-h-[660px] overflow-auto">
      <table className="min-w-[1540px] w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl">
          <tr>
            <HeaderCell label="Appointment ID" sortKey="appointmentId" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
            <HeaderCell label="Patient" sortKey="patientName" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
            <HeaderCell label="Patient Code" sortKey="patientCode" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
            <HeaderCell label="Dentist" sortKey="dentist" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
            <HeaderCell label="Appointment Type" sortKey="appointmentType" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
            <HeaderCell label="Date" sortKey="date" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
            <HeaderCell label="Time" sortKey="time" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />
            <HeaderCell label="Status" sortKey="status" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} align="center" />
            <HeaderCell label="Check-in" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} align="center" />
            <HeaderCell label="Balance" sortKey="balance" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} align="right" />
            <HeaderCell label="Actions" activeSortKey={sortKey} sortDirection={sortDirection} onSort={onSort} align="right" />
          </tr>
        </thead>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <tbody>
            {appointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="border-t border-border/60 transition-all hover:bg-primary/5"
              >
                <td className="px-4 py-4 text-sm font-bold text-primary">{appointment.appointmentId}</td>
                <td className="px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <PatientAvatar
                      patient={{
                        fullName: appointment.patientName,
                        avatarTone: appointment.avatarTone,
                      }}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{appointment.patientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{appointment.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-foreground">{appointment.patientCode}</td>
                <td className="px-4 py-4 text-sm text-foreground">{appointment.dentist}</td>
                <td className="px-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{appointment.appointmentType}</p>
                    <p className="truncate text-xs text-muted-foreground">Clinic schedule</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-foreground">{appointment.dateLabel}</td>
                <td className="px-4 py-4 text-sm font-semibold text-foreground">{appointment.timeLabel}</td>
                <td className="px-4 py-4 text-center">
                  <AppointmentStatusBadge status={appointment.status} />
                </td>
                <td className="px-4 py-4 text-center">
                  <CheckInBadge status={appointment.status} label={appointment.checkInLabel} />
                </td>
                <td className="px-4 py-4 text-right">
                  <BalanceBadge amount={appointment.balance} />
                </td>
                <td className="px-4 py-4">
                  <RowActions appointment={appointment} onCheckIn={onCheckIn} />
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {!isLoading && appointments.length === 0 && <EmptyState />}
    </div>
  );
}

export function AppointmentsModule() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(appointmentRecords);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [filters, setFilters] = useState<AppointmentFilterState>(initialFilters);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, filters, sortKey, sortDirection, pageSize]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return appointments
      .filter((appointment) => {
        const matchesSearch =
          !normalizedSearch ||
          appointment.patientName.toLowerCase().includes(normalizedSearch) ||
          appointment.patientCode.toLowerCase().includes(normalizedSearch) ||
          appointment.phone.toLowerCase().includes(normalizedSearch) ||
          appointment.dentist.toLowerCase().includes(normalizedSearch);

        const matchesStatus = filters.status === 'All' || appointment.status === filters.status;
        const matchesDentist = filters.dentist === 'All' || appointment.dentist === filters.dentist;
        const matchesType = filters.type === 'All' || appointment.appointmentType === filters.type;
        const matchesDate = !filters.date || appointment.scheduledAt.slice(0, 10) === filters.date;

        return matchesSearch && matchesStatus && matchesDentist && matchesType && matchesDate;
      })
      .sort((a, b) => {
        const result = compareAppointments(a, b, sortKey);
        return sortDirection === 'asc' ? result : -result;
      });
  }, [appointments, deferredSearch, filters, sortDirection, sortKey]);

  const pageCount = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const visibleAppointments = filteredAppointments.slice((page - 1) * pageSize, page * pageSize);

  const todayAppointments = appointments.filter((appointment) => appointment.scheduledAt.slice(0, 10) === todayDateValue);
  const checkedInCount = todayAppointments.filter((appointment) => appointment.status === 'Checked-in').length;
  const waitingQueue = todayAppointments.filter((appointment) => appointment.status === 'Checked-in');
  const waitingCount = waitingQueue.length;
  const completedTodayCount = todayAppointments.filter((appointment) => appointment.status === 'Completed').length;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const handleFiltersReset = () => {
    setFilters(initialFilters);
    setSearch('');
  };

  const handleCheckIn = (appointmentId: string) => {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) => {
        if (appointment.id !== appointmentId) {
          return appointment;
        }

        return {
          ...appointment,
          status: 'Checked-in',
          checkInLabel: formatCheckInLabel(new Date()),
          checkInAt: new Date().toISOString(),
          priority: appointment.priority ?? 'Normal',
        };
      }),
    );
  };

  const handleCallPatient = (appointmentId: string) => {
    const shouldMoveToChair = window.confirm('Send this patient to the treatment chair?');

    if (!shouldMoveToChair) {
      return;
    }

    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) => {
        if (appointment.id !== appointmentId) {
          return appointment;
        }

        return {
          ...appointment,
          status: 'In Chair',
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">
            Manage bookings, schedules, check-ins, and appointment status.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
              <CalendarDays className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
              <p className="text-xs font-semibold text-muted-foreground">Today&apos;s Appointments</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <UserCheck className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{checkedInCount}</p>
              <p className="text-xs font-semibold text-muted-foreground">Checked-in</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Clock3 className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
              <p className="text-xs font-semibold text-muted-foreground">Waiting</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedTodayCount}</p>
              <p className="text-xs font-semibold text-muted-foreground">Completed Today</p>
            </div>
          </div>
        </div>
      </div>

      <AppointmentSearchBar value={search} onChange={setSearch} />

      <section
        className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl theme-surface-shadow"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        <div className="flex flex-col gap-4 border-b border-border/70 px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground">Appointments</h2>
              <p className="text-sm text-muted-foreground">Sortable, filterable appointment schedule.</p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto"
            >
              <Plus className="size-4" />
              New Appointment
            </button>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="inline-flex w-full rounded-2xl border border-border bg-background/60 p-1 shadow-sm dark:bg-background/30 xl:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all xl:flex-none ${
                  viewMode === 'table'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-foreground hover:bg-muted/70'
                }`}
                aria-pressed={viewMode === 'table'}
              >
                <Table2 className="size-4" />
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all xl:flex-none ${
                  viewMode === 'calendar'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-foreground hover:bg-muted/70'
                }`}
                aria-pressed={viewMode === 'calendar'}
              >
                <LayoutGrid className="size-4" />
                Calendar View
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:flex xl:flex-1 xl:flex-wrap xl:justify-end">
              <FilterSelect
                label="Status"
                value={filters.status}
                options={['All', ...appointmentStatuses]}
                onChange={(status) => setFilters({ ...filters, status: status as AppointmentStatus | 'All' })}
              />
              <FilterSelect
                label="Dentist"
                value={filters.dentist}
                options={['All', ...dentistOptions]}
                onChange={(dentist) => setFilters({ ...filters, dentist })}
              />
              <FilterSelect
                label="Appointment Type"
                value={filters.type}
                options={['All', ...appointmentTypes]}
                onChange={(type) => setFilters({ ...filters, type })}
              />
              <DateFilter
                value={filters.date}
                onChange={(date) => setFilters({ ...filters, date })}
                onToday={() => setFilters({ ...filters, date: todayDateValue })}
              />
              <button
                type="button"
                onClick={handleFiltersReset}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-4 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/30 dark:bg-background/30 md:w-auto"
              >
                <RotateCcw className="size-4" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          filteredAppointments.length === 0 ? (
            <EmptyState />
          ) : (
            <AppointmentCalendarPlaceholder appointments={filteredAppointments} />
          )
        ) : (
          <>
            <AppointmentTable
              appointments={visibleAppointments}
              isLoading={isLoading}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
              onCheckIn={handleCheckIn}
            />
            {!isLoading && (
              <AppointmentPagination
                page={page}
                pageCount={pageCount}
                totalItems={filteredAppointments.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}

            <WaitingQueueTable
              appointments={appointments}
              currentTime={currentTime}
              onCallPatient={handleCallPatient}
            />
          </>
        )}
      </section>
    </div>
  );
}
