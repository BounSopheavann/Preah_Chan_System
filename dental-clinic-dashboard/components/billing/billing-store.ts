'use client';

import {
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
  type Payment,
  type PaymentMethod,
  type PaymentStatus,
  buildInvoiceItemsFromProcedures,
  calculateGrandTotal,
  determinePaymentStatus,
  generateInvoiceNumber,
} from './billing-data';
import { loadFlowState, saveFlowState } from '@/components/treatment-execution/procedure-workspace-store';

const INVOICE_STORAGE_KEY = 'preah-chan-billing-invoice';

/* ── Invoice Creation ── */

/**
 * Build a fresh Invoice from the current treatment session state.
 * Returns null if there is no valid completed session with billing-eligible procedures.
 */
export function buildInvoiceFromSession(): Invoice | null {
  const flow = loadFlowState();
  if (!flow) return null;

  const session = flow.session;
  if (session.status !== 'Completed') return null;

  const billingEligible = session.completedProcedures.filter((p) => p.billingEligible === true);
  if (billingEligible.length === 0) return null;

  const items = buildInvoiceItemsFromProcedures(billingEligible);
  if (items.length === 0) return null;

  const now = new Date().toISOString();
  const invoiceNumber = generateInvoiceNumber();

  const invoice: Invoice = {
    id: `inv-${session.id}-${Date.now()}`,
    invoiceNumber,
    createdAt: now,
    status: 'Draft',
    items,
    payment: {
      amountPaid: 0,
      paymentMethod: 'Cash',
      paymentNote: '',
      paymentStatus: 'Unpaid',
    },
    sessionId: session.id,
    patientId: session.patientId,
    patientName: session.patientName,
    appointmentDate: session.appointmentDate,
    dentist: session.dentist,
  };

  return invoice;
}

/* ── LocalStorage Persistence ── */

export function loadSavedInvoice(): Invoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Invoice;
  } catch {
    return null;
  }
}

export function saveInvoice(invoice: Invoice): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoice));
}

export function clearSavedInvoice(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(INVOICE_STORAGE_KEY);
}

/* ── Invoice Mutations ── */

export function updateInvoiceItem(
  invoice: Invoice,
  itemId: string,
  updates: Partial<Pick<InvoiceItem, 'quantity' | 'unitPrice' | 'description' | 'discount'>>
): Invoice {
  const updatedItems = invoice.items.map((item) => {
    if (item.id !== itemId) return item;

    const newQuantity = updates.quantity ?? item.quantity;
    const newUnitPrice = updates.unitPrice ?? item.unitPrice;
    const newDiscount = updates.discount ?? item.discount;

    return {
      ...item,
      description: updates.description ?? item.description,
      quantity: Math.max(1, newQuantity),
      unitPrice: Math.max(0, newUnitPrice),
      discount: Math.max(0, newDiscount),
      lineTotal: Math.max(0, newQuantity * newUnitPrice - newDiscount),
    };
  });

  return { ...invoice, items: updatedItems };
}

export function removeInvoiceItem(invoice: Invoice, itemId: string): Invoice {
  // Only allow removal of manual charges
  const item = invoice.items.find((i) => i.id === itemId);
  if (!item || !item.isManualCharge) return invoice;

  return {
    ...invoice,
    items: invoice.items.filter((i) => i.id !== itemId),
  };
}

export function addManualCharge(invoice: Invoice): Invoice {
  const newItem: InvoiceItem = {
    id: `manual-${Date.now()}`,
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    lineTotal: 0,
    isManualCharge: true,
  };

  return {
    ...invoice,
    items: [...invoice.items, newItem],
  };
}

export function updatePayment(
  invoice: Invoice,
  updates: Partial<Pick<Payment, 'amountPaid' | 'paymentMethod' | 'paymentNote'>>
): Invoice {
  const grandTotal = calculateGrandTotal(invoice.items);
  const newAmountPaid = Math.max(0, updates.amountPaid ?? invoice.payment.amountPaid);

  // Clamp amount paid to grand total (no negative balance)
  const clampedAmountPaid = Math.min(newAmountPaid, grandTotal);

  const paymentStatus = determinePaymentStatus(grandTotal, clampedAmountPaid);

  return {
    ...invoice,
    payment: {
      amountPaid: clampedAmountPaid,
      paymentMethod: (updates.paymentMethod as PaymentMethod) ?? invoice.payment.paymentMethod,
      paymentNote: updates.paymentNote ?? invoice.payment.paymentNote,
      paymentStatus,
    },
  };
}

export function finalizeInvoice(invoice: Invoice): Invoice {
  const grandTotal = calculateGrandTotal(invoice.items);
  const paymentStatus = determinePaymentStatus(grandTotal, invoice.payment.amountPaid);

  return {
    ...invoice,
    status: paymentStatus,
    finalizedAt: new Date().toISOString(),
    payment: {
      ...invoice.payment,
      paymentStatus,
    },
  };
}

export function saveDraftInvoice(invoice: Invoice): void {
  saveInvoice({ ...invoice, status: 'Draft' });
}