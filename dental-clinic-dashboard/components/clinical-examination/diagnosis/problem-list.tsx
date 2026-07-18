'use client';

import { ChevronsUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { DiagnosisRecord } from './diagnosis-data';
import {
  priorityBadgeColor,
  severityBadgeColor,
  sourceBadgeColor,
  statusBadgeColor,
} from './diagnosis-data';

interface ProblemListProps {
  diagnoses: DiagnosisRecord[];
  onSelect: (diagnosis: DiagnosisRecord) => void;
  onResolve: (diagnosis: DiagnosisRecord) => void;
  onAddToTreatmentPlan: (diagnosis: DiagnosisRecord) => void;
  selectedId: string | null;
}

type SortKey = 'diagnosisName' | 'toothNumber' | 'severity' | 'priority' | 'dateIdentified' | 'status';
type SortDir = 'asc' | 'desc';

export function ProblemList({
  diagnoses,
  onSelect,
  onResolve,
  onAddToTreatmentPlan,
  selectedId,
}: ProblemListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const priorityOrder = { Emergency: 0, Urgent: 1, Recommended: 2, Routine: 3 };
  const severityOrder = { Severe: 0, Moderate: 1, Mild: 2 };
  const statusOrder = { Active: 0, Monitored: 1, Resolved: 2 };

  const sorted = [...diagnoses].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'priority') cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
    else if (sortKey === 'severity') cmp = severityOrder[a.severity] - severityOrder[b.severity];
    else if (sortKey === 'status') cmp = statusOrder[a.status] - statusOrder[b.status];
    else if (sortKey === 'dateIdentified') cmp = a.dateIdentified.localeCompare(b.dateIdentified);
    else if (sortKey === 'toothNumber') cmp = a.toothNumber.localeCompare(b.toothNumber);
    else cmp = a.diagnosisName.localeCompare(b.diagnosisName);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortHeader = ({ label, sortKey: sk }: { label: string; sortKey: SortKey }) => (
    <th className="px-3 py-3">
      <button
        type="button"
        onClick={() => handleSort(sk)}
        className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-normal transition-colors hover:text-foreground ${
          sortKey === sk ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        {label}
        <ChevronsUpDown className="size-3.5" />
      </button>
    </th>
  );

  if (diagnoses.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1000px] w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl">
          <tr>
            <SortHeader label="Diagnosis" sortKey="diagnosisName" />
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Code</th>
            <SortHeader label="Tooth" sortKey="toothNumber" />
            <SortHeader label="Severity" sortKey="severity" />
            <SortHeader label="Priority" sortKey="priority" />
            <SortHeader label="Date" sortKey="dateIdentified" />
            <SortHeader label="Status" sortKey="status" />
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Source</th>
            <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-normal text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((dx) => (
            <tr
              key={dx.id}
              className={`border-t border-border/60 transition-all cursor-pointer hover:bg-primary/5 ${
                selectedId === dx.id ? 'bg-primary/5' : ''
              }`}
              onClick={() => onSelect(dx)}
            >
              <td className="px-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{dx.diagnosisName}</p>
                </div>
              </td>
              <td className="px-3 py-3">
                <span className="text-xs font-mono font-semibold text-muted-foreground">{dx.diagnosisCode}</span>
              </td>
              <td className="px-3 py-3">
                <span className="text-sm font-semibold text-foreground">{dx.toothNumber}</span>
              </td>
              <td className="px-3 py-3">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${severityBadgeColor[dx.severity]}`}>
                  {dx.severity}
                </span>
              </td>
              <td className="px-3 py-3">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeColor[dx.priority]}`}>
                  {dx.priority}
                </span>
              </td>
              <td className="px-3 py-3 text-sm text-muted-foreground">{dx.dateIdentified}</td>
              <td className="px-3 py-3">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeColor[dx.status]}`}>
                  {dx.status}
                </span>
              </td>
              <td className="px-3 py-3">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sourceBadgeColor[dx.source]}`}>
                  {dx.source}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <div className="relative flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onResolve(dx); }}
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background/70 px-2 text-[11px] font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === dx.id ? null : dx.id); }}
                    className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>
                  {menuOpen === dx.id && (
                    <div className="absolute right-0 top-8 z-20 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 text-sm text-popover-foreground shadow-xl">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onSelect(dx); setMenuOpen(null); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAddToTreatmentPlan(dx); setMenuOpen(null); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        Add to Treatment Plan
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onResolve(dx); setMenuOpen(null); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}