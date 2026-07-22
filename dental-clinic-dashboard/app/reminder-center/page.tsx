import { DashboardLayout } from '@/components/dashboard-layout';
import { ReminderCenterWorkspace } from '@/components/reminder-center/reminder-center-workspace';

export default function ReminderCenterPage() {
  return (
    <DashboardLayout>
      <ReminderCenterWorkspace />
    </DashboardLayout>
  );
}
