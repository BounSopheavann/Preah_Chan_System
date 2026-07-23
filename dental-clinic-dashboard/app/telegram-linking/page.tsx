import { DashboardLayout } from '@/components/dashboard-layout';
import { TelegramLinkingWorkspace } from '@/components/telegram-linking/telegram-linking-workspace';

export default function TelegramLinkingPage() {
  return (
    <DashboardLayout>
      <TelegramLinkingWorkspace />
    </DashboardLayout>
  );
}