'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  MinusCircle,
  PlusCircle,
  Receipt,
  Save,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PatientContextHeader } from '@/components/treatment-execution/patient-context-header';
import {
  loadFlowState,
  type TreatmentFlowState,
} from '@/components/treatment-execution/procedure-workspace-store';
import type { TreatmentSession, ProcedureExecution } from '@/components/treatment-execution/treatment-execution-data';
import {
  type Invoice,
  type InvoiceItem,
  type PaymentMethod,
  formatCurrency,
  calculateSubtotal,
  calculateTotalDiscount,
  calculateGrandTotal,
  calculateBalanceDue,
} from './billing-data';
import {
  buildInvoiceFromSession,
  loadSavedInvoice,
  saveInvoice,
  clearSavedInvoice,
  updateInvoiceItem,
  removeInvoiceItem,
  addManualCharge,
  updatePayment,
  finalizeInvoice,
  saveDraftInvoice,
} from './billing-store';

type ValidationError = {
  type: string;
  message: string;
};

export function BillingWorkspace() {
  const router = useRouter();
  const [flow, setFlow] = useState<TreatmentFlowState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [initialBuildAttempted, setInitialBuildAttempted] = useState(false);

  // Helper to save invoice and update state
  const persistInvoice = useCallback((inv: Invoice) => {
    saveInvoice(inv);
    setInvoice(inv);
    // Also persist to treatment flow state to keep them in sync
    const flow = loadFlowState();
    if (flow) {
      saveInvoice(inv);
    }
  }, []);

  useEffect(() => {
    // First try to load an existing saved invoice
    const saved = loadSavedInvoice();
    if (saved) {
      setInvoice(saved);
      setHydrated(true);
      setInitialBuildAttempted(true);
      return;
    }

    // Otherwise build from session
    const built = buildInvoiceFromSession();
    if (built) {
      setInvoice(built);
      saveInvoice(built);
    }

    // Also load flow state for display
    const stored = loadFlowState();
    if (stored) {
      setFlow(stored);
    }

    setHydrated(true);
    setInitialBuildAttempted(true);
  }, []);

  const session = flow?.session;

  const grandTotal = useMemo(() => {
    if (!invoice) return 0;
    return calculateGrandTotal(invoice.items);
  }, [invoice]);

  const subtotal = useMemo(() => {
    if (!invoice) return 0;
    return calculateSubtotal(invoice.items);
  }, [invoice]);

  const totalDiscount = useMemo(() => {
    if (!invoice) return 0;
    return calculateTotalDiscount(invoice.items);
  }, [invoice]);

  const balanceDue = useMemo(() => {
    if (!invoice) return 0;
    return calculateBalanceDue(grandTotal, invoice.payment.amountPaid);
  }, [invoice, grandTotal]);

  const getStatusBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      Draft: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
      Unpaid: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
      'Partially Paid': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
      Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    };
    return map[status] || map.Draft;
  };

  const inputClass =
    'h-9 w-full rounded-lg border border-border bg-background/70 px-3 text-xs text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30 placeholder:text-muted-foreground/60';
  const numberInputClass =
    'h-9 w-24 rounded-lg border border-border bg-background/70 px-2.5 text-xs text-right text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';
  const selectClass =
    'h-9 rounded-lg border border-border bg-background/70 px-2.5 text-xs text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20 dark:bg-background/30';

  const isFinalized = invoice?.status !== 'Draft' && !!invoice?.finalizedAt;

  const validate = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    if (!invoice) return errors;

    if (invoice.items.length === 0) {
      errors.push({ type: 'no_items', message: 'At least one invoice item is required.' });
    }

    invoice.items.forEach((item, index) => {
      if (!item.description.trim()) {
        errors.push({
          type: `item_${index}_description`,
          message: `Invoice item #${index + 1} requires a description.`,
        });
      }
      if (item.quantity < 1) {
        errors.push({
          type: `item_${index}_quantity`,
          message: `"${item.description || 'Item #' + (index + 1)}" quantity must be at least 1.`,
        });
      }
      if (item.unitPrice < 0) {
        errors.push({
          type: `item_${index}_price`,
          message: `"${item.description || 'Item #' + (index + 1)}" unit price cannot be negative.`,
        });
      }
      if (item.discount < 0) {
        errors.push({
          type: `item_${index}_discount`,
          message: `"${item.description || 'Item #' + (index + 1)}" discount cannot be negative.`,
        });
      }
    });

    return errors;
  }, [invoice]);

  const handleSaveDraft = useCallback(() => {
    if (!invoice) return;
    saveDraftInvoice(invoice);
    setSavedMessage('Draft saved successfully.');
    setTimeout(() => setSavedMessage(''), 3000);
  }, [invoice]);

  const handleFinalize = useCallback(() => {
    if (!invoice) return;
    const errors = validate();
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setIsFinalizing(true);
    const finalized = finalizeInvoice(invoice);
    persistInvoice(finalized);
    setIsFinalizing(false);
  }, [invoice, validate, persistInvoice]);

  const handleItemUpdate = useCallback(
    (itemId: string, updates: Partial<Pick<InvoiceItem, 'quantity' | 'unitPrice' | 'description' | 'discount'>>) => {
      if (!invoice) return;
      const updated = updateInvoiceItem(invoice, itemId, updates);
      persistInvoice(updated);
    },
    [invoice, persistInvoice]
  );

  const handleRemoveManual = useCallback(
    (itemId: string) => {
      if (!invoice) return;
      const updated = removeInvoiceItem(invoice, itemId);
      persistInvoice(updated);
    },
    [invoice, persistInvoice]
  );

  const handleAddCharge = useCallback(() => {
    if (!invoice) return;
    const updated = addManualCharge(invoice);
    persistInvoice(updated);
  }, [invoice, persistInvoice]);

  const handlePaymentUpdate = useCallback(
    (updates: Partial<{ amountPaid: number; paymentMethod: PaymentMethod; paymentNote: string }>) => {
      if (!invoice) return;
      const updated = updatePayment(invoice, updates);
      persistInvoice(updated);
    },
    [invoice, persistInvoice]
  );

  const handleBack = useCallback(() => {
    router.push('/treatment-summary');
  }, [router]);

  const dismissError = useCallback((type: string) => {
    setValidationErrors((prev) => prev.filter((e) => e.type !== type));
  }, []);

  // ── Render ──

  if (!hydrated) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading billing workspace...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!invoice && initialBuildAttempted) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="group -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Treatment Summary
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card/90 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">No Billable Procedures</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There are currently no completed procedures available for billing.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Complete a treatment session and mark procedures as billing-eligible to generate an invoice.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="size-4" />
              Return to Treatment Summary
            </Button>
            <Button variant="outline" onClick={() => router.push('/treatment-execution')}>
              Go to Treatment Execution
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-4 mx-[100px]">
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Initializing invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-[100px]">
      {/* Back navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="group -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Treatment Summary
        </Button>
      </div>

      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Invoice</h1>
          <p className="text-sm text-muted-foreground">
            Invoice #{invoice.invoiceNumber}
            {' · '}
            {invoice.patientName}
            {' · '}
            {invoice.appointmentDate}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusBadgeClass(invoice.status)}`}
          >
            {invoice.status === 'Draft' ? 'Draft' : invoice.status}
          </span>
          <span className="inline-flex shrink-0 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="mr-1 size-3" />
            Completed
          </span>
        </div>
      </div>

      {/* Patient / Visit Header (using shared component when session available) */}
      {session && <PatientContextHeader session={session} />}
      {!session && (
        <div className="rounded-xl border border-border bg-card/95 p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm">
              {invoice.patientName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-foreground leading-tight">{invoice.patientName}</h2>
                <span className="rounded-md border border-border bg-muted/50 px-1.5 py-0.25 text-[11px] font-semibold text-muted-foreground">
                  {invoice.patientId}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>Visit: <strong className="text-foreground/90 font-semibold">{invoice.appointmentDate}</strong></span>
                <span className="text-muted-foreground/30">•</span>
                <span>Dentist: <strong className="text-foreground/90 font-semibold">{invoice.dentist}</strong></span>
                <span className="text-muted-foreground/30">•</span>
                <span>Session: <strong className="text-foreground/90 font-semibold">{invoice.sessionId}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved message */}
      {savedMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{savedMessage}</span>
        </div>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((err, idx) => (
            <div
              key={`${err.type}-${idx}`}
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">Validation Error</p>
                <p className="text-xs text-rose-700 dark:text-rose-300">{err.message}</p>
              </div>
              <button
                onClick={() => dismissError(err.type)}
                className="shrink-0 text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Finalized success banner */}
      {isFinalized && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              Invoice Finalized Successfully
            </h3>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              Invoice #{invoice.invoiceNumber} has been finalized
              {invoice.finalizedAt ? ` on ${new Date(invoice.finalizedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}.
              {invoice.status === 'Paid' ? ' Payment has been received in full.' : invoice.status === 'Partially Paid' ? ' A partial payment has been recorded.' : ' Awaiting payment.'}
            </p>
          </div>
        </div>
      )}

      {/* Main layout: Left (items + payment) + Right (summary) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-10">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5 lg:col-span-7">
          {/* Billable Procedures */}
          <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <Receipt className="size-4 text-primary" />
              Billable Procedures
            </h3>

            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-[2fr_80px_100px_80px_100px_40px] gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Discount</span>
              <span className="text-right">Line Total</span>
              <span />
            </div>

            <div className="space-y-2">
              {invoice.items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-muted/20 px-3.5 py-3 dark:bg-background/10"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_80px_100px_80px_100px_40px] sm:gap-2 sm:items-center">
                    {/* Description */}
                    <div className="min-w-0">
                      {item.isManualCharge ? (
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemUpdate(item.id, { description: e.target.value })
                          }
                          className={inputClass}
                          placeholder={`Item #${index + 1} description...`}
                          disabled={isFinalized}
                        />
                      ) : (
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            From completed procedure
                            {item.sourceExecutionId && ` · ${item.sourceExecutionId.slice(0, 16)}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemUpdate(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
                        }
                        className={numberInputClass}
                        disabled={isFinalized}
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">Unit Price</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemUpdate(item.id, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })
                          }
                          className={numberInputClass + ' pl-5 w-full'}
                          disabled={isFinalized}
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    <div>
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">Discount</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) =>
                            handleItemUpdate(item.id, { discount: Math.max(0, parseFloat(e.target.value) || 0) })
                          }
                          className={numberInputClass + ' pl-5 w-full'}
                          disabled={isFinalized}
                        />
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <label className="sm:hidden block text-[10px] font-semibold text-muted-foreground mb-0.5">Line Total</label>
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(item.lineTotal)}
                      </p>
                    </div>

                    {/* Remove button (manual charges only) */}
                    <div className="flex justify-center">
                      {item.isManualCharge && !isFinalized && (
                        <button
                          onClick={() => handleRemoveManual(item.id)}
                          className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Charge button */}
            {!isFinalized && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCharge}
                className="mt-3"
              >
                <PlusCircle className="mr-1 size-3.5" />
                Add Charge
              </Button>
            )}
          </div>

          {/* ── Payment Section ── */}
          <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <DollarSign className="size-4 text-primary" />
              Payment
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Amount Paid */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Amount Received</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoice.payment.amountPaid}
                    onChange={(e) =>
                      handlePaymentUpdate({
                        amountPaid: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    className={inputClass + ' pl-7 text-sm'}
                    disabled={isFinalized}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Payment Method</label>
                <select
                  value={invoice.payment.paymentMethod}
                  onChange={(e) =>
                    handlePaymentUpdate({ paymentMethod: e.target.value as PaymentMethod })
                  }
                  className={selectClass + ' w-full'}
                  disabled={isFinalized}
                >
                  <option value="Cash">Cash</option>
                  <option value="KHQR / Bank Transfer">KHQR / Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Payment Status</label>
                <div className="h-9 flex items-center">
                  <span
                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusBadgeClass(invoice.payment.paymentStatus)}`}
                  >
                    {invoice.payment.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Change Due (when overpaid) */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Change Due</label>
                <p className="h-9 flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {invoice.payment.amountPaid > grandTotal
                    ? formatCurrency(invoice.payment.amountPaid - grandTotal)
                    : formatCurrency(0)}
                </p>
              </div>
            </div>

            {/* Payment Note */}
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Payment / Reference Note
              </label>
              <input
                type="text"
                value={invoice.payment.paymentNote}
                onChange={(e) => handlePaymentUpdate({ paymentNote: e.target.value })}
                className={inputClass}
                placeholder="Optional payment reference or note..."
                disabled={isFinalized}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Invoice Summary ── */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card/90 p-5 theme-surface-shadow lg:sticky lg:top-24">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <FileText className="size-4 text-primary" />
              Invoice Summary
            </h3>

            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>

              {/* Total Discount */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Discount</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(totalDiscount)}
                </span>
              </div>

              <div className="border-t border-border pt-2">
                {/* Grand Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Grand Total</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                {/* Amount Paid */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(invoice.payment.amountPaid)}
                  </span>
                </div>

                {/* Balance Due */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Balance Due</span>
                  <span
                    className={`text-base font-bold ${
                      balanceDue > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {formatCurrency(balanceDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Status */}
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 dark:bg-background/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Invoice Status</span>
                <span
                  className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${getStatusBadgeClass(invoice.status)}`}
                >
                  {invoice.status === 'Draft' ? 'Draft' : invoice.status}
                </span>
              </div>
              {invoice.finalizedAt && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Finalized on{' '}
                  {new Date(invoice.finalizedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 space-y-2">
              {!isFinalized && (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSaveDraft}
                  >
                    <Save className="mr-1.5 size-4" />
                    Save Draft
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleFinalize}
                    disabled={isFinalizing}
                  >
                    <CheckCircle2 className="mr-1.5 size-4" />
                    {isFinalizing ? 'Finalizing...' : 'Finalize Invoice'}
                  </Button>
                </>
              )}

              {isFinalized && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/treatment-execution')}
                  >
                    <ArrowLeft className="mr-1.5 size-4" />
                    Return to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}