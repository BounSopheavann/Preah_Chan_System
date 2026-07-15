import { DashboardLayout } from '@/components/dashboard-layout';
import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  UserCheck,
  UserPlus,
  XCircle,
  BellRing,
} from 'lucide-react';

const activityLog = [
  {
    id: 1,
    title: 'Patient Checked In',
    description: 'Ariana Lopez arrived for her 2:00 PM hygiene visit.',
    timestamp: '2 min ago',
    icon: UserCheck,
  },
  {
    id: 2,
    title: 'Appointment Completed',
    description: 'Routine cleaning marked complete for Daniel Kim.',
    timestamp: '12 min ago',
    icon: CheckCircle2,
  },
  {
    id: 3,
    title: 'Invoice Generated',
    description: 'Invoice #2048 created for a crown preparation visit.',
    timestamp: '18 min ago',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Payment Received',
    description: 'Payment processed successfully at the front desk.',
    timestamp: '27 min ago',
    icon: CreditCard,
  },
  {
    id: 5,
    title: 'Follow-up Scheduled',
    description: 'Post-op review booked for next Tuesday morning.',
    timestamp: '41 min ago',
    icon: CalendarClock,
  },
  {
    id: 6,
    title: 'Recall Reminder Sent',
    description: 'Automated recall reminder sent to overdue patients.',
    timestamp: '55 min ago',
    icon: BellRing,
  },
  {
    id: 7,
    title: 'New Patient Registered',
    description: 'Intake completed for Sofia Martin at reception.',
    timestamp: '1 hr ago',
    icon: UserPlus,
  },
  {
    id: 8,
    title: 'Appointment Cancelled',
    description: 'Tomorrow afternoon appointment was cancelled.',
    timestamp: '1 hr ago',
    icon: XCircle,
  },
];

export default function ActivityLogPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
          <p className="text-muted-foreground">
            Review the latest clinic events and front desk updates.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-xl md:p-6 theme-surface-shadow">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">Recent Events</h2>
            <p className="text-sm text-muted-foreground">
              Full activity history placeholder using the same mock data set.
            </p>
          </div>

          <ul className="mt-5 space-y-2.5">
            {activityLog.map((activity) => {
              const Icon = activity.icon;

              return (
                <li
                  key={activity.id}
                  className="grid grid-cols-[auto,minmax(0,1fr),auto] items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 dark:bg-background/20"
                >
                  <div className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-muted/80 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {activity.title}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>

                  <time className="whitespace-nowrap pt-0.5 text-[11px] font-medium text-muted-foreground">
                    {activity.timestamp}
                  </time>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
