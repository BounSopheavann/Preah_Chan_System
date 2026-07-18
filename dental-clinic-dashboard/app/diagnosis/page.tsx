import { DashboardLayout } from '@/components/dashboard-layout';

export default function DiagnosisPlaceholderPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card/90 p-8 text-center backdrop-blur-sm theme-surface-shadow">
          <h1 className="text-3xl font-bold text-foreground">Diagnosis</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This is a placeholder page for the future Diagnosis module. Phase 1 only includes the Clinical Examination workspace.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
