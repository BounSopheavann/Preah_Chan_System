import { DashboardLayout } from '@/components/dashboard-layout';

export default function ReminderCenterPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reminder Center</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Manage and send patient reminders. This workspace will be built in a future update.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/20">
            <svg
              className="size-8 text-amber-600 dark:text-amber-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Coming Soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Recall created successfully! The full Reminder Center will allow you to manage all
            pending recalls and send reminders via the selected method.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}