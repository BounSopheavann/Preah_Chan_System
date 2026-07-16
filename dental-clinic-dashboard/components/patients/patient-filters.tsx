'use client';

import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { ConsentStatus, PatientGender, PatientStatus } from './patient-data';

export interface PatientFilterState {
  status: PatientStatus | 'All';
  gender: PatientGender | 'All';
  consent: ConsentStatus | 'All';
}

interface PatientFiltersProps {
  filters: PatientFilterState;
  onChange: (filters: PatientFilterState) => void;
  onReset: () => void;
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-semibold text-muted-foreground md:max-w-44">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PatientFilters({ filters, onChange, onReset }: PatientFiltersProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-xl theme-surface-shadow">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </span>
          Filters
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] xl:flex xl:flex-1 xl:justify-end">
          <FilterSelect
            label="Status"
            value={filters.status}
            options={['All', 'Active', 'Inactive']}
            onChange={(status) => onChange({ ...filters, status })}
          />
          <FilterSelect
            label="Gender"
            value={filters.gender}
            options={['All', 'Male', 'Female', 'Other']}
            onChange={(gender) => onChange({ ...filters, gender })}
          />
          <FilterSelect
            label="Consent"
            value={filters.consent}
            options={['All', 'Accepted', 'Pending', 'Declined']}
            onChange={(consent) => onChange({ ...filters, consent })}
          />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-4 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/30 dark:bg-background/30"
          >
            <RotateCcw className="size-4" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
