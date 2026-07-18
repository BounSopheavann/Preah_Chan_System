'use client';

import { Clock3, DollarSign, ListChecks, TriangleAlert } from 'lucide-react';
import type { TreatmentItem } from './treatment-data';

interface TreatmentSummaryProps {
  items: TreatmentItem[];
}

export function TreatmentSummary({ items }: TreatmentSummaryProps) {
  const totalProcedures = items.length;
  const urgentCount = items.filter((i) => i.priority === 'Urgent' || i.priority === 'Emergency').length;
  const totalMinutes = items.reduce((acc, i) => {
    const match = i.estimatedDuration.match(/(\d+)/);
    return acc + (match ? parseInt(match[1]) : 0);
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalCost = items.reduce((acc, i) => acc + i.total, 0);
  const approvedAmount = items.filter((i) => i.status === 'Approved').reduce((acc, i) => acc + i.total, 0);
  const remaining = totalCost - approvedAmount;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <SummaryCard icon={<ListChecks className="size-5" />} label="Total Procedures" value={String(totalProcedures)} color="text-primary" bg="bg-primary/10" />
      <SummaryCard icon={<TriangleAlert className="size-5" />} label="Urgent" value={String(urgentCount)} color="text-rose-600 dark:text-rose-400" bg="bg-rose-500/10" />
      <SummaryCard icon={<Clock3 className="size-5" />} label="Est. Duration" value={`${hours}h ${mins}m`} color="text-violet-600 dark:text-violet-400" bg="bg-violet-500/10" />
      <SummaryCard icon={<DollarSign className="size-5" />} label="Est. Cost" value={`$${totalCost}`} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-500/10" />
      <SummaryCard icon={<DollarSign className="size-5" />} label="Approved" value={`$${approvedAmount}`} color="text-sky-600 dark:text-sky-400" bg="bg-sky-500/10" />
      <SummaryCard icon={<DollarSign className="size-5" />} label="Remaining" value={`$${remaining}`} color="text-amber-600 dark:text-amber-400" bg="bg-amber-500/10" />
    </div>
  );
}

function SummaryCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-3 backdrop-blur-xl theme-surface-shadow">
      <div className="flex items-center gap-2">
        <span className={`flex size-9 items-center justify-center rounded-xl ${bg} ${color}`}>{icon}</span>
        <div>
          <p className="text-lg font-bold text-foreground">{value}</p>
          <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}