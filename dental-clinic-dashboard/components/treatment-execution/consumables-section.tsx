'use client';

import { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { consumableOptions } from './treatment-execution-data';
import type { ConsumableRecord } from './treatment-execution-data';

interface ConsumablesSectionProps {
  consumables: ConsumableRecord[];
  onChange: (consumables: ConsumableRecord[]) => void;
}

export function ConsumablesSection({ consumables, onChange }: ConsumablesSectionProps) {
  const selectClass = 'h-9 rounded-xl border border-border bg-background/70 px-3 text-xs font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 w-full';

  const addConsumable = () => {
    const newItem: ConsumableRecord = {
      id: `con-${Date.now()}`,
      material: '',
      quantityUsed: 1,
      batchLot: '',
      notes: '',
    };
    onChange([...consumables, newItem]);
  };

  const removeConsumable = (id: string) => {
    onChange(consumables.filter((c) => c.id !== id));
  };

  const updateConsumable = (id: string, field: keyof ConsumableRecord, value: string | number) => {
    onChange(consumables.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Consumables / Materials</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{consumables.length}</span>
        </div>
        <Button variant="outline" size="sm" onClick={addConsumable}>
          <Plus className="size-3.5" />
          Add Material
        </Button>
      </div>

      {consumables.length === 0 && (
        <p className="text-xs text-muted-foreground">No consumables added yet. Click "Add Material" to record materials used.</p>
      )}

      <div className="space-y-3">
        {consumables.map((item) => (
          <div key={item.id} className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-background/50 p-3 dark:bg-background/20">
            <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold text-muted-foreground min-w-[140px]">
              Material / Product
              <select value={item.material} onChange={(e) => updateConsumable(item.id, 'material', e.target.value)} className={selectClass}>
                <option value="">Select...</option>
                {consumableOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-semibold text-muted-foreground w-20">
              Qty
              <input type="number" min={1} value={item.quantityUsed} onChange={(e) => updateConsumable(item.id, 'quantityUsed', Number(e.target.value))} className={selectClass} />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold text-muted-foreground min-w-[100px]">
              Batch/Lot <span className="text-[9px] font-normal">(optional)</span>
              <input type="text" value={item.batchLot} onChange={(e) => updateConsumable(item.id, 'batchLot', e.target.value)} placeholder="e.g. B2026-01" className={selectClass} />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-[10px] font-semibold text-muted-foreground min-w-[120px]">
              Notes <span className="text-[9px] font-normal">(optional)</span>
              <input type="text" value={item.notes} onChange={(e) => updateConsumable(item.id, 'notes', e.target.value)} placeholder="Notes..." className={selectClass} />
            </label>
            <button
              type="button"
              onClick={() => removeConsumable(item.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}