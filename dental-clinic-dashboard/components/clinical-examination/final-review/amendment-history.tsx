'use client';

import { AmendmentRecord } from './final-review-data';
import { CornerDownRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AmendmentHistoryProps {
  amendments: AmendmentRecord[];
  onAddAmendment: () => void;
}

export function AmendmentHistory({ amendments, onAddAmendment }: AmendmentHistoryProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <CornerDownRight className="size-4 text-muted-foreground" />
          Amendment History
        </h3>
        <Button variant="outline" size="sm" onClick={onAddAmendment}>
          <Plus className="mr-1 size-3.5" /> Add Amendment
        </Button>
      </div>
      {amendments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No amendments recorded.</p>
      ) : (
        <div className="space-y-2">
          {amendments.map((amendment) => (
            <div key={amendment.id} className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{amendment.date} · {amendment.author}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">{amendment.reason}</p>
              {amendment.notes && <p className="mt-0.5 text-xs text-muted-foreground">{amendment.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}