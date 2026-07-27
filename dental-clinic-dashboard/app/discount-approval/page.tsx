import { DashboardLayout } from '@/components/dashboard-layout';
import { DiscountApprovalWorkspace } from '@/components/billing/discount-approval-workspace';

export default function DiscountApprovalPage() {
  return (
    <DashboardLayout>
      <DiscountApprovalWorkspace />
    </DashboardLayout>
  );
}