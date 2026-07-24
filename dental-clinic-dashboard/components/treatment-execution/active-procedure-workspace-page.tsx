'use client';

import { useState, useRef } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Bold,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
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
  ChevronRight,
  Play,
  Stethoscope,
  Activity,
  ScanLine,
  Pill,
  Camera,
  ClipboardList,
  MinusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── MOCK DATA ──────────────────────────────────────────── */

const MOCK_PATIENT = {
  name: 'Sok Dara',
  patientId: 'PT000124',
  age: 34,
  gender: 'Male',
  medicalAlert: 'Penicillin Allergy',
};

const MOCK_APPOINTMENT = {
  type: 'Filling',
  dentist: 'Dr. Chan Vireak',
  chair: 'Chair 02',
  time: '10:30 AM',
};

const MOCK_PROCEDURE = {
  procedure: 'Composite Filling',
  tooth: '#16',
  surface: 'Occlusal',
  status: 'In Progress',
  duration: '35 minutes',
};

const MOCK_TREATMENT_PLAN = [
  { procedure: 'Composite Filling', tooth: '#16', status: 'In Progress' },
  { procedure: 'Scaling', tooth: 'Full Mouth', status: 'Planned' },
  { procedure: 'Crown Review', tooth: '#26', status: 'Planned' },
];

const MOCK_CLINICAL_NOTES =
  'Patient reports sensitivity when drinking cold water. Caries observed on tooth #16 occlusal surface. Composite restoration recommended.';

const MOCK_ANESTHESIA = {
  drug: 'Lidocaine 2%',
  dosage: '1.8 ml',
  quantity: 1,
  injectionSite: 'Buccal infiltration',
};

const MOCK_MATERIALS = [
  { material: 'Composite Resin', quantity: 1, unit: 'unit' },
  { material: 'Etching Gel', quantity: 1, unit: 'unit' },
  { material: 'Bonding Agent', quantity: 1, unit: 'unit' },
  { material: 'Cotton Roll', quantity: 2, unit: 'units' },
];

const MOCK_PRESCRIPTION = {
  medicine: 'Ibuprofen',
  dosage: '400 mg',
  frequency: 'Every 8 hours',
  duration: '3 days',
  instructions: 'Take after food',
};

const MOCK_IMAGES: { id: string; label: string; type: 'X-ray' | 'Clinical' }[] = [
  { id: 'img-1', label: 'Pre-op X-ray #16', type: 'X-ray' },
  { id: 'img-2', label: 'Occlusal view #16', type: 'Clinical' },
  { id: 'img-3', label: 'Bitewing X-ray', type: 'X-ray' },
];

/* ── UI HELPERS ─────────────────────────────────────────── */

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
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

function ToothGrid() {
  const upperTeeth = [
    '#18', '#17', '#16', '#15', '#14', '#13', '#12', '#11',
    '#21', '#22', '#23', '#24', '#25', '#26', '#27', '#28',
  ];
  const lowerTeeth = [
    '#48', '#47', '#46', '#45', '#44', '#43', '#42', '#41',
    '#31', '#32', '#33', '#34', '#35', '#36', '#37', '#38',
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 justify-center">
        {upperTeeth.map((t) => (
          <div
            key={t}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[10px] font-bold transition-all ${
              t === '#16'
                ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 ring-2 ring-blue-400'
                : t === '#26'
                  ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                  : 'border-border bg-muted/30 text-muted-foreground'
            }`}
            title={t}
          >
            {t.replace('#', '')}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {lowerTeeth.map((t) => (
          <div
            key={t}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[10px] font-bold transition-all ${
              t === '#16'
                ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                : 'border-border bg-muted/30 text-muted-foreground'
            }`}
            title={t}
          >
            {t.replace('#', '')}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-blue-500 bg-blue-100" />
          Active (#16)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded border border-amber-300 bg-amber-50" />
          Planned (#26)
        </span>
      </div>
    </div>
  );
}

function ImagePlaceholder({ label, type }: { label: string; type: 'X-ray' | 'Clinical' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 p-4 text-center">
      <div className="flex h-20 w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
        {type === 'X-ray' ? (
          <ScanLine className="size-8 text-primary/40" />
        ) : (
          <Camera className="size-8 text-primary/40" />
        )}
      </div>
      <p className="mt-2 text-xs font-semibold text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{type === 'X-ray' ? 'X-ray' : 'Clinical Image'}</p>
    </div>
  );
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-2xl">
      {message}
    </div>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────────── */

export function ActiveProcedureWorkspacePage() {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [notesHtml, setNotesHtml] = useState(MOCK_CLINICAL_NOTES);
  const [anesthesiaEnabled, setAnesthesiaEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'plan'>('current');
  const [completedProcedures, setCompletedProcedures] = useState<string[]>([]);
  const [materials, setMaterials] = useState(MOCK_MATERIALS);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
  };

  const handleSaveNotes = () => {
    const html = editorRef.current?.innerHTML || '';
    setNotesHtml(html);
    showToast('Notes saved (UI mockup)');
  };

  const execToolbarCommand = (command: 'bold' | 'italic' | 'insertUnorderedList' | 'insertText') => {
    editorRef.current?.focus();
    if (command === 'insertText') {
      document.execCommand('insertText', false, `\n[${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}] `);
      return;
    }
    document.execCommand(command, false);
  };

  const handleAddMaterial = () => {
    setMaterials((prev) => [...prev, { material: 'New Material', quantity: 1, unit: 'unit' }]);
    showToast('Material row added (UI mockup)');
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
    showToast('Material removed (UI mockup)');
  };

  const handleAddAnesthesia = () => {
    showToast('Anesthesia recorded (UI mockup)');
  };

  const handleAttachImage = () => {
    showToast('Image attachment dialog would open (UI mockup)');
  };

  const handleAddPrescription = () => {
    showToast('Prescription added (UI mockup)');
  };

  const handleCompleteProcedure = () => {
    showToast('Procedure marked complete (UI mockup)');
  };

  const handleNextProcedure = () => {
    showToast('Moving to next procedure (UI mockup)');
  };

  const handlePauseProcedure = () => {
    showToast('Procedure paused (UI mockup)');
  };

  const handleBackToTreatment = () => {
    showToast('Returning to Treatment Execution (UI mockup)');
  };

  const markStepComplete = (procedure: string) => {
    setCompletedProcedures((prev) =>
      prev.includes(procedure) ? prev : [...prev, procedure]
    );
    showToast(`"${procedure}" toggled complete (UI mockup)`);
  };

  /* ── RENDER ────────────────────────────────────────────── */

  return (
    <div className="relative mx-auto max-w-[1600px] space-y-5 px-4 pb-28 pt-4 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
            onClick={handleBackToTreatment}
          >
            <ArrowLeft className="size-4" />
            Back to Treatment Execution
          </Button>
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary/80">
              Active Procedure Workspace
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {MOCK_PATIENT.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {MOCK_PROCEDURE.procedure} on tooth {MOCK_PROCEDURE.tooth} — {MOCK_PROCEDURE.status}
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
        </div>
      </div>

      {/* Medical Alert Bar */}
      <div className="sticky top-4 z-20 rounded-3xl border border-border/80 bg-card/90 px-4 py-3 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldAlert className="size-4 text-rose-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Medical Alert
          </span>
          <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {MOCK_PATIENT.medicalAlert}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)]">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Patient Summary */}
          <section className="grid gap-4 rounded-3xl border border-border/80 bg-card/95 p-5 shadow-[0_16px_40px_rgba(2,6,23,0.08)] md:grid-cols-2 xl:grid-cols-4">
            <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                  Patient Session
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-bold text-foreground">{MOCK_PATIENT.name}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                    {MOCK_PATIENT.patientId}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{MOCK_APPOINTMENT.type}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{MOCK_APPOINTMENT.chair}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                  Current Status
                </p>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-200">{MOCK_PROCEDURE.status.toUpperCase()}</p>
              </div>
            </div>
            <StatChip label="Patient Name" value={MOCK_PATIENT.name} hint={`${MOCK_PATIENT.age} years old · ${MOCK_PATIENT.gender}`} />
            <StatChip label="Patient ID" value={MOCK_PATIENT.patientId} hint="Clinic chart reference" />
            <StatChip label="Appointment" value={MOCK_APPOINTMENT.type} hint={MOCK_APPOINTMENT.time} />
            <StatChip label="Dentist" value={MOCK_APPOINTMENT.dentist} hint={MOCK_APPOINTMENT.chair} />
            <StatChip label="Procedure" value={MOCK_PROCEDURE.procedure} hint={MOCK_PROCEDURE.surface} />
            <StatChip label="Tooth" value={MOCK_PROCEDURE.tooth} hint={MOCK_PROCEDURE.surface} />
            <StatChip label="Duration" value={MOCK_PROCEDURE.duration} hint="Estimated time" />
            <StatChip label="Status" value={MOCK_PROCEDURE.status} hint="Currently active" />
          </section>

          {/* Tabs: Current Procedure / Treatment Plan */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('current')}
              className="rounded-2xl"
            >
              <Activity className="size-4" />
              Current Procedure
            </Button>
            <Button
              variant={activeTab === 'plan' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('plan')}
              className="rounded-2xl"
            >
              <ClipboardList className="size-4" />
              Treatment Plan
            </Button>
          </div>

          {/* Current Procedure View */}
          {activeTab === 'current' && (
            <>
              {/* Tooth / Odontogram */}
              <SectionCard
                eyebrow="Odontogram"
                title="Dental Chart"
                description="Visual tooth map — #16 highlighted as active tooth"
              >
                <ToothGrid />
              </SectionCard>

              {/* Clinical Notes */}
              <SectionCard
                eyebrow="Clinical Notes"
                title="Treatment notes"
                description="Record observations, findings, and procedure details."
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
                  <Button variant="secondary" size="xs" onClick={handleSaveNotes}>
                    <Save className="size-3" />
                    Save Notes
                  </Button>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-3 shadow-inner focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
                  <div
                    ref={editorRef}
                    className="min-h-[180px] whitespace-pre-wrap rounded-xl outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    aria-label="Clinical notes editor"
                    dangerouslySetInnerHTML={{ __html: notesHtml }}
                  />
                </div>
              </SectionCard>

              {/* Anesthesia */}
              <SectionCard
                eyebrow="Anesthesia"
                title="Local anesthesia record"
                description="Document medication, dosage, quantity, and injection site."
              >
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Syringe className="size-4 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {anesthesiaEnabled ? 'Anesthesia enabled' : 'Anesthesia skipped'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {MOCK_ANESTHESIA.drug} — {MOCK_ANESTHESIA.dosage}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={anesthesiaEnabled ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setAnesthesiaEnabled((prev) => !prev)}
                  >
                    {anesthesiaEnabled ? 'Disable' : 'Use anesthesia'}
                  </Button>
                </div>
                <div className={`grid gap-3 md:grid-cols-2 ${!anesthesiaEnabled ? 'opacity-70' : ''}`}>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Drug Name
                    <input
                      defaultValue={MOCK_ANESTHESIA.drug}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                      disabled={!anesthesiaEnabled}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Dosage
                    <input
                      defaultValue={MOCK_ANESTHESIA.dosage}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                      disabled={!anesthesiaEnabled}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Quantity (cartridges)
                    <input
                      type="number"
                      min={1}
                      defaultValue={MOCK_ANESTHESIA.quantity}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                      disabled={!anesthesiaEnabled}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Injection Site
                    <input
                      defaultValue={MOCK_ANESTHESIA.injectionSite}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                      disabled={!anesthesiaEnabled}
                    />
                  </label>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAnesthesiaEnabled(false)}>
                    Skip
                  </Button>
                  <Button onClick={handleAddAnesthesia}>
                    <Syringe className="size-4" />
                    Save Anesthesia
                  </Button>
                </div>
              </SectionCard>

              {/* Materials / Consumables */}
              <SectionCard
                eyebrow="Materials"
                title="Consumables used"
                description="Record materials used during the procedure."
              >
                <div className="overflow-hidden rounded-2xl border border-border">
                  <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr_auto] gap-px bg-border text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    <div className="bg-muted/30 px-3 py-2">Material</div>
                    <div className="bg-muted/30 px-3 py-2">Quantity</div>
                    <div className="bg-muted/30 px-3 py-2">Unit</div>
                    <div className="bg-muted/30 px-3 py-2 text-right">Remove</div>
                  </div>
                  <div className="divide-y divide-border bg-background/70">
                    {materials.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[1.3fr_0.7fr_0.7fr_auto] md:items-end">
                        <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                          <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Material</span>
                          <input
                            defaultValue={item.material}
                            className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                          <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Quantity</span>
                          <input
                            type="number"
                            min={1}
                            defaultValue={item.quantity}
                            className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
                          <span className="md:hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Unit</span>
                          <input
                            defaultValue={item.unit}
                            className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(index)}
                          className="flex h-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Remove ${item.material}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={handleAddMaterial}>
                    <Plus className="size-4" />
                    Add Material
                  </Button>
                </div>
              </SectionCard>

              {/* Clinical Images / X-rays */}
              <SectionCard
                eyebrow="Clinical Images"
                title="X-rays & photos"
                description="View mock images for this procedure. Real uploading not implemented."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {MOCK_IMAGES.map((img) => (
                    <div key={img.id} className="group relative">
                      <ImagePlaceholder label={img.label} type={img.type} />
                      <div className="mt-2 flex gap-1">
                        <Button variant="outline" size="xs" className="flex-1" onClick={() => showToast(`Preview: ${img.label}`)}>
                          <Eye className="size-3" />
                          View
                        </Button>
                        <Button variant="outline" size="xs" className="flex-1" onClick={() => showToast(`Full screen: ${img.label}`)}>
                          <Maximize2 className="size-3" />
                          Expand
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" onClick={handleAttachImage}>
                    <UploadCloud className="size-4" />
                    Attach Image
                  </Button>
                </div>
              </SectionCard>

              {/* Prescription */}
              <SectionCard
                eyebrow="Prescription"
                title="Medication plan"
                description="Add medication instructions for the patient."
              >
                <div className="grid gap-3 md:grid-cols-2 rounded-2xl border border-border bg-muted/15 p-4">
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Medicine
                    <input
                      defaultValue={MOCK_PRESCRIPTION.medicine}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Dosage
                    <input
                      defaultValue={MOCK_PRESCRIPTION.dosage}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Frequency
                    <input
                      defaultValue={MOCK_PRESCRIPTION.frequency}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Duration
                    <input
                      defaultValue={MOCK_PRESCRIPTION.duration}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                  <label className="md:col-span-2 flex flex-col gap-1.5 text-xs font-semibold text-foreground">
                    Instructions
                    <input
                      defaultValue={MOCK_PRESCRIPTION.instructions}
                      className="h-10 rounded-xl border border-border bg-background/70 px-3 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleAddPrescription}>
                    <Plus className="size-4" />
                    Add Prescription
                  </Button>
                  <Button variant="secondary" onClick={() => showToast('Prescription saved (UI mockup)')}>
                    <Save className="size-4" />
                    Save Prescription
                  </Button>
                </div>
              </SectionCard>
            </>
          )}

          {/* Treatment Plan View */}
          {activeTab === 'plan' && (
            <SectionCard
              eyebrow="Treatment Plan"
              title="Procedure progress"
              description="Overview of all planned procedures and their current status."
            >
              <div className="space-y-3">
                {MOCK_TREATMENT_PLAN.map((step, index) => {
                  const isCompleted = completedProcedures.includes(step.procedure);
                  const isActive = step.status === 'In Progress' && !isCompleted;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                        isActive
                          ? 'border-primary/30 bg-primary/5'
                          : isCompleted
                            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-900/10'
                            : 'border-border bg-muted/20'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : isCompleted
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-200'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="size-5" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {step.procedure}
                        </p>
                        <p className="text-xs text-muted-foreground">Tooth {step.tooth}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-200'
                            : isActive
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-200'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? 'Completed' : step.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => markStepComplete(step.procedure)}
                        className="shrink-0"
                      >
                        <CheckCircle2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => showToast('Next procedure initiated (UI mockup)')}>
                  <Play className="size-4" />
                  Start Next
                </Button>
                <Button variant="secondary" size="sm" onClick={() => showToast('Treatment plan updated (UI mockup)')}>
                  <Save className="size-4" />
                  Update Plan
                </Button>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
          {/* Current Procedure Summary */}
          <SectionCard
            eyebrow="Current Procedure"
            title={MOCK_PROCEDURE.procedure}
            description={`Tooth ${MOCK_PROCEDURE.tooth} — ${MOCK_PROCEDURE.surface}`}
          >
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600 dark:text-emerald-300" />
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">
                  {MOCK_PROCEDURE.status}
                </p>
              </div>
              <p className="mt-2 text-sm font-bold text-foreground">{MOCK_PROCEDURE.procedure}</p>
              <p className="text-xs text-muted-foreground">
                Tooth {MOCK_PROCEDURE.tooth} • {MOCK_PROCEDURE.surface}
              </p>
            </div>
            <StatChip label="Duration" value={MOCK_PROCEDURE.duration} hint="Estimated" />
            <StatChip label="Dentist" value={MOCK_APPOINTMENT.dentist} hint={MOCK_APPOINTMENT.chair} />
          </SectionCard>

          {/* Treatment Plan Progress */}
          <SectionCard
            eyebrow="Treatment Plan"
            title="Progress"
            description="3 procedures planned"
          >
            <div className="space-y-2">
              {MOCK_TREATMENT_PLAN.map((step, index) => {
                const isCompleted = completedProcedures.includes(step.procedure);
                const isActive = step.status === 'In Progress' && !isCompleted;
                return (
                  <div key={index} className="flex items-center gap-3 rounded-xl bg-muted/15 p-2.5">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="size-3.5" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {step.procedure}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Tooth {step.tooth}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${
                      isCompleted
                        ? 'text-emerald-600'
                        : isActive
                          ? 'text-blue-600'
                          : 'text-muted-foreground'
                    }`}>
                      {isCompleted ? '✓' : isActive ? '●' : '○'}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard
            eyebrow="Quick Actions"
            title="Procedure controls"
            description="Mockup buttons — no real workflow"
          >
            <div className="space-y-2">
              <Button className="h-11 w-full justify-start rounded-2xl" onClick={handleSaveNotes}>
                <Save className="size-4" />
                Save Notes
              </Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl" onClick={handleAddMaterial}>
                <Plus className="size-4" />
                Add Material
              </Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl" onClick={handleAddAnesthesia}>
                <Syringe className="size-4" />
                Add Anesthesia
              </Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl" onClick={handleAttachImage}>
                <Camera className="size-4" />
                Attach Image
              </Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl" onClick={handleAddPrescription}>
                <Pill className="size-4" />
                Add Prescription
              </Button>
              <div className="border-t border-border pt-2 mt-2 space-y-2">
                <Button className="h-11 w-full justify-start rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCompleteProcedure}>
                  <CheckCircle2 className="size-4" />
                  Complete Procedure
                </Button>
                <Button variant="outline" className="h-11 w-full justify-start rounded-2xl" onClick={handleNextProcedure}>
                  <ChevronRight className="size-4" />
                  Next Procedure
                </Button>
                <Button variant="outline" className="h-11 w-full justify-start rounded-2xl" onClick={handlePauseProcedure}>
                  <PauseCircle className="size-4" />
                  Pause Procedure
                </Button>
                <Button variant="outline" className="h-11 w-full justify-start rounded-2xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300" onClick={handleBackToTreatment}>
                  <MinusCircle className="size-4" />
                  Back to Treatment Execution
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Patient Context */}
          <SectionCard
            eyebrow="Patient Context"
            title="Clinical safety"
            description="Quick reminder of the patient profile."
          >
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <User className="size-3.5" />
                  Patient
                </div>
                <p className="mt-2 font-bold text-foreground">{MOCK_PATIENT.name}</p>
                <p className="text-xs text-muted-foreground">{MOCK_PATIENT.patientId} · {MOCK_PATIENT.age} years old</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <ShieldAlert className="size-3.5" />
                  Alerts
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                    {MOCK_PATIENT.medicalAlert}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}