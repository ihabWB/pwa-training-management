import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import TraineeTasksTable from '@/components/trainee/trainee-tasks-table';

export const revalidate = 30;

export default async function MyTasksPage({
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

  // Fetch tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('trainee_id', traineeData.id)
    .order('due_date', { ascending: true });

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
            {locale === 'ar' ? 'مهامي' : 'My Tasks'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'عرض وإدارة مهامك'
              : 'View and manage your tasks'}
          </p>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <TraineeTasksTable 
            tasks={tasks || []} 
            locale={locale} 
            traineeId={traineeData.id}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
