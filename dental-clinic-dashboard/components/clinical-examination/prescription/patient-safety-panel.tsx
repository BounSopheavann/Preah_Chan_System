'use client';

import { AlertTriangle, ShieldAlert, HeartPulse, Pill, User } from 'lucide-react';
import { PATIENT } from '../patient-context';

export function PatientSafetyPanel() {
  const hasAllergy = PATIENT.allergies.length > 0;

  return (
    <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-primary/10 p-2 text-primary">
          <ShieldAlert className="size-4" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-foreground">Patient Safety</h3>
          <p className="text-xs text-muted-foreground">Review before prescribing</p>
        </div>
      </div>

      {hasAllergy && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 dark:border-rose-500/40 dark:bg-rose-500/10">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Warning — Known Drug Allergy
            </p>
            <p className="mt-0.5 text-sm font-semibold text-rose-800 dark:text-rose-200">
              {PATIENT.allergies.join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <SafetyRow icon={<User className="size-3.5" />} label="Patient" value={`${PATIENT.name} (${PATIENT.code})`} />
        <SafetyRow icon={<HeartPulse className="size-3.5" />} label="Age / Sex" value={`${PATIENT.age} yrs · ${PATIENT.sex}`} />
        <SafetyRow
          icon={<AlertTriangle className="size-3.5" />}
          label="Medical Conditions"
          value={PATIENT.medicalConditions.join(', ')}
          danger={false}
        />
        <SafetyRow
          icon={<AlertTriangle className="size-3.5" />}
          label="Known Allergies"
          value={PATIENT.allergies.join(', ')}
          danger={hasAllergy}
        />
        <SafetyRow icon={<Pill className="size-3.5" />} label="Current Medications" value={PATIENT.currentMedications.join(', ')} />
      </div>

      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        <p className="font-semibold">Important Medical Alerts</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {PATIENT.alerts.map((alert) => (
            <li key={alert}>{alert}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SafetyRow({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`mt-1 text-sm font-semibold ${danger ? 'text-rose-700 dark:text-rose-300' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}