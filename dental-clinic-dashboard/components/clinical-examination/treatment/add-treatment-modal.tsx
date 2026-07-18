'use client';

import { Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { procedureOptions, treatmentPhases, treatmentPriorities } from './treatment-data';
import type { TreatmentItem, TreatmentPriority, TreatmentPhase } from './treatment-data';

interface AddTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: TreatmentItem) => void;
  diagnoses: { id: string; diagnosisName: string; toothNumber: string }[];
  nextSequence: number;
}

const surfaceOptions = ['Occlusal', 'Mesial', 'Distal', 'Buccal', 'Lingual', 'Full'];

export function AddTreatmentModal({ isOpen, onClose, onSave, diagnoses, nextSequence }: AddTreatmentModalProps) {
  const [procedure, setProcedure] = useState('');
  const [procedureCode, setProcedureCode] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [linkedDiagnosisId, setLinkedDiagnosisId] = useState('');
  const [toothArea, setToothArea] = useState('');
  const [toothSurface, setToothSurface] = useState<string[]>([]);
  const [priority, setPriority] = useState<TreatmentPriority>('Recommended');
  const [treatmentPhase, setTreatmentPhase] = useState<TreatmentPhase>('Restorative Phase');
  const [estimatedDuration, setEstimatedDuration] = useState('45 min');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const filteredProcedures = procedureOptions.filter((p) => p.toLowerCase().includes(procedure.toLowerCase()) && p !== procedure);
  const selectedDiagnosis = diagnoses.find((d) => d.id === linkedDiagnosisId);

  const handleDiagnosisSelect = (id: string) => {
    setLinkedDiagnosisId(id);
    const dx = diagnoses.find((d) => d.id === id);
    if (dx && dx.toothNumber && dx.toothNumber !== 'General') setToothArea(dx.toothNumber);
  };

  const toggleSurface = (s: string) => {
    setToothSurface((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSave = () => {
    const total = (unitPrice * quantity) - discount;
    onSave({
      id: `tx-${Date.now()}`,
      sequence: nextSequence,
      procedure,
      procedureCode,
      linkedDiagnosis: selectedDiagnosis?.diagnosisName ?? '',
      linkedDiagnosisId,
      toothArea: toothArea || 'General',
      toothSurface,
      archQuadrant: '',
      priority,
      treatmentPhase,
      estimatedDuration,
      quantity,
      unitPrice,
      discount,
      total: Math.max(0, total),
      status: 'Proposed',
      dentist: 'Dr. Maya',
      notes,
    });
    handleClose();
  };

  const handleClose = () => {
    setProcedure(''); setProcedureCode(''); setLinkedDiagnosisId(''); setToothArea('');
    setToothSurface([]); setPriority('Recommended'); setTreatmentPhase('Restorative Phase');
    setEstimatedDuration('45 min'); setQuantity(1); setUnitPrice(0); setDiscount(0); setNotes('');
    onClose();
  };

  const selectClass = 'h-10 rounded-xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm pt-10 pb-10">
      <div className="mx-4 w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-foreground">Add Treatment</h2><p className="text-sm text-muted-foreground">Add a new treatment item to the plan.</p></div>
          <button type="button" onClick={handleClose} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground"><X className="size-4" /></button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="relative sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Procedure <span className="text-destructive">*</span></label>
            <div className="relative">
              <input type="text" value={procedure} onChange={(e) => { setProcedure(e.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} placeholder="Search or type..." className="h-10 w-full rounded-xl border border-border bg-background/70 pl-9 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30" />
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {showSuggestions && filteredProcedures.length > 0 && procedure && (
              <div className="absolute z-30 mt-1 w-full rounded-xl border border-border bg-popover p-1 shadow-xl">
                {filteredProcedures.slice(0, 6).map((p) => (
                  <button key={p} type="button" onClick={() => { setProcedure(p); setShowSuggestions(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-muted"><Plus className="size-3.5 text-primary" />{p}</button>
                ))}
              </div>
            )}
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Procedure Code <span className="text-[10px] font-normal">(optional)</span>
            <input type="text" value={procedureCode} onChange={(e) => setProcedureCode(e.target.value)} placeholder="e.g. RCT-001" className={selectClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Linked Diagnosis <span className="text-destructive">*</span>
            <select value={linkedDiagnosisId} onChange={(e) => handleDiagnosisSelect(e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              {diagnoses.map((d) => (<option key={d.id} value={d.id}>{d.diagnosisName} ({d.toothNumber})</option>))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
            Tooth / Area <span className="text-destructive">*</span>
            <input type="text" value={toothArea} onChange={(e) => setToothArea(e.target.value)} placeholder="e.g. 26, Full Mouth" className={selectClass} />
          </label>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Tooth Surface <span className="text-[10px] font-normal">(optional)</span></label>
            <div className="flex flex-wrap gap-2">
              {surfaceOptions.map((s) => (
                <button key={s} type="button" onClick={() => toggleSurface(s)} className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-semibold transition-all ${toothSurface.includes(s) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>{s}</button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">Priority <span className="text-destructive">*</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TreatmentPriority)} className={selectClass}>
              {treatmentPriorities.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">Treatment Phase
            <select value={treatmentPhase} onChange={(e) => setTreatmentPhase(e.target.value as TreatmentPhase)} className={selectClass}>
              <option value="">No Phase</option>
              {treatmentPhases.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">Est. Duration
            <input type="text" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} placeholder="e.g. 45 min" className={selectClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">Quantity
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={selectClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">Unit Price ($)
            <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} placeholder="0" className={selectClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">Discount ($)
            <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="0" className={selectClass} />
          </label>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Notes <span className="text-[10px] font-normal">(optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Clinical notes for this treatment..." className="min-h-20 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!procedure.trim() || !linkedDiagnosisId}>
            <Plus className="size-4" /> Add to Plan
          </Button>
        </div>
      </div>
    </div>
  );
}