'use client';

import { Lock } from 'lucide-react';
import { CURRENT_USER, todayLabel } from '../patient-context';

export function LockedRecordBanner() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/50">
      <div className="flex items-center gap-2">
        <Lock className="size-4 text-slate-500 dark:text-slate-400" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Locked Clinical Record</span>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Completed on: {todayLabel()} · Completed by: {CURRENT_USER}
      </p>
    </div>
  );
}