'use client';

import { Plus, Search } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddDiagnosisModal } from './add-diagnosis-modal';
import { AddToTreatmentPlanModal } from './add-to-treatment-plan-modal';
import { ClinicalContextPanel } from './clinical-context-panel';
import { DiagnosisDetailsPanel } from './diagnosis-details-panel';
import { DiagnosisFilters } from './diagnosis-filters';
import { DiagnosisSummary } from './diagnosis-summary';
import { dummyDiagnoses, type DiagnosisRecord } from './diagnosis-data';
import { ProblemList } from './problem-list';
import { ResolveDiagnosisModal } from './resolve-diagnosis-modal';

export function DiagnosisTab() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>(dummyDiagnoses);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [toothFilter, setToothFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<DiagnosisRecord | null>(null);
  const [isTreatmentPlanModalOpen, setIsTreatmentPlanModalOpen] = useState(false);
  const [treatmentPlanTarget, setTreatmentPlanTarget] = useState<DiagnosisRecord | null>(null);
  const [quickFilter, setQuickFilter] = useState<string>('All');

  const filteredDiagnoses = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return diagnoses.filter((dx) => {
      const matchesSearch =
        !normalizedSearch ||
        dx.diagnosisName.toLowerCase().includes(normalizedSearch) ||
        dx.diagnosisCode.toLowerCase().includes(normalizedSearch) ||
        dx.toothNumber.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'All' || dx.status === statusFilter;
      const matchesSeverity = severityFilter === 'All' || dx.severity === severityFilter;
      const matchesPriority = priorityFilter === 'All' || dx.priority === priorityFilter;
      const matchesTooth = !toothFilter || dx.toothNumber.includes(toothFilter);
      const matchesSource = sourceFilter === 'All' || dx.source === sourceFilter;

      const matchesQuick =
        quickFilter === 'All' ||
        (quickFilter === 'Active' && dx.status === 'Active') ||
        (quickFilter === 'Urgent' && (dx.priority === 'Urgent' || dx.priority === 'Emergency')) ||
        (quickFilter === 'Emergency' && dx.priority === 'Emergency') ||
        (quickFilter === 'Monitored' && dx.status === 'Monitored') ||
        (quickFilter === 'Resolved' && dx.status === 'Resolved');

      return matchesSearch && matchesStatus && matchesSeverity && matchesPriority && matchesTooth && matchesSource && matchesQuick;
    });
  }, [diagnoses, deferredSearch, statusFilter, severityFilter, priorityFilter, toothFilter, sourceFilter, quickFilter]);

  const handleAddDiagnosis = (newDiagnosis: DiagnosisRecord) => {
    setDiagnoses((prev) => [...prev, newDiagnosis]);
  };

  const handleResolve = (diagnosis: DiagnosisRecord) => {
    setResolveTarget(diagnosis);
    setIsResolveModalOpen(true);
  };

  const handleResolveConfirm = (diagnosis: DiagnosisRecord, resolutionDate: string, resolutionNotes: string) => {
    setDiagnoses((prev) =>
      prev.map((dx) =>
        dx.id === diagnosis.id
          ? { ...dx, status: 'Resolved' as const, resolutionDate, resolutionNotes }
          : dx
      )
    );
    if (selectedDiagnosis?.id === diagnosis.id) {
      setSelectedDiagnosis((prev) =>
        prev ? { ...prev, status: 'Resolved' as const, resolutionDate, resolutionNotes } : null
      );
    }
  };

  const handleAddToTreatmentPlan = (diagnosis: DiagnosisRecord) => {
    setTreatmentPlanTarget(diagnosis);
    setIsTreatmentPlanModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setSeverityFilter('All');
    setPriorityFilter('All');
    setToothFilter('');
    setSourceFilter('All');
    setQuickFilter('All');
  };

  const quickFilterChips = [
    { label: 'All', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Urgent', value: 'Urgent' },
    { label: 'Emergency', value: 'Emergency' },
    { label: 'Monitored', value: 'Monitored' },
    { label: 'Resolved', value: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Diagnosis & Problem List</h2>
          <p className="text-sm text-muted-foreground">
            Record diagnoses based on clinical examination and diagnostic findings.
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="size-4" />
          Add Diagnosis
        </Button>
      </div>

      {/* Summary Cards */}
      <DiagnosisSummary diagnoses={diagnoses} />

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {quickFilterChips.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => setQuickFilter(chip.value)}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              quickFilter === chip.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: Problem List */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl border border-border bg-card/90 p-4 theme-surface-shadow">
            <DiagnosisFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              severityFilter={severityFilter}
              onSeverityFilterChange={setSeverityFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              toothFilter={toothFilter}
              onToothFilterChange={setToothFilter}
              sourceFilter={sourceFilter}
              onSourceFilterChange={setSourceFilter}
              onReset={handleResetFilters}
            />
          </div>

          {/* Problem List Table */}
          <div className="rounded-2xl border border-border bg-card/90 theme-surface-shadow">
            {filteredDiagnoses.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
                <div className="relative mb-5 flex size-24 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary theme-strong-shadow">
                  <Search className="size-10" aria-hidden="true" />
                  <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Plus className="size-4" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">No diagnoses recorded yet.</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Add a diagnosis based on the patient's clinical examination, odontogram, or diagnostic images.
                </p>
                <Button className="mt-5" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="size-4" />
                  Add First Diagnosis
                </Button>
              </div>
            ) : (
              <div className="p-1">
                <ProblemList
                  diagnoses={filteredDiagnoses}
                  onSelect={(dx) => setSelectedDiagnosis(dx)}
                  onResolve={handleResolve}
                  onAddToTreatmentPlan={handleAddToTreatmentPlan}
                  selectedId={selectedDiagnosis?.id ?? null}
                />
              </div>
            )}
          </div>

          {/* Count */}
          {filteredDiagnoses.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredDiagnoses.length} of {diagnoses.length} diagnoses
              </span>
              {filteredDiagnoses.length < diagnoses.length && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-semibold text-primary transition-all hover:text-primary/80"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Side panels */}
        <div className="space-y-4">
          <DiagnosisDetailsPanel
            diagnosis={selectedDiagnosis}
            onClose={() => setSelectedDiagnosis(null)}
            onResolve={handleResolve}
            onAddToTreatmentPlan={handleAddToTreatmentPlan}
          />
          <ClinicalContextPanel />
        </div>
      </div>

      {/* Modals */}
      <AddDiagnosisModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddDiagnosis}
      />
      <ResolveDiagnosisModal
        isOpen={isResolveModalOpen}
        diagnosis={resolveTarget}
        onClose={() => { setIsResolveModalOpen(false); setResolveTarget(null); }}
        onConfirm={handleResolveConfirm}
      />
      <AddToTreatmentPlanModal
        isOpen={isTreatmentPlanModalOpen}
        diagnosis={treatmentPlanTarget}
        onClose={() => { setIsTreatmentPlanModalOpen(false); setTreatmentPlanTarget(null); }}
      />
    </div>
  );
}