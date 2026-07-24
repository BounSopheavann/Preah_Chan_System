'use client';

import type { DragEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Bold,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FileUp,
  Image as ImageIcon,
  Italic,
  List,
  Maximize2,
  PauseCircle,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Syringe,
  Trash2,
  UploadCloud,
  User,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PATIENT, CURRENT_EXAMINATION } from '@/components/clinical-examination/patient-context';
import {
  applyProcedureCompletion,
  applyProcedureIncomplete,
  createDefaultFlowState,
  type TreatmentFlowState,
} from './procedure-workspace-store';
import type {
  AnesthesiaRecord,
  ConsumableRecord,
  PlannedTreatmentItem,
  ProcedureAttachment,
  ProcedureExecution,
  ProcedurePrescriptionItem,
} from './treatment-execution-data';

const DEFAULT_ASSISTANT = 'Nurse Lina';
const APPOINTMENT_NUMBER = 'AP-2026-0142';
const ALERT_BADGES = [
  'Penicillin Allergy',
  'Diabetes Type II',
  'Hypertension',
  'Latex Allergy',
  'Consent Accepted',
];

type WorkspaceAttachment = {
  id: string;
  name: string;
  type: 'X-ray' | 'Clinical Image' | 'PDF';
  previewUrl: string;
  uploadedAt: string;
  sizeLabel: string;
  mimeType: string;
};

function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function mapAttachmentFromExecution(attachment: ProcedureAttachment): WorkspaceAttachment {
  return {
    id: attachment.id,
    name: attachment.fileName,
    type: attachment.type === 'X-ray' ? 'X-ray' : 'Clinical Image',
    previewUrl: attachment.fileUrl,
    uploadedAt: attachment.uploadedAt,
    sizeLabel: 'Stored demo file',
    mimeType: attachment.type === 'X-ray' ? 'image/jpeg' : 'image/png',
  };
}

function createConsumableRow(index: number): ConsumableRecord {
  return {
    id: `cons-${Date.now()}-${index}`,
    material: '',
    quantityUsed: 1,
    unit: 'pcs',
    batchLot: '',
    notes: '',
  };
}

function createPrescriptionRow(index: number): ProcedurePrescriptionItem {
  return {
    id: `rx-${Date.now()}-${index}`,
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  };
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/80 bg-card/95 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur md:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary/80">
              {eyebrow}
            </p>
          )}
          <h3 className="mt-1 text-lg font-bold text-foreground">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function StatChip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/25 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ActiveProcedureWorkspacePage() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [flow, setFlow] = useState<TreatmentFlowState>(() => createDefaultFlowState());
  const [nowMs] = useState(Date.now());
  const [notesHtml, setNotesHtml] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [consumables, setConsumables] = useState<ConsumableRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<ProcedurePrescriptionItem[]>([]);
  const [attachments, setAttachments] = useState<WorkspaceAttachment[]>([]);
  const [anesthesiaEnabled, setAnesthesiaEnabled] = useState(false);
  const [anesthesia, setAnesthesia] = useState<AnesthesiaRecord>({
    drug: '',
    dosage: '',
    quantity: 1,
    injectionSite: '',
    notes: '',
  });
  const [manualStatus, setManualStatus] = useState('Draft not saved yet');
  const [validationMessage, setValidationMessage] = useState('');
  const [fullScreenFile, setFullScreenFile] = useState<WorkspaceAttachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setManualStatus('UI prototype mode');
    setHydrated(true);
  }, []);

  const activeExecution = flow.session.inProgressProcedure;
  const activeItem = useMemo<PlannedTreatmentItem | null>(() => {
    if (!activeExecution) {
      return null;
    }

    return (
      flow.session.plannedItems.find((item) => item.id === activeExecution.treatmentItemId) || null
    );
  }, [activeExecution, flow.session.plannedItems]);

  const currentElapsed = useMemo(() => {
    if (!activeExecution?.startedAtMs) {
      return 0;
    }

    return Math.max(0, Math.floor((nowMs - activeExecution.startedAtMs) / 1000));
  }, [activeExecution?.startedAtMs, nowMs]);

  const completedCount = flow.session.completedProcedures.length;
  const remainingCount = flow.session.plannedItems.filter(
    (item) => item.status === 'Planned' || item.status === 'Postponed'
  ).length;
  const totalEstimatedTotal = flow.session.plannedItems.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const currentProcedureCost = activeItem?.estimatedPrice ?? 0;
  const todayTotal = flow.session.completedProcedures.reduce((sum, proc) => {
    const match = flow.session.plannedItems.find((item) => item.id === proc.treatmentItemId);
    return sum + (match?.estimatedPrice ?? 0);
  }, 0);

  useEffect(() => {
    if (!activeExecution) {
      setNotesHtml('');
      setConsumables([]);
      setPrescriptions([]);
      setAttachments([]);
      setAnesthesiaEnabled(false);
      setAnesthesia({
        drug: '',
        dosage: '',
        quantity: 1,
        injectionSite: '',
        notes: '',
      });
      return;
    }

    setNotesHtml(activeExecution.clinicalNotes || '');
    setConsumables(activeExecution.consumables.length > 0 ? activeExecution.consumables : [createConsumableRow(1)]);
    setPrescriptions(activeExecution.prescriptions.length > 0 ? activeExecution.prescriptions : [createPrescriptionRow(1)]);
    setAttachments(activeExecution.attachments.map(mapAttachmentFromExecution));
    setAnesthesiaEnabled(activeExecution.anesthesiaUsed);
    setAnesthesia(activeExecution.anesthesia || {
      drug: '',
      dosage: '',
      quantity: 1,
      injectionSite: '',
      notes: '',
    });
  }, [activeExecution?.id]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== notesHtml) {
      editorRef.current.innerHTML = notesHtml;
    }
  }, [notesHtml]);

  const updateExecution = (updater: (execution: ProcedureExecution) => ProcedureExecution) => {
    setFlow((prev) => {
      const current = prev.session.inProgressProcedure;
      if (!current) {
        return prev;
      }

      return {
        ...prev,
        session: {
          ...prev.session,
          inProgressProcedure: updater(current),
        },
      };
    });
  };

  const syncNotes = () => {
    const html = editorRef.current?.innerHTML || '';
    setNotesHtml(html);
    updateExecution((execution) => ({
      ...execution,
      clinicalNotes: html,
    }));
  };

  const execToolbarCommand = (command: 'bold' | 'italic' | 'insertUnorderedList' | 'insertText') => {
    editorRef.current?.focus();
    if (command === 'insertText') {
      document.execCommand('insertText', false, `\n[${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}] `);
      syncNotes();
      return;
    }

    document.execCommand(command, false);
    syncNotes();
  };

  const handleManualSave = () => {
    setManualStatus('Prototype save disabled — UI only');
    setValidationMessage('');
  };

  const handlePauseProcedure = () => {
    if (!activeExecution) {
      return;
    }

    const nextFlow: TreatmentFlowState = {
      ...flow,
      session: {
        ...flow.session,
        status: 'In Treatment',
        inProgressProcedure: {
          ...activeExecution,
          status: 'In Progress',
        },
      },
    };

    setFlow(nextFlow);
    setManualStatus('Procedure paused. Returning to Treatment Execution.');

    router.push('/treatment-execution');
  };

  const handleMarkIncomplete = () => {
    const nextFlow = applyProcedureIncomplete(flow);
    setFlow(nextFlow);
    setValidationMessage('');
    router.push('/treatment-execution');
  };

  const handleCompleteProcedure = () => {
    if (!activeExecution || !activeItem) {
      setValidationMessage('There is no active procedure to complete.');
      return;
    }

    if (!stripHtml(activeExecution.clinicalNotes)) {
      setValidationMessage('Clinical notes are required before completing a procedure.');
      return;
    }

    if (!activeExecution.dentist.trim()) {
      setValidationMessage('Responsible dentist is required before completing a procedure.');
      return;
    }

    const nextFlow = applyProcedureCompletion(flow);
    setFlow(nextFlow);
    setValidationMessage('');
    router.push('/treatment-execution');
  };

  const handleAnesthesiaSave = () => {
    updateExecution((execution) => ({
      ...execution,
      status: 'In Progress',
    }));
    setManualStatus('Procedure paused locally. Resume later from Treatment Execution.');
  };

  const handleAnesthesiaSkip = () => {
    setAnesthesiaEnabled(false);
    setAnesthesia({
      drug: '',
      dosage: '',
      quantity: 1,
      injectionSite: '',
      notes: '',
    });
    updateExecution((execution) => ({
      ...execution,
      anesthesiaUsed: false,
      anesthesia: undefined,
    }));
    setManualStatus('Anesthesia skipped for this procedure.');
  };

  const addConsumable = () => {
    setConsumables((prev) => {
      const next = [...prev, createConsumableRow(prev.length + 1)];
      updateExecution((execution) => ({
        ...execution,
        consumables: next,
      }));
      return next;
    });
  };

  const addPrescription = () => {
    setPrescriptions((prev) => {
      const next = [...prev, createPrescriptionRow(prev.length + 1)];
      updateExecution((execution) => ({
        ...execution,
        prescriptions: next,
      }));
      return next;
    });
  };

  const addAttachments = (files: FileList | File[]) => {
    const now = new Date();
    const next = [...attachments];

    Array.from(files).forEach((file, index) => {
      const mime = file.type || 'application/octet-stream';
      const type: WorkspaceAttachment['type'] = mime.includes('pdf')
        ? 'PDF'
        : mime.startsWith('image/') && file.name.toLowerCase().includes('xray')
          ? 'X-ray'
          : mime.startsWith('image/')
            ? 'Clinical Image'
            : 'PDF';

      next.push({
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        type,
        previewUrl: URL.createObjectURL(file),
        uploadedAt: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        mimeType: mime,
      });
    });

    setAttachments(next);
    updateExecution((execution) => ({
      ...execution,
      attachments: next.map((item) => ({
        id: item.id,
        type: item.type === 'X-ray' ? 'X-ray' : 'Clinical Image',
        fileName: item.name,
        fileUrl: item.previewUrl,
        uploadedAt: item.uploadedAt,
        uploadedBy: activeExecution?.dentist || PATIENT.name,
      })),
    }));
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const match = prev.find((item) => item.id === id);
      if (match) {
        URL.revokeObjectURL(match.previewUrl);
      }
      const next = prev.filter((item) => item.id !== id);
      updateExecution((execution) => ({
        ...execution,
        attachments: next.map((item) => ({
          id: item.id,
          type: item.type === 'X-ray' ? 'X-ray' : 'Clinical Image',
          fileName: item.name,
          fileUrl: item.previewUrl,
          uploadedAt: item.uploadedAt,
          uploadedBy: activeExecution?.dentist || PATIENT.name,
        })),
      }));
      return next;
    });
  };

  const updateConsumable = (id: string, field: keyof ConsumableRecord, value: string | number) => {
    setConsumables((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, [field]: value } : item));
      updateExecution((execution) => ({
        ...execution,
        consumables: next,
      }));
      return next;
    });
  };

  const removeConsumable = (id: string) => {
    setConsumables((prev) => {
      const next = prev.filter((item) => item.id !== id);
      updateExecution((execution) => ({
        ...execution,
        consumables: next,
      }));
      return next;
    });
  };

  const updatePrescription = (id: string, field: keyof ProcedurePrescriptionItem, value: string) => {
    setPrescriptions((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, [field]: value } : item));
      updateExecution((execution) => ({
        ...execution,
        prescriptions: next,
      }));
      return next;
    });
  };

  const removePrescription = (id: string) => {
    setPrescriptions((prev) => {
      const next = prev.filter((item) => item.id !== id);
      updateExecution((execution) => ({
        ...execution,
        prescriptions: next,
      }));
      return next;
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      addAttachments(event.dataTransfer.files);
    }
  };

  const completionReady = stripHtml(activeExecution?.clinicalNotes || '').length > 0;
  const mainPrompt = activeItem
    ? `${activeItem.procedure} on tooth ${activeItem.toothArea}`
    : 'No active procedure loaded';

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 px-4 pb-6 pt-4 lg:px-8">
        <div className="rounded-3xl border border-border bg-card/95 p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading active procedure workspace...</p>
        </div>
      </div>
    );
  }

  if (!activeExecution || !activeItem) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-4 px-4 pb-6 pt-4 lg:px-8">
        <Button variant="ghost" className="w-fit" onClick={() => router.push('/treatment-execution')}>
          <ArrowLeft className="size-4" />
          Back to Treatment Execution
        </Button>
        <section className="rounded-3xl border border-border bg-card/95 p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary/80">
            Active Procedure Workspace
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">No procedure is currently running</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Start a procedure from Treatment Execution to open this workspace with a live chart, clinical
            notes, materials, imaging, and prescription controls.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[1600px] space-y-5 px-4 pb-28 pt-4 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/treatment-execution')}
          >
            <ArrowLeft className="size-4" />
            Back to Treatment Execution
          </Button>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/80">
              Active Procedure Workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {PATIENT.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time procedure chart for {mainPrompt}. The procedure stays open until it is completed.
            </p>
          </div>
        </div>

        <div className="hidden flex-col items-end gap-2 md:flex">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
              Status
            </p>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-200">IN PROGRESS</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Running Timer
            </p>
            <p className="mt-1 font-mono text-3xl font-black tracking-[0.14em] text-foreground">
              {formatElapsedTime(currentElapsed)}
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-4 z-20 rounded-3xl border border-border/80 bg-card/90 px-4 py-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Medical Alerts
          </span>
          {ALERT_BADGES.map((alert) => (
            <span
              key={alert}
              className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-foreground"
            >
              {alert}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)]">
        <div className="space-y-5">
          <section className="grid gap-4 rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_16px_40px_rgba(2,6,23,0.08)] md:grid-cols-2 xl:grid-cols-4">
            <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                  Patient Session
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-bold text-foreground">{PATIENT.name}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                    {PATIENT.code}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Appointment {APPOINTMENT_NUMBER}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{CURRENT_EXAMINATION}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                  Current Status
                </p>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-200">IN PROGRESS</p>
              </div>
            </div>

            <StatChip label="Patient Name" value={PATIENT.name} hint={`${PATIENT.age} years old · ${PATIENT.sex}`} />
            <StatChip label="Patient Code" value={PATIENT.code} hint="Clinic chart reference" />
            <StatChip label="Appointment #" value={APPOINTMENT_NUMBER} hint={flow.session.appointmentDate} />
            <StatChip label="Dentist" value={flow.session.dentist} hint="Responsible clinician" />
            <StatChip label="Procedure" value={activeItem.procedure} hint={activeItem.linkedDiagnosis} />
            <StatChip label="Tooth Number" value={activeItem.toothArea} hint={activeItem.toothSurface.join(', ') || 'Full arch'} />
            <StatChip label="Session Status" value={flow.session.status} hint={`Last saved ${flow.lastSavedAt ? new Date(flow.lastSavedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'just now'}`} />
            <StatChip label="Timer" value={formatElapsedTime(currentElapsed)} hint="Live running clock" />
          </section>

          {validationMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              {validationMessage}
            </div>
          )}

          <SectionCard
            eyebrow="Procedure Details"
            title="Current procedure summary"
            description="The dentist sees the live treatment context, planned values, and who is assisting."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatChip label="Procedure" value={activeItem.procedure} />
              <StatChip label="Tooth" value={activeItem.toothArea} />
              <StatChip label="Surface" value={activeItem.toothSurface.join(', ') || 'N/A'} />
              <StatChip label="Estimated Duration" value={activeItem.estimatedDuration} />
              <StatChip label="Estimated Price" value={formatCurrency(activeItem.estimatedPrice)} />
              <StatChip label="Priority" value={activeItem.priority} />
              <StatChip label="Dentist" value={flow.session.dentist} />
              <StatChip label="Assistant" value={flow.session.assistant || DEFAULT_ASSISTANT} />
              <StatChip label="Procedure Status" value={activeExecution.status} />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Clinical Notes"
            title="Rich treatment notes"
            description="Use bold, italic, bullets, and timestamps. Notes auto-save while you work."
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="xs" onClick={() => execToolbarCommand('bold')} aria-label="Bold">
                <Bold className="size-3" />
                Bold
              </Button>
              <Button variant="outline" size="xs" onClick={() => execToolbarCommand('italic')} aria-label="Italic">
                <Italic className="size-3" />
                Italic
              </Button>
              <Button variant="outline" size="xs" onClick={() => execToolbarCommand('insertUnorderedList')} aria-label="Bullet list">
                <List className="size-3" />
                Bullet list
              </Button>
              <Button variant="outline" size="xs" onClick={() => execToolbarCommand('insertText')} aria-label="Insert timestamp">
                <Clock className="size-3" />
                Timestamp
              </Button>
              <span className="ml-auto text-[11px] font-semibold text-muted-foreground">{manualStatus}</span>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-3 shadow-inner focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
              <div
                ref={editorRef}
                className="min-h-[220px] whitespace-pre-wrap rounded-xl outline-none"
                contentEditable
                suppressContentEditableWarning
                aria-label="Clinical notes editor"
                onInput={syncNotes}
                onBlur={syncNotes}
              />
              {!stripHtml(notesHtml) && (
                <p className="pointer-events-none -mt-56 px-1 text-sm text-muted-foreground/60">
                  Record the actual treatment performed...
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Anesthesia"
            title="Local anesthesia record"
            description="Document medication, dosage, quantity, and injection site or skip if no anesthetic is used."
          >
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <Syringe className="size-4 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {anesthesiaEnabled ? 'Anesthesia enabled' : 'Anesthesia skipped'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The record remains editable and saves with the active procedure.
                  </p>
                </div>
              </div>
              <Button variant={anesthesiaEnabled ? 'secondary' : 'outline'} size="sm" onClick={() => setAnesthesiaEnabled((prev) => !prev)}>
                {anesthesiaEnabled ? 'Disable' : 'Use anesthesia'}
              </Button>
            </div>

            <div className={`grid gap-3 md:grid-cols-2 ${!anesthesiaEnabled ? 'opacity-70' : ''}`}>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                Drug Name
                <input
                  value={anesthesia.drug}
                  onChange={(e) => setAnesthesia({ ...anesthesia, drug: e.target.value })}
                  className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  placeholder="Select or type drug"
                  disabled={!anesthesiaEnabled}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                Dosage
                <input
                  value={anesthesia.dosage}
                  onChange={(e) => setAnesthesia({ ...anesthesia, dosage: e.target.value })}
                  className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  placeholder="e.g. 1.8 mL per cartridge"
                  disabled={!anesthesiaEnabled}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                Quantity
                <input
                  type="number"
                  min={1}
                  value={anesthesia.quantity}
                  onChange={(e) => setAnesthesia({ ...anesthesia, quantity: Number(e.target.value) })}
                  className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  disabled={!anesthesiaEnabled}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                Injection Site
                <input
                  value={anesthesia.injectionSite}
                  onChange={(e) => setAnesthesia({ ...anesthesia, injectionSite: e.target.value })}
                  className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  placeholder="e.g. Inferior Alveolar Nerve Block"
                  disabled={!anesthesiaEnabled}
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                Notes
                <input
                  value={anesthesia.notes}
                  onChange={(e) => setAnesthesia({ ...anesthesia, notes: e.target.value })}
                  className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  placeholder="Any anesthesia notes"
                  disabled={!anesthesiaEnabled}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={handleAnesthesiaSkip}>
                Skip
              </Button>
              <Button onClick={handleAnesthesiaSave}>
                Save
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Consumables Used"
            title="Material tracking"
            description="Record materials used during the procedure. Inventory deduction is intentionally not connected."
          >
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr_1fr_auto] gap-px bg-border text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                <div className="bg-muted/30 px-3 py-2">Material</div>
                <div className="bg-muted/30 px-3 py-2">Quantity</div>
                <div className="bg-muted/30 px-3 py-2">Unit</div>
                <div className="bg-muted/30 px-3 py-2">Notes</div>
                <div className="bg-muted/30 px-3 py-2 text-right">Remove</div>
              </div>
              <div className="divide-y divide-border bg-background/70">
                {consumables.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[1.3fr_0.7fr_0.7fr_1fr_auto] md:items-end">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Material</span>
                      <input
                        value={item.material}
                        onChange={(e) => updateConsumable(item.id, 'material', e.target.value)}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        placeholder="Composite Resin A2"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Quantity</span>
                      <input
                        type="number"
                        min={1}
                        value={item.quantityUsed}
                        onChange={(e) => updateConsumable(item.id, 'quantityUsed', Number(e.target.value))}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Unit</span>
                      <input
                        value={item.unit || 'pcs'}
                        onChange={(e) => updateConsumable(item.id, 'unit', e.target.value)}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        placeholder="pcs"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Notes</span>
                      <input
                        value={item.notes}
                        onChange={(e) => updateConsumable(item.id, 'notes', e.target.value)}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        placeholder="Shade match / isolation / etc."
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeConsumable(item.id)}
                      className="flex h-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remove consumable row ${item.id}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={addConsumable}>
                <Plus className="size-4" />
                Add Material
              </Button>
              <Button variant="secondary" onClick={handleManualSave}>
                <Save className="size-4" />
                Save
              </Button>
              <p className="text-xs text-muted-foreground">
                Inventory deduction is disabled in this UI.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Clinical Images"
            title="Upload x-rays, photos, or PDFs"
            description="Drag and drop files or use the upload button. Preview, view full screen, and delete are all supported."
          >
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-3xl border-2 border-dashed p-5 transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/15'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
                  <UploadCloud className="size-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Drop clinical files here</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Support for X-rays, photos, and PDFs.
                  </p>
                </div>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="size-4" />
                  Upload files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(event) => {
                    if (event.target.files) {
                      addAttachments(event.target.files);
                      event.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {attachments.map((file) => (
                <div key={file.id} className="rounded-2xl border border-border bg-muted/20 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        {file.type === 'PDF' ? (
                          <FileText className="size-5" />
                        ) : (
                          <ImageIcon className="size-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {file.type} • {file.sizeLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="rounded-lg p-1 text-muted-foreground transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Delete ${file.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFullScreenFile(file)}>
                      <Maximize2 className="size-3.5" />
                      View Full Screen
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setFullScreenFile(file)}>
                      <Eye className="size-3.5" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Prescription"
            title="Medication plan"
            description="Add or skip medication instructions. The list stays within the active procedure until saved."
          >
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_1.1fr_auto] gap-px bg-border text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                <div className="bg-muted/30 px-3 py-2">Medicine</div>
                <div className="bg-muted/30 px-3 py-2">Dosage</div>
                <div className="bg-muted/30 px-3 py-2">Frequency</div>
                <div className="bg-muted/30 px-3 py-2">Duration</div>
                <div className="bg-muted/30 px-3 py-2">Instructions</div>
                <div className="bg-muted/30 px-3 py-2 text-right">Remove</div>
              </div>
              <div className="divide-y divide-border bg-background/70">
                {prescriptions.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_1.1fr_auto] md:items-end">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Medicine</span>
                      <input
                        value={item.medicineName}
                        onChange={(e) => updatePrescription(item.id, 'medicineName', e.target.value)}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        placeholder="Amoxicillin"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Dosage</span>
                      <input
                        value={item.dosage}
                        onChange={(e) => updatePrescription(item.id, 'dosage', e.target.value)}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        placeholder="500 mg"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Frequency</span>
                      <input
                        value={item.frequency}
                        onChange={(e) => updatePrescription(item.id, 'frequency', e.target.value)}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        placeholder="3x daily"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Duration</span>
                      <input
                        value={item.duration}
                        onChange={(e) => updatePrescription(item.id, 'duration', e.target.value)}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        placeholder="7 days"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                      <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Instructions</span>
                      <input
                        value={item.instructions}
                        onChange={(e) => updatePrescription(item.id, 'instructions', e.target.value)}
                        className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                        placeholder="Take after meals"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removePrescription(item.id)}
                      className="flex h-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remove prescription row ${item.id}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={addPrescription}>
                <Plus className="size-4" />
                Add Medicine
              </Button>
              <Button variant="secondary" onClick={handleManualSave}>
                <Save className="size-4" />
                Save Prescription
              </Button>
              <Button variant="ghost" onClick={() => setPrescriptions([])}>
                Skip
              </Button>
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
          <SectionCard
            eyebrow="Live Session Summary"
            title="Session overview"
            description="Real-time treatment context for the dentist and assistant."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-emerald-600 dark:text-emerald-300" />
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">
                    Current Procedure
                  </p>
                </div>
                <p className="mt-2 text-sm font-bold text-foreground">{activeItem.procedure}</p>
                <p className="text-xs text-muted-foreground">
                  Tooth {activeItem.toothArea} • {activeItem.toothSurface.join(', ') || 'No surface specified'}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Elapsed Time
                </p>
                <p className="mt-1 font-mono text-3xl font-black tracking-[0.16em] text-foreground">
                  {formatElapsedTime(currentElapsed)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Running since {activeExecution.startTime}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <StatChip label="Completed Today" value={String(completedCount)} />
                <StatChip label="Remaining Procedures" value={String(remainingCount)} />
                <StatChip label="Estimated Total" value={formatCurrency(totalEstimatedTotal)} />
                <StatChip label="Current Procedure Cost" value={formatCurrency(currentProcedureCost)} />
                <StatChip label="Today's Total" value={formatCurrency(todayTotal)} />
                <StatChip label="Dentist" value={flow.session.dentist} />
                <StatChip label="Assistant" value={flow.session.assistant || DEFAULT_ASSISTANT} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Quick Actions"
            title="Procedure controls"
            description="Keep the dentist in the flow without leaving the workspace."
          >
            <div className="space-y-2">
              <Button className="h-11 w-full justify-start rounded-2xl" onClick={handleManualSave}>
                <Save className="size-4" />
                Save Progress
              </Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl" onClick={handlePauseProcedure}>
                <PauseCircle className="size-4" />
                Pause Procedure
              </Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300" onClick={handleMarkIncomplete}>
                <ShieldAlert className="size-4" />
                Mark Incomplete
              </Button>
              <Button className="h-11 w-full justify-start rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60" onClick={handleCompleteProcedure} disabled={!completionReady}>
                <CheckCircle2 className="size-4" />
                Complete Procedure
              </Button>
            </div>
            {!completionReady && (
              <p className="mt-3 text-xs text-muted-foreground">
                Clinical notes must be recorded before completion.
              </p>
            )}
          </SectionCard>

          <SectionCard
            eyebrow="Patient Context"
            title="Clinical safety"
            description="A quick reminder of the patient profile and alerts."
          >
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <User className="size-3.5" />
                  Patient
                </div>
                <p className="mt-2 font-bold text-foreground">{PATIENT.name}</p>
                <p className="text-xs text-muted-foreground">{PATIENT.code} · {PATIENT.age} years old</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <AlertTriangle className="size-3.5" />
                  Alerts
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PATIENT.allergies.map((allergy) => (
                    <span key={allergy} className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                      {allergy}
                    </span>
                  ))}
                  {PATIENT.medicalConditions.map((condition) => (
                    <span key={condition} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      {condition}
                    </span>
                  ))}
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                    Consent Accepted
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-11 justify-center rounded-2xl" onClick={handleManualSave}>
            <Save className="size-4" />
            Save
          </Button>
          <Button className="h-11 justify-center rounded-2xl bg-primary text-primary-foreground" onClick={handleCompleteProcedure} disabled={!completionReady}>
            <CheckCircle2 className="size-4" />
            Complete
          </Button>
          <Button variant="outline" className="h-11 justify-center rounded-2xl border-rose-200 text-rose-700" onClick={handleMarkIncomplete}>
            <ShieldAlert className="size-4" />
            Incomplete
          </Button>
          <Button variant="outline" className="h-11 justify-center rounded-2xl" onClick={handlePauseProcedure}>
            <PauseCircle className="size-4" />
            Pause
          </Button>
        </div>
      </div>

      {fullScreenFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl rounded-3xl border border-border bg-card p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Full Screen Preview
                </p>
                <h3 className="text-lg font-bold text-foreground">{fullScreenFile.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setFullScreenFile(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="rounded-2xl border border-border bg-muted/15 p-3">
              {fullScreenFile.type === 'PDF' ? (
                <iframe
                  title={fullScreenFile.name}
                  src={fullScreenFile.previewUrl}
                  className="h-[70vh] w-full rounded-xl border-0 bg-background"
                />
              ) : (
                <img
                  src={fullScreenFile.previewUrl}
                  alt={fullScreenFile.name}
                  className="max-h-[70vh] w-full rounded-xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
