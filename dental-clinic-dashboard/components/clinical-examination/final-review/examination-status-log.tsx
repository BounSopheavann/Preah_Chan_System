'use client';

import { StatusLogEvent } from './final-review-data';
import { Clock } from 'lucide-react';

interface StatusLogProps {
  events: StatusLogEvent[];
}

export function ExaminationStatusLog({ events }: StatusLogProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <Clock className="size-4 text-muted-foreground" />
        Status Log
      </h3>
      <div className="space-y-2">
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm">
            <div className="flex shrink-0 gap-2 text-xs text-muted-foreground">
              <span>{event.date}</span>
              <span>{event.time}</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold text-foreground">{event.user}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{event.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}