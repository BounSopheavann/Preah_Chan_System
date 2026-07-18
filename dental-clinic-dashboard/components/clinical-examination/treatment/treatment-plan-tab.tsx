'use client';

import { Plus, Save, Search } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddTreatmentModal } from './add-treatment-modal';
import { CostEstimatePanel } from './cost-estimate-panel';
import { dummyTreatmentPlan, planStatusBadgeColor, type TreatmentItem } from './treatment-data';
import { TreatmentDetailsPanel } from './treatment-details-panel';
import { TreatmentFilters } from './treatment-filters';
import { TreatmentItemsTable } from './treatment-items-table';
import { TreatmentSummary } from './treatment-summary';

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 dark:bg-background/20">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children ?? <p className="mt-1 text-sm font-bold text-foreground">{value}</p>}
    </div>
  );
}

export function TreatmentPlanTab() {
  const [plan, setPlan] = useState(dummyTreatmentPlan);
  const [search, setSearch] = useState('');
  const [priorityF, setPriorityF] = useState('All');
  const [statusF, setStatusF] = useState('All');
  const [phaseF, setPhaseF] = useState('All');
  const [toothF, setToothF] = useState('');
  const [selected, setSelected] = useState<TreatmentItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [quick, setQuick] = useState('All');
  const [pName, setPName] = useState(plan.planName);
  const [msg, setMsg] = useState<string | null>(null);
  const ds = useDeferredValue(search);

  const diags = [
    { id: 'dx-001', diagnosisName: 'Deep Dental Caries', toothNumber: '26' },
    { id: 'dx-002', diagnosisName: 'Reversible Pulpitis', toothNumber: '16' },
    { id: 'dx-003', diagnosisName: 'Chronic Gingivitis', toothNumber: 'General' },
    { id: 'dx-004', diagnosisName: 'Periapical Lesion', toothNumber: '26' },
  ];

  const filtered = useMemo(() => {
    const ns = ds.trim().toLowerCase();
    return plan.items.filter((i) => {
      const ms = !ns || i.procedure.toLowerCase().includes(ns) || i.procedureCode.toLowerCase().includes(ns) || i.linkedDiagnosis.toLowerCase().includes(ns);
      const mq = quick === 'All' || (quick === 'Emergency' && i.priority === 'Emergency') || (quick === 'Urgent' && i.priority === 'Urgent') || (quick === 'Approved' && i.status === 'Approved') || (quick === 'Proposed' && i.status === 'Proposed') || (quick === 'Declined' && i.status === 'Declined') || (quick === 'Completed' && i.status === 'Completed');
      return ms && (priorityF === 'All' || i.priority === priorityF) && (statusF === 'All' || i.status === statusF) && (phaseF === 'All' || i.treatmentPhase === phaseF) && (!toothF || i.toothArea.includes(toothF)) && mq;
    });
  }, [plan.items, ds, priorityF, statusF, phaseF, toothF, quick]);

  const calc = (items: TreatmentItem[]) => {
    const sub = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
    const disc = items.reduce((a, i) => a + i.discount, 0);
    const tot = sub - disc;
    const aa = items.filter((i) => i.status === 'Approved').reduce((a, i) => a + i.total, 0);
    return { subtotal: sub, discount: disc, estimatedTotal: tot, approvedAmount: aa, remainingEstimate: tot - aa, patientShare: Math.max(0, tot - 200), insuranceEstimate: 200 };
  };

  const handleAdd = (item: TreatmentItem) => {
    setPlan((p) => { const n = [...p.items, item]; return { ...p, items: n, ...calc(n) }; });
  };

  const handleRemove = (item: TreatmentItem) => {
    setPlan((p) => {
      const n = p.items.filter((i) => i.id !== item.id).map((i, idx) => ({ ...i, sequence: idx + 1 }));
      if (selected?.id === item.id) setSelected(null);
      return { ...p, items: n, ...calc(n) };
    });
  };

  const moveUp = (id: string) => {
    setPlan((p) => {
      const idx = p.items.findIndex((i) => i.id === id);
      if (idx <= 0) return p;
      const n = [...p.items];
      [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
      return { ...p, items: n.map((i, x) => ({ ...i, sequence: x + 1 })) };
    });
  };

  const moveDown = (id: string) => {
    setPlan((p) => {
      const idx = p.items.findIndex((i) => i.id === id);
      if (idx >= p.items.length - 1) return p;
      const n = [...p.items];
      [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
      return { ...p, items: n.map((i, x) => ({ ...i, sequence: x + 1 })) };
    });
  };

  const savePlan = () => {
    setPlan((p) => ({ ...p, planName: pName }));
    setMsg('Treatment plan saved.');
    setTimeout(() => setMsg(null), 2000);
  };

  const resetF = () => { setSearch(''); setPriorityF('All'); setStatusF('All'); setPhaseF('All'); setToothF(''); setQuick('All'); };

  const chips = [
    { l: 'All', v: 'All' }, { l: 'Emergency', v: 'Emergency' }, { l: 'Urgent', v: 'Urgent' },
    { l: 'Approved', v: 'Approved' }, { l: 'Proposed', v: 'Proposed' }, { l: 'Declined', v: 'Declined' }, { l: 'Completed', v: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {msg && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{msg}</div>}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 className="text-2xl font-bold text-foreground">Treatment Plan</h2><p className="text-sm text-muted-foreground">Create and manage proposed treatments.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setAddOpen(true)}><Plus className="size-4" /> Add Treatment</Button>
          <Button variant="outline" onClick={savePlan}><Save className="size-4" /> Save Draft</Button>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Plan Name">{plan.status === 'Draft' ? <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} className="w-full bg-transparent text-sm font-bold text-foreground outline-none" /> : <p className="text-sm font-bold text-foreground">{pName}</p>}</Field>
          <Field label="Plan ID" value={plan.planId} />
          <Field label="Date" value={plan.planDate} />
          <Field label="Patient" value={plan.patient} />
          <Field label="Status">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${planStatusBadgeColor[plan.status]}`}>{plan.status}</span>
          </Field>
        </div>
      </div>
      <TreatmentSummary items={plan.items} />
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <button key={c.v} type="button" onClick={() => setQuick(c.v)}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${quick === c.v ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>{c.l}</button>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
            <TreatmentFilters search={search} onSearchChange={setSearch} priorityFilter={priorityF} onPriorityFilterChange={setPriorityF} statusFilter={statusF} onStatusFilterChange={setStatusF} phaseFilter={phaseF} onPhaseFilterChange={setPhaseF} toothFilter={toothF} onToothFilterChange={setToothF} onReset={resetF} />
          </div>
          <div className="rounded-2xl border border-border bg-card/90 theme-surface-shadow">
            {filtered.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex size-24 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary theme-strong-shadow"><Search className="size-10" /></div>
                <h3 className="mt-5 text-xl font-bold text-foreground">No treatments have been added to this plan.</h3>
                <p className="mt-2 text-sm text-muted-foreground">Add a treatment based on the patient's diagnoses.</p>
                <Button className="mt-5" onClick={() => setAddOpen(true)}><Plus className="size-4" /> Add First Treatment</Button>
              </div>
            ) : (
              <div className="p-1">
                <TreatmentItemsTable items={filtered} onSelect={(i) => setSelected(i)} onEdit={(i) => setSelected(i)} onRemove={handleRemove} onMoveUp={moveUp} onMoveDown={moveDown} selectedId={selected?.id ?? null} />
              </div>
            )}
          </div>
          {filtered.length > 0 && filtered.length < plan.items.length && (
            <div className="text-xs text-muted-foreground">Showing {filtered.length} of {plan.items.length} items. <button type="button" onClick={resetF} className="font-semibold text-primary">Clear filters</button></div>
          )}
        </div>
        <div className="space-y-4">
          <CostEstimatePanel plan={plan} />
          <TreatmentDetailsPanel item={selected} onClose={() => setSelected(null)} onEdit={(i) => setSelected(i)} onRemove={handleRemove} />
        </div>
      </div>
      <AddTreatmentModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSave={handleAdd} diagnoses={diags} nextSequence={plan.items.length + 1} />
    </div>
  );
}