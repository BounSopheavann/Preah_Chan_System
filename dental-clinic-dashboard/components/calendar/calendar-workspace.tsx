'use client';

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  calendarAppointments,
  calendarDentists,
  statusColors,
  statusDotColors,
  timeSlots,
  type CalendarAppointment,
  type CalendarAppointmentStatus,
} from './calendar-data';

type ViewMode = 'day' | 'week' | 'month';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ACTIVE_DENTISTS = ['Dr. Dara Sok', 'Dr. Lina Chea', 'Dr. Vannak Lim'];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTimeDisplay(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  return cells;
}

function AppointmentCard({
  appointment,
  compact,
  onClick,
}: {
  appointment: CalendarAppointment;
  compact?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-md border px-2 py-1.5 transition-all hover:shadow-md hover:-translate-y-0.5 ${
        statusColors[appointment.status]
      } ${compact ? 'text-[11px]' : 'text-xs'}`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`inline-block size-2 rounded-full ${statusDotColors[appointment.status]}`} />
        <span className="font-semibold truncate">
          {compact ? (appointment.patientName.split(' ')[0] ?? appointment.patientName) : appointment.patientName}
        </span>
      </div>
      {!compact && (
        <>
          <p className="mt-0.5 truncate text-muted-foreground">
            {formatTimeDisplay(appointment.startTime)} – {formatTimeDisplay(appointment.endTime)}
          </p>
          <p className="truncate text-muted-foreground">{appointment.appointmentType}</p>
        </>
      )}
    </button>
  );
}

function SlotInfoPanel({
  slot,
  onClose,
}: {
  slot: { date: string; time: string; dentist: string } | null;
  onClose: () => void;
}) {
  if (!slot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Available Slot</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-semibold text-foreground">{slot.date}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-semibold text-foreground">{formatTimeDisplay(slot.time)}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Dentist</p>
            <p className="text-sm font-semibold text-foreground">{slot.dentist}</p>
          </div>
          <button
            type="button"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentDetailPanel({
  appointment,
  onClose,
  onOpenFullDetail,
}: {
  appointment: CalendarAppointment | null;
  onClose: () => void;
  onOpenFullDetail: () => void;
}) {
  if (!appointment) return null;

  const statusClass = statusColors[appointment.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Appointment Detail</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {appointment.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{appointment.patientName}</p>
              <p className="text-sm text-muted-foreground">{appointment.patientId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-semibold text-foreground">{appointment.date}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm font-semibold text-foreground">
                {formatTimeDisplay(appointment.startTime)} – {formatTimeDisplay(appointment.endTime)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Dentist</p>
              <p className="text-sm font-semibold text-foreground">{appointment.dentist}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-semibold text-foreground">{appointment.appointmentType}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
              <span className={`inline-block size-2 rounded-full ${statusDotColors[appointment.status]}`} />
              {appointment.status}
            </span>
            <span className="text-xs text-muted-foreground">Phone: {appointment.phone}</span>
          </div>
          <button
            type="button"
            onClick={onOpenFullDetail}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open full detail
          </button>
        </div>
      </div>
    </div>
  );
}

export function CalendarWorkspace() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dentistFilter, setDentistFilter] = useState<string>('All Dentists');
  const [search, setSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; dentist: string } | null>(null);

  const currentDateStr = formatDate(selectedDate);

  const filteredAppointments = useMemo(() => {
    return calendarAppointments.filter((apt) => {
      if (dentistFilter !== 'All Dentists' && apt.dentist !== dentistFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = apt.patientName.toLowerCase().includes(q);
        const idMatch = apt.patientId.toLowerCase().includes(q);
        const phoneMatch = apt.phone.toLowerCase().includes(q);
        if (!nameMatch && !idMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [dentistFilter, search]);

  const dayAppointments = useMemo(() => {
    return filteredAppointments.filter((apt) => apt.date === currentDateStr);
  }, [filteredAppointments, currentDateStr]);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const weekDayStrs = useMemo(() => weekDays.map((d) => formatDate(d)), [weekDays]);

  const weekAppointments = useMemo(() => {
    return filteredAppointments.filter((apt) => weekDayStrs.includes(apt.date));
  }, [filteredAppointments, weekDayStrs]);

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const monthCells = useMemo(() => getMonthDays(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  const todayStr = formatDate(new Date());

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    filteredAppointments.forEach((apt) => {
      const existing = map.get(apt.date) ?? [];
      existing.push(apt);
      map.set(apt.date, existing);
    });
    return map;
  }, [filteredAppointments]);

  const todaySummary = useMemo(() => {
    const todays = calendarAppointments.filter((apt) => apt.date === todayStr);
    const total = todays.length;
    const confirmed = todays.filter((a) => a.status === 'Confirmed').length;
    const checkedIn = todays.filter((a) => a.status === 'Checked-in').length;
    const inChair = todays.filter((a) => a.status === 'In Chair').length;
    const completed = todays.filter((a) => a.status === 'Completed').length;
    const booked = todays.filter((a) => a.status === 'Booked').length;
    const availableSlots = timeSlots.length - todays.length;
    return { total, confirmed, checkedIn, inChair, completed, booked, availableSlots };
  }, []);

  function navigate(direction: 'prev' | 'next') {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  function handleDayClick(day: number) {
    const newDate = new Date(selectedYear, selectedMonth, day);
    setSelectedDate(newDate);
    setViewMode('day');
  }

  function handleSlotClick(date: string, time: string, dentist: string) {
    setSelectedSlot({ date, time, dentist });
  }

  function isSlotOccupied(date: string, time: string, dentist: string): boolean {
    return calendarAppointments.some((apt) => {
      const aptStart = apt.startTime;
      const aptEnd = apt.endTime;
      return apt.date === date && apt.dentist === dentist && time >= aptStart && time < aptEnd;
    });
  }

  function getAppointmentForSlot(date: string, time: string, dentist: string): CalendarAppointment | undefined {
    return calendarAppointments.find((apt) => {
      const aptStart = apt.startTime;
      const aptEnd = apt.endTime;
      return apt.date === date && apt.dentist === dentist && time >= aptStart && time < aptEnd;
    });
  }

  function getAppointmentsForDay(dateStr: string): CalendarAppointment[] {
    return filteredAppointments.filter((apt) => apt.date === dateStr);
  }

  const headerDateLabel = useMemo(() => {
    if (viewMode === 'day') {
      const dayName = DAY_NAMES_FULL[selectedDate.getDay()];
      const monthName = MONTH_NAMES[selectedDate.getMonth()];
      return `${dayName}, ${monthName} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      const startMonth = MONTH_NAMES[start.getMonth()];
      const endMonth = MONTH_NAMES[end.getMonth()];
      if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  }, [viewMode, selectedDate, weekDays]);

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <SummaryStat label="Total" value={todaySummary.total} color="text-foreground" />
        <SummaryStat label="Booked" value={todaySummary.booked} color="text-sky-600" />
        <SummaryStat label="Confirmed" value={todaySummary.confirmed} color="text-blue-600" />
        <SummaryStat label="Checked-in" value={todaySummary.checkedIn} color="text-amber-600" />
        <SummaryStat label="In Chair" value={todaySummary.inChair} color="text-violet-600" />
        <SummaryStat label="Completed" value={todaySummary.completed} color="text-emerald-600" />
        <SummaryStat label="Available" value={todaySummary.availableSlots} color="text-muted-foreground" />
      </div>

      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('prev')}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background/70 text-foreground transition-all hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-primary/10 px-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
          >
            <CalendarDays className="size-4" />
            Today
          </button>
          <button
            type="button"
            onClick={() => navigate('next')}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background/70 text-foreground transition-all hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
          <h2 className="ml-2 text-base font-bold text-foreground md:text-lg">{headerDateLabel}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Tabs */}
          <div className="inline-flex rounded-xl border border-border bg-background/70 p-0.5">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Dentist Filter */}
          <select
            value={dentistFilter}
            onChange={(e) => setDentistFilter(e.target.value)}
            className="h-9 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
          >
            {calendarDentists.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-40 rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
            />
          </div>

          {/* Book Appointment */}
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
          <div className="overflow-auto">
            <table className="min-w-[600px] w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 w-20 bg-card px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Time
                  </th>
                  {ACTIVE_DENTISTS.map((dentist) => (
                    <th
                      key={dentist}
                      className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                        dentistFilter !== 'All Dentists' && dentistFilter !== dentist
                          ? 'text-muted-foreground/40'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {dentist}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, idx) => {
                  const isLunchBreak = time >= '12:00' && time < '13:00';
                  return (
                    <tr key={time} className={`border-b border-border/60 ${isLunchBreak ? 'bg-muted/20' : ''}`}>
                      <td className="sticky left-0 z-10 bg-card px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 text-muted-foreground" />
                          <span className="text-xs font-semibold text-muted-foreground">
                            {formatTimeDisplay(time)}
                          </span>
                        </div>
                      </td>
                      {ACTIVE_DENTISTS.map((dentist) => {
                        const appointment = getAppointmentForSlot(currentDateStr, time, dentist);
                        const occupied = isSlotOccupied(currentDateStr, time, dentist);

                        if (appointment) {
                          return (
                            <td key={`${dentist}-${time}`} className="px-2 py-1">
                              <AppointmentCard
                                appointment={appointment}
                                onClick={() => setSelectedAppointment(appointment)}
                              />
                            </td>
                          );
                        }

                        if (isLunchBreak) {
                          return (
                            <td key={`${dentist}-${time}`} className="px-2 py-1">
                              <div className="flex h-full min-h-[36px] items-center justify-center rounded-md bg-muted/30">
                                <span className="text-[10px] text-muted-foreground/60">Lunch</span>
                              </div>
                            </td>
                          );
                        }

                        if (!occupied) {
                          return (
                            <td key={`${dentist}-${time}`} className="px-2 py-1">
                              <button
                                type="button"
                                onClick={() => handleSlotClick(currentDateStr, time, dentist)}
                                className="flex h-full min-h-[36px] w-full items-center justify-center rounded-md border border-dashed border-border/40 bg-background/30 text-xs text-muted-foreground/50 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary/70"
                              >
                                +
                              </button>
                            </td>
                          );
                        }

                        return <td key={`${dentist}-${time}`} className="px-2 py-1" />;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
          <div className="overflow-auto">
            <table className="min-w-[700px] w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 w-20 bg-card px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Time
                  </th>
                  {weekDays.map((day) => {
                    const dayStr = formatDate(day);
                    const isToday = dayStr === todayStr;
                    return (
                      <th
                        key={dayStr}
                        className={`px-2 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                          isToday ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <span>{DAY_NAMES[day.getDay()]}</span>
                        <span className={`ml-1 inline-flex size-6 items-center justify-center rounded-full text-sm ${
                          isToday ? 'bg-primary text-primary-foreground' : ''
                        }`}>
                          {day.getDate()}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => {
                  const isLunchBreak = time >= '12:00' && time < '13:00';
                  return (
                    <tr key={time} className={`border-b border-border/60 ${isLunchBreak ? 'bg-muted/20' : ''}`}>
                      <td className="sticky left-0 z-10 bg-card px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 text-muted-foreground" />
                          <span className="text-xs font-semibold text-muted-foreground">
                            {formatTimeDisplay(time)}
                          </span>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const dayStr = formatDate(day);
                        const dayApps = weekAppointments.filter((apt) => {
                          const aptStart = apt.startTime;
                          const aptEnd = apt.endTime;
                          return apt.date === dayStr && time >= aptStart && time < aptEnd;
                        });

                        if (isLunchBreak) {
                          return (
                            <td key={dayStr} className="px-1 py-1">
                              <div className="flex min-h-[36px] items-center justify-center rounded-md bg-muted/30">
                                <span className="text-[10px] text-muted-foreground/50">Lunch</span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={dayStr} className="px-1 py-1">
                            {dayApps.length > 0 ? (
                              <div className="space-y-1">
                                {dayApps.map((apt) => (
                                  <AppointmentCard
                                    key={apt.id}
                                    appointment={apt}
                                    compact
                                    onClick={() => setSelectedAppointment(apt)}
                                  />
                                ))}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSlotClick(dayStr, time, dentistFilter === 'All Dentists' ? ACTIVE_DENTISTS[0] : dentistFilter)}
                                className="flex min-h-[36px] w-full items-center justify-center rounded-md border border-dashed border-border/30 bg-transparent text-xs text-muted-foreground/30 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary/60"
                              >
                                +
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl">
          <div className="grid grid-cols-7 gap-px bg-border/50">
            {DAY_NAMES.map((name) => (
              <div key={name} className="bg-card px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {name}
              </div>
            ))}
            {monthCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-24 bg-card/50" />;
              }

              const dateObj = new Date(selectedYear, selectedMonth, day);
              const dateStr = formatDate(dateObj);
              const isToday = dateStr === todayStr;
              const dayApps = appointmentsByDate.get(dateStr) ?? [];

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`min-h-24 bg-card p-2 text-left transition-all hover:bg-muted/50 ${
                    isToday ? 'ring-2 ring-inset ring-primary/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {day}
                    </span>
                    {dayApps.length > 0 && (
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {dayApps.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {dayApps.slice(0, 3).map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        compact
                        onClick={(e) => {
                          e?.stopPropagation();
                          setSelectedAppointment(apt);
                        }}
                      />
                    ))}
                    {dayApps.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">+{dayApps.length - 3} more</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AppointmentDetailPanel
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onOpenFullDetail={() => router.push('/appointment-detail')}
      />
      <SlotInfoPanel
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
      />
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-3 py-2.5 text-center backdrop-blur-sm">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}