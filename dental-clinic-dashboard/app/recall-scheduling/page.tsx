import { DashboardLayout } from '@/components/dashboard-layout';
import { RecallSchedulingWorkspace } from '@/components/recall-scheduling/recall-scheduling-workspace';

export default function RecallSchedulingPage() {
  return (
    <DashboardLayout>
      <RecallSchedulingWorkspace />
    </DashboardLayout>
  );
}