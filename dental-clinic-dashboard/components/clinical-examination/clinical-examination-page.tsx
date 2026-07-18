'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  ClipboardList,
  Clock3,
  CornerDownLeft,
  CornerDownRight,
  FileText,
  Radio,
  RotateCcw,
  Scan,
  Stethoscope,
  Undo2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { XrayImagesSection } from './xray-images/xray-images-section';
import { DiagnosisTab } from './diagnosis/diagnosis-tab';
import { TreatmentPlanTab } from './treatment/treatment-plan-tab';

const SURFACES = ['occlusal', 'mesial', 'distal', 'buccal', 'lingual'] as const;
type SurfaceKey = (typeof SURFACES)[number];

type ConditionKey =
  | 'Healthy'
  | 'Caries'
  | 'Composite Filling'
  | 'Amalgam Filling'
  | 'Crown'
  | 'Bridge'
  | 'Implant'
  | 'Root Canal'
  | 'Missing'
  | 'Extracted'
  | 'Fracture'
  | 'Wear'
  | 'Sealant'
  | 'Sensitivity'
  | 'Periapical Lesion'
  | 'Abscess'
  | 'Calculus'
  | 'Gingivitis'
  | 'Periodontitis';

type RecommendationKey =
  | 'Observation'
  | 'Cleaning'
  | 'Composite Filling'
  | 'Extraction'
  | 'Root Canal'
  | 'Crown'
  | 'Bridge'
  | 'Implant'
  | 'Whitening'
  | 'Periodontal Therapy';

type ToothRecord = {
  condition: ConditionKey;
  surfaces: SurfaceKey[];
  recommendation: RecommendationKey;
  notes: string;
  dentist: string;
  lastUpdated: string;
};

type ToothMap = Record<number, ToothRecord>;

type Snapshot = {
  records: ToothMap;
  selectedTooth: number | null;
  selectedSurfaces: SurfaceKey[];
  condition: ConditionKey;
  recommendation: RecommendationKey;
  notes: string;
};

const conditionOptions: ConditionKey[] = [
  'Healthy',
  'Caries',
  'Composite Filling',
  'Amalgam Filling',
  'Crown',
  'Bridge',
  'Implant',
  'Root Canal',
  'Missing',
  'Extracted',
  'Fracture',
  'Wear',
  'Sealant',
  'Sensitivity',
  'Periapical Lesion',
  'Abscess',
  'Calculus',
  'Gingivitis',
  'Periodontitis',
];

const recommendationOptions: RecommendationKey[] = [
  'Observation',
  'Cleaning',
  'Composite Filling',
  'Extraction',
  'Root Canal',
  'Crown',
  'Bridge',
  'Implant',
  'Whitening',
  'Periodontal Therapy',
];

const toothNames: Record<number, string> = {
  18: 'Upper 3rd Molar',
  17: 'Upper 2nd Molar',
  16: 'Upper 1st Molar',
  15: 'Upper 2nd Premolar',
  14: 'Upper 1st Premolar',
  13: 'Upper Canine',
  12: 'Upper Lateral Incisor',
  11: 'Upper Central Incisor',
  21: 'Upper Central Incisor',
  22: 'Upper Lateral Incisor',
  23: 'Upper Canine',
  24: 'Upper 1st Premolar',
  25: 'Upper 2nd Premolar',
  26: 'Upper 1st Molar',
  27: 'Upper 2nd Molar',
  28: 'Upper 3rd Molar',
  48: 'Lower 3rd Molar',
  47: 'Lower 2nd Molar',
  46: 'Lower 1st Molar',
  45: 'Lower 2nd Premolar',
  44: 'Lower 1st Premolar',
  43: 'Lower Canine',
  42: 'Lower Lateral Incisor',
  41: 'Lower Central Incisor',
  31: 'Lower Central Incisor',
  32: 'Lower Lateral Incisor',
  33: 'Lower Canine',
  34: 'Lower 1st Premolar',
  35: 'Lower 2nd Premolar',
  36: 'Lower 1st Molar',
  37: 'Lower 2nd Molar',
  38: 'Lower 3rd Molar',
};

const upperPermanent = [18, 17, 16, 15, 14, 13, 12, 11];
const upperPermanentReverse = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerPermanent = [48, 47, 46, 45, 44, 43, 42, 41];
const lowerPermanentReverse = [31, 32, 33, 34, 35, 36, 37, 38];

const initialRecords: ToothMap = {
  11: {
    condition: 'Composite Filling',
    surfaces: ['mesial'],
    recommendation: 'Observation',
    notes: 'Composite restoration noted during routine examination.',
    dentist: 'Dr. Maya',
    lastUpdated: '5 min ago',
  },
  26: {
    condition: 'Caries',
    surfaces: ['occlusal', 'distal'],
    recommendation: 'Root Canal',
    notes: 'Deep distal caries with pain during percussion.',
    dentist: 'Dr. Maya',
    lastUpdated: '2 min ago',
  },
  36: {
    condition: 'Missing',
    surfaces: [],
    recommendation: 'Observation',
    notes: '',
    dentist: 'Dr. Maya',
    lastUpdated: '7 min ago',
  },
  47: {
    condition: 'Healthy',
    surfaces: [],
    recommendation: 'Observation',
    notes: '',
    dentist: 'Dr. Maya',
    lastUpdated: '10 min ago',
  },
};

const surfaceLabel = {
  occlusal: 'Occlusal',
  mesial: 'Mesial',
  distal: 'Distal',
  buccal: 'Buccal',
  lingual: 'Lingual',
};

const conditionPalette: Record<ConditionKey, { fill: string; stroke: string; ring: string; text: string }> = {
  Healthy: { fill: '#ffffff', stroke: '#94a3b8', ring: '#0ea5e9', text: '#0f172a' },
  Caries: { fill: '#fef08a', stroke: '#d97706', ring: '#facc15', text: '#0f172a' },
  'Composite Filling': { fill: '#bfdbfe', stroke: '#2563eb', ring: '#60a5fa', text: '#0f172a' },
  'Amalgam Filling': { fill: '#94a3b8', stroke: '#475569', ring: '#64748b', text: '#0f172a' },
  Crown: { fill: '#d8b4fe', stroke: '#7e22ce', ring: '#a855f7', text: '#0f172a' },
  Bridge: { fill: '#e9d5ff', stroke: '#9333ea', ring: '#c084fc', text: '#0f172a' },
  Implant: { fill: '#a5f3fc', stroke: '#0891b2', ring: '#22d3ee', text: '#0f172a' },
  'Root Canal': { fill: '#fdba74', stroke: '#ea580c', ring: '#fb923c', text: '#0f172a' },
  Missing: { fill: '#e2e8f0', stroke: '#475569', ring: '#64748b', text: '#0f172a' },
  Extracted: { fill: '#fff1f2', stroke: '#e11d48', ring: '#f43f5e', text: '#0f172a' },
  Fracture: { fill: '#fef3c7', stroke: '#b45309', ring: '#f59e0b', text: '#0f172a' },
  Wear: { fill: '#e5e7eb', stroke: '#6b7280', ring: '#9ca3af', text: '#0f172a' },
  Sealant: { fill: '#bfdbfe', stroke: '#1d4ed8', ring: '#60a5fa', text: '#0f172a' },
  Sensitivity: { fill: '#f5f3ff', stroke: '#7c3aed', ring: '#8b5cf6', text: '#0f172a' },
  'Periapical Lesion': { fill: '#fecdd3', stroke: '#be123c', ring: '#fb7185', text: '#0f172a' },
  Abscess: { fill: '#7f1d1d', stroke: '#991b1b', ring: '#b91c1c', text: '#f8fafc' },
  Calculus: { fill: '#e7e5e4', stroke: '#78716c', ring: '#a8a29e', text: '#0f172a' },
  Gingivitis: { fill: '#fce7f3', stroke: '#be185d', ring: '#ec4899', text: '#0f172a' },
  Periodontitis: { fill: '#f5d0fe', stroke: '#a21caf', ring: '#d946ef', text: '#0f172a' },
};

const conditionBadgeClass = {
  Healthy: 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
  Caries: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  'Composite Filling': 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  'Amalgam Filling': 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  Crown: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  Bridge: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
  Implant: 'border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
  'Root Canal': 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
  Missing: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  Extracted: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  Fracture: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  Wear: 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200',
  Sealant: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
  Sensitivity: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  'Periapical Lesion': 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  Abscess: 'border-red-300 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200',
  Calculus: 'border-stone-200 bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200',
  Gingivitis: 'border-pink-200 bg-pink-50 text-pink-800 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300',
  Periodontitis: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
};

const buildSnapshot = (records: ToothMap, selectedTooth: number | null, selectedSurfaces: SurfaceKey[], condition: ConditionKey, recommendation: RecommendationKey, notes: string): Snapshot => ({
  records,
  selectedTooth,
  selectedSurfaces,
  condition,
  recommendation,
  notes,
});

const filterForCondition = (condition: ConditionKey, group: string) => {
  if (group === 'healthy') return condition === 'Healthy';
  if (group === 'needs-treatment') {
    return [
      'Caries',
      'Root Canal',
      'Extracted',
      'Fracture',
      'Periapical Lesion',
      'Abscess',
      'Gingivitis',
      'Periodontitis',
      'Sensitivity',
    ].includes(condition);
  }
  if (group === 'missing') return condition === 'Missing';
  if (group === 'restorations') {
    return [
      'Composite Filling',
      'Amalgam Filling',
      'Crown',
      'Bridge',
      'Implant',
      'Sealant',
    ].includes(condition);
  }
  return true;
};

export function ClinicalExaminationPage() {
  const [activeTab, setActiveTab] = useState<'odontogram' | 'xrays' | 'diagnosis' | 'treatment'>('odontogram');
  const [records, setRecords] = useState<ToothMap>(initialRecords);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(26);
  const [selectedSurfaces, setSelectedSurfaces] = useState<SurfaceKey[]>(['occlusal', 'distal']);
  const [condition, setCondition] = useState<ConditionKey>('Caries');
  const [recommendation, setRecommendation] = useState<RecommendationKey>('Root Canal');
  const [notes, setNotes] = useState('Deep distal caries with pain during percussion.');
  const [filter, setFilter] = useState<'all' | 'healthy' | 'needs-treatment' | 'missing' | 'restorations'>('all');
  const [history, setHistory] = useState<Snapshot[]>([buildSnapshot(initialRecords, 26, ['occlusal', 'distal'], 'Caries', 'Root Canal', 'Deep distal caries with pain during percussion.')]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const selectedRecord = selectedTooth ? records[selectedTooth] : null;

  const visibleToothNumbers = useMemo(() => {
    const filtered = Object.entries(records).filter(([, value]) => filterForCondition(value.condition, filter));
    return new Set(filtered.map(([key]) => Number(key)));
  }, [records, filter]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedTooth(null);
        setSelectedSurfaces([]);
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        setHistoryIndex((current) => Math.max(0, current - 1));
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        setHistoryIndex((current) => Math.min(history.length - 1, current + 1));
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [history.length]);

  useEffect(() => {
    const snapshot = history[historyIndex];
    if (!snapshot) return;
    setRecords(snapshot.records);
    setSelectedTooth(snapshot.selectedTooth);
    setSelectedSurfaces(snapshot.selectedSurfaces);
    setCondition(snapshot.condition);
    setRecommendation(snapshot.recommendation);
    setNotes(snapshot.notes);
  }, [historyIndex]);

  const pushHistory = (nextRecords: ToothMap, nextSelectedTooth: number | null, nextSelectedSurfaces: SurfaceKey[], nextCondition: ConditionKey, nextRecommendation: RecommendationKey, nextNotes: string) => {
    const nextSnapshot = buildSnapshot(nextRecords, nextSelectedTooth, nextSelectedSurfaces, nextCondition, nextRecommendation, nextNotes);
    setHistory((current) => [...current.slice(0, historyIndex + 1), nextSnapshot]);
    setHistoryIndex((current) => current + 1);
  };

  const handleSelectTooth = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    const toothRecord = records[toothNumber];
    if (toothRecord) {
      setSelectedSurfaces(toothRecord.surfaces);
      setCondition(toothRecord.condition);
      setRecommendation(toothRecord.recommendation);
      setNotes(toothRecord.notes);
    } else {
      setSelectedSurfaces([]);
      setCondition('Healthy');
      setRecommendation('Observation');
      setNotes('');
    }
  };

  const toggleSurface = (surface: SurfaceKey) => {
    if (!selectedTooth) return;
    setSelectedSurfaces((current) => {
      const next = current.includes(surface)
        ? current.filter((item) => item !== surface)
        : [...current, surface];
      return next;
    });
  };

  const commitSave = () => {
    if (!selectedTooth) {
      setSaveMessage('Cannot save without selecting a tooth.');
      return;
    }

    if (!condition) {
      setSaveMessage('Cannot save without selecting a condition.');
      return;
    }

    const nextRecords = {
      ...records,
      [selectedTooth]: {
        condition,
        surfaces: selectedSurfaces,
        recommendation,
        notes,
        dentist: 'Dr. Maya',
        lastUpdated: 'Just now',
      },
    };

    setRecords(nextRecords);
    setSaveMessage('Tooth details saved successfully.');
    pushHistory(nextRecords, selectedTooth, selectedSurfaces, condition, recommendation, notes);
    window.setTimeout(() => setSaveMessage(null), 2200);
  };

  const resetSelectedForm = () => {
    if (!selectedTooth) return;
    const current = records[selectedTooth];
    setSelectedSurfaces(current?.surfaces ?? []);
    setCondition(current?.condition ?? 'Healthy');
    setRecommendation(current?.recommendation ?? 'Observation');
    setNotes(current?.notes ?? '');
    setSaveMessage(null);
  };

  const clearSelection = () => {
    setSelectedTooth(null);
    setSelectedSurfaces([]);
    setCondition('Healthy');
    setRecommendation('Observation');
    setNotes('');
  };

  const resetAll = () => {
    const nextRecords = structuredClone(initialRecords);
    setRecords(nextRecords);
    setSelectedTooth(26);
    setSelectedSurfaces(['occlusal', 'distal']);
    setCondition('Caries');
    setRecommendation('Root Canal');
    setNotes('Deep distal caries with pain during percussion.');
    pushHistory(nextRecords, 26, ['occlusal', 'distal'], 'Caries', 'Root Canal', 'Deep distal caries with pain during percussion.');
  };

  const recentUpdates = useMemo(() => {
    return Object.entries(records)
      .map(([toothNumber, record]) => ({
        toothNumber: Number(toothNumber),
        condition: record.condition,
        updatedAt: record.lastUpdated,
      }))
      .sort((a, b) => a.toothNumber - b.toothNumber)
      .slice(0, 4);
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clinical Examination</h1>
          <p className="text-sm text-muted-foreground">Interactive Odontogram</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ToolbarButton label="Undo" icon={<Undo2 className="size-4" />} onClick={() => setHistoryIndex((current) => Math.max(0, current - 1))} />
          <ToolbarButton label="Redo" icon={<CornerDownRight className="size-4" />} onClick={() => setHistoryIndex((current) => Math.min(history.length - 1, current + 1))} />
          <ToolbarButton label="Clear Selection" icon={<X className="size-4" />} onClick={clearSelection} />
          <ToolbarButton label="Reset All" icon={<RotateCcw className="size-4" />} onClick={resetAll} />
        </div>
      </div>

      {saveMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {saveMessage}
        </div>
      ) : null}

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-card/60 p-1 theme-surface-shadow">
        <button
          type="button"
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'odontogram'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
          onClick={() => setActiveTab('odontogram')}
        >
          <ClipboardList className="size-4" />
          Odontogram
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'xrays'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
          onClick={() => setActiveTab('xrays')}
        >
          <Scan className="size-4" />
          X-rays & Images
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'diagnosis'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
          onClick={() => setActiveTab('diagnosis')}
        >
          <Stethoscope className="size-4" />
          Diagnosis
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'treatment'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
          onClick={() => setActiveTab('treatment')}
        >
          <FileText className="size-4" />
          Treatment Plan
        </button>
      </div>

      {activeTab === 'odontogram' && (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-border bg-card/90 p-5 sm:p-6 theme-surface-shadow">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Odontogram</h2>
              <p className="text-sm text-muted-foreground">Click a tooth to record clinical findings.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterButton active={filter === 'all'} label="Show All" onClick={() => setFilter('all')} />
              <FilterButton active={filter === 'healthy'} label="Healthy" onClick={() => setFilter('healthy')} />
              <FilterButton active={filter === 'needs-treatment'} label="Needs Treatment" onClick={() => setFilter('needs-treatment')} />
              <FilterButton active={filter === 'missing'} label="Missing Teeth" onClick={() => setFilter('missing')} />
              <FilterButton active={filter === 'restorations'} label="Restorations" onClick={() => setFilter('restorations')} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/80 bg-muted/25 p-3 dark:bg-background/20">
            <div className="min-w-[760px] space-y-4">
              <OdontogramRow numbers={upperPermanent} selectedTooth={selectedTooth} visibleToothNumbers={visibleToothNumbers} onSelect={handleSelectTooth} records={records} selectedSurfaces={selectedSurfaces} onSurfaceToggle={toggleSurface} />
              <OdontogramRow numbers={upperPermanentReverse} selectedTooth={selectedTooth} visibleToothNumbers={visibleToothNumbers} onSelect={handleSelectTooth} records={records} selectedSurfaces={selectedSurfaces} onSurfaceToggle={toggleSurface} />
              <div className="pt-1 text-center text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Lower Permanent Teeth</div>
              <OdontogramRow numbers={lowerPermanent} selectedTooth={selectedTooth} visibleToothNumbers={visibleToothNumbers} onSelect={handleSelectTooth} records={records} selectedSurfaces={selectedSurfaces} onSurfaceToggle={toggleSurface} />
              <OdontogramRow numbers={lowerPermanentReverse} selectedTooth={selectedTooth} visibleToothNumbers={visibleToothNumbers} onSelect={handleSelectTooth} records={records} selectedSurfaces={selectedSurfaces} onSurfaceToggle={toggleSurface} />
            </div>
          </div>

          <div className="mt-4">
            <ToothLegend />
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card/90 p-4 sm:p-5 theme-surface-shadow">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <ClipboardList className="size-4" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">Selected Tooth</h3>
                <p className="text-xs text-muted-foreground">Tooth details panel</p>
              </div>
            </div>

            {selectedTooth ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <DetailItem label="Tooth Number" value={String(selectedTooth)} />
                  <DetailItem label="Tooth Name" value={toothNames[selectedTooth] ?? 'Unknown tooth'} />
                  <DetailItem label="Selected Surfaces" value={selectedSurfaces.length ? selectedSurfaces.map((surface) => surfaceLabel[surface]).join(', ') : 'None'} />
                  <DetailItem label="Current Status" value={selectedRecord?.condition ?? condition} />
                  <DetailItem label="Last Updated" value={selectedRecord?.lastUpdated ?? 'Just now'} />
                  <DetailItem label="Dentist" value={selectedRecord?.dentist ?? 'Dr. Maya'} />
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-3 dark:bg-background/25">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Condition & Procedure
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Condition</label>
                      <select value={condition} onChange={(event) => setCondition(event.target.value as ConditionKey)} className="w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30">
                        {conditionOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Procedure Recommendation</label>
                      <select value={recommendation} onChange={(event) => setRecommendation(event.target.value as RecommendationKey)} className="w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30">
                        {recommendationOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Clinical Notes</label>
                      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-28 w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30" placeholder="Deep distal caries with pain during percussion." />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={commitSave}>Save Tooth</Button>
                  <Button variant="outline" onClick={resetSelectedForm}>Reset</Button>
                  <Button variant="secondary" onClick={clearSelection}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center">
                <p className="text-base font-semibold text-foreground">No tooth selected.</p>
                <p className="mt-2 text-sm text-muted-foreground">Select a tooth from the odontogram.</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Recent Tooth Updates</h3>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Live</span>
            </div>
            <div className="space-y-3">
              {recentUpdates.map((item) => (
                <div key={`${item.toothNumber}-${item.condition}`} className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Tooth {item.toothNumber}</p>
                      <p className="text-xs text-muted-foreground">{item.condition}</p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">{item.updatedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
      )}

      {activeTab === 'xrays' && (
        <XrayImagesSection />
      )}

      {activeTab === 'diagnosis' && (
        <DiagnosisTab />
      )}

      {activeTab === 'treatment' && (
        <TreatmentPlanTab />
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ToolbarButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button variant={active ? 'default' : 'outline'} size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}

function OdontogramRow({
  numbers,
  selectedTooth,
  visibleToothNumbers,
  onSelect,
  records,
  selectedSurfaces,
  onSurfaceToggle,
}: {
  numbers: number[];
  selectedTooth: number | null;
  visibleToothNumbers: Set<number>;
  onSelect: (toothNumber: number) => void;
  records: ToothMap;
  selectedSurfaces: SurfaceKey[];
  onSurfaceToggle: (surface: SurfaceKey) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {numbers.map((number) => {
        const record = records[number];
        const shouldRender = visibleToothNumbers.has(number) || visibleToothNumbers.size === 0;
        if (!shouldRender) {
          return <div key={number} className="invisible w-[62px]" />;
        }

        const palette = record ? conditionPalette[record.condition] : conditionPalette.Healthy;
        const isSelected = selectedTooth === number;
        return (
          <button
            key={number}
            type="button"
            onClick={() => onSelect(number)}
            className="group flex w-[62px] flex-col items-center rounded-2xl border border-transparent p-1 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div className={`rounded-xl border-2 p-1 transition-all ${isSelected ? 'border-primary shadow-[0_0_0_1px_rgba(14,165,233,0.25),0_0_16px_rgba(14,165,233,0.24)]' : 'border-transparent'}`}>
              <ToothSVG
                number={number}
                condition={record?.condition ?? 'Healthy'}
                selected={isSelected}
                selectedSurfaces={selectedSurfaces}
                onSurfaceToggle={onSurfaceToggle}
                onSelect={onSelect}
              />
            </div>
            <span className="mt-1 text-[11px] font-semibold text-muted-foreground">{number}</span>
          </button>
        );
      })}
    </div>
  );
}

function ToothSVG({
  number,
  condition,
  selected,
  selectedSurfaces,
  onSurfaceToggle,
  onSelect,
}: {
  number: number;
  condition: ConditionKey;
  selected: boolean;
  selectedSurfaces: SurfaceKey[];
  onSurfaceToggle: (surface: SurfaceKey) => void;
  onSelect: (toothNumber: number) => void;
}) {
  const palette = conditionPalette[condition];

  return (
    <svg viewBox="0 0 100 120" className="size-[62px]" role="img" aria-label={`Tooth ${number}`}>
      <defs>
        <filter id={`glow-${number}`}> 
          <feGaussianBlur stdDeviation="1.35" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M50 4C65 4 77 11 86 24C93 34 96 47 94 60C92 82 79 100 59 114C55 117 45 117 41 114C21 100 8 82 6 60C4 47 7 34 14 24C23 11 35 4 50 4Z"
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={selected ? '3.5' : '2'}
        filter={selected ? `url(#glow-${number})` : undefined}
      />
      <path
        d="M32 23C38 16 43 12 50 12C57 12 62 16 68 23"
        fill="none"
        stroke={selected ? '#0ea5e9' : palette.stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="25" y="17" width="50" height="24" rx="8" fill={selectedSurfaces.includes('occlusal') ? 'rgba(14,165,233,0.45)' : 'transparent'} stroke={selectedSurfaces.includes('occlusal') ? '#0ea5e9' : 'transparent'} strokeWidth="2" onClick={(event) => { event.stopPropagation(); onSelect(number); onSurfaceToggle('occlusal'); }} />
      <rect x="12" y="30" width="16" height="46" rx="6" fill={selectedSurfaces.includes('mesial') ? 'rgba(14,165,233,0.45)' : 'transparent'} stroke={selectedSurfaces.includes('mesial') ? '#0ea5e9' : 'transparent'} strokeWidth="2" onClick={(event) => { event.stopPropagation(); onSelect(number); onSurfaceToggle('mesial'); }} />
      <rect x="72" y="30" width="16" height="46" rx="6" fill={selectedSurfaces.includes('distal') ? 'rgba(14,165,233,0.45)' : 'transparent'} stroke={selectedSurfaces.includes('distal') ? '#0ea5e9' : 'transparent'} strokeWidth="2" onClick={(event) => { event.stopPropagation(); onSelect(number); onSurfaceToggle('distal'); }} />
      <rect x="26" y="60" width="20" height="34" rx="6" fill={selectedSurfaces.includes('buccal') ? 'rgba(14,165,233,0.45)' : 'transparent'} stroke={selectedSurfaces.includes('buccal') ? '#0ea5e9' : 'transparent'} strokeWidth="2" onClick={(event) => { event.stopPropagation(); onSelect(number); onSurfaceToggle('buccal'); }} />
      <rect x="54" y="60" width="20" height="34" rx="6" fill={selectedSurfaces.includes('lingual') ? 'rgba(14,165,233,0.45)' : 'transparent'} stroke={selectedSurfaces.includes('lingual') ? '#0ea5e9' : 'transparent'} strokeWidth="2" onClick={(event) => { event.stopPropagation(); onSelect(number); onSurfaceToggle('lingual'); }} />
      <path d="M34 87C40 93 45 97 50 100C55 97 60 93 66 87" fill="none" stroke={palette.stroke} strokeWidth="2.5" strokeLinecap="round" />
      {condition === 'Missing' ? <path d="M30 38L70 82" stroke="#64748b" strokeWidth="3" strokeLinecap="round" /> : null}
      {condition === 'Root Canal' ? <rect x="19" y="16" width="62" height="76" rx="14" fill="none" stroke="#fb923c" strokeWidth="3" strokeDasharray="4 3" /> : null}
      {condition === 'Crown' ? <rect x="17" y="14" width="66" height="82" rx="13" fill="rgba(168,85,247,0.18)" /> : null}
      {condition === 'Abscess' ? <circle cx="50" cy="48" r="8" fill="#b91c1c" opacity="0.8" /> : null}
    </svg>
  );
}

function ToothLegend() {
  return (
    <div className="rounded-2xl border border-border bg-muted/35 p-4 dark:bg-background/20">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="rounded-full bg-primary/10 p-1.5 text-primary">
          <ChevronRight className="size-3.5" />
        </span>
        Color Legend
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <LegendItem label="Healthy" color="#ffffff" border="#94a3b8" />
        <LegendItem label="Existing Restoration" color="#bfdbfe" border="#2563eb" />
        <LegendItem label="Caries" color="#fef08a" border="#d97706" />
        <LegendItem label="Root Canal" color="#fdba74" border="#ea580c" />
        <LegendItem label="Crown" color="#d8b4fe" border="#7e22ce" />
        <LegendItem label="Missing" color="#e2e8f0" border="#475569" />
        <LegendItem label="Extraction Needed" color="#fff1f2" border="#e11d48" />
        <LegendItem label="Abscess" color="#7f1d1d" border="#991b1b" />
      </div>
    </div>
  );
}

function LegendItem({ label, color, border }: { label: string; color: string; border: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-3 py-2 dark:bg-background/30">
      <span className="size-3 rounded-full border-2" style={{ backgroundColor: color, borderColor: border }} />
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}
