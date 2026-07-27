'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  FileCheck2,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppointmentStatusBadge } from '@/components/appointments/status-badge';
import type { AppointmentStatus } from '@/components/appointments/appointment-data';
import { ConsentBadge } from '@/components/patients/status-badge';
import type { ConsentStatus, PatientGender } from '@/components/patients/patient-data';
import { Button } from '@/components/ui/button';

type CheckInRecord = {
  patientName: string;
  patientCode: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  gender: PatientGender;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string;
  medicalConditions: string;
  currentMedication: string;
  consentStatus: ConsentStatus;
  appointmentId: string;
  dentist: string;
  appointmentType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
};

const INITIAL_RECORD: CheckInRecord = {
  patientName: 'Sok Dara', patientCode: 'PT000128', phone: '012 345 678',
  dateOfBirth: 'March 14, 1994', age: 32, gender: 'Male', address: 'Phnom Penh, Cambodia',
  emergencyContact: 'Sok Lina', emergencyPhone: '098 765 432', allergies: 'Penicillin',
  medicalConditions: 'None reported', currentMedication: 'None', consentStatus: 'Accepted',
  appointmentId: 'APT-20260727-014', dentist: 'Dr. Chan Vuthy', appointmentType: 'Root Canal',
  date: 'July 27, 2026', startTime: '09:00', endTime: '10:30', status: 'Confirmed',
  reason: 'Persistent pain on lower-left molar',
};

function formatTime(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-background/40 p-3"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{icon}{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div>;
}

function PatientEditDialog({ record, onClose, onSave }: { record: CheckInRecord; onClose: () => void; onSave: (record: CheckInRecord) => void }) {
  const [draft, setDraft] = useState(record);
  const update = (key: keyof CheckInRecord, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}><div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Patient Information</p><h2 className="mt-1 text-xl font-bold">Edit Patient</h2></div><button type="button" onClick={onClose} aria-label="Close"><X className="size-5 text-muted-foreground" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Patient name<input value={draft.patientName} onChange={(event) => update('patientName', event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 font-normal" /></label><label className="text-sm font-semibold">Phone<input value={draft.phone} onChange={(event) => update('phone', event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 font-normal" /></label><label className="text-sm font-semibold sm:col-span-2">Address<input value={draft.address} onChange={(event) => update('address', event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 font-normal" /></label><label className="text-sm font-semibold">Emergency contact<input value={draft.emergencyContact} onChange={(event) => update('emergencyContact', event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 font-normal" /></label><label className="text-sm font-semibold">Emergency phone<input value={draft.emergencyPhone} onChange={(event) => update('emergencyPhone', event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 font-normal" /></label></div><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => { onSave(draft); onClose(); }}><Check className="size-4" />Save changes</Button></div></div></div>;
}

function ConsentDialog({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}><div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start gap-3"><span className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><FileCheck2 className="size-5" /></span><div><h2 className="text-lg font-bold">Treatment consent</h2><p className="mt-1 text-sm text-muted-foreground">Mock consent record for today’s appointment.</p></div></div><div className="mt-5 rounded-xl border border-border bg-background/50 p-4 text-sm"><div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><ConsentBadge status="Accepted" /></div><p className="mt-3 text-muted-foreground">Patient consent is available for the planned Root Canal appointment. No electronic signature or document storage is used in this UI phase.</p></div><div className="mt-6 flex justify-end"><Button onClick={onClose}>Close</Button></div></div></div>;
}

export function CheckInWorkspace() {
  const router = useRouter();
  const [record, setRecord] = useState(INITIAL_RECORD);
  const [editOpen, setEditOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const unavailable = ['Cancelled', 'Completed', 'No-show', 'Checked-in'].includes(record.status);
  const initials = record.patientName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const checkIn = () => { if (!unavailable) { setRecord((current) => ({ ...current, status: 'Checked-in' })); setCheckedIn(true); } };

  return <div className="mx-auto max-w-[1200px] space-y-5 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><Button variant="ghost" className="-ml-2 text-muted-foreground" onClick={() => router.push('/appointment-detail')}><ArrowLeft className="size-4" />Back to Appointment Detail</Button><p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-primary/80">Reception Workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Check-in</h1><p className="mt-1 text-sm text-muted-foreground">Verify the patient and appointment before adding them to the waiting queue.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEditOpen(true)}><Edit3 className="size-4" />Edit Patient</Button>{!checkedIn && <Button disabled={unavailable} onClick={checkIn}><CheckCircle2 className="size-4" />Check In Patient</Button>}{checkedIn && <Button onClick={() => router.push('/')}><Users className="size-4" />Open Waiting Queue</Button>}</div></div>

    {checkedIn && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><div><p className="font-bold">Patient checked in successfully.</p><p className="mt-1 text-sm">Queue number Q-014 · Check-in time 8:53 AM · Assigned dentist {record.dentist}</p></div></div>}

    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{initials}</span><div><h2 className="text-lg font-bold">{record.patientName}</h2><p className="text-sm text-muted-foreground">{record.patientCode} · {record.appointmentId}</p></div></div><div className="flex items-center gap-3"><AppointmentStatusBadge status={record.status} /><span className="text-sm font-semibold text-muted-foreground">{formatTime(record.startTime)} – {formatTime(record.endTime)}</span></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><InfoItem label="Appointment date" value={record.date} icon={<CalendarDays className="size-3.5" />} /><InfoItem label="Appointment type" value={record.appointmentType} /><InfoItem label="Assigned dentist" value={record.dentist} /></div></section>

    <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]"><div className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><User className="size-5 text-primary" />Patient Information</h2><Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Edit3 className="size-3.5" />Edit</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><InfoItem label="Patient code" value={record.patientCode} /><InfoItem label="Phone" value={record.phone} icon={<Phone className="size-3.5" />} /><InfoItem label="Date of birth / age" value={`${record.dateOfBirth} · ${record.age} years`} /><InfoItem label="Gender" value={record.gender} /><InfoItem label="Address" value={record.address} icon={<MapPin className="size-3.5" />} /></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><Phone className="size-5 text-primary" />Contact Information</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><InfoItem label="Phone" value={record.phone} /><InfoItem label="Address" value={record.address} /><InfoItem label="Emergency contact" value={record.emergencyContact} /><InfoItem label="Emergency phone" value={record.emergencyPhone} /></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><AlertTriangle className="size-5 text-primary" />Medical Information</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><InfoItem label="Allergies" value={record.allergies} /><InfoItem label="Medical conditions" value={record.medicalConditions} /><InfoItem label="Current medications" value={record.currentMedication} /></div><div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><div><p className="text-xs font-bold uppercase tracking-wide">Medical Alert — {record.allergies} Allergy</p><p className="mt-1 text-sm">Review before prescribing or beginning treatment.</p></div></div></section></div>

    <aside className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="size-5 text-primary" />Consent</h2><ConsentBadge status={record.consentStatus} /></div><p className="mt-3 text-sm text-muted-foreground">Consent is available for this appointment.</p><Button variant="outline" className="mt-4 w-full" onClick={() => setConsentOpen(true)}>Review Consent</Button></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-lg font-bold">Appointment Information</h2><div className="mt-4 space-y-3"><InfoItem label="Appointment ID" value={record.appointmentId} /><InfoItem label="Date" value={record.date} /><InfoItem label="Time" value={`${formatTime(record.startTime)} – ${formatTime(record.endTime)}`} icon={<Clock3 className="size-3.5" />} /><InfoItem label="Reason for visit" value={record.reason} /></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Check-in validation</p><div className="mt-4 space-y-2 text-sm">{['Appointment is for today', 'Appointment is not cancelled', 'Patient record is available', 'Required consent is accepted'].map((item) => <div key={item} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" />{item}</div>)}</div></section></aside></div>
    <div className="flex justify-end"><Button variant="ghost" onClick={() => router.push('/appointment-detail')}><ArrowLeft className="size-4" />Cancel / Back</Button></div>
    {editOpen && <PatientEditDialog record={record} onClose={() => setEditOpen(false)} onSave={setRecord} />}{consentOpen && <ConsentDialog onClose={() => setConsentOpen(false)} />}
  </div>;
}