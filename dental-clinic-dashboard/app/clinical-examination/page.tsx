import { DashboardLayout } from '@/components/dashboard-layout';
import { ClinicalExaminationPage } from '@/components/clinical-examination/clinical-examination-page';

export default function ClinicalExaminationRoutePage() {
  return (
    <DashboardLayout>
      <ClinicalExaminationPage />
    </DashboardLayout>
  );
}
