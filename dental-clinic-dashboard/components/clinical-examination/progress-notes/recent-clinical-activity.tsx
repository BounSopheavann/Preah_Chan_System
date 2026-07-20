'use client';

import { Activity, CircleDot } from 'lucide-react';
import { recentActivitySeed } from './progress-notes-data';

const dotColor: Record<string, string> = {
  note: 'bg-fuchsia-500',
  treatment: 'bg-sky-500',
  diagnosis: 'bg-emerald-500',
  odontogram: 'bg-cyan-500',
};

export function RecentClinicalActivity() {
  return (
    <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-primary/10 p-2 text-primary">
          <Activity className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Clinical timeline</p>
        </div>
      </div>
      <div className="space-y-3">
        {recentActivitySeed.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <CircleDot className={`size-2.5 ${dotColor[item.type]} mt-1.5`} />
              {i < recentActivitySeed.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="flex-1 pb-1">
              <p className="text-xs font-semibold text-foreground">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}