'use client';

import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardList, FileText, RotateCcw, ShieldCheck, Stethoscope, User } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Surface = 'O' | 'M' | 'D' | 'B' | 'L';
type Condition = 'Healthy' | 'Caries' | 'Fracture' | 'Missing' | 'Infection' | 'Mobility' | 'Impacted' | 'Root Canal Treated' | 'Other';
type Restoration = 'None' | 'Composite Filling' | 'Amalgam Filling' | 'Crown' | 'Bridge' | 'Implant' | 'Veneer' | 'Temporary Filling' | 'Root Canal Restoration' | 'Other';
type Finding = { surfaces: Surface[]; condition: Condition; restoration: Restoration; note: string };

const upperLeft = [18, 17, 16, 15, 14, 13, 12, 11];
const upperRight = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeft = [48, 47, 46, 45, 44, 43, 42, 41];
const lowerRight = [31, 32, 33, 34, 35, 36, 37, 38];
const surfaces: Surface[] = ['O', 'M', 'D', 'B', 'L'];
const conditions: Condition[] = ['Healthy', 'Caries', 'Fracture', 'Missing', 'Infection', 'Mobility', 'Impacted', 'Root Canal Treated', 'Other'];
const restorations: Restoration[] = ['None', 'Composite Filling', 'Amalgam Filling', 'Crown', 'Bridge', 'Implant', 'Veneer', 'Temporary Filling', 'Root Canal Restoration', 'Other'];

const initialFindings: Record<number, Finding> = {
  16: { surfaces: ['O', 'D'], condition: 'Caries', restoration: 'Composite Filling', note: 'Secondary caries around distal restoration.' },
  26: { surfaces: ['O'], condition: 'Healthy', restoration: 'Amalgam Filling', note: '' },
  36: { surfaces: [], condition: 'Root Canal Treated', restoration: 'Crown', note: 'Existing crown and completed endodontic treatment.' },
  46: { surfaces: [], condition: 'Missing', restoration: 'None', note: '' },
};

const emptyFinding = (): Finding => ({ surfaces: [], condition: 'Healthy', restoration: 'None', note: '' });

function conditionClass(finding?: Finding) {
  if (!finding || finding.condition === 'Healthy') return 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-200';
  if (finding.condition === 'Missing') return 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200';
  if (finding.condition === 'Root Canal Treated') return 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200';
  return 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200';
}

function ToothRow({ numbers, selected, findings, onSelect }: { numbers: number[]; selected: number; findings: Record<number, Finding>; onSelect: (tooth: number) => void }) {
  return <div className="grid grid-cols-8 gap-2">{numbers.map((tooth) => { const finding = findings[tooth]; return <button key={tooth} type="button" onClick={() => onSelect(tooth)} aria-label={`Select tooth ${tooth}`} className={`min-h-24 rounded-2xl border-2 p-2 text-center transition-all hover:-translate-y-0.5 hover:border-primary/60 ${conditionClass(finding)} ${selected === tooth ? 'border-primary ring-4 ring-primary/15' : ''}`}><span className="mx-auto flex size-12 items-center justify-center rounded-full border-2 border-current bg-card text-sm font-bold shadow-sm">{tooth}</span><span className="mt-2 block text-[10px] font-semibold leading-tight">{finding?.condition ?? 'Healthy'}</span>{finding?.restoration !== 'None' && <span className="mt-1 block truncate text-[10px] opacity-80">{finding?.restoration}</span>}</button>; })}</div>;
}

export function OdontogramWorkspace() {
  const router = useRouter();
  const [findings, setFindings] = useState<Record<number, Finding>>(initialFindings);
  const [selectedTooth, setSelectedTooth] = useState(16);
  const [surfacesSelected, setSurfacesSelected] = useState<Surface[]>(initialFindings[16].surfaces);
  const [condition, setCondition] = useState<Condition>(initialFindings[16].condition);
  const [restoration, setRestoration] = useState<Restoration>(initialFindings[16].restoration);
  const [note, setNote] = useState(initialFindings[16].note);
  const [message, setMessage] = useState('');

  const selectTooth = (tooth: number) => { const finding = findings[tooth] ?? emptyFinding(); setSelectedTooth(tooth); setSurfacesSelected(finding.surfaces); setCondition(finding.condition); setRestoration(finding.restoration); setNote(finding.note); setMessage(''); };
  const toggleSurface = (surface: Surface) => setSurfacesSelected((current) => current.includes(surface) ? current.filter((item) => item !== surface) : [...current, surface]);
  const resetEditor = () => { const finding = findings[selectedTooth] ?? emptyFinding(); setSurfacesSelected(finding.surfaces); setCondition(finding.condition); setRestoration(finding.restoration); setNote(finding.note); setMessage('Editor reset.'); };
  const saveFinding = () => { setFindings((current) => ({ ...current, [selectedTooth]: { surfaces: surfacesSelected, condition, restoration, note } })); setMessage(`Tooth ${selectedTooth} finding saved.`); };

  return <div className="mx-auto max-w-[1200px] space-y-5 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><Button variant="ghost" className="-ml-2 text-muted-foreground" onClick={() => router.push('/clinical-examination')}><ArrowLeft className="size-4" />Back to Examination</Button><p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-primary/80">Clinical Examination</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Odontogram</h1><p className="mt-1 text-sm text-muted-foreground">Record tooth conditions, surfaces, and existing restorations</p></div><div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold"><User className="size-4 text-primary" />Sok Dara · PT000128</span><span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"><AlertTriangle className="size-4" />Penicillin Allergy</span></div></div>
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-4"><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Patient</p><p className="mt-1 font-semibold">Sok Dara · 34 years</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Visit</p><p className="mt-1 font-semibold">General Examination</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Dentist</p><p className="mt-1 font-semibold">Dr. Chan Vuthy</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Consent</p><p className="mt-1 flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300"><ShieldCheck className="size-4" />Accepted</p></div></div></section>
    {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 className="size-5" />{message}</div>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-bold"><ClipboardList className="size-5 text-primary" />Permanent Teeth</h2><p className="mt-1 text-sm text-muted-foreground">FDI numbering · select a tooth to edit its finding</p></div><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-slate-300 px-2 py-1">Healthy</span><span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-amber-700">Needs review</span><span className="rounded-full border border-rose-300 bg-rose-50 px-2 py-1 text-rose-700">Missing</span><span className="rounded-full border border-violet-300 bg-violet-50 px-2 py-1 text-violet-700">Root canal</span></div></div><div className="mt-5 overflow-x-auto rounded-2xl border border-border/70 bg-muted/20 p-4"><div className="min-w-[700px] space-y-5"><p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Upper Permanent Teeth</p><ToothRow numbers={upperLeft} selected={selectedTooth} findings={findings} onSelect={selectTooth}/><ToothRow numbers={upperRight} selected={selectedTooth} findings={findings} onSelect={selectTooth}/><div className="border-t border-dashed border-border pt-4"/><p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Lower Permanent Teeth</p><ToothRow numbers={lowerLeft} selected={selectedTooth} findings={findings} onSelect={selectTooth}/><ToothRow numbers={lowerRight} selected={selectedTooth} findings={findings} onSelect={selectTooth}/></div></div></section>
    <aside className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center gap-2"><span className="rounded-full bg-primary/10 p-2 text-primary"><Stethoscope className="size-4"/></span><div><h2 className="text-lg font-bold">Selected Tooth: {selectedTooth}</h2><p className="text-xs text-muted-foreground">Edit clinical finding</p></div></div><div className="mt-5 space-y-4"><div><label className="mb-2 block text-sm font-semibold">Surface</label><div className="flex flex-wrap gap-2">{surfaces.map((surface) => <button key={surface} type="button" onClick={() => toggleSurface(surface)} className={`flex size-10 items-center justify-center rounded-xl border text-sm font-bold transition-colors ${surfacesSelected.includes(surface) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted'}`}>{surface}</button>)}</div><p className="mt-1 text-xs text-muted-foreground">O Occlusal · M Mesial · D Distal · B Buccal · L Lingual</p></div><label className="block text-sm font-semibold">Condition<select value={condition} onChange={(event) => setCondition(event.target.value as Condition)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"><option>{conditions.join('</option><option>')}</option></select></label><label className="block text-sm font-semibold">Existing Restoration<select value={restoration} onChange={(event) => setRestoration(event.target.value as Restoration)} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"><option>{restorations.join('</option><option>')}</option></select></label><label className="block text-sm font-semibold">Clinical Note<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Optional clinical note..." className="mt-1.5 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm font-normal"/></label><div className="flex gap-2"><Button className="flex-1" onClick={saveFinding}><CheckCircle2 className="size-4"/>Save Tooth Finding</Button><Button variant="outline" onClick={resetEditor} title="Reset editor"><RotateCcw className="size-4"/></Button></div></div></section>
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><FileText className="size-5 text-primary"/>Recorded Findings</h2><div className="mt-4 space-y-3">{Object.entries(findings).map(([tooth, finding]) => <div key={tooth} className="rounded-xl border border-border bg-background/40 p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-bold">Tooth {tooth}</p><p className="text-sm text-muted-foreground">{finding.condition}{finding.surfaces.length ? ` · ${finding.surfaces.join(', ')}` : ''}</p>{finding.restoration !== 'None' && <p className="text-xs text-muted-foreground">Existing: {finding.restoration}</p>}</div><Button variant="outline" size="sm" onClick={() => selectTooth(Number(tooth))}>Edit</Button></div></div>)}</div></section></aside></div>
  </div>;
}