'use client';

import { Play, Clock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlannedTreatmentItem } from './treatment-execution-data';
import { planItemStatusBadgeColor } from './treatment-execution-data';

interface PlannedTreatmentListProps {
  items: PlannedTreatmentItem[];
  onStartProcedure: (item: PlannedTreatmentItem) => void;
  highlightedItemId?: string | null;
}

export function PlannedTreatmentList({ items, onStartProcedure, highlightedItemId }: PlannedTreatmentListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/90 p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">No Treatment Items Planned</p>
        <p className="mt-1 text-xs text-muted-foreground">Create a treatment plan before starting execution.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/95 shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/20 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Today's Treatment Plan</h3>
          <p className="text-[11px] text-muted-foreground">{items.length} procedure{items.length !== 1 ? 's' : ''} scheduled for today</p>
        </div>
      </div>

      {/* Responsive Table for Desktop & Tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/10 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <th className="py-2 px-3 text-center w-8">#</th>
              <th className="py-2 px-3">Procedure</th>
              <th className="py-2 px-3 w-16 text-center">Tooth</th>
              <th className="py-2 px-3 w-20 text-center">Surface</th>
              <th className="py-2 px-3 w-20 text-center">Duration</th>
              <th className="py-2 px-3 w-20 text-right">Price</th>
              <th className="py-2 px-3 w-24 text-center">Priority</th>
              <th className="py-2 px-3 w-24 text-center">Status</th>
              <th className="py-2 px-3 w-36 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {items.map((item) => {
              const isCompleted = item.status === 'Completed';
              const isDeclined = item.status === 'Declined';
              const canStart = item.status === 'Planned' || item.status === 'In Progress';
              const isHighlighted = highlightedItemId === item.id;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-muted/5 ${
                    isHighlighted ? 'bg-emerald-50/70 dark:bg-emerald-500/10' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-center font-semibold text-muted-foreground">
                    {item.sequence}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground leading-snug">{item.procedure}</span>
                      {item.linkedDiagnosis && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <AlertCircle className="size-3 shrink-0 text-muted-foreground/60" />
                          {item.linkedDiagnosis}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center font-medium">
                    {item.toothArea}
                  </td>
                  <td className="py-2 px-3 text-center text-muted-foreground">
                    {item.toothSurface.length > 0 ? item.toothSurface.join(', ') : '-'}
                  </td>
                  <td className="py-2 px-3 text-center text-muted-foreground font-medium">
                    {item.estimatedDuration}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-foreground">
                    ${item.estimatedPrice}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      item.priority === 'Urgent'
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none ${planItemStatusBadgeColor[item.status]}`}>
                      {isHighlighted && isCompleted ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="size-2.5" />
                          Completed
                        </span>
                      ) : (
                        item.status
                      )}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    {canStart && !isCompleted && !isDeclined ? (
                      <Button
                        onClick={() => onStartProcedure(item)}
                        size="xs"
                        className="h-7 px-2.5 text-[11px]"
                      >
                        <Play className="mr-1 size-3" />
                        {item.status === 'In Progress' ? 'Resume' : 'Start'}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 italic pr-3">
                        {isCompleted ? 'Done' : 'Declined'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stacked Cards for Mobile Screen sizes */}
      <div className="block md:hidden divide-y divide-border">
        {items.map((item) => {
          const isCompleted = item.status === 'Completed';
          const isDeclined = item.status === 'Declined';
          const canStart = item.status === 'Planned' || item.status === 'In Progress';
          const isHighlighted = highlightedItemId === item.id;

          return (
            <div
              key={item.id}
              className={`space-y-2 p-3 ${isHighlighted ? 'bg-emerald-50/70 dark:bg-emerald-500/10' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">#{item.sequence}</span>
                    <h4 className="text-xs font-bold text-foreground truncate">{item.procedure}</h4>
                  </div>
                  {item.linkedDiagnosis && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <AlertCircle className="size-2.5 text-muted-foreground/60" />
                      {item.linkedDiagnosis}
                    </p>
                  )}
                </div>
                <span className={`inline-flex items-center rounded-full border px-1.5 py-0.25 text-[9px] font-semibold ${planItemStatusBadgeColor[item.status]}`}>
                  {isHighlighted && isCompleted ? (
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="size-2.5" />
                      Completed
                    </span>
                  ) : (
                    item.status
                  )}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 bg-muted/20 rounded p-1.5 text-[10px] text-muted-foreground">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60">Tooth/Surf</span>
                  <span className="font-semibold text-foreground">{item.toothArea} {item.toothSurface.length > 0 ? `(${item.toothSurface.join(', ')})` : ''}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60">Dur / Price</span>
                  <span className="font-semibold text-foreground">{item.estimatedDuration} / ${item.estimatedPrice}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60">Priority</span>
                  <span className={`font-semibold ${item.priority === 'Urgent' ? 'text-rose-500' : 'text-blue-500'}`}>{item.priority}</span>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                {canStart && !isCompleted && !isDeclined ? (
                  <Button
                    onClick={() => onStartProcedure(item)}
                    size="xs"
                    className="h-7 w-full text-[11px]"
                  >
                    <Play className="mr-1 size-3" />
                    {item.status === 'In Progress' ? 'Resume Procedure' : 'Start Procedure'}
                  </Button>
                ) : (
                  <span className="text-[11px] text-muted-foreground/60 italic font-medium">
                    {isCompleted ? 'Procedure Completed' : 'Procedure Declined'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
