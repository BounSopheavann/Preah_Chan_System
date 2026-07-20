'use client';

import { Search, X } from 'lucide-react';

const selectClass =
  'h-9 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

const quickFilters = [
  { label: 'All', value: 'All' },
  { label: 'Examination', value: 'Examination' },
  { label: 'Treatment', value: 'Treatment' },
  { label: 'Follow-up', value: 'Follow-up' },
  { label: 'Communication', value: 'Patient Communication' },
];

export function ProgressNoteFilters({
  search,
  onSearchChange,
  noteType,
  onNoteTypeChange,
  author,
  onAuthorChange,
  dateRange,
  onDateRangeChange,
  onReset,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  noteType: string;
  onNoteTypeChange: (v: string) => void;
  author: string;
  onAuthorChange: (v: string) => void;
  dateRange: string;
  onDateRangeChange: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="h-9 w-full rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
          />
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
            Note Type
            <select value={noteType} onChange={(e) => onNoteTypeChange(e.target.value)} className={selectClass}>
              <option value="All">All Types</option>
              <option value="Examination">Examination</option>
              <option value="Procedure">Procedure</option>
              <option value="Treatment">Treatment</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Patient Communication">Patient Communication</option>
              <option value="Consultation">Consultation</option>
              <option value="Referral">Referral</option>
              <option value="General">General</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
            Author
            <select value={author} onChange={(e) => onAuthorChange(e.target.value)} className={selectClass}>
              <option value="All">All Authors</option>
              <option value="Dr. Maya">Dr. Maya</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-muted-foreground">
            Date Range
            <select value={dateRange} onChange={(e) => onDateRangeChange(e.target.value)} className={selectClass}>
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quickFilters.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => onNoteTypeChange(chip.value)}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                noteType === chip.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {chip.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all hover:text-primary/80"
          >
            <X className="size-3" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}