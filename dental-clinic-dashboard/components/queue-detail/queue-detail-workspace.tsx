'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

type QueueStatus = 'Waiting' | 'In Chair';

const QUEUE = {
  number: 'Q-014',
  checkInTime: '8:53 AM',
  appointmentTime: '9:00 AM',
  dentist: 'Dr. Chan Vuthy',
  priority: 'Normal',
  appointmentType: 'Root Canal',
  reason: 'Persistent pain on lower-left molar',
};

const PATIENT = {
  name: 'Sok Dara',
  code: 'PT000128',
  phone: '012 345 678',
  gender: 'Male',
  dateOfBirth: 'March 14, 1994',
  age: 32,
  allergy: 'Penicillin',
  conditions: 'None reported',
  medication: 'None',
  consent: 'Accepted',
};

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon && <span className="text-primary">{icon}</span>}{label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'warning' | 'success' }) {
  const styles = {
    neutral: 'border-border bg-muted text-foreground',
    warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  };
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}

export function QueueDetailWorkspace() {
  const router = useRouter();
  const [status, setStatus] = useState<QueueStatus>('Waiting');
  const [chair, setChair] = useState('Not Assigned');
  const [sentMessage, setSentMessage] = useState(false);

  const sendToChair = () => {
    setStatus('In Chair');
    setChair('Chair 2');
    setSentMessage(true);
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button variant="ghost" className="-ml-2 text-muted-foreground" onClick={() => router.push('/')}>
            <ArrowLeft className="size-4" />Return to Queue
          </Button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/80">Queue Detail</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{PATIENT.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{QUEUE.number} · {QUEUE.appointmentType} · {QUEUE.dentist}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status === 'Waiting' ? 'warning' : 'success'}>{status}</Badge>
          <Badge>{QUEUE.priority} priority</Badge>
        </div>
      </div>

      {sentMessage && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 className="size-5" />Patient sent to chair successfully.</div>}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">SD</span><div><p className="text-lg font-bold text-foreground">{PATIENT.name}</p><p className="text-sm text-muted-foreground">{PATIENT.code} · {PATIENT.phone}</p></div></div>
          <div className="flex flex-wrap gap-2"><Badge tone={status === 'Waiting' ? 'warning' : 'success'}>{status}</Badge><Badge>{QUEUE.priority}</Badge><Badge>{QUEUE.dentist}</Badge></div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><Clock3 className="size-5 text-primary" />Queue Information</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Queue number" value={QUEUE.number} /><Detail label="Queue status" value={status} /><Detail label="Priority" value={QUEUE.priority} /><Detail label="Waiting time" value="Waiting: 12 minutes" icon={<Clock3 className="size-4" />} />
          <Detail label="Check-in time" value={QUEUE.checkInTime} /><Detail label="Appointment time" value={QUEUE.appointmentTime} icon={<CalendarDays className="size-4" />} /><Detail label="Assigned dentist" value={QUEUE.dentist} icon={<User className="size-4" />} /><Detail label="Chair / room" value={chair} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><User className="size-5 text-primary" />Patient Summary</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Detail label="Patient code" value={PATIENT.code} /><Detail label="Phone" value={PATIENT.phone} icon={<Phone className="size-4" />} /><Detail label="Date of birth / age" value={`${PATIENT.dateOfBirth} · ${PATIENT.age} years`} /><Detail label="Gender" value={PATIENT.gender} /><Detail label="Appointment type" value={QUEUE.appointmentType} icon={<Stethoscope className="size-4" />} /><Detail label="Reason for visit" value={QUEUE.reason} /></div><Button variant="outline" className="mt-4" onClick={() => router.push('/patients')}><User className="size-4" />View Patient Profile</Button></section>
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><AlertTriangle className="size-5 text-amber-600" />Medical Alerts</h2><div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><div><p className="text-xs font-bold uppercase tracking-wide">Medical Alert</p><p className="mt-1 font-semibold">{PATIENT.allergy} Allergy</p><p className="mt-1 text-xs opacity-80">Review before prescribing or beginning treatment.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Detail label="Medical conditions" value={PATIENT.conditions} /><Detail label="Current medication" value={PATIENT.medication} /><Detail label="Consent status" value={PATIENT.consent} icon={<ShieldCheck className="size-4" />} /></div></section>
        </div>
        <aside className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><FileText className="size-5 text-primary" />Appointment Summary</h2><div className="mt-4 space-y-3"><Detail label="Appointment type" value={QUEUE.appointmentType} /><Detail label="Appointment time" value={QUEUE.appointmentTime} /><Detail label="Dentist" value={QUEUE.dentist} /><Detail label="Reason for visit" value={QUEUE.reason} /><Detail label="Appointment status" value="Confirmed" /></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Next action</p>{status === 'Waiting' ? <><p className="mt-2 text-sm text-muted-foreground">Everything is ready for the dentist to call this patient.</p><Button className="mt-4 w-full" onClick={sendToChair}><Stethoscope className="size-4" />Send to Chair</Button></> : <><p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Patient is ready in {chair}.</p><Button className="mt-4 w-full" onClick={() => router.push('/clinical-examination')}><Stethoscope className="size-4" />Open Examination</Button></>}</section></aside>
      </div>
    </div>
  );
}