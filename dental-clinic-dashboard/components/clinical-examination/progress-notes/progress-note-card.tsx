'use client';

import { Eye, Pencil, Printer } from 'lucide-react';
import type { ProgressNote } from './progress-notes-data';
import { noteTypeBadgeColor } from './progress-notes-data';
import { AttachmentCard } from './attachment-card';

export function ProgressNoteCard({
  note,
  onView,
  onAmend,
  onPrint,
}: {
  note: ProgressNote;
  onView: (note: ProgressNote) => void;
  onAmend: (note: ProgressNote) => void;
  onPrint: (note: ProgressNote) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">{note.date.split(' ').slice(0, 2).join(' ')}</p>
            <p className="text-[11px] text-muted-foreground">{note.time}</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${noteTypeBadgeColor[note.type]}`}>
                {note.type}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">{note.author} · {note.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onView(note)} className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground" aria-label="View" title="View">
            <Eye className="size-3.5" />
          </button>
          <button onClick={() => onAmend(note)} className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground" aria-label="Amend" title="Amend">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={() => onPrint(note)} className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground" aria-label="Print" title="Print">
            <Printer className="size-3.5" />
          </button>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-foreground">{note.content}</p>

      {note.attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.attachments.map((att) => (
            <AttachmentCard key={att.id} name={att.name} type={att.type} />
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
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

      {note.lastAmendedAt && (
        <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
          Amended by {note.lastAmendedBy} · {note.lastAmendedAt}
        </p>
      )}
    </div>
  );
}