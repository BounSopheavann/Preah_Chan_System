'use client';

import { ChevronsUpDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { TreatmentItem } from './treatment-data';
import { priorityBadgeColor, treatmentStatusBadgeColor } from './treatment-data';

interface TreatmentItemsTableProps {
  items: TreatmentItem[];
  onSelect: (item: TreatmentItem) => void;
  onEdit: (item: TreatmentItem) => void;
  onRemove: (item: TreatmentItem) => void;
  onMoveUp: (itemId: string) => void;
  onMoveDown: (itemId: string) => void;
  selectedId: string | null;
}

type SortKey = 'sequence' | 'procedure' | 'priority' | 'unitPrice' | 'total' | 'status';
type SortDir = 'asc' | 'desc';

export function TreatmentItemsTable({ items, onSelect, onEdit, onRemove, onMoveUp, onMoveDown, selectedId }: TreatmentItemsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('sequence');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const priorityOrder = { Emergency: 0, Urgent: 1, Recommended: 2, Optional: 3 };
  const sorted = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'sequence') cmp = a.sequence - b.sequence;
    else if (sortKey === 'priority') cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
    else if (sortKey === 'unitPrice') cmp = a.unitPrice - b.unitPrice;
    else if (sortKey === 'total') cmp = a.total - b.total;
    else cmp = a.procedure.localeCompare(b.procedure);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortHeader = ({ label, sortKey: sk }: { label: string; sortKey: SortKey }) => (
    <th className="px-3 py-3">
      <button type="button" onClick={() => handleSort(sk)} className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-normal transition-colors hover:text-foreground ${sortKey === sk ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}<ChevronsUpDown className="size-3.5" />
      </button>
    </th>
  );

  if (items.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1200px] w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">#</th>
            <SortHeader label="Procedure" sortKey="procedure" />
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Code</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Diagnosis</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Tooth</th>
            <SortHeader label="Priority" sortKey="priority" />
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Duration</th>
            <SortHeader label="Price" sortKey="unitPrice" />
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-normal text-muted-foreground">Qty</th>
            <SortHeader label="Total" sortKey="total" />
            <SortHeader label="Status" sortKey="status" />
            <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-normal text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, idx) => (
            <tr key={item.id} className={`border-t border-border/60 transition-all cursor-pointer hover:bg-primary/5 ${selectedId === item.id ? 'bg-primary/5' : ''}`} onClick={() => onSelect(item)}>
              <td className="px-3 py-3 text-sm font-bold text-muted-foreground">{item.sequence}</td>
              <td className="px-3 py-3"><p className="text-sm font-semibold text-foreground">{item.procedure}</p></td>
              <td className="px-3 py-3"><span className="text-xs font-mono font-semibold text-muted-foreground">{item.procedureCode}</span></td>
              <td className="px-3 py-3 max-w-36"><p className="truncate text-xs text-muted-foreground" title={item.linkedDiagnosis}>{item.linkedDiagnosis}</p></td>
              <td className="px-3 py-3"><span className="text-sm font-semibold text-foreground">{item.toothArea}</span></td>
              <td className="px-3 py-3"><span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeColor[item.priority]}`}>{item.priority}</span></td>
              <td className="px-3 py-3 text-sm text-muted-foreground">{item.estimatedDuration}</td>
              <td className="px-3 py-3 text-sm font-semibold text-foreground">${item.unitPrice}</td>
              <td className="px-3 py-3 text-sm text-foreground">{item.quantity}</td>
              <td className="px-3 py-3 text-sm font-bold text-primary">${item.total}</td>
              <td className="px-3 py-3"><span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${treatmentStatusBadgeColor[item.status]}`}>{item.status}</span></td>
              <td className="px-3 py-3 text-right">
                <div className="relative flex items-center justify-end gap-1">
                  <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background/70 px-2 text-[11px] font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30">Edit</button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === item.id ? null : item.id); }} className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background/30"><MoreHorizontal className="size-3.5" /></button>
                  {menuOpen === item.id && (
                    <div className="absolute right-0 top-8 z-20 w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 text-sm text-popover-foreground shadow-xl">
                      <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(item); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted">Edit Item</button>
                      {idx > 0 && <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp(item.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted">Move Up</button>}
                      {idx < items.length - 1 && <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown(item.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted">Move Down</button>}
                      <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(item); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950">Remove from Plan</button>
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