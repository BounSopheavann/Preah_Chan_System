import { DashboardLayout } from '@/components/dashboard-layout';
import { QueueDetailWorkspace } from '@/components/queue-detail/queue-detail-workspace';

export default function QueueDetailPage() {
  return (
    <DashboardLayout>
      <QueueDetailWorkspace />
    </DashboardLayout>
  );
}