import { DashboardLayout } from '@/components/dashboard-layout';
import { TelegramPatientPortalWorkspace } from '@/components/telegram-patient-portal/telegram-patient-portal-workspace';

export default function TelegramPatientPortalPage() {
  return <DashboardLayout><TelegramPatientPortalWorkspace /></DashboardLayout>;
}