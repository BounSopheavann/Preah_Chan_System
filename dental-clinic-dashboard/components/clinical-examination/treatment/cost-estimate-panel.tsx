'use client';

import { DollarSign, Info } from 'lucide-react';
import type { TreatmentPlanData } from './treatment-data';

interface CostEstimatePanelProps {
  plan: TreatmentPlanData;
}

export function CostEstimatePanel({ plan }: CostEstimatePanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-primary/10 p-2 text-primary">
          <DollarSign className="size-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-foreground">Cost Estimate</h3>
          <p className="text-xs text-muted-foreground">Treatment cost summary</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-sm font-bold text-foreground">${plan.subtotal}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
          <span className="text-sm text-muted-foreground">Discount</span>
          <span className="text-sm font-bold text-rose-600">-${plan.discount}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-3 dark:bg-primary/10">
          <span className="text-sm font-bold text-foreground">Estimated Total</span>
          <span className="text-lg font-bold text-primary">${plan.estimatedTotal}</span>
        </div>
        <div className="mt-3 border-t border-border pt-3 space-y-2">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Insurance Estimate</span>
            <span className="text-xs font-semibold text-foreground">${plan.insuranceEstimate}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Patient Estimated Share</span>
            <span className="text-xs font-semibold text-foreground">${plan.patientShare}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Approved Amount</span>
            <span className="text-xs font-semibold text-emerald-600">${plan.approvedAmount}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs text-muted-foreground">Remaining Estimate</span>
            <span className="text-xs font-semibold text-amber-600">${plan.remainingEstimate}</span>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Info className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300">Estimate only. Final charges may vary.</p>
        </div>
      </div>
    </div>
  );
}