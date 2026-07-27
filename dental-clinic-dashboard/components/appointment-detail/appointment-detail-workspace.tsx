'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { AppointmentStatusBadge } from '@/components/appointments/status-badge';
import { appointmentStatuses, appointmentTypes, dentistOptions, type AppointmentStatus } from '@/components/appointments/appointment-data';

type AppointmentDetail = {
  appointmentId: string;
  patientName: string;
  patientCode: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  dentist: string;
  appointmentType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
  notes: string;
  medicalAlert: string;
  consentStatus: string;
};

const INITIAL_APPOINTMENT: AppointmentDetail = {
  appointmentId: 'APT-2026-0128',
  patientName: 'Sok Dara',
  patientCode: 'PT000128',
  phone: '012 345 678',
  dateOfBirth: 'November 18, 1991',
  age: 34,
  dentist: 'Dr. Chan Vuthy',
  appointmentType: 'Root Canal',
  date: '2026-07-27',
  startTime: '09:00',
  endTime: '10:30',
  status: 'Confirmed',
  reason: 'Persistent pain on lower-left molar',
  notes: 'Patient reported increasing pain during the last three days.',
  medicalAlert: 'Penicillin allergy',
  consentStatus: 'Treatment consent on file',
};

const statusOptions = [...appointmentStatuses];

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function duration(start: string, end: string) {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  const minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3">
      {icon && <span className="mt-0.5 text-primary">{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function EditAppointmentModal({
  appointment,
  onClose,
  onSave,
}: {
  appointment: AppointmentDetail;
  onClose: () => void;
  onSave: (appointment: AppointmentDetail) => void;
}) {
  const [draft, setDraft] = useState(appointment);
  const update = <K extends keyof AppointmentDetail>(key: K, value: AppointmentDetail[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Appointment Workspace</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">Edit Appointment</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close edit appointment">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-foreground">Dentist<select value={draft.dentist} onChange={(event) => update('dentist', event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15">{dentistOptions.map((dentist) => <option key={dentist}>{dentist}</option>)}<option>Dr. Chan Vuthy</option></select></label>
          <label className="text-sm font-semibold text-foreground">Appointment type<select value={draft.appointmentType} onChange={(event) => update('appointmentType', event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15">{appointmentTypes.map((type) => <option key={type}>{type}</option>)}<option>Root Canal</option></select></label>
          <label className="text-sm font-semibold text-foreground">Date<input type="date" value={draft.date} onChange={(event) => update('date', event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-sm font-semibold text-foreground">Start<input type="time" value={draft.startTime} onChange={(event) => update('startTime', event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-2 text-sm font-normal outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" /></label><label className="text-sm font-semibold text-foreground">End<input type="time" value={draft.endTime} onChange={(event) => update('endTime', event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-2 text-sm font-normal outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" /></label></div>
          <label className="text-sm font-semibold text-foreground sm:col-span-2">Reason for visit<input value={draft.reason} onChange={(event) => update('reason', event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" /></label>
          <label className="text-sm font-semibold text-foreground sm:col-span-2">Appointment notes<textarea value={draft.notes} onChange={(event) => update('notes', event.target.value)} rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Discard</Button><Button onClick={() => { onSave(draft); onClose(); }}><Check className="size-4" />Save changes</Button></div>
      </div>
    </div>
  );
}

function CancelAppointmentModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start gap-3"><span className="rounded-full bg-rose-100 p-2 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"><AlertTriangle className="size-5" /></span><div><h2 className="text-lg font-bold text-foreground">Cancel appointment?</h2><p className="mt-1 text-sm text-muted-foreground">Are you sure you want to cancel this appointment? This only updates the current mock session.</p></div></div>
        <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Keep Appointment</Button><Button variant="destructive" onClick={onConfirm}>Cancel Appointment</Button></div>
      </div>
    </div>
  );
}

export function AppointmentDetailWorkspace() {
  const router = useRouter();
  const [appointment, setAppointment] = useState(INITIAL_APPOINTMENT);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const canCheckIn = !['Cancelled', 'Completed', 'No-show'].includes(appointment.status);
  const initials = appointment.patientName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3"><Button variant="ghost" className="-ml-2 text-muted-foreground" onClick={() => router.push('/calendar')}><ArrowLeft className="size-4" />Back to Calendar</Button><div><p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/80">Appointment Detail</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{appointment.patientName}</h1><p className="mt-1 text-sm text-muted-foreground">{appointment.appointmentId} · {appointment.appointmentType}</p></div></div>
        <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEditOpen(true)}><Edit3 className="size-4" />Edit</Button>{canCheckIn && <Button onClick={() => router.push('/check-in')}><CheckCircle2 className="size-4" />Check-in</Button>} {appointment.status !== 'Cancelled' && <Button variant="destructive" onClick={() => setCancelOpen(true)}>Cancel Appointment</Button>}</div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{initials}</span><div><p className="text-lg font-bold text-foreground">{appointment.patientName}</p><p className="text-sm text-muted-foreground">{appointment.patientCode} · {appointment.phone}</p></div></div><div className="flex items-center gap-3"><AppointmentStatusBadge status={appointment.status} /><span className="text-sm font-semibold text-muted-foreground">{formatDate(appointment.date)}</span></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><DetailRow label="Appointment time" value={`${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}`} icon={<Clock3 className="size-4" />} /><DetailRow label="Appointment type" value={appointment.appointmentType} icon={<Stethoscope className="size-4" />} /><DetailRow label="Assigned dentist" value={appointment.dentist} icon={<User className="size-4" />} /></div></section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]"><div className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><User className="size-5 text-primary" />Patient Information</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><DetailRow label="Patient code" value={appointment.patientCode} /><DetailRow label="Phone" value={appointment.phone} icon={<Phone className="size-4" />} /><DetailRow label="Age / date of birth" value={`${appointment.age} years · ${appointment.dateOfBirth}`} /><DetailRow label="Consent" value={appointment.consentStatus} icon={<ShieldCheck className="size-4" />} /></div><div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><div><p className="text-xs font-bold uppercase tracking-wide">Medical alert</p><p className="mt-1 text-sm font-semibold">{appointment.medicalAlert}</p><p className="mt-1 text-xs opacity-80">Review before prescribing or beginning treatment.</p></div></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><FileText className="size-5 text-primary" />Visit Notes</h2><div className="mt-4 space-y-4"><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Reason for visit</p><p className="mt-1 text-sm text-foreground">{appointment.reason}</p></div><div className="border-t border-border pt-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Appointment notes</p><p className="mt-1 text-sm leading-6 text-foreground">{appointment.notes}</p></div></div></section></div><aside className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-lg font-bold text-foreground">Appointment information</h2><div className="mt-4 space-y-3"><DetailRow label="Date" value={formatDate(appointment.date)} icon={<CalendarDays className="size-4" />} /><DetailRow label="Start time" value={formatTime(appointment.startTime)} /><DetailRow label="End time" value={formatTime(appointment.endTime)} /><DetailRow label="Duration" value={duration(appointment.startTime, appointment.endTime)} /></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Current status</p><div className="mt-3 flex items-center gap-3"><AppointmentStatusBadge status={appointment.status} /><span className="text-sm text-muted-foreground">Status updates apply to this page session.</span></div><label className="mt-4 block text-xs font-semibold text-muted-foreground">Mock status<select value={appointment.status} onChange={(event) => setAppointment((current) => ({ ...current, status: event.target.value as AppointmentStatus }))} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary/50">{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label></section></aside></div>
      {editOpen && <EditAppointmentModal appointment={appointment} onClose={() => setEditOpen(false)} onSave={setAppointment} />}
      {cancelOpen && <CancelAppointmentModal onClose={() => setCancelOpen(false)} onConfirm={() => { setAppointment((current) => ({ ...current, status: 'Cancelled' })); setCancelOpen(false); }} />}
    </div>
  );
}