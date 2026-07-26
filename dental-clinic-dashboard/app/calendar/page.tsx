import { Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { CalendarWorkspace } from '@/components/calendar/calendar-workspace';

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="mx-[100px] rounded-2xl border border-border bg-card/80 p-6 text-sm text-muted-foreground shadow-sm">Loading calendar...</div>}>
        <CalendarWorkspace />
      </Suspense>
    </DashboardLayout>
  );
}