'use client';

import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { diagnosisSeverities, diagnosisPriorities, diagnosisStatuses, diagnosisSources } from './diagnosis-data';

interface DiagnosisFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  toothFilter: string;
  onToothFilterChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  onReset: () => void;
}

export function DiagnosisFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  severityFilter,
  onSeverityFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  toothFilter,
  onToothFilterChange,
  sourceFilter,
  onSourceFilterChange,
  onReset,
}: DiagnosisFiltersProps) {
  const filterSelectClass =
    'h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 min-w-0';

  const hasFilters = search || statusFilter !== 'All' || severityFilter !== 'All' || priorityFilter !== 'All' || toothFilter || sourceFilter !== 'All';

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search diagnosis..."
          className="h-10 w-full rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className={filterSelectClass}>
          <option value="All">All Status</option>
          {diagnosisStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <select value={severityFilter} onChange={(e) => onSeverityFilterChange(e.target.value)} className={filterSelectClass}>
          <option value="All">All Severity</option>
          {diagnosisSeverities.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <select value={priorityFilter} onChange={(e) => onPriorityFilterChange(e.target.value)} className={filterSelectClass}>
          <option value="All">All Priority</option>
          {diagnosisPriorities.map((p) => (<option key={p} value={p}>{p}</option>))}
        </select>
        <input
          type="text"
          value={toothFilter}
          onChange={(e) => onToothFilterChange(e.target.value)}
          placeholder="Tooth #"
          className={filterSelectClass}
        />
        <select value={sourceFilter} onChange={(e) => onSourceFilterChange(e.target.value)} className={filterSelectClass}>
          <option value="All">All Sources</option>
          {diagnosisSources.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" />
            Reset Filters
          </Button>
          <span className="text-xs text-muted-foreground">Active filters applied</span>
        </div>
      )}
    </div>
  );
}