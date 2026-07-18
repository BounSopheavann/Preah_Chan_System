'use client';

import { Activity, AlertTriangle, Ban, CheckCircle2, ClipboardList } from 'lucide-react';
import type { DiagnosisRecord } from './diagnosis-data';

interface DiagnosisSummaryProps {
  diagnoses: DiagnosisRecord[];
}

export function DiagnosisSummary({ diagnoses }: DiagnosisSummaryProps) {
  const activeCount = diagnoses.filter((d) => d.status === 'Active').length;
  const urgentCount = diagnoses.filter((d) => d.priority === 'Urgent' || d.priority === 'Emergency').length;
  const monitoredCount = diagnoses.filter((d) => d.status === 'Monitored').length;
  const resolvedCount = diagnoses.filter((d) => d.status === 'Resolved').length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryCard
        icon={<ClipboardList className="size-5" />}
        label="Active Problems"
        value={activeCount}
        color="text-emerald-600 dark:text-emerald-400"
        bg="bg-emerald-500/10"
      />
      <SummaryCard
        icon={<AlertTriangle className="size-5" />}
        label="Urgent Problems"
        value={urgentCount}
        color="text-rose-600 dark:text-rose-400"
        bg="bg-rose-500/10"
      />
      <SummaryCard
        icon={<Activity className="size-5" />}
        label="Monitored Problems"
        value={monitoredCount}
        color="text-amber-600 dark:text-amber-400"
        bg="bg-amber-500/10"
      />
      <SummaryCard
        icon={<CheckCircle2 className="size-5" />}
        label="Resolved Problems"
        value={resolvedCount}
        color="text-slate-600 dark:text-slate-400"
        bg="bg-slate-500/10"
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
      <div className="flex items-center gap-3">
        <span className={`flex size-11 items-center justify-center rounded-2xl ${bg} ${color}`}>
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}