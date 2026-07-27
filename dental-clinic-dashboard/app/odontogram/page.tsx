import { DashboardLayout } from '@/components/dashboard-layout';
import { OdontogramWorkspace } from '@/components/odontogram/odontogram-workspace';

export default function OdontogramPage() {
  return (
    <DashboardLayout>
      <OdontogramWorkspace />
    </DashboardLayout>
  );
}