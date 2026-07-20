'use client';

import { useState, useEffect } from 'react';
import {
  X, Save, CheckCircle2, PauseCircle, AlertTriangle, Clock, User, Stethoscope, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnesthesiaSection } from './anesthesia-section';
import { ConsumablesSection } from './consumables-section';
import { ProcedureAttachments } from './procedure-attachments';
import { ProcedurePrescriptionSection } from './procedure-prescription';
import type {
  PlannedTreatmentItem, ProcedureExecution, AnesthesiaRecord,
  ConsumableRecord, ProcedureAttachment, ProcedurePrescriptionItem,
  InterruptionReason,
} from './treatment-execution-data';
import { procedureStatusBadgeColor } from './treatment-execution-data';

interface ProcedureRecordingDrawerProps {
  isOpen: boolean;
  plannedItem: PlannedTreatmentItem | null;
  existingExecution: ProcedureExecution | null;
  onClose: () => void;
  onSaveDraft: (execution: ProcedureExecution) => void;
  onComplete: (execution: ProcedureExecution) => void;
  onInterrupt: (execution: ProcedureExecution, reason: InterruptionReason, notes: string) => void;
  onCancel: () => void;
}

const defaultAnesthesia: AnesthesiaRecord = { drug: '', dosage: '', quantity: 1, injectionSite: '', notes: '' };

export function ProcedureRecordingDrawer({
  isOpen, plannedItem, existingExecution, onClose, onSaveDraft, onComplete, onInterrupt, onCancel,
}: ProcedureRecordingDrawerProps) {
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [complications, setComplications] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState('');
  const [anesthesiaEnabled, setAnesthesiaEnabled] = useState(false);
  const [anesthesia, setAnesthesia] = useState<AnesthesiaRecord>(defaultAnesthesia);
  const [consumables, setConsumables] = useState<ConsumableRecord[]>([]);
  const [attachments, setAttachments] = useState<ProcedureAttachment[]>([]);
  const [prescriptions, setPrescriptions] = useState<ProcedurePrescriptionItem[]>([]);
  const [showInterruptModal, setShowInterruptModal] = useState(false);
  const [interruptReason, setInterruptReason] = useState<InterruptionReason>('Other');
  const [interruptNotes, setInterruptNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (existingExecution) {
      setClinicalNotes(existingExecution.clinicalNotes);
      setComplications(existingExecution.complications);
      setQuantity(existingExecution.quantity);
      setDuration(existingExecution.duration);
      setAnesthesiaEnabled(existingExecution.anesthesiaUsed);
      setAnesthesia(existingExecution.anesthesia || defaultAnesthesia);
      setConsumables(existingExecution.consumables);
      setAttachments(existingExecution.attachments);
      setPrescriptions(existingExecution.prescriptions);
    } else {
      setClinicalNotes('');
      setComplications('');
      setQuantity(1);
      setDuration(plannedItem?.estimatedDuration || '');
      setAnesthesiaEnabled(false);
      setAnesthesia(defaultAnesthesia);
      setConsumables([]);
      setAttachments([]);
      setPrescriptions([]);
    }
    setValidationError('');
    setShowInterruptModal(false);
  }, [existingExecution, plannedItem, isOpen]);

  if (!isOpen || !plannedItem) return null;

  const buildExecution = (status: ProcedureExecution['status']): ProcedureExecution => ({
    id: existingExecution?.id || `exec-${Date.now()}`,
    treatmentItemId: plannedItem.id,
    procedure: plannedItem.procedure,
    toothNumber: plannedItem.toothArea,
    toothSurface: plannedItem.toothSurface,
    dentist: 'Dr. Maya',
    startTime: existingExecution?.startTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    endTime: status === 'Completed' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined,
    status,
    clinicalNotes,
    complications,
    quantity,
    duration,
    anesthesiaUsed: anesthesiaEnabled,
    anesthesia: anesthesiaEnabled ? anesthesia : undefined,
    consumables,
    attachments,
    prescriptions,
  });

  const handleComplete = () => {
    if (!clinicalNotes.trim()) {
      setValidationError('Clinical notes are required before completing a procedure.');
      return;
    }
    setValidationError('');
    onComplete(buildExecution('Completed'));
  };

  const handleSaveDraft = () => {
    setValidationError('');
    onSaveDraft(buildExecution('In Progress'));
  };

  const handleInterrupt = () => {
    setShowInterruptModal(true);
  };

  const confirmInterrupt = () => {
    const exec = buildExecution('Interrupted');
    exec.interruptionReason = interruptReason;
    exec.interruptionNotes = interruptNotes;
    onInterrupt(exec, interruptReason, interruptNotes);
    setShowInterruptModal(false);
  };

  const inputClass = 'h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60';
  const textareaClass = 'min-h-24 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60';

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl border-l border-border bg-card shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Procedure Recording</h2>
            <p className="text-xs text-muted-foreground">{plannedItem.procedure} · Tooth {plannedItem.toothArea}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Procedure info */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Procedure</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground truncate">{plannedItem.procedure}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tooth</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">{plannedItem.toothArea}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Surface</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">{plannedItem.toothSurface.join(', ') || 'N/A'}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dentist</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">Dr. Maya</div>
            </div>
          </div>

          {/* Start time */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Started at:</span>
            <span className="text-sm font-semibold text-foreground">
              {existingExecution?.startTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">{validationError}</span>
            </div>
          )}

          {/* Clinical Notes */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <FileText className="size-3.5" />
              Clinical Notes <span className="text-destructive">*</span>
            </label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className={textareaClass}
              placeholder="Describe the procedure performed, findings, and any observations..."
            />
          </div>

          {/* Quantity & Duration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
              Quantity
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
              Duration
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 45 min" className={inputClass} />
            </label>
          </div>

          {/* Complications */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <AlertTriangle className="size-3.5" />
              Complications <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              value={complications}
              onChange={(e) => setComplications(e.target.value)}
              className="min-h-16 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60"
              placeholder="Any complications during the procedure..."
            />
          </div>

          {/* Anesthesia */}
          <AnesthesiaSection
            enabled={anesthesiaEnabled}
            anesthesia={anesthesia}
            onToggle={setAnesthesiaEnabled}
            onChange={setAnesthesia}
          />

          {/* Consumables */}
          <ConsumablesSection consumables={consumables} onChange={setConsumables} />

          {/* Attachments */}
          <ProcedureAttachments attachments={attachments} onChange={setAttachments} />

          {/* Prescription */}
          <ProcedurePrescriptionSection prescriptions={prescriptions} onChange={setPrescriptions} />

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={onCancel}>
              <X className="size-4" />
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSaveDraft}>
              <Save className="size-4" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={handleInterrupt} className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-300">
              <PauseCircle className="size-4" />
              Interrupt
            </Button>
            <Button onClick={handleComplete}>
              <CheckCircle2 className="size-4" />
              Complete Procedure
            </Button>
          </div>
        </div>
      </div>

      {/* Interrupt Modal */}
      {showInterruptModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">Interrupt Treatment</h3>
            <p className="mt-1 text-sm text-muted-foreground">Record why this procedure could not be completed.</p>

            <div className="mt-4 space-y-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                Reason
                <select value={interruptReason} onChange={(e) => setInterruptReason(e.target.value as InterruptionReason)} className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20">
                  <option value="Patient Pain">Patient Pain</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Time Limit">Time Limit</option>
                  <option value="Equipment Issue">Equipment Issue</option>
                  <option value="Patient Requested Stop">Patient Requested Stop</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                Notes <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>
                <textarea value={interruptNotes} onChange={(e) => setInterruptNotes(e.target.value)} rows={3} className="min-h-20 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20" placeholder="Additional details..." />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowInterruptModal(false)}>Cancel</Button>
              <Button onClick={confirmInterrupt} className="bg-amber-600 text-white hover:bg-amber-700">
                <PauseCircle className="size-4" />
                Confirm Interrupt
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}