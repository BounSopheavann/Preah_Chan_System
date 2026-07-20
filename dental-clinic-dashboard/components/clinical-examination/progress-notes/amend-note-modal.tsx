'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CURRENT_USER, nowTime, todayLabel } from '../patient-context';
import { type ProgressNote } from './progress-notes-data';

interface AmendNoteModalProps {
  isOpen: boolean;
  note: ProgressNote | null;
  onClose: () => void;
  onSave: (noteId: string, reason: string, content: string) => void;
}

export function AmendNoteModal({ isOpen, note, onClose, onSave }: AmendNoteModalProps) {
  const [reason, setReason] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen || !note) return null;

  const handleSave = () => {
    if (!reason.trim() || !content.trim()) return;
    onSave(note.id, reason.trim(), content.trim());
    setReason('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm pt-10 pb-10">
      <div className="mx-4 w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Amend Note</h2>
              <p className="text-sm text-muted-foreground">Original note is preserved below.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Original note reference */}
        <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4 dark:bg-background/20">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Original Note — {note.author} · {note.date} {note.time}
          </p>
          <p className="mt-2 text-sm text-foreground">{note.content}</p>
        </div>

        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Amendment Reason <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Clarification of medication dosage"
          className="mb-3 h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none focus:border-primary/50 dark:bg-background/30"
        />

        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Amendment Content <span className="text-destructive">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Describe the correction or additional information..."
          className="min-h-24 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 dark:bg-background/30"
        />

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!reason.trim() || !content.trim()}>Save Amendment</Button>
        </div>
      </div>
    </div>
  );
}