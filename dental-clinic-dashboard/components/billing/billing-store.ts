'use client';

import {
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
  type Payment,
  type PaymentMethod,
  type PaymentStatus,
  type Receipt,
  type ReceiptItem,
  buildInvoiceItemsFromProcedures,
  calculateSubtotal,
  calculateTotalDiscount,
  calculateGrandTotal,
  calculateBalanceDue,
  determinePaymentStatus,
  generateInvoiceNumber,
  generateReceiptNumber,
} from './billing-data';
import { loadFlowState, saveFlowState } from '@/components/treatment-execution/procedure-workspace-store';

const INVOICE_STORAGE_KEY = 'preah-chan-billing-invoice';
const RECEIPT_STORAGE_KEY = 'preah-chan-billing-receipt';

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
      amountReceived: 0,
      amountPaid: 0,
      changeDue: 0,
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
  updates: Partial<Pick<Payment, 'amountReceived' | 'paymentMethod' | 'paymentNote'>>
): Invoice {
  const grandTotal = calculateGrandTotal(invoice.items);
  const newAmountReceived = Math.max(0, updates.amountReceived ?? invoice.payment.amountReceived);

  // amountPaid = min(amountReceived, grandTotal)
  const newAmountPaid = Math.min(newAmountReceived, grandTotal);
  // changeDue = max(0, amountReceived - grandTotal)
  const changeDue = Math.max(0, newAmountReceived - grandTotal);
  const paymentStatus = determinePaymentStatus(grandTotal, newAmountPaid);

  return {
    ...invoice,
    payment: {
      amountReceived: newAmountReceived,
      amountPaid: newAmountPaid,
      changeDue,
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

/* ── Receipt Persistence ── */

export function loadSavedReceipt(): Receipt | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(RECEIPT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Receipt;
  } catch {
    return null;
  }
}

export function saveReceipt(receipt: Receipt): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
}

export function clearSavedReceipt(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(RECEIPT_STORAGE_KEY);
}

/**
 * Build a Receipt from a finalized Invoice.
 * The receipt is a read-only snapshot of the finalized financial data.
 * If a receipt already exists for this invoice, it is returned as-is (no duplicate).
 */
export function buildReceiptFromInvoice(invoice: Invoice): Receipt {
  // Check if a receipt already exists for this invoice
  const existing = loadSavedReceipt();
  if (existing && existing.invoiceId === invoice.id) {
    return existing;
  }

  const items: ReceiptItem[] = invoice.items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount,
    lineTotal: item.lineTotal,
    isManualCharge: item.isManualCharge,
  }));

  const subtotal = calculateSubtotal(invoice.items);
  const totalDiscount = calculateTotalDiscount(invoice.items);
  const grandTotal = calculateGrandTotal(invoice.items);
  const balanceDue = calculateBalanceDue(grandTotal, invoice.payment.amountPaid);

  const receipt: Receipt = {
    id: `rcpt-${invoice.id}`,
    receiptNumber: generateReceiptNumber(),
    invoiceNumber: invoice.invoiceNumber,
    invoiceId: invoice.id,
    createdAt: new Date().toISOString(),
    sessionId: invoice.sessionId,
    patientId: invoice.patientId,
    patientName: invoice.patientName,
    appointmentDate: invoice.appointmentDate,
    dentist: invoice.dentist,
    items,
    subtotal,
    totalDiscount,
    grandTotal,
    amountReceived: invoice.payment.amountReceived,
    amountPaid: invoice.payment.amountPaid,
    changeDue: invoice.payment.changeDue,
    balanceDue,
    paymentMethod: invoice.payment.paymentMethod,
    paymentNote: invoice.payment.paymentNote,
    paymentStatus: invoice.payment.paymentStatus,
    invoiceStatus: invoice.status,
    finalizedAt: invoice.finalizedAt || new Date().toISOString(),
  };

  saveReceipt(receipt);
  return receipt;
}
