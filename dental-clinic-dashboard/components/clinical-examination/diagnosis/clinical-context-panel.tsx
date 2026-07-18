'use client';

import { AlertTriangle, Brain, ClipboardList, Scan, Stethoscope } from 'lucide-react';

export function ClinicalContextPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-primary/10 p-2 text-primary">
          <Brain className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-foreground">Clinical Context</h3>
          <p className="text-xs text-muted-foreground">Review findings while diagnosing</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Chief Complaint */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ClipboardList className="size-3.5" />
            Chief Complaint
          </div>
          <p className="text-sm font-semibold text-foreground">
            Pain while chewing on upper left molar.
          </p>
        </div>

        {/* Pain Level */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="size-3.5" />
            Pain Level
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-amber-400 to-rose-500" />
            </div>
            <span className="text-sm font-bold text-foreground">7 / 10</span>
          </div>
        </div>

        {/* Key Clinical Finding */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Stethoscope className="size-3.5" />
            Clinical Finding
          </div>
          <p className="text-sm font-semibold text-foreground">
            Deep caries on tooth 26.
          </p>
        </div>

        {/* Odontogram Findings */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ClipboardList className="size-3.5" />
            Odontogram
          </div>
          <p className="text-sm font-semibold text-foreground">Tooth 26</p>
          <p className="text-xs text-muted-foreground">Occlusal + Distal Caries</p>
        </div>

        {/* X-ray Findings */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/20">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Scan className="size-3.5" />
            X-ray
          </div>
          <p className="text-sm font-semibold text-foreground">PA Tooth 26</p>
          <p className="text-xs text-muted-foreground">Possible pulpal involvement</p>
        </div>

        {/* Medical Alert */}
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            <AlertTriangle className="size-3.5" />
            Medical Alert
          </div>
          <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
            Penicillin Allergy
          </p>
        </div>
      </div>
    </div>
  );
}