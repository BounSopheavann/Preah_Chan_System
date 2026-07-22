import { Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AppointmentsModule } from '@/components/appointments/appointments-module';

export default function AppointmentsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="mx-[100px] rounded-2xl border border-border bg-card/80 p-6 text-sm text-muted-foreground shadow-sm">Loading appointments...</div>}>
        <AppointmentsModule />
      </Suspense>
    </DashboardLayout>
  );
}
