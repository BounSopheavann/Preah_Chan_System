'use client';

import { Syringe, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { anesthesiaOptions, injectionSites } from './treatment-execution-data';
import type { AnesthesiaRecord } from './treatment-execution-data';

interface AnesthesiaSectionProps {
  enabled: boolean;
  anesthesia: AnesthesiaRecord;
  onToggle: (enabled: boolean) => void;
  onChange: (record: AnesthesiaRecord) => void;
}

export function AnesthesiaSection({ enabled, anesthesia, onToggle, onChange }: AnesthesiaSectionProps) {
  const selectClass = 'h-9 rounded-xl border border-border bg-background/70 px-3 text-xs font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 w-full';

  if (!enabled) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Syringe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Local Anesthesia</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onToggle(true)}>
            <Plus className="size-3.5" />
            Add Anesthesia
          </Button>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof AnesthesiaRecord, value: string | number) => {
    onChange({ ...anesthesia, [field]: value });
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Syringe className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-bold text-amber-800 dark:text-amber-200">Local Anesthesia Used</span>
        </div>
        <button
          type="button"
          onClick={() => onToggle(false)}
          className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        >
          <X className="size-3" /> Remove
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          Drug
          <select value={anesthesia.drug} onChange={(e) => handleChange('drug', e.target.value)} className={selectClass}>
            <option value="">Select drug...</option>
            {anesthesiaOptions.map((opt) => (
              <option key={opt.drug} value={opt.drug}>{opt.drug}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          Dosage
          <input type="text" value={anesthesia.dosage} onChange={(e) => handleChange('dosage', e.target.value)} placeholder="e.g. 1.8 mL" className={selectClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          Quantity (cartridges)
          <input type="number" min={1} value={anesthesia.quantity} onChange={(e) => handleChange('quantity', Number(e.target.value))} className={selectClass} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          Injection Site
          <select value={anesthesia.injectionSite} onChange={(e) => handleChange('injectionSite', e.target.value)} className={selectClass}>
            <option value="">Select site...</option>
            {injectionSites.map((site) => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <label className="flex flex-col gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Notes <span className="text-[10px] font-normal">(optional)</span>
            <input type="text" value={anesthesia.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any notes about the anesthesia..." className={selectClass} />
          </label>
        </div>
      </div>
    </div>
  );
}