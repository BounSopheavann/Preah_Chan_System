'use client';

import { CalendarClock, X } from 'lucide-react';
import type { ProgressNote } from './progress-notes-data';
import { noteTypeBadgeColor } from './progress-notes-data';
import { AttachmentCard } from './attachment-card';

export function ProgressNoteDetailsPanel({
  note,
  onClose,
}: {
  note: ProgressNote | null;
  onClose: () => void;
}) {
  if (!note) {
    return (
      <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <CalendarClock className="size-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">No note selected</p>
          <p className="mt-1 text-xs text-muted-foreground">Click a note to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${noteTypeBadgeColor[note.type]}`}>
                {note.type}
              </span>
              <span className="text-xs text-muted-foreground">{note.id}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{note.date} · {note.time}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-sm font-semibold text-foreground">{note.author} · {note.role}</p>

        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground dark:bg-background/20">
          {note.content}
        </div>

        {note.attachments.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {note.attachments.map((att) => (
                <AttachmentCard key={att.id} name={att.name} type={att.type} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          {note.linkedExamination && (
            <span className="rounded-lg bg-muted/50 px-2 py-1 font-semibold">{note.linkedExamination}</span>
          )}
          {note.linkedDiagnosis && (
            <span className="rounded-lg bg-muted/50 px-2 py-1 font-semibold">Dx: {note.linkedDiagnosis}</span>
          )}
          {note.linkedTreatment && (
            <span className="rounded-lg bg-muted/50 px-2 py-1 font-semibold">Tx: {note.linkedTreatment}</span>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground dark:bg-background/20">
          <p>Created by {note.createdBy} · {note.createdAt}</p>
          {note.lastAmendedAt && (
            <p className="mt-1">Last amended by {note.lastAmendedBy} · {note.lastAmendedAt}</p>
          )}
        </div>

        {note.amendments.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amendment History</p>
            <div className="space-y-2">
              {note.amendments.map((am, i) => (
                <div key={i} className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs dark:border-amber-500/30 dark:bg-amber-500/10">
                  <p className="font-semibold text-foreground">{am.reason}</p>
                  <p className="mt-1 text-muted-foreground">{am.content}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Amended by {am.amendedBy} · {am.amendmentDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}