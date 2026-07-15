'use client';

import Link from 'next/link';
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

import { cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    title: 'Patient Checked In',
    description: 'Ariana Lopez arrived for her 2:00 PM hygiene visit.',
    timestamp: '2 min ago',
    icon: UserCheck,
    tone: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
  },
  {
    id: 2,
    title: 'Appointment Completed',
    description: 'Routine cleaning marked complete for Daniel Kim.',
    timestamp: '12 min ago',
    icon: CheckCircle2,
    tone: 'text-sky-600 bg-sky-500/10 border-sky-500/20 dark:text-sky-400',
  },
  {
    id: 3,
    title: 'Invoice Generated',
    description: 'Invoice #2048 created for a crown preparation visit.',
    timestamp: '18 min ago',
    icon: FileText,
    tone: 'text-violet-600 bg-violet-500/10 border-violet-500/20 dark:text-violet-400',
  },
  {
    id: 4,
    title: 'Payment Received',
    description: 'Payment processed successfully at the front desk.',
    timestamp: '27 min ago',
    icon: CreditCard,
    tone: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
  },
  {
    id: 5,
    title: 'Follow-up Scheduled',
    description: 'Post-op review booked for next Tuesday morning.',
    timestamp: '41 min ago',
    icon: CalendarClock,
    tone: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20 dark:text-cyan-400',
  },
  {
    id: 6,
    title: 'Recall Reminder Sent',
    description: 'Automated recall reminder sent to overdue patients.',
    timestamp: '55 min ago',
    icon: BellRing,
    tone: 'text-fuchsia-600 bg-fuchsia-500/10 border-fuchsia-500/20 dark:text-fuchsia-400',
  },
  {
    id: 7,
    title: 'New Patient Registered',
    description: 'Intake completed for Sofia Martin at reception.',
    timestamp: '1 hr ago',
    icon: UserPlus,
    tone: 'text-teal-600 bg-teal-500/10 border-teal-500/20 dark:text-teal-400',
  },
  {
    id: 8,
    title: 'Appointment Cancelled',
    description: 'Tomorrow afternoon appointment was cancelled.',
    timestamp: '1 hr ago',
    icon: XCircle,
    tone: 'text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400',
  },
] as const;

export function ActivityTimeline() {
  return (
    <section
      className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-xl md:p-5 theme-surface-shadow"
      style={{ backdropFilter: 'blur(10px)' }}
      aria-labelledby="recent-activity-title"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="recent-activity-title" className="text-lg font-bold text-foreground">
            Recent Activity
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest updates from the front desk and clinical team
          </p>
        </div>
        <span className="rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {activities.length} events
        </span>
      </div>

      <ul className="space-y-2.5">
        {activities.slice(0, 8).map((activity) => {
          const Icon = activity.icon;

          return (
            <li
              key={activity.id}
              className="grid grid-cols-[auto,minmax(0,1fr),auto] items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-colors hover:bg-background/70 dark:bg-background/20 dark:hover:bg-background/30"
            >
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border',
                  activity.tone,
                )}
              >
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

      <div className="mt-4 flex justify-end">
        <Link
          href="/activity-log"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-background/60 px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 dark:bg-background/30 dark:hover:bg-muted/40"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
