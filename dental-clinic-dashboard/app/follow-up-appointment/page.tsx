import { DashboardLayout } from '@/components/dashboard-layout';
import { FollowUpAppointmentWorkspace } from '@/components/follow-up-appointment/follow-up-appointment-workspace';

export default function FollowUpAppointmentPage() {
  return (
    <DashboardLayout>
      <FollowUpAppointmentWorkspace />
    </DashboardLayout>
  );
}
