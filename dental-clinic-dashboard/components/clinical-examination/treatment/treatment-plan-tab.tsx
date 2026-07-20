'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TreatmentSummary } from './treatment-summary';
import { TreatmentFilters } from './treatment-filters';
import { TreatmentItemsTable } from './treatment-items-table';
import { CostEstimatePanel } from './cost-estimate-panel';
import { TreatmentDetailsPanel } from './treatment-details-panel';
import { AddTreatmentModal } from './add-treatment-modal';
import { dummyTreatmentPlan } from './treatment-data';
import { dummyDiagnoses } from '../diagnosis/diagnosis-data';
import type { TreatmentItem, TreatmentPlanData } from './treatment-data';

const diagnoses = dummyDiagnoses.map((dx) => ({
  id: dx.id,
  diagnosisName: dx.diagnosisName,
  toothNumber: dx.toothNumber,
}));

export function TreatmentPlanTab() {
  const [plan, setPlan] = useState<TreatmentPlanData>(dummyTreatmentPlan);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [toothFilter, setToothFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<TreatmentItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<TreatmentItem | null>(null);

  const items = plan.items;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !search || item.procedure.toLowerCase().includes(search.toLowerCase()) || item.procedureCode.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesPhase = phaseFilter === 'All' || item.treatmentPhase === phaseFilter;
      const matchesTooth = !toothFilter || item.toothArea.toLowerCase().includes(toothFilter.toLowerCase());
      return matchesSearch && matchesPriority && matchesStatus && matchesPhase && matchesTooth;
    });
  }, [items, search, priorityFilter, statusFilter, phaseFilter, toothFilter]);

  const handleAdd = (newItem: TreatmentItem) => {
    const updatedItems = [...items, newItem];
    const total = updatedItems.reduce((acc, i) => acc + i.total, 0);
    setPlan({ ...plan, items: updatedItems, estimatedTotal: total, subtotal: total + plan.discount });
    setShowAddModal(false);
  };

  const handleEdit = (item: TreatmentItem) => {
    setEditItem(item);
    setShowAddModal(true);
  };

  const handleUpdate = (updatedItem: TreatmentItem) => {
    const updatedItems = items.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    const total = updatedItems.reduce((acc, i) => acc + i.total, 0);
    setPlan({ ...plan, items: updatedItems, estimatedTotal: total, subtotal: total + plan.discount });
    setShowAddModal(false);
    setEditItem(null);
    setSelectedItem(updatedItem);
  };

  const handleRemove = (item: TreatmentItem) => {
    const updatedItems = items.filter((i) => i.id !== item.id).map((i, idx) => ({ ...i, sequence: idx + 1 }));
    const total = updatedItems.reduce((acc, i) => acc + i.total, 0);
    setPlan({ ...plan, items: updatedItems, estimatedTotal: total, subtotal: total + plan.discount });
    setSelectedItem(null);
  };

  const handleMoveUp = (itemId: string) => {
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx <= 0) return;
    const updated = [...items];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setPlan({ ...plan, items: updated.map((i, idx) => ({ ...i, sequence: idx + 1 })) });
  };

  const handleMoveDown = (itemId: string) => {
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx < 0 || idx >= items.length - 1) return;
    const updated = [...items];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    setPlan({ ...plan, items: updated.map((i, idx) => ({ ...i, sequence: idx + 1 })) });
  };

  const handleResetFilters = () => {
    setSearch(''); setPriorityFilter('All'); setStatusFilter('All'); setPhaseFilter('All'); setToothFilter('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Treatment Plan</h2>
          <p className="text-sm text-muted-foreground">
            {plan.planName} · {plan.status} · {items.length} procedure{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditItem(null); setShowAddModal(true); }}>
          <Plus className="mr-1.5 size-4" />
          Add Treatment
        </Button>
      </div>

      <TreatmentSummary items={items} />

      <TreatmentFilters
        search={search} onSearchChange={setSearch}
        priorityFilter={priorityFilter} onPriorityFilterChange={setPriorityFilter}
        statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
        phaseFilter={phaseFilter} onPhaseFilterChange={setPhaseFilter}
        toothFilter={toothFilter} onToothFilterChange={setToothFilter}
        onReset={handleResetFilters}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/90 p-0 theme-surface-shadow">
            <div className="overflow-x-auto">
              {filteredItems.length > 0 ? (
                <TreatmentItemsTable
                  items={filteredItems}
                  onSelect={setSelectedItem}
                  onEdit={handleEdit}
                  onRemove={handleRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  selectedId={selectedItem?.id ?? null}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6">
                    <p className="text-base font-semibold text-foreground">No treatment items</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {items.length === 0
                        ? 'Add treatments to create the plan.'
                        : 'No items match your filters.'}
                    </p>
                    {items.length > 0 && (
                      <Button variant="outline" size="sm" className="mt-3" onClick={handleResetFilters}>
                        Reset Filters
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <CostEstimatePanel plan={plan} />
          <TreatmentDetailsPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onEdit={(item) => { setEditItem(item); setShowAddModal(true); }}
            onRemove={(item) => {
              const updatedItems = items.filter((i) => i.id !== item.id).map((i, idx) => ({ ...i, sequence: idx + 1 }));
              const total = updatedItems.reduce((acc, i) => acc + i.total, 0);
              setPlan({ ...plan, items: updatedItems, estimatedTotal: total, subtotal: total + plan.discount });
              setSelectedItem(null);
            }}
          />
        </aside>
      </div>

      <AddTreatmentModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditItem(null); }}
        onSave={editItem ? handleUpdate : handleAdd}
        diagnoses={diagnoses}
        nextSequence={items.length + 1}
      />
    </div>
  );
}