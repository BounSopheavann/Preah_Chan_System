import { DashboardLayout } from '@/components/dashboard-layout';
import { PatientsModule } from '@/components/patients/patients-module';

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <PatientsModule />
    </DashboardLayout>
  );
}
