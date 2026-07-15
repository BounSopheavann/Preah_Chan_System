'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StatisticsGrid } from '@/components/statistics-grid';
import { TodaysSchedule } from '@/components/todays-schedule';
import { WaitingQueue } from '@/components/waiting-queue';
import { QuickActions } from '@/components/quick-actions';
import { RecallsList } from '@/components/recalls-list';
import { ActivityTimeline } from '@/components/activity-timeline';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your dental clinic management system</p>
        </div>

        <StatisticsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TodaysSchedule />
            <WaitingQueue />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <RecallsList />
          </div>
        </div>

        <ActivityTimeline />
      </div>
    </DashboardLayout>
  );
}
