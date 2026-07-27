import { DashboardLayout } from '@/components/dashboard-layout';
import { AppointmentDetailWorkspace } from '@/components/appointment-detail/appointment-detail-workspace';

export default function AppointmentDetailPage() {
  return (
    <DashboardLayout>
      <AppointmentDetailWorkspace />
    </DashboardLayout>
  );
}