'use client';

import { ClipboardList, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { dummyProgressNotes, type ProgressNote } from './progress-notes-data';
import { ProgressNoteCard } from './progress-note-card';
import { ProgressNoteFilters } from './progress-note-filters';
import { RecentClinicalActivity } from './recent-clinical-activity';
import { AddProgressNoteModal } from './add-progress-note-modal';
import { AmendNoteModal } from './amend-note-modal';
import { ProgressNoteDetailsPanel } from './progress-note-details-panel';

export function ProgressNotesTab() {
  const [notes, setNotes] = useState<ProgressNote[]>(dummyProgressNotes);
  const [search, setSearch] = useState('');
  const [noteType, setNoteType] = useState('All');
  const [author, setAuthor] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAmendOpen, setIsAmendOpen] = useState(false);
  const [selected, setSelected] = useState<ProgressNote | null>(null);
  const [amendTarget, setAmendTarget] = useState<ProgressNote | null>(null);
  const [loading, setLoading] = useState(false);

  const sorted = useMemo(
    () => [...notes].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)),
    [notes]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter((n) => {
      const matchesSearch = !q || n.content.toLowerCase().includes(q) || n.type.toLowerCase().includes(q);
      const matchesType = noteType === 'All' || n.type === noteType;
      const matchesAuthor = author === 'All' || n.author === author;
      const matchesDate = dateRange === 'All' || (dateRange === 'Today' && n.date.includes('18 Jul 2026'));
      return matchesSearch && matchesType && matchesAuthor && matchesDate;
    });
  }, [sorted, search, noteType, author, dateRange]);

  const handleSave = (note: ProgressNote) => {
    setNotes((prev) => [note, ...prev]);
  };

  const handleAmend = (noteId: string, reason: string, content: string) => {
    const amendment = {
      amendedBy: 'Dr. Maya',
      amendmentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reason,
      content,
    };
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              lastAmendedAt: amendment.amendmentDate,
              lastAmendedBy: amendment.amendedBy,
              amendments: [...n.amendments, amendment],
            }
          : n
      )
    );
  };

  const handleReset = () => {
    setSearch('');
    setNoteType('All');
    setAuthor('All');
    setDateRange('All');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-muted/50" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}
          </div>
          <div className="h-48 animate-pulse rounded-2xl border border-border bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Progress Notes</h2>
          <p className="text-sm text-muted-foreground">
            Document chronological clinical notes for this patient's care.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="size-4" />
          Add Note
        </Button>
      </div>

      <ProgressNoteFilters
        search={search}
        onSearchChange={setSearch}
        noteType={noteType}
        onNoteTypeChange={setNoteType}
        author={author}
        onAuthorChange={setAuthor}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onReset={handleReset}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/90 px-6 py-14 text-center theme-surface-shadow">
              <div className="mb-5 flex size-24 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary">
                <ClipboardList className="size-10" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No progress notes recorded yet.</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Add clinical notes to maintain a chronological record of the patient's care.
              </p>
              <Button className="mt-5" onClick={() => setIsAddOpen(true)}>
                <Plus className="size-4" />
                Add First Note
              </Button>
            </div>
          ) : (
            filtered.map((note) => (
              <ProgressNoteCard
                key={note.id}
                note={note}
                onView={setSelected}
                onAmend={(n) => { setAmendTarget(n); setIsAmendOpen(true); }}
                onPrint={() => {}}
              />
            ))
          )}
        </div>

        <div className="space-y-4">
          <RecentClinicalActivity />
        </div>
      </div>

      <AddProgressNoteModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleSave} />

      <AmendNoteModal
        isOpen={isAmendOpen}
        note={amendTarget}
        onClose={() => { setIsAmendOpen(false); setAmendTarget(null); }}
        onSave={handleAmend}
      />

      <ProgressNoteDetailsPanel note={selected} onClose={() => setSelected(null)} />
    </div>
  );
}