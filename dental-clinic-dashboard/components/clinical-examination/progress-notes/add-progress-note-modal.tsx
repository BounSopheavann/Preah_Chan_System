'use client';

import { Bold, Italic, List, ListOrdered, Paperclip, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CURRENT_USER, CURRENT_EXAMINATION, nowTime, todayLabel } from '../patient-context';
import {
  attachmentTypes,
  noteTypes,
  type AttachmentType,
  type NoteType,
  type ProgressNote,
} from './progress-notes-data';

interface AddProgressNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: ProgressNote) => void;
}

const selectClass =
  'h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

export function AddProgressNoteModal({ isOpen, onClose, onSave }: AddProgressNoteModalProps) {
  const [type, setType] = useState<NoteType>('Examination');
  const [content, setContent] = useState('');
  const [linkedDiagnosis, setLinkedDiagnosis] = useState('Deep Dental Caries');
  const [linkedTreatment, setLinkedTreatment] = useState('Root Canal Treatment');
  const [attachments, setAttachments] = useState<{ id: string; type: AttachmentType; name: string }[]>([]);
  const [attachType, setAttachType] = useState<AttachmentType>('Image');
  const [attachName, setAttachName] = useState('');

  if (!isOpen) return null;

  const addAttachment = () => {
    if (!attachName.trim()) return;
    setAttachments((prev) => [
      ...prev,
      { id: `att-${Date.now()}`, type: attachType, name: attachName.trim() },
    ]);
    setAttachName('');
  };

  const handleSave = () => {
    const note: ProgressNote = {
      id: `note-${Date.now()}`,
      type,
      date: todayLabel(),
      time: nowTime(),
      author: CURRENT_USER,
      role: 'Dentist',
      linkedExamination: CURRENT_EXAMINATION,
      linkedDiagnosis,
      linkedTreatment,
      content,
      attachments: attachments.map((a) => ({ id: a.id, type: a.type, name: a.name })),
      createdAt: `${todayLabel()}, ${nowTime()}`,
      createdBy: CURRENT_USER,
      amendments: [],
    };
    onSave(note);
    reset();
    onClose();
  };

  const reset = () => {
    setType('Examination');
    setContent('');
    setLinkedDiagnosis('Deep Dental Caries');
    setLinkedTreatment('Root Canal Treatment');
    setAttachments([]);
    setAttachName('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm pt-8 pb-10">
      <div className="mx-4 w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Progress Note</h2>
            <p className="text-sm text-muted-foreground">Document a clinical event in the patient timeline.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <ContextField label="Date" value={todayLabel()} />
          <ContextField label="Time" value={nowTime()} />
          <ContextField label="Author" value={CURRENT_USER} />
        </div>

        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Note Type <span className="text-destructive">*</span>
        </label>
        <div className="mb-4 flex flex-wrap gap-2">
          {noteTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                type === t
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Content <span className="text-destructive">*</span>
        </label>
        <div className="rounded-xl border border-border bg-background/70 dark:bg-background/30">
          <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
            <FormatBtn icon={<Bold className="size-3.5" />} label="Bold" onClick={() => wrapSelection('**')} />
            <FormatBtn icon={<Italic className="size-3.5" />} label="Italic" onClick={() => wrapSelection('_')} />
            <FormatBtn icon={<List className="size-3.5" />} label="Bullets" onClick={() => prefixLine('• ')} />
            <FormatBtn icon={<ListOrdered className="size-3.5" />} label="Numbered" onClick={() => prefixLine('1. ')} />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Document the clinical finding, procedure, or communication..."
            className="min-h-32 w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <label className="flex flex-1 flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Linked Diagnosis
            <input type="text" value={linkedDiagnosis} onChange={(e) => setLinkedDiagnosis(e.target.value)} className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none focus:border-primary/50 dark:bg-background/30" />
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Linked Treatment
            <input type="text" value={linkedTreatment} onChange={(e) => setLinkedTreatment(e.target.value)} className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none focus:border-primary/50 dark:bg-background/30" />
          </label>
        </div>

        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Paperclip className="size-3.5" /> Attachments <span className="text-[10px] font-normal">(UI only)</span>
          </p>
          <div className="flex gap-2">
            <select value={attachType} onChange={(e) => setAttachType(e.target.value as AttachmentType)} className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm dark:bg-background/30">
              {attachmentTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
            <input
              type="text"
              value={attachName}
              onChange={(e) => setAttachName(e.target.value)}
              placeholder="Attachment name..."
              className="h-10 flex-1 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none focus:border-primary/50 dark:bg-background/30"
            />
            <button
              type="button"
              onClick={addAttachment}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 text-sm font-semibold text-primary hover:bg-primary/20"
            >
              <Plus className="size-4" /> Add
            </button>
          </div>
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((a) => (
                <span key={a.id} className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground">
                  {a.type}: {a.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!content.trim()}>Save Note</Button>
        </div>
      </div>
    </div>
  );

  function wrapSelection(wrap: string) {
    setContent((prev) => `${prev}${wrap}text${wrap}`);
  }
  function prefixLine(prefix: string) {
    setContent((prev) => `${prev}\n${prefix}item`);
  }
}

function ContextField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function FormatBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
    >
      {icon}
    </button>
  );
}