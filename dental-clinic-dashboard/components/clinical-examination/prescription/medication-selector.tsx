'use client';

import { AlertTriangle, Pill, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { medicationCatalog } from './prescription-data';

interface MedicationSelectorProps {
  onSelect: (name: string) => void;
  onCustom: (name: string) => void;
}

export function MedicationSelector({ onSelect, onCustom }: MedicationSelectorProps) {
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = medicationCatalog.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.genericName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        Medication Name <span className="text-destructive">*</span>
      </label>
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search medication..."
            className="h-10 w-full rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
          />
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border border-border bg-popover p-1 shadow-xl">
            {filtered.map((m) => (
              <button
                key={m.name}
                type="button"
                onClick={() => {
                  onSelect(m.name);
                  setQuery(m.name);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"
              >
                <Pill className="size-3.5 text-primary" />
                <span className="font-semibold">{m.name}</span>
                <span className="text-xs text-muted-foreground">({m.genericName})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or enter custom medication..."
          className="h-10 flex-1 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
        />
        <button
          type="button"
          onClick={() => {
            if (custom.trim()) {
              onCustom(custom.trim());
              setCustom('');
            }
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
        >
          <Plus className="size-4" />
          Custom
        </button>
      </div>
    </div>
  );
}

interface AllergyWarningModalProps {
  isOpen: boolean;
  medicationName: string;
  allergy: string;
  onCancel: () => void;
  onAcknowledge: () => void;
}

export function AllergyWarningModal({
  isOpen,
  medicationName,
  allergy,
  onCancel,
  onAcknowledge,
}: AllergyWarningModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-rose-300 bg-card p-6 shadow-2xl dark:border-rose-500/40">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">Medication Safety Warning</h2>
            <p className="text-sm text-muted-foreground">Patient has a recorded allergy.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
          <p className="text-rose-800 dark:text-rose-200">
            This patient has a recorded <strong>{allergy}</strong> allergy.
          </p>
          <p className="font-semibold text-foreground">Selected Medication:</p>
          <p className="rounded-lg bg-background/60 px-3 py-2 font-semibold text-foreground">{medicationName}</p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button onClick={onCancel} variant="outline">
            Cancel Selection
          </Button>
          <Button onClick={onAcknowledge} className="bg-rose-600 text-white hover:bg-rose-700">
            Acknowledge Warning
          </Button>
        </div>
      </div>
    </div>
  );
}