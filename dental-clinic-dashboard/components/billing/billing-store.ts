'use client';

import {
  type Invoice,
  type InvoiceItem,
  type Payment,
  type PaymentMethod,
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

/* ── In-memory state (no localStorage) ── */

let _memoryInvoice: Invoice | null = null;
let _memoryReceipt: Receipt | null = null;

/* ── Invoice Creation ── */

export function buildInvoiceFromSession(): Invoice | null {
  // Build a mock invoice with sample items
  const now = new Date().toISOString();
  const invoiceNumber = generateInvoiceNumber();

  const mockItems: InvoiceItem[] = [
    {
      id: 'item-001',
      description: 'Composite Filling - Tooth 14',
      quantity: 1,
      unitPrice: 180,
      discount: 0,
      lineTotal: 180,
      isManualCharge: false,
    },
    {
      id: 'item-002',
      description: 'Local Anesthesia',
      quantity: 1,
      unitPrice: 25,
      discount: 0,
      lineTotal: 25,
      isManualCharge: false,
    },
  ];

  const invoice: Invoice = {
    id: `inv-mock-${Date.now()}`,
    invoiceNumber,
    createdAt: now,
    status: 'Draft',
    items: mockItems,
    payment: {
      amountReceived: 0,
      amountPaid: 0,
      changeDue: 0,
      paymentMethod: 'Cash',
      paymentNote: '',
      paymentStatus: 'Unpaid',
    },
    sessionId: 'mock-session',
    patientId: 'PC-1001',
    patientName: 'Ariana Lopez',
    appointmentDate: 'July 23, 2026',
    dentist: 'Dr. Sarah',
  };

  return invoice;
}

/* ── In-memory Persistence ── */

export function loadSavedInvoice(): Invoice | null {
  return _memoryInvoice;
}

export function saveInvoice(invoice: Invoice): void {
  _memoryInvoice = invoice;
}

export function clearSavedInvoice(): void {
  _memoryInvoice = null;
}

/* ── Invoice Mutations ── (kept for UI interactivity) */

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
  const item = invoice.items.find((i) => i.id === itemId);
  if (!item || !item.isManualCharge) return invoice;
  return { ...invoice, items: invoice.items.filter((i) => i.id !== itemId) };
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
  return { ...invoice, items: [...invoice.items, newItem] };
}

export function updatePayment(
  invoice: Invoice,
  updates: Partial<Pick<Payment, 'amountReceived' | 'paymentMethod' | 'paymentNote'>>
): Invoice {
  const grandTotal = calculateGrandTotal(invoice.items);
  const newAmountReceived = Math.max(0, updates.amountReceived ?? invoice.payment.amountReceived);
  const newAmountPaid = Math.min(newAmountReceived, grandTotal);
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
    payment: { ...invoice.payment, paymentStatus },
  };
}

export function saveDraftInvoice(invoice: Invoice): void {
  saveInvoice({ ...invoice, status: 'Draft' });
}

/* ── Receipt ── */

export function loadSavedReceipt(): Receipt | null {
  return _memoryReceipt;
}

export function saveReceipt(receipt: Receipt): void {
  _memoryReceipt = receipt;
}

export function clearSavedReceipt(): void {
  _memoryReceipt = null;
}

export function buildReceiptFromInvoice(invoice: Invoice): Receipt {
  if (_memoryReceipt && _memoryReceipt.invoiceId === invoice.id) {
    return _memoryReceipt;
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

  _memoryReceipt = receipt;
  return receipt;
}