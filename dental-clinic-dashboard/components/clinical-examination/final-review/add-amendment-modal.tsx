'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CURRENT_USER, todayLabel } from '../patient-context';
import { AmendmentRecord } from './final-review-data';
import { X } from 'lucide-react';

interface AddAmendmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (amendment: AmendmentRecord) => void;
}

export function AddAmendmentModal({ open, onClose, onSave }: AddAmendmentModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const handleSave = () => {
    if (!reason.trim()) return;
    onSave({
      id: `amd-${Date.now()}`,
      reason: reason.trim(),
      notes: notes.trim(),
      date: todayLabel(),
      author: CURRENT_USER,
    });
    setReason('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Add Amendment</h3>
          <button type="button" onClick={onClose} className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Amendment Reason *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Corrected tooth number"
              className="w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Amendment Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional details about the amendment..."
              className="w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Date: {todayLabel()}</span>
            <span>·</span>
            <span>Author: {CURRENT_USER}</span>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!reason.trim()}>Save Amendment</Button>
        </div>
      </div>
    </div>
  );
}