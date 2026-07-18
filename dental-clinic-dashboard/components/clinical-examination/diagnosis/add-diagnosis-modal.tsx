'use client';

import { Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  diagnosisSeverities,
  diagnosisPriorities,
  diagnosisStatuses,
  diagnosisSources,
  diagnosisSuggestions,
  type DiagnosisRecord,
  type DiagnosisSeverity,
  type DiagnosisPriority,
  type DiagnosisStatus,
  type DiagnosisSource,
} from './diagnosis-data';

interface AddDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diagnosis: DiagnosisRecord) => void;
}

const emptyForm = {
  diagnosisName: '',
  diagnosisCode: '',
  toothNumber: '',
  toothSurface: [] as string[],
  severity: 'Moderate' as DiagnosisSeverity,
  priority: 'Recommended' as DiagnosisPriority,
  status: 'Active' as DiagnosisStatus,
  source: 'Manual Entry' as DiagnosisSource,
  clinicalNotes: '',
};

const toothSurfaces = ['Occlusal', 'Mesial', 'Distal', 'Buccal', 'Lingual', 'Apical'];

export function AddDiagnosisModal({ isOpen, onClose, onSave }: AddDiagnosisModalProps) {
  const [form, setForm] = useState({ ...emptyForm });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [toothType, setToothType] = useState<'specific' | 'multiple' | 'general'>('specific');
  const [multipleTeeth, setMultipleTeeth] = useState('');

  if (!isOpen) return null;

  const filteredSuggestions = diagnosisSuggestions.filter(
    (s) => s.toLowerCase().includes(form.diagnosisName.toLowerCase()) && s !== form.diagnosisName
  );

  const toggleSurface = (surface: string) => {
    setForm((prev) => ({
      ...prev,
      toothSurface: prev.toothSurface.includes(surface)
        ? prev.toothSurface.filter((s) => s !== surface)
        : [...prev.toothSurface, surface],
    }));
  };

  const handleSave = () => {
    const toothValue =
      toothType === 'general' ? 'General' :
      toothType === 'multiple' ? multipleTeeth :
      form.toothNumber;

    const newDiagnosis: DiagnosisRecord = {
      id: `dx-${Date.now()}`,
      diagnosisName: form.diagnosisName,
      diagnosisCode: form.diagnosisCode,
      toothNumber: toothValue || 'General',
      toothSurface: form.toothSurface,
      severity: form.severity,
      priority: form.priority,
      status: form.status,
      source: form.source,
      dateIdentified: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosedBy: 'Dr. Maya',
      clinicalNotes: form.clinicalNotes,
    };
    onSave(newDiagnosis);
    setForm({ ...emptyForm });
    setToothType('specific');
    setMultipleTeeth('');
    onClose();
  };

  const handleClose = () => {
    setForm({ ...emptyForm });
    setToothType('specific');
    setMultipleTeeth('');
    onClose();
  };

  const selectClass =
    'h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm pt-10 pb-10">
      <div className="mx-4 w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Diagnosis</h2>
            <p className="text-sm text-muted-foreground">Record a new clinical diagnosis.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {/* Diagnosis Name */}
          <div className="relative sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Diagnosis Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.diagnosisName}
                onChange={(e) => { setForm((prev) => ({ ...prev, diagnosisName: e.target.value })); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search or type diagnosis..."
                className="h-10 w-full rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
              />
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {showSuggestions && filteredSuggestions.length > 0 && form.diagnosisName && (
              <div className="absolute z-30 mt-1 w-full rounded-xl border border-border bg-popover p-1 shadow-xl">
                {filteredSuggestions.slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => { setForm((prev) => ({ ...prev, diagnosisName: suggestion })); setShowSuggestions(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"
                  >
                    <Plus className="size-3.5 text-primary" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Diagnosis Code */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Diagnosis Code <span className="text-[10px] font-normal">(optional)</span>
            <input
              type="text"
              value={form.diagnosisCode}
              onChange={(e) => setForm((prev) => ({ ...prev, diagnosisCode: e.target.value }))}
              placeholder="e.g. K02.9"
              className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
            />
          </label>

          {/* Tooth Type */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Tooth Selection
            <select value={toothType} onChange={(e) => setToothType(e.target.value as typeof toothType)} className={selectClass}>
              <option value="specific">Specific Tooth</option>
              <option value="multiple">Multiple Teeth</option>
              <option value="general">General / Full Mouth</option>
            </select>
          </label>

          {/* Tooth Number */}
          {toothType === 'specific' && (
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
              Tooth Number <span className="text-destructive">*</span>
              <input
                type="text"
                value={form.toothNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, toothNumber: e.target.value }))}
                placeholder="e.g. 26"
                className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
              />
            </label>
          )}

          {toothType === 'multiple' && (
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
              Tooth Numbers <span className="text-destructive">*</span>
              <input
                type="text"
                value={multipleTeeth}
                onChange={(e) => setMultipleTeeth(e.target.value)}
                placeholder="e.g. 16, 17, 26"
                className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30"
              />
            </label>
          )}

          {/* Tooth Surface */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Tooth Surface <span className="text-[10px] font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {toothSurfaces.map((surface) => (
                <button
                  key={surface}
                  type="button"
                  onClick={() => toggleSurface(surface)}
                  className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-semibold transition-all ${
                    form.toothSurface.includes(surface)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {surface}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Severity <span className="text-destructive">*</span>
            <select
              value={form.severity}
              onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value as DiagnosisSeverity }))}
              className={selectClass}
            >
              {diagnosisSeverities.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </label>

          {/* Priority */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Priority <span className="text-destructive">*</span>
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as DiagnosisPriority }))}
              className={selectClass}
            >
              {diagnosisPriorities.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </label>

          {/* Status */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Status <span className="text-destructive">*</span>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as DiagnosisStatus }))}
              className={selectClass}
            >
              {diagnosisStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </label>

          {/* Source */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Source <span className="text-destructive">*</span>
            <select
              value={form.source}
              onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value as DiagnosisSource }))}
              className={selectClass}
            >
              {diagnosisSources.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </label>

          {/* Clinical Notes */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Clinical Notes <span className="text-[10px] font-normal">(optional)</span>
            </label>
            <textarea
              value={form.clinicalNotes}
              onChange={(e) => setForm((prev) => ({ ...prev, clinicalNotes: e.target.value }))}
              rows={4}
              placeholder="Describe the clinical findings supporting this diagnosis..."
              className="min-h-24 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.diagnosisName.trim()}>
            <Plus className="size-4" />
            Save Diagnosis
          </Button>
        </div>
      </div>
    </div>
  );
}