import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import NewReportForm from '@/components/trainee/new-report-form';

export default async function NewReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile || userProfile.role !== 'trainee') {
    redirect(`/${locale}/dashboard`);
  }

  // Get trainee details
  const { data: traineeData } = await supabase
    .from('trainees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!traineeData) {
    redirect(`/${locale}/trainee/dashboard`);
  }

  return (
    <DashboardLayout
      locale={locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'ar' ? 'إضافة تقرير جديد' : 'Add New Report'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'قم بإنشاء تقرير يومي، أسبوعي أو شهري عن عملك'
              : 'Create a daily, weekly or monthly report about your work'}
          </p>
        </div>

        {/* Report Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <NewReportForm traineeId={traineeData.id} locale={locale} />
        </div>
      </div>
    </DashboardLayout>
  );
}
