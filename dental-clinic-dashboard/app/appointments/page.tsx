import { DashboardLayout } from '@/components/dashboard-layout';
import { AppointmentsModule } from '@/components/appointments/appointments-module';

export default function AppointmentsPage() {
  return (
    <DashboardLayout>
      <AppointmentsModule />
    </DashboardLayout>
  );
}

