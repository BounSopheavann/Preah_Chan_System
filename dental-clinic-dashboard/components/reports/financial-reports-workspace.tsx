'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Landmark,
  Percent,
  Printer,
  Receipt,
  Search,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'Today' | 'This Week' | 'This Month' | 'This Year' | 'Custom Range';
type ChartType = 'bar' | 'line' | 'area' | 'cumulative';

type OutstandingRecord = {
  id: string;
  patient: string;
  code: string;
  invoice: string;
  total: number;
  paid: number;
  outstanding: number;
  date: string;
  status: 'Partially Paid' | 'Unpaid' | 'Overdue';
};

type ActivityRecord = {
  id: string;
  type: 'payment' | 'discount' | 'invoice';
  description: string;
  invoiceRef: string;
  patient: string;
  method?: string;
  amount: number;
  time: string;
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockDatasets: Record<string, {
  totalBilled: number;
  collected: number;
  outstanding: number;
  discounts: number;
  invoices: number;
  collectionRate: number;
  revenueTrend: { label: string; value: number }[];
  invoiceStatus: { paid: number; paidAmount: number; partial: number; partialCollected: number; unpaid: number; unpaidAmount: number };
  paymentMethods: { method: string; amount: number; percentage: number }[];
  procedures: { name: string; treatments: number; revenue: number; share: number }[];
  dentists: { name: string; procedures: number; patients: number; revenue: number; share: number }[];
  outstandingRecords: OutstandingRecord[];
  discountBreakdown: { total: number; percentage: number; fixed: number; approved: number; reasons: { reason: string; count: number; amount: number }[] };
  activity: ActivityRecord[];
}> = {
  'This Month': {
    totalBilled: 12450,
    collected: 10820,
    outstanding: 1630,
    discounts: 420,
    invoices: 148,
    collectionRate: 86.9,
    revenueTrend: [
      { label: 'Jul 1', value: 420 },
      { label: 'Jul 2', value: 680 },
      { label: 'Jul 3', value: 510 },
      { label: 'Jul 4', value: 890 },
      { label: 'Jul 5', value: 760 },
      { label: 'Jul 6', value: 340 },
      { label: 'Jul 7', value: 550 },
      { label: 'Jul 8', value: 920 },
      { label: 'Jul 9', value: 610 },
      { label: 'Jul 10', value: 780 },
      { label: 'Jul 11', value: 430 },
      { label: 'Jul 12', value: 670 },
      { label: 'Jul 13', value: 810 },
      { label: 'Jul 14', value: 540 },
      { label: 'Jul 15', value: 720 },
      { label: 'Jul 16', value: 380 },
      { label: 'Jul 17', value: 650 },
      { label: 'Jul 18', value: 490 },
      { label: 'Jul 19', value: 830 },
      { label: 'Jul 20', value: 570 },
    ],
    invoiceStatus: { paid: 112, paidAmount: 9750, partial: 21, partialCollected: 1070, unpaid: 15, unpaidAmount: 1630 },
    paymentMethods: [
      { method: 'KHQR', amount: 4820, percentage: 44.5 },
      { method: 'Cash', amount: 3600, percentage: 33.3 },
      { method: 'Bank Transfer', amount: 1650, percentage: 15.2 },
      { method: 'Card', amount: 750, percentage: 6.9 },
    ],
    procedures: [
      { name: 'Root Canal', treatments: 18, revenue: 2850, share: 26.3 },
      { name: 'Crown', treatments: 12, revenue: 2400, share: 22.2 },
      { name: 'Scaling & Cleaning', treatments: 45, revenue: 1850, share: 17.1 },
      { name: 'Filling', treatments: 28, revenue: 1520, share: 14.0 },
      { name: 'Extraction', treatments: 15, revenue: 1100, share: 10.2 },
      { name: 'Consultation', treatments: 30, revenue: 650, share: 6.0 },
    ],
    dentists: [
      { name: 'Dr. Chan Dara', procedures: 42, patients: 28, revenue: 4850, share: 44.8 },
      { name: 'Dr. Sok Lina', procedures: 35, patients: 22, revenue: 3620, share: 33.5 },
      { name: 'Dr. Kim Sothea', procedures: 28, patients: 18, revenue: 2350, share: 21.7 },
    ],
    outstandingRecords: [
      { id: 'out-1', patient: 'Sok Dara', code: 'PT000128', invoice: 'INV-2026-0108', total: 185, paid: 100, outstanding: 85, date: 'Jul 15, 2026', status: 'Partially Paid' },
      { id: 'out-2', patient: 'Maly Chenda', code: 'PT000214', invoice: 'INV-2026-0105', total: 320, paid: 0, outstanding: 320, date: 'Jul 10, 2026', status: 'Unpaid' },
      { id: 'out-3', patient: 'Chan Sreyneang', code: 'PT000087', invoice: 'INV-2026-0103', total: 450, paid: 200, outstanding: 250, date: 'Jun 28, 2026', status: 'Partially Paid' },
      { id: 'out-4', patient: 'Vannak Lim', code: 'PT000301', invoice: 'INV-2026-0099', total: 280, paid: 0, outstanding: 280, date: 'Jun 20, 2026', status: 'Overdue' },
      { id: 'out-5', patient: 'Sophea Keo', code: 'PT000176', invoice: 'INV-2026-0095', total: 195, paid: 0, outstanding: 195, date: 'Jun 12, 2026', status: 'Overdue' },
      { id: 'out-6', patient: 'Rithy Sam', code: 'PT000263', invoice: 'INV-2026-0101', total: 500, paid: 300, outstanding: 200, date: 'Jul 5, 2026', status: 'Partially Paid' },
      { id: 'out-7', patient: 'Srey Mom', code: 'PT000045', invoice: 'INV-2026-0092', total: 150, paid: 0, outstanding: 150, date: 'Jun 5, 2026', status: 'Overdue' },
      { id: 'out-8', patient: 'Bora Kim', code: 'PT000189', invoice: 'INV-2026-0106', total: 220, paid: 0, outstanding: 220, date: 'Jul 12, 2026', status: 'Unpaid' },
    ],
    discountBreakdown: {
      total: 420,
      percentage: 280,
      fixed: 140,
      approved: 12,
      reasons: [
        { reason: 'Promotion', count: 5, amount: 180 },
        { reason: 'Loyalty', count: 3, amount: 95 },
        { reason: 'Management Approval', count: 2, amount: 85 },
        { reason: 'Treatment Package', count: 2, amount: 60 },
      ],
    },
    activity: [
      { id: 'act-1', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0108', patient: 'Sok Dara', method: 'KHQR', amount: 100, time: 'Today, 3:42 PM' },
      { id: 'act-2', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0107', patient: 'Chan Sreyneang', method: 'Cash', amount: 250, time: 'Today, 2:15 PM' },
      { id: 'act-3', type: 'discount', description: 'Discount approved', invoiceRef: 'INV-2026-0106', patient: 'Bora Kim', amount: -25, time: 'Today, 1:30 PM' },
      { id: 'act-4', type: 'invoice', description: 'Invoice issued', invoiceRef: 'INV-2026-0109', patient: 'Sophea Keo', amount: 480, time: 'Today, 11:20 AM' },
      { id: 'act-5', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0104', patient: 'Maly Chenda', method: 'Bank Transfer', amount: 180, time: 'Yesterday, 4:50 PM' },
      { id: 'act-6', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0102', patient: 'Vannak Lim', method: 'KHQR', amount: 320, time: 'Yesterday, 2:10 PM' },
      { id: 'act-7', type: 'discount', description: 'Discount approved', invoiceRef: 'INV-2026-0101', patient: 'Rithy Sam', amount: -35, time: 'Yesterday, 10:30 AM' },
      { id: 'act-8', type: 'invoice', description: 'Invoice issued', invoiceRef: 'INV-2026-0108', patient: 'Sok Dara', amount: 185, time: 'Jul 25, 2026' },
    ],
  },
  'This Week': {
    totalBilled: 3450,
    collected: 2980,
    outstanding: 470,
    discounts: 120,
    invoices: 38,
    collectionRate: 86.4,
    revenueTrend: [
      { label: 'Mon', value: 520 },
      { label: 'Tue', value: 680 },
      { label: 'Wed', value: 410 },
      { label: 'Thu', value: 750 },
      { label: 'Fri', value: 620 },
      { label: 'Sat', value: 0 },
      { label: 'Sun', value: 0 },
    ],
    invoiceStatus: { paid: 28, paidAmount: 2510, partial: 6, partialCollected: 470, unpaid: 4, unpaidAmount: 470 },
    paymentMethods: [
      { method: 'KHQR', amount: 1320, percentage: 44.3 },
      { method: 'Cash', amount: 980, percentage: 32.9 },
      { method: 'Bank Transfer', amount: 450, percentage: 15.1 },
      { method: 'Card', amount: 230, percentage: 7.7 },
    ],
    procedures: [
      { name: 'Root Canal', treatments: 4, revenue: 720, share: 24.2 },
      { name: 'Crown', treatments: 3, revenue: 650, share: 21.8 },
      { name: 'Scaling & Cleaning', treatments: 12, revenue: 520, share: 17.4 },
      { name: 'Filling', treatments: 7, revenue: 420, share: 14.1 },
      { name: 'Extraction', treatments: 4, revenue: 350, share: 11.7 },
      { name: 'Consultation', treatments: 8, revenue: 180, share: 6.0 },
    ],
    dentists: [
      { name: 'Dr. Chan Dara', procedures: 12, patients: 8, revenue: 1350, share: 45.3 },
      { name: 'Dr. Sok Lina', procedures: 10, patients: 7, revenue: 980, share: 32.9 },
      { name: 'Dr. Kim Sothea', procedures: 8, patients: 5, revenue: 650, share: 21.8 },
    ],
    outstandingRecords: [
      { id: 'out-1', patient: 'Sok Dara', code: 'PT000128', invoice: 'INV-2026-0108', total: 185, paid: 100, outstanding: 85, date: 'Jul 15, 2026', status: 'Partially Paid' },
      { id: 'out-2', patient: 'Maly Chenda', code: 'PT000214', invoice: 'INV-2026-0105', total: 320, paid: 0, outstanding: 320, date: 'Jul 10, 2026', status: 'Unpaid' },
      { id: 'out-3', patient: 'Bora Kim', code: 'PT000189', invoice: 'INV-2026-0106', total: 220, paid: 0, outstanding: 220, date: 'Jul 12, 2026', status: 'Unpaid' },
    ],
    discountBreakdown: {
      total: 120,
      percentage: 80,
      fixed: 40,
      approved: 4,
      reasons: [
        { reason: 'Promotion', count: 2, amount: 60 },
        { reason: 'Loyalty', count: 1, amount: 30 },
        { reason: 'Management Approval', count: 1, amount: 30 },
      ],
    },
    activity: [
      { id: 'act-1', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0108', patient: 'Sok Dara', method: 'KHQR', amount: 100, time: 'Today, 3:42 PM' },
      { id: 'act-2', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0107', patient: 'Chan Sreyneang', method: 'Cash', amount: 250, time: 'Today, 2:15 PM' },
      { id: 'act-3', type: 'discount', description: 'Discount approved', invoiceRef: 'INV-2026-0106', patient: 'Bora Kim', amount: -25, time: 'Today, 1:30 PM' },
      { id: 'act-4', type: 'invoice', description: 'Invoice issued', invoiceRef: 'INV-2026-0109', patient: 'Sophea Keo', amount: 480, time: 'Today, 11:20 AM' },
      { id: 'act-5', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0104', patient: 'Maly Chenda', method: 'Bank Transfer', amount: 180, time: 'Yesterday, 4:50 PM' },
    ],
  },
  'This Year': {
    totalBilled: 142800,
    collected: 121380,
    outstanding: 21420,
    discounts: 5200,
    invoices: 1680,
    collectionRate: 85.0,
    revenueTrend: [
      { label: 'Jan', value: 9800 },
      { label: 'Feb', value: 10200 },
      { label: 'Mar', value: 11500 },
      { label: 'Apr', value: 10800 },
      { label: 'May', value: 12400 },
      { label: 'Jun', value: 11800 },
      { label: 'Jul', value: 10820 },
    ],
    invoiceStatus: { paid: 1280, paidAmount: 108000, partial: 240, partialCollected: 13380, unpaid: 160, unpaidAmount: 21420 },
    paymentMethods: [
      { method: 'KHQR', amount: 52000, percentage: 42.8 },
      { method: 'Cash', amount: 41000, percentage: 33.8 },
      { method: 'Bank Transfer', amount: 19500, percentage: 16.1 },
      { method: 'Card', amount: 8880, percentage: 7.3 },
    ],
    procedures: [
      { name: 'Root Canal', treatments: 210, revenue: 32500, share: 26.8 },
      { name: 'Crown', treatments: 145, revenue: 27800, share: 22.9 },
      { name: 'Scaling & Cleaning', treatments: 520, revenue: 21500, share: 17.7 },
      { name: 'Filling', treatments: 320, revenue: 17200, share: 14.2 },
      { name: 'Extraction', treatments: 180, revenue: 12800, share: 10.5 },
      { name: 'Consultation', treatments: 350, revenue: 7200, share: 5.9 },
    ],
    dentists: [
      { name: 'Dr. Chan Dara', procedures: 480, patients: 320, revenue: 52000, share: 42.8 },
      { name: 'Dr. Sok Lina', procedures: 420, patients: 280, revenue: 39800, share: 32.8 },
      { name: 'Dr. Kim Sothea', procedures: 350, patients: 220, revenue: 29580, share: 24.4 },
    ],
    outstandingRecords: [
      { id: 'out-1', patient: 'Sok Dara', code: 'PT000128', invoice: 'INV-2026-0108', total: 185, paid: 100, outstanding: 85, date: 'Jul 15, 2026', status: 'Partially Paid' },
      { id: 'out-2', patient: 'Maly Chenda', code: 'PT000214', invoice: 'INV-2026-0105', total: 320, paid: 0, outstanding: 320, date: 'Jul 10, 2026', status: 'Unpaid' },
      { id: 'out-3', patient: 'Chan Sreyneang', code: 'PT000087', invoice: 'INV-2026-0103', total: 450, paid: 200, outstanding: 250, date: 'Jun 28, 2026', status: 'Partially Paid' },
      { id: 'out-4', patient: 'Vannak Lim', code: 'PT000301', invoice: 'INV-2026-0099', total: 280, paid: 0, outstanding: 280, date: 'Jun 20, 2026', status: 'Overdue' },
      { id: 'out-5', patient: 'Sophea Keo', code: 'PT000176', invoice: 'INV-2026-0095', total: 195, paid: 0, outstanding: 195, date: 'Jun 12, 2026', status: 'Overdue' },
      { id: 'out-6', patient: 'Rithy Sam', code: 'PT000263', invoice: 'INV-2026-0101', total: 500, paid: 300, outstanding: 200, date: 'Jul 5, 2026', status: 'Partially Paid' },
      { id: 'out-7', patient: 'Srey Mom', code: 'PT000045', invoice: 'INV-2026-0092', total: 150, paid: 0, outstanding: 150, date: 'Jun 5, 2026', status: 'Overdue' },
      { id: 'out-8', patient: 'Bora Kim', code: 'PT000189', invoice: 'INV-2026-0106', total: 220, paid: 0, outstanding: 220, date: 'Jul 12, 2026', status: 'Unpaid' },
    ],
    discountBreakdown: {
      total: 5200,
      percentage: 3500,
      fixed: 1700,
      approved: 145,
      reasons: [
        { reason: 'Promotion', count: 62, amount: 2200 },
        { reason: 'Loyalty', count: 38, amount: 1200 },
        { reason: 'Management Approval', count: 25, amount: 1050 },
        { reason: 'Treatment Package', count: 20, amount: 750 },
      ],
    },
    activity: [
      { id: 'act-1', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0108', patient: 'Sok Dara', method: 'KHQR', amount: 100, time: 'Today, 3:42 PM' },
      { id: 'act-2', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0107', patient: 'Chan Sreyneang', method: 'Cash', amount: 250, time: 'Today, 2:15 PM' },
      { id: 'act-3', type: 'discount', description: 'Discount approved', invoiceRef: 'INV-2026-0106', patient: 'Bora Kim', amount: -25, time: 'Today, 1:30 PM' },
      { id: 'act-4', type: 'invoice', description: 'Invoice issued', invoiceRef: 'INV-2026-0109', patient: 'Sophea Keo', amount: 480, time: 'Today, 11:20 AM' },
      { id: 'act-5', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0104', patient: 'Maly Chenda', method: 'Bank Transfer', amount: 180, time: 'Yesterday, 4:50 PM' },
      { id: 'act-6', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0102', patient: 'Vannak Lim', method: 'KHQR', amount: 320, time: 'Yesterday, 2:10 PM' },
      { id: 'act-7', type: 'discount', description: 'Discount approved', invoiceRef: 'INV-2026-0101', patient: 'Rithy Sam', amount: -35, time: 'Yesterday, 10:30 AM' },
      { id: 'act-8', type: 'invoice', description: 'Invoice issued', invoiceRef: 'INV-2026-0108', patient: 'Sok Dara', amount: 185, time: 'Jul 25, 2026' },
    ],
  },
};

const todayDataset: typeof mockDatasets['This Month'] = {
  totalBilled: 1250,
  collected: 1080,
  outstanding: 170,
  discounts: 45,
  invoices: 14,
  collectionRate: 86.4,
  revenueTrend: [
    { label: '8 AM', value: 0 },
    { label: '9 AM', value: 120 },
    { label: '10 AM', value: 250 },
    { label: '11 AM', value: 180 },
    { label: '12 PM', value: 90 },
    { label: '1 PM', value: 0 },
    { label: '2 PM', value: 210 },
    { label: '3 PM', value: 150 },
    { label: '4 PM', value: 80 },
    { label: '5 PM', value: 0 },
  ],
  invoiceStatus: { paid: 10, paidAmount: 880, partial: 2, partialCollected: 200, unpaid: 2, unpaidAmount: 170 },
  paymentMethods: [
    { method: 'KHQR', amount: 480, percentage: 44.4 },
    { method: 'Cash', amount: 360, percentage: 33.3 },
    { method: 'Bank Transfer', amount: 150, percentage: 13.9 },
    { method: 'Card', amount: 90, percentage: 8.3 },
  ],
  procedures: [
    { name: 'Root Canal', treatments: 2, revenue: 320, share: 29.6 },
    { name: 'Crown', treatments: 1, revenue: 250, share: 23.1 },
    { name: 'Scaling & Cleaning', treatments: 4, revenue: 180, share: 16.7 },
    { name: 'Filling', treatments: 3, revenue: 150, share: 13.9 },
    { name: 'Extraction', treatments: 2, revenue: 120, share: 11.1 },
    { name: 'Consultation', treatments: 2, revenue: 60, share: 5.6 },
  ],
  dentists: [
    { name: 'Dr. Chan Dara', procedures: 5, patients: 4, revenue: 480, share: 44.4 },
    { name: 'Dr. Sok Lina', procedures: 4, patients: 3, revenue: 350, share: 32.4 },
    { name: 'Dr. Kim Sothea', procedures: 3, patients: 2, revenue: 250, share: 23.1 },
  ],
  outstandingRecords: [
    { id: 'out-1', patient: 'Sok Dara', code: 'PT000128', invoice: 'INV-2026-0108', total: 185, paid: 100, outstanding: 85, date: 'Jul 15, 2026', status: 'Partially Paid' },
    { id: 'out-2', patient: 'Maly Chenda', code: 'PT000214', invoice: 'INV-2026-0105', total: 320, paid: 0, outstanding: 320, date: 'Jul 10, 2026', status: 'Unpaid' },
  ],
  discountBreakdown: {
    total: 45,
    percentage: 30,
    fixed: 15,
    approved: 2,
    reasons: [
      { reason: 'Promotion', count: 1, amount: 25 },
      { reason: 'Loyalty', count: 1, amount: 20 },
    ],
  },
  activity: [
    { id: 'act-1', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0108', patient: 'Sok Dara', method: 'KHQR', amount: 100, time: 'Today, 3:42 PM' },
    { id: 'act-2', type: 'payment', description: 'Payment received', invoiceRef: 'INV-2026-0107', patient: 'Chan Sreyneang', method: 'Cash', amount: 250, time: 'Today, 2:15 PM' },
    { id: 'act-3', type: 'discount', description: 'Discount approved', invoiceRef: 'INV-2026-0106', patient: 'Bora Kim', amount: -25, time: 'Today, 1:30 PM' },
    { id: 'act-4', type: 'invoice', description: 'Invoice issued', invoiceRef: 'INV-2026-0109', patient: 'Sophea Keo', amount: 480, time: 'Today, 11:20 AM' },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatUSD = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'Paid':
    case 'payment':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300';
    case 'Partially Paid':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300';
    case 'Unpaid':
    case 'Overdue':
    case 'discount':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300';
    case 'invoice':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  trendLabel,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down';
  trendLabel?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="size-5 text-white" />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
            trend === 'up'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {trendLabel}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Main Workspace ──────────────────────────────────────────────────────────

export function FinancialReportsWorkspace() {
  const [period, setPeriod] = useState<Period>('This Month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [outstandingSearch, setOutstandingSearch] = useState('');
  const [outstandingStatus, setOutstandingStatus] = useState<string>('All');
  const [exportFeedback, setExportFeedback] = useState('');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [printFeedback, setPrintFeedback] = useState('');

  const data = useMemo(() => {
    if (period === 'Today') return todayDataset;
    return mockDatasets[period] || mockDatasets['This Month'];
  }, [period]);

  const filteredOutstanding = useMemo(() => {
    return data.outstandingRecords.filter((r) => {
      const matchesSearch = !outstandingSearch ||
        r.patient.toLowerCase().includes(outstandingSearch.toLowerCase()) ||
        r.code.toLowerCase().includes(outstandingSearch.toLowerCase()) ||
        r.invoice.toLowerCase().includes(outstandingSearch.toLowerCase());
      const matchesStatus = outstandingStatus === 'All' || r.status === outstandingStatus;
      return matchesSearch && matchesStatus;
    });
  }, [data.outstandingRecords, outstandingSearch, outstandingStatus]);

  const maxTrendValue = Math.max(...data.revenueTrend.map((d) => d.value), 1);

  const cumulativeData = useMemo(() => {
    let acc = 0;
    return data.revenueTrend.map((d) => {
      acc += d.value;
      return { label: d.label, value: d.value, cumulative: acc };
    });
  }, [data.revenueTrend]);

  const maxCumulativeValue = cumulativeData.length > 0
    ? Math.max(...cumulativeData.map((d) => d.cumulative), 1)
    : 1;

  const showFeedback = (setter: (v: string) => void, msg: string) => {
    setter(msg);
    setTimeout(() => setter(''), 3000);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/80">Finance</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Financial Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review clinic revenue, collections, outstanding balances, and financial activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => showFeedback(setPrintFeedback, 'Printing is available in the future backend phase.')}
            >
              <Printer className="size-4" />
              Print Report
            </Button>
            {printFeedback && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card p-3 text-xs font-medium text-muted-foreground shadow-lg">
                {printFeedback}
              </div>
            )}
          </div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => showFeedback(setExportFeedback, 'Report export is available in the future backend phase.')}
            >
              <Download className="size-4" />
              Export
            </Button>
            {exportFeedback && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card p-3 text-xs font-medium text-muted-foreground shadow-lg">
                {exportFeedback}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Date Filter ────────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-xs font-semibold text-muted-foreground">
            Report Period
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="mt-1.5 block h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
          </label>
          {period === 'Custom Range' && (
            <>
              <label className="text-xs font-semibold text-muted-foreground">
                From Date
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="mt-1.5 block h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                />
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                To Date
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="mt-1.5 block h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                />
              </label>
            </>
          )}
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">Period</p>
            <p className="text-sm font-bold text-foreground">{period}</p>
          </div>
        </div>
      </Card>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryCard
          icon={Receipt}
          label="Total Billed"
          value={formatUSD(data.totalBilled)}
          sub={`${data.invoices} invoices`}
          trend="up"
          trendLabel="+12.4%"
          color="bg-blue-600"
        />
        <SummaryCard
          icon={DollarSign}
          label="Collected Revenue"
          value={formatUSD(data.collected)}
          sub="Money actually received"
          trend="up"
          trendLabel="+8.2%"
          color="bg-emerald-600"
        />
        <SummaryCard
          icon={Wallet}
          label="Outstanding Balance"
          value={formatUSD(data.outstanding)}
          sub="Yet to be collected"
          trend="down"
          trendLabel="+3.1%"
          color="bg-amber-600"
        />
        <SummaryCard
          icon={Percent}
          label="Discounts Given"
          value={formatUSD(data.discounts)}
          sub={`${data.discountBreakdown.approved} approved`}
          trend="down"
          trendLabel="-2.0%"
          color="bg-rose-600"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Collection Rate"
          value={`${data.collectionRate}%`}
          sub={`${data.invoiceStatus.paid} paid of ${data.invoices} invoices`}
          trend={data.collectionRate >= 85 ? 'up' : 'down'}
          trendLabel={data.collectionRate >= 85 ? '+1.5%' : '-2.3%'}
          color="bg-violet-600"
        />
      </div>

      {/* ── Revenue Trend + Invoice Status + Payment Methods ───────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Revenue Trend</h2>
              <p className="text-sm text-muted-foreground">Collected revenue over {period.toLowerCase()}</p>
            </div>
            {/* Chart Type Selector */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5 text-xs">
              {(['bar', 'line', 'area', 'cumulative'] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`rounded-md px-2.5 py-1.5 font-semibold capitalize transition-colors ${
                    chartType === type
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type === 'cumulative' ? 'Cumul.' : type}
                </button>
              ))}
            </div>
          </div>
           <div className="mt-5">
             {chartType === 'bar' && (
               <div className="flex" style={{ height: 244 }}>
                 {/* Y-axis labels */}
                 <div className="flex flex-col justify-between pr-3 text-right" style={{ height: 204 }}>
                   {[0, 1, 2, 3, 4].map((i) => {
                     const val = (maxTrendValue / 4) * (4 - i);
                     const yVal = val >= 1000 ? `$${Math.round(val / 1000)}K` : val >= 500 ? `$${Math.round(val / 100) * 100}` : `$${Math.round(val)}`;
                     return (
                       <span key={`ylabel-${i}`} className="text-[11px] font-medium leading-none text-muted-foreground">
                         {yVal}
                       </span>
                     );
                   })}
                 </div>
                 {/* Plot area */}
                 <div className="relative flex-1">
                   {/* Grid lines */}
                   <div className="absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: 204 }}>
                     {[0, 1, 2, 3, 4].map((i) => (
                       <div key={`grid-${i}`} className="border-t border-muted-foreground/15" />
                     ))}
                   </div>
                   {/* Bars */}
                   <div className="relative flex items-end gap-1" style={{ height: 204 }}>
                     {data.revenueTrend.map((point) => {
                       const heightPct = (point.value / maxTrendValue) * 100;
                       return (
                         <div key={point.label} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                           <div
                             className="w-full max-w-[20px] rounded-t-sm bg-primary/75 transition-all duration-150 hover:bg-primary hover:shadow-md"
                             style={{ height: `${Math.max(heightPct, 1)}%` }}
                           />
                           {/* Tooltip */}
                           <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold shadow-lg group-hover:block whitespace-nowrap z-10">
                             <div className="text-foreground">{formatUSD(point.value)}</div>
                             <div className="text-[9px] text-muted-foreground">{point.label}</div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                   {/* X-axis labels (auto-thinned to avoid crowding) */}
                   <div className="mt-2.5 flex gap-1">
                     {data.revenueTrend.map((point, i) => {
                       const n = data.revenueTrend.length;
                       const step = Math.max(1, Math.ceil(n / 8));
                       const show = n <= 8 || i % step === 0;
                       return (
                         <div key={point.label} className="flex-1 text-center text-[10px] font-medium text-muted-foreground">
                           {show ? point.label : ''}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
             )}
            {chartType === 'line' && (
              <svg viewBox="0 0 600 244" className="w-full" preserveAspectRatio="none" style={{ height: 244 }}>
                {/* Subtle grid background aligned with Y ticks */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={`grid-${i}`} x1="44" y1={12 + 50 * i} x2="600" y2={12 + 50 * i} stroke="currentColor" className="stroke-muted" strokeWidth="0.5" opacity={0.18} />
                ))}
                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const val = (maxTrendValue / 4) * (4 - i);
                  const yVal = val >= 1000 ? `$${Math.round(val / 1000)}K` : val >= 500 ? `$${Math.round(val / 100) * 100}` : `$${Math.round(val)}`;
                  return (
                    <text key={`ylabel-${i}`} x="38" y={12 + 50 * i + 4} textAnchor="end" className="fill-muted-foreground" fontSize="11" fontWeight="500">
                      {yVal}
                    </text>
                  );
                })}
                {/* Clearly visible thin line */}
                <polyline
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={data.revenueTrend.map((point, i) => {
                    const x = 44 + ((i + 0.5) / data.revenueTrend.length) * 556;
                    const y = 12 + (1 - point.value / maxTrendValue) * 200;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Data point markers + hover zone */}
                {data.revenueTrend.map((point, i) => {
                  const x = 44 + ((i + 0.5) / data.revenueTrend.length) * 556;
                  const y = 12 + (1 - point.value / maxTrendValue) * 200;
                  const n = data.revenueTrend.length;
                  const step = Math.max(1, Math.ceil(n / 8));
                  const showLabel = n <= 8 || i % step === 0;
                  return (
                    <g key={point.label} className="group cursor-pointer">
                      {/* Invisible hover area */}
                      <circle cx={x} cy={y} r="10" className="fill-transparent" />
                      {/* Data point dot - visible always, slightly enlarged */}
                      <circle cx={x} cy={y} r="3" className="fill-primary" opacity="0.75" />
                      {/* Highlighted dot on hover */}
                      <circle cx={x} cy={y} r="5" className="fill-primary hidden group-hover:block" stroke="hsl(var(--card))" strokeWidth="1.5" />
                      {/* X-axis label (auto-thinned) */}
                      {showLabel && (
                        <text x={x} y="234" textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontWeight="400">
                          {point.label}
                        </text>
                      )}
                      {/* Hover tooltip matching dark card style */}
                      <rect x={x - 42} y={y - 34} width="84" height="24" rx="6" className="fill-popover stroke-border hidden group-hover:block" strokeWidth="1" />
                      <text x={x} y={y - 21} textAnchor="middle" className="hidden group-hover:block fill-popover-foreground" fontSize="11" fontWeight="700">
                        {formatUSD(point.value)}
                      </text>
                      <text x={x} y={y - 11} textAnchor="middle" className="hidden group-hover:block fill-muted-foreground" fontSize="8.5">
                        {point.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
            {chartType === 'area' && (
              <svg viewBox="0 0 600 244" className="w-full" preserveAspectRatio="none" style={{ height: 244 }}>
                {/* Subtle grid background aligned with Y ticks */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={`grid-${i}`} x1="44" y1={12 + 50 * i} x2="600" y2={12 + 50 * i} stroke="currentColor" className="stroke-muted" strokeWidth="0.5" opacity={0.18} />
                ))}
                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const val = (maxTrendValue / 4) * (4 - i);
                  const yVal = val >= 1000 ? `$${Math.round(val / 1000)}K` : val >= 500 ? `$${Math.round(val / 100) * 100}` : `$${Math.round(val)}`;
                  return (
                    <text key={`ylabel-${i}`} x="38" y={12 + 50 * i + 4} textAnchor="end" className="fill-muted-foreground" fontSize="11" fontWeight="500">
                      {yVal}
                    </text>
                  );
                })}
                {/* Subtle transparent gradient fill - secondary to line */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#areaGradient)"
                  points={`44,212 ${data.revenueTrend.map((point, i) => {
                    const x = 44 + ((i + 0.5) / data.revenueTrend.length) * 556;
                    const y = 12 + (1 - point.value / maxTrendValue) * 200;
                    return `${x},${y}`;
                  }).join(' ')} 600,212`}
                />
                {/* Clearly visible line */}
                <polyline
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={data.revenueTrend.map((point, i) => {
                    const x = 44 + ((i + 0.5) / data.revenueTrend.length) * 556;
                    const y = 12 + (1 - point.value / maxTrendValue) * 200;
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Data point markers + hover zone */}
                {data.revenueTrend.map((point, i) => {
                  const x = 44 + ((i + 0.5) / data.revenueTrend.length) * 556;
                  const y = 12 + (1 - point.value / maxTrendValue) * 200;
                  const n = data.revenueTrend.length;
                  const step = Math.max(1, Math.ceil(n / 8));
                  const showLabel = n <= 8 || i % step === 0;
                  return (
                    <g key={point.label} className="group cursor-pointer">
                      <circle cx={x} cy={y} r="10" className="fill-transparent" />
                      <circle cx={x} cy={y} r="3" className="fill-primary" opacity="0.75" />
                      <circle cx={x} cy={y} r="5" className="fill-primary hidden group-hover:block" stroke="hsl(var(--card))" strokeWidth="1.5" />
                      {showLabel && (
                        <text x={x} y="234" textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontWeight="400">
                          {point.label}
                        </text>
                      )}
                      <rect x={x - 42} y={y - 34} width="84" height="24" rx="6" className="fill-popover stroke-border hidden group-hover:block" strokeWidth="1" />
                      <text x={x} y={y - 21} textAnchor="middle" className="hidden group-hover:block fill-popover-foreground" fontSize="11" fontWeight="700">
                        {formatUSD(point.value)}
                      </text>
                      <text x={x} y={y - 11} textAnchor="middle" className="hidden group-hover:block fill-muted-foreground" fontSize="8.5">
                        {point.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
            {chartType === 'cumulative' && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Cumulative Revenue</p>
                <svg viewBox="0 0 600 224" className="w-full" preserveAspectRatio="none" style={{ height: 224 }}>
                  {/* Subtle grid background aligned with Y ticks */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line key={`grid-${i}`} x1="44" y1={12 + 45 * i} x2="600" y2={12 + 45 * i} stroke="currentColor" className="stroke-muted" strokeWidth="0.5" opacity={0.18} />
                  ))}
                  {/* Y-axis labels */}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const val = (maxCumulativeValue / 4) * (4 - i);
                    const yVal = val >= 1000 ? `$${Math.round(val / 1000)}K` : val >= 500 ? `$${Math.round(val / 100) * 100}` : `$${Math.round(val)}`;
                    return (
                      <text key={`ylabel-${i}`} x="38" y={12 + 45 * i + 4} textAnchor="end" className="fill-muted-foreground" fontSize="11" fontWeight="500">
                        {yVal}
                      </text>
                    );
                  })}
                  {/* Subtle transparent gradient fill - secondary to line */}
                  <defs>
                    <linearGradient id="cumulativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <polygon
                    fill="url(#cumulativeGradient)"
                    points={`44,192 ${cumulativeData.map((point, i) => {
                      const x = 44 + ((i + 0.5) / cumulativeData.length) * 556;
                      const y = 12 + (1 - point.cumulative / maxCumulativeValue) * 180;
                      return `${x},${y}`;
                    }).join(' ')} 600,192`}
                  />
                  {/* Clearly visible line */}
                  <polyline
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={cumulativeData.map((point, i) => {
                      const x = 44 + ((i + 0.5) / cumulativeData.length) * 556;
                      const y = 12 + (1 - point.cumulative / maxCumulativeValue) * 180;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  {/* Data point markers + hover zone */}
                  {cumulativeData.map((point, i) => {
                    const x = 44 + ((i + 0.5) / cumulativeData.length) * 556;
                    const y = 12 + (1 - point.cumulative / maxCumulativeValue) * 180;
                    const n = cumulativeData.length;
                    const step = Math.max(1, Math.ceil(n / 8));
                    const showLabel = n <= 8 || i % step === 0;
                    return (
                      <g key={point.label} className="group cursor-pointer">
                        <circle cx={x} cy={y} r="10" className="fill-transparent" />
                        <circle cx={x} cy={y} r="3" className="fill-primary" opacity="0.75" />
                        <circle cx={x} cy={y} r="5" className="fill-primary hidden group-hover:block" stroke="hsl(var(--card))" strokeWidth="1.5" />
                        {showLabel && (
                          <text x={x} y="214" textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontWeight="400">
                            {point.label}
                          </text>
                        )}
                        <rect x={x - 45} y={y - 34} width="90" height="24" rx="6" className="fill-popover stroke-border hidden group-hover:block" strokeWidth="1" />
                        <text x={x} y={y - 21} textAnchor="middle" className="hidden group-hover:block fill-popover-foreground" fontSize="11" fontWeight="700">
                          {formatUSD(point.cumulative)}
                        </text>
                        <text x={x} y={y - 11} textAnchor="middle" className="hidden group-hover:block fill-muted-foreground" fontSize="8.5">
                          {point.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </Card>

        {/* Invoice Status */}
        <Card>
          <SectionHeader title="Invoice Status" />
          <div className="mt-5 space-y-4">
            {/* Paid */}
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Paid
                </span>
                <span className="font-bold">{data.invoiceStatus.paid}</span>
              </div>
              <p className="text-xs text-muted-foreground">{formatUSD(data.invoiceStatus.paidAmount)}</p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(data.invoiceStatus.paid / data.invoices) * 100}%` }}
                />
              </div>
            </div>
            {/* Partially Paid */}
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <Clock className="size-4 text-amber-500" />
                  Partially Paid
                </span>
                <span className="font-bold">{data.invoiceStatus.partial}</span>
              </div>
              <p className="text-xs text-muted-foreground">{formatUSD(data.invoiceStatus.partialCollected)} collected</p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${(data.invoiceStatus.partial / data.invoices) * 100}%` }}
                />
              </div>
            </div>
            {/* Unpaid */}
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <XCircle className="size-4 text-rose-500" />
                  Unpaid
                </span>
                <span className="font-bold">{data.invoiceStatus.unpaid}</span>
              </div>
              <p className="text-xs text-muted-foreground">{formatUSD(data.invoiceStatus.unpaidAmount)} outstanding</p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${(data.invoiceStatus.unpaid / data.invoices) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Payment Methods ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Revenue by Payment Method" />
          <div className="mt-5 space-y-4">
            {data.paymentMethods.map((pm) => (
              <div key={pm.method}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    {pm.method === 'KHQR' ? <Landmark className="size-4 text-primary" /> :
                     pm.method === 'Cash' ? <Banknote className="size-4 text-emerald-500" /> :
                     pm.method === 'Bank Transfer' ? <Landmark className="size-4 text-blue-500" /> :
                     <CreditCard className="size-4 text-violet-500" />}
                    {pm.method}
                  </span>
                  <span className="font-bold">{formatUSD(pm.amount)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pm.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{pm.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue by Procedure */}
        <Card>
          <SectionHeader title="Revenue by Procedure" />
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-3">Procedure</th>
                  <th className="pb-3 pr-3 text-right">Treatments</th>
                  <th className="pb-3 pr-3 text-right">Revenue</th>
                  <th className="pb-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {data.procedures.map((proc) => (
                  <tr key={proc.name} className="border-b border-border last:border-0">
                    <td className="py-3 pr-3 font-semibold">{proc.name}</td>
                    <td className="py-3 pr-3 text-right text-muted-foreground">{proc.treatments}</td>
                    <td className="py-3 pr-3 text-right font-bold">{formatUSD(proc.revenue)}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${proc.share}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{proc.share}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Revenue by Dentist ─────────────────────────────────────────── */}
      <Card>
        <SectionHeader title="Revenue by Dentist" description="Financial contribution by provider" />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 pr-3">Dentist</th>
                <th className="pb-3 pr-3 text-right">Completed Procedures</th>
                <th className="pb-3 pr-3 text-right">Patients</th>
                <th className="pb-3 pr-3 text-right">Revenue</th>
                <th className="pb-3 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody>
              {data.dentists.map((dentist) => (
                <tr key={dentist.name} className="border-b border-border last:border-0">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {dentist.name.split(' ').pop()?.charAt(0) || 'D'}
                      </div>
                      <span className="font-semibold">{dentist.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-right text-muted-foreground">{dentist.procedures}</td>
                  <td className="py-3 pr-3 text-right text-muted-foreground">{dentist.patients}</td>
                  <td className="py-3 pr-3 text-right font-bold">{formatUSD(dentist.revenue)}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${dentist.share}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{dentist.share}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Outstanding Balances ───────────────────────────────────────── */}
      <Card>
        <SectionHeader title="Outstanding Balances" description="Invoices with partial or no payment" />
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex-1 text-xs font-semibold text-muted-foreground">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={outstandingSearch}
                onChange={(e) => setOutstandingSearch(e.target.value)}
                placeholder="Search patient, code, or invoice..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground"
              />
            </div>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            Status
            <select
              value={outstandingStatus}
              onChange={(e) => setOutstandingStatus(e.target.value)}
              className="mt-1.5 block h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            >
              <option>All</option>
              <option>Partially Paid</option>
              <option>Unpaid</option>
              <option>Overdue</option>
            </select>
          </label>
        </div>
        <div className="mt-4 overflow-x-auto">
          {filteredOutstanding.length > 0 ? (
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-3">Patient</th>
                  <th className="pb-3 pr-3">Patient Code</th>
                  <th className="pb-3 pr-3">Invoice</th>
                  <th className="pb-3 pr-3 text-right">Total</th>
                  <th className="pb-3 pr-3 text-right">Paid</th>
                  <th className="pb-3 pr-3 text-right">Outstanding</th>
                  <th className="pb-3 pr-3">Date</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutstanding.map((rec) => (
                  <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-3 pr-3 font-semibold">{rec.patient}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{rec.code}</td>
                    <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">{rec.invoice}</td>
                    <td className="py-3 pr-3 text-right font-bold">{formatUSD(rec.total)}</td>
                    <td className="py-3 pr-3 text-right text-muted-foreground">{formatUSD(rec.paid)}</td>
                    <td className="py-3 pr-3 text-right font-bold text-rose-600 dark:text-rose-400">{formatUSD(rec.outstanding)}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{rec.date}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(rec.status)}`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No outstanding balances match your search criteria.
            </div>
          )}
        </div>
      </Card>

      {/* ── Discount Summary + Recent Activity ─────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Discount Summary */}
        <Card>
          <SectionHeader title="Discount Summary" />
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Total Discounts</p>
              <p className="mt-1 text-xl font-black text-foreground">{formatUSD(data.discountBreakdown.total)}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Percentage</p>
              <p className="mt-1 text-xl font-black text-foreground">{formatUSD(data.discountBreakdown.percentage)}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Fixed</p>
              <p className="mt-1 text-xl font-black text-foreground">{formatUSD(data.discountBreakdown.fixed)}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Approved</p>
              <p className="mt-1 text-xl font-black text-foreground">{data.discountBreakdown.approved} discounts</p>
            </div>
          </div>
          {data.discountBreakdown.reasons.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Top Reasons</p>
              <div className="space-y-2">
                {data.discountBreakdown.reasons.map((r) => (
                  <div key={r.reason} className="flex items-center justify-between rounded-lg border border-border bg-background/20 px-3 py-2 text-sm">
                    <span className="font-medium">{r.reason}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{r.count}x</span>
                      <span className="font-bold">{formatUSD(r.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Recent Financial Activity */}
        <Card>
          <SectionHeader title="Recent Financial Activity" description="Latest transactions and events" />
          <div className="mt-5 space-y-3">
            {data.activity.map((act) => (
              <div key={act.id} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3">
                <div className={`mt-0.5 rounded-lg p-1.5 ${statusBadgeClass(act.type)}`}>
                  {act.type === 'payment' ? <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-300" /> :
                   act.type === 'discount' ? <Percent className="size-4 text-rose-600 dark:text-rose-300" /> :
                   <FileText className="size-4 text-blue-600 dark:text-blue-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{act.description}</p>
                    <span className={`text-sm font-bold ${
                      act.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {act.amount > 0 ? '+' : ''}{formatUSD(act.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {act.invoiceRef}
                    {act.patient && ` · ${act.patient}`}
                    {act.method && ` · ${act.method}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}