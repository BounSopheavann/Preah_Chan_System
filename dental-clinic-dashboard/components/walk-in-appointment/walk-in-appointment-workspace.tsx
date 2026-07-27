'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  Stethoscope,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppointmentStatusBadge } from '@/components/appointments/status-badge';
import type { AppointmentStatus } from '@/components/appointments/appointment-data';
import { Button } from '@/components/ui/button';

type MockPatient = {
  name: string;
  code: string;
  phone: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  age: number;
  medicalAlert: string;
};

type DentistAvailability = { dentist: string; slots: string[] };

const patients: MockPatient[] = [
  { name: 'Sok Dara', code: 'PT000128', phone: '012 345 678', gender: 'Male', dateOfBirth: 'March 14, 1994', age: 32, medicalAlert: 'Penicillin allergy' },
  { name: 'Chan Sreypov', code: 'PT000204', phone: '096 442 8173', gender: 'Female', dateOfBirth: 'November 8, 1998', age: 27, medicalAlert: 'None reported' },
  { name: 'Lim Vannak', code: 'PT000317', phone: '088 721 4560', gender: 'Male', dateOfBirth: 'June 21, 1987', age: 39, medicalAlert: 'Latex sensitivity' },
];

const availability: DentistAvailability[] = [
  { dentist: 'Dr. Chan Vuthy', slots: ['10:30 AM', '11:00 AM', '2:00 PM'] },
  { dentist: 'Dr. Srey Mom', slots: ['9:45 AM', '1:30 PM', '3:00 PM'] },
  { dentist: 'Dr. Dara Sok', slots: [] },
];

const appointmentTypes = ['Consultation', 'Cleaning', 'Filling', 'Extraction', 'Root Canal', 'Crown', 'Emergency', 'Review'];
const priorities = ['Normal', 'Urgent', 'Emergency'] as const;

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-background/40 p-3"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{icon}{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div>;
}

export function WalkInAppointmentWorkspace() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<MockPatient | null>(patients[0]);
  const [appointmentType, setAppointmentType] = useState('Consultation');
  const [reason, setReason] = useState('Severe tooth pain since last night');
  const [dentist, setDentist] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<(typeof priorities)[number]>('Normal');
  const [notes, setNotes] = useState('');
  const [created, setCreated] = useState(false);

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((patient) => [patient.name, patient.code, patient.phone].some((value) => value.toLowerCase().includes(term)));
  }, [search]);
  const selectedDentist = availability.find((item) => item.dentist === dentist);
  const canCreate = Boolean(selectedPatient && appointmentType && dentist && time);

  return <div className="mx-auto max-w-[1200px] space-y-5 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><Button variant="ghost" className="-ml-2 text-muted-foreground" onClick={() => router.push('/appointments')}><ArrowLeft className="size-4" />Back to Appointments</Button><p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-primary/80">Reception Workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Walk-in Appointment</h1><p className="mt-1 text-sm text-muted-foreground">Create a same-day appointment for a patient without an existing booking.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary"><CalendarDays className="size-4" />Today · July 27, 2026</span></div>

    {created && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 className="mt-0.5 size-5 shrink-0" /><div><p className="font-bold">Walk-in appointment created successfully.</p><p className="mt-1 text-sm">APT-WALKIN-027 · <AppointmentStatusBadge status={'Booked' as AppointmentStatus} /></p></div></div>}

    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"><div className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-lg font-bold"><Search className="size-5 text-primary" />Patient Search</h2><p className="mt-1 text-sm text-muted-foreground">Search by name, patient code, or phone.</p></div><Button variant="outline" size="sm" onClick={() => router.push('/patients')}><UserPlus className="size-3.5" />Register New Patient</Button></div><div className="relative mt-4"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patient..." className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15" /></div><div className="mt-3 space-y-2">{results.map((patient) => <button key={patient.code} type="button" onClick={() => setSelectedPatient(patient)} className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${selectedPatient?.code === patient.code ? 'border-primary/50 bg-primary/5' : 'border-border bg-background/40 hover:bg-muted/60'}`}><span><span className="block text-sm font-bold">{patient.name}</span><span className="text-xs text-muted-foreground">{patient.code} · {patient.phone}</span></span><span className="text-xs font-semibold text-muted-foreground">{patient.gender}</span></button>)}{results.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">No mock patient found. Try another search or register a new patient.</p>}</div></section>

    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><User className="size-5 text-primary" />Selected Patient</h2>{selectedPatient ? <><div className="mt-4 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{selectedPatient.name.split(' ').map((part) => part[0]).join('')}</span><div><p className="font-bold">{selectedPatient.name}</p><p className="text-sm text-muted-foreground">{selectedPatient.code} · Existing Patient</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><InfoItem label="Phone" value={selectedPatient.phone} /><InfoItem label="Date of birth / age" value={`${selectedPatient.dateOfBirth} · ${selectedPatient.age} years`} /><InfoItem label="Gender" value={selectedPatient.gender} /><InfoItem label="Medical alert" value={selectedPatient.medicalAlert} icon={<AlertTriangle className="size-3.5" />} /></div></> : <p className="mt-4 text-sm text-muted-foreground">Select an existing patient to continue.</p>}</section>

    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><Stethoscope className="size-5 text-primary" />Walk-in Appointment Details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Appointment type<select value={appointmentType} onChange={(event) => setAppointmentType(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal">{appointmentTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label className="text-sm font-semibold">Priority<select value={priority} onChange={(event) => setPriority(event.target.value as (typeof priorities)[number])} className={`mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-sm font-normal ${priority === 'Emergency' ? 'border-red-300 text-red-700' : 'border-border'}`}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold sm:col-span-2">Reason for visit<input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal" /></label><label className="text-sm font-semibold sm:col-span-2">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Optional reception notes" className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal" /></label></div></section></div>

    <aside className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><Clock3 className="size-5 text-primary" />Dentist Availability</h2><p className="mt-1 text-sm text-muted-foreground">Select an available slot for today.</p><div className="mt-4 space-y-3">{availability.map((item) => <div key={item.dentist} className={`rounded-xl border p-3 ${dentist === item.dentist ? 'border-primary/50 bg-primary/5' : 'border-border bg-background/40'}`}><button type="button" onClick={() => { setDentist(item.dentist); setTime(''); }} className="flex w-full items-center justify-between text-left"><span className="font-bold">{item.dentist}</span>{item.slots.length === 0 && <span className="text-xs font-semibold text-muted-foreground">No available slots</span>}</button>{item.slots.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{item.slots.map((slot) => <button key={slot} type="button" onClick={() => { setDentist(item.dentist); setTime(slot); }} className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${dentist === item.dentist && time === slot ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted'}`}>{slot}</button>)}</div>}</div>)}</div></section>

    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-lg font-bold">Appointment Summary</h2><div className="mt-4 space-y-3"><InfoItem label="Patient" value={selectedPatient?.name ?? 'Not selected'} /><InfoItem label="Patient code" value={selectedPatient?.code ?? 'Not selected'} /><InfoItem label="Appointment type" value={appointmentType} /><InfoItem label="Dentist / time" value={dentist && time ? `${dentist} · ${time}` : 'Select dentist and time'} /><InfoItem label="Priority" value={priority} /><InfoItem label="Reason for visit" value={reason || 'Not provided'} /></div><Button className="mt-5 w-full" disabled={!canCreate || created} onClick={() => setCreated(true)}><CheckCircle2 className="size-4" />{created ? 'Appointment Created' : 'Create Walk-in Appointment'}</Button>{created && <Button variant="outline" className="mt-2 w-full" onClick={() => router.push('/check-in')}>Continue to Check-in</Button>}</section><div className="flex justify-end"><Button variant="ghost" onClick={() => router.push('/appointments')}><ArrowLeft className="size-4" />Cancel / Back</Button></div></aside></div>
  </div>;
}