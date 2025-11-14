import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import TraineeReportsTable from '@/components/trainee/trainee-reports-table';
import { Plus } from 'lucide-react';

export const revalidate = 30;

export default async function MyReportsPage({
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
    return (
      <DashboardLayout
        locale={locale}
        userRole={userProfile.role}
        userName={userProfile.full_name}
      >
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'ar' ? 'لم يتم العثور على بيانات المتدرب' : 'Trainee profile not found'}
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  // Fetch reports
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('trainee_id', traineeData.id)
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout
      locale={locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'ar' ? 'تقاريري' : 'My Reports'}
            </h1>
            <p className="text-gray-600 mt-1">
              {locale === 'ar'
                ? 'عرض وإدارة تقاريرك'
                : 'View and manage your reports'}
            </p>
          </div>
          
          {/* Add Report Button */}
          <Link
            href={`/${locale}/trainee/my-reports/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            {locale === 'ar' ? 'إضافة تقرير جديد' : 'Add New Report'}
          </Link>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <TraineeReportsTable reports={reports || []} locale={locale} />
        </div>
      </div>
    </DashboardLayout>
  );
}
