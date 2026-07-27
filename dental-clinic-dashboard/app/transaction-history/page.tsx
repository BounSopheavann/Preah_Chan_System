import { DashboardLayout } from '@/components/dashboard-layout';
import { TransactionHistoryWorkspace } from '@/components/billing/transaction-history-workspace';

export default function TransactionHistoryPage() {
  return <DashboardLayout><TransactionHistoryWorkspace /></DashboardLayout>;
}