'use client';

import { AlertTriangle, User, Scan, ClipboardList, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PATIENT } from '@/components/clinical-examination/patient-context';
import type { TreatmentSession } from './treatment-execution-data';

interface PatientContextHeaderProps {
  session: TreatmentSession;
}

export function PatientContextHeader({ session }: PatientContextHeaderProps) {
  const hasAllergies = PATIENT.allergies.length > 0;
  const hasConditions = PATIENT.medicalConditions.length > 0;
  const hasAlerts = hasAllergies || hasConditions;

  return (
    <div className="rounded-xl border border-border bg-card/95 p-3.5 sm:p-4 shadow-sm">
      {/* Main row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Patient info */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm">
            {PATIENT.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-foreground leading-tight">{PATIENT.name}</h2>
              <span className="rounded-md border border-border bg-muted/50 px-1.5 py-0.25 text-[11px] font-semibold text-muted-foreground">{PATIENT.code}</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {session.status}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span>Age: <strong className="text-foreground/90 font-semibold">{PATIENT.age}</strong></span>
              <span className="text-muted-foreground/30">•</span>
              <span>Sex: <strong className="text-foreground/90 font-semibold">{PATIENT.sex}</strong></span>
              <span className="text-muted-foreground/30">•</span>
              <span>Appt: <strong className="text-foreground/90 font-semibold">{session.appointmentDate} @ {session.appointmentTime}</strong></span>
              <span className="text-muted-foreground/30">•</span>
              <span>Dentist: <strong className="text-foreground/90 font-semibold">{session.dentist}</strong></span>
              <span className="text-muted-foreground/30">•</span>
              <span>Session: <strong className="text-foreground/90 font-semibold">{session.id}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick access links */}
        <div className="flex flex-wrap gap-1.5">
          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
            <User className="mr-1.5 h-3.5 w-3.5" />
            Patient Profile
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
            <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
            Odontogram
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
            <Scan className="mr-1.5 h-3.5 w-3.5" />
            X-rays
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
            <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
            Previous Notes
          </Button>
        </div>
      </div>

      {/* Medical alerts strip */}
      {hasAlerts && (
        <div className="mt-3 flex flex-col gap-1.5 rounded-lg border border-red-200/40 bg-red-500/5 px-3 py-2 text-xs sm:flex-row sm:items-center dark:border-red-500/10">
          <span className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400 shrink-0 uppercase tracking-wider text-[10px]">
            <AlertTriangle className="h-3.5 w-3.5" />
            Medical Alerts:
          </span>
          <div className="flex flex-wrap gap-2">
            {/* Penicillin Allergy Badge */}
            <span className="inline-flex items-center gap-1.5 rounded bg-rose-500/10 px-2 py-0.5 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/20">
              <span>Allergy: Penicillin</span>
              <span className="text-rose-400/50 font-normal">|</span>
              <span className="text-[11px] font-normal text-rose-600/90 dark:text-rose-400/90">Avoid beta-lactams</span>
            </span>

            {/* Diabetes Condition Badge */}
            <span className="inline-flex items-center gap-1.5 rounded bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/20">
              <span>Diabetes (Type 2)</span>
              <span className="text-amber-400/50 font-normal">|</span>
              <span className="text-[11px] font-normal text-amber-600/90 dark:text-amber-400/90">Metformin 500mg bid</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
