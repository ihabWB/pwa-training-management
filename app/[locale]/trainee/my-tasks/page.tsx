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

  // Fetch tasks assigned to this trainee
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', traineeData.id)
    .order('due_date', { ascending: true });

  console.log('🔍 Trainee ID:', traineeData.id);
  console.log('🔍 Tasks found:', tasks?.length || 0);
  console.log('🔍 Tasks error:', tasksError);
  console.log('🔍 Tasks data:', tasks);

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

        {/* Debug Info - معلومات التشخيص */}
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-green-900 mb-4 text-xl">🔍 معلومات التشخيص (Debug Info)</h3>
          <div className="bg-white rounded p-4 text-sm font-mono space-y-2 text-right">
            <div className="border-b pb-2 bg-blue-100 p-2 rounded">
              <strong className="text-lg">معرف المتدرب (Trainee ID):</strong> 
              <div className="text-xs mt-1 font-mono text-gray-600">{traineeData.id}</div>
            </div>
            <div className="border-b pb-2">
              <strong>عدد المهام المعروضة:</strong> {tasks?.length || 0}
            </div>
            {tasks && tasks.length > 0 ? (
              <>
                <div className="border-b pb-2 bg-yellow-50 p-2 rounded">
                  <strong>المهمة الأولى - العنوان:</strong> {tasks[0].title}
                </div>
                <div className="border-b pb-2 bg-yellow-50 p-2 rounded">
                  <strong>الوصف:</strong> {tasks[0].description}
                </div>
                <div className="border-b pb-2">
                  <strong>الحالة:</strong> {tasks[0].status}
                </div>
                <div className="border-b pb-2">
                  <strong>الأولوية:</strong> {tasks[0].priority}
                </div>
                <div className="border-b pb-2">
                  <strong>تاريخ الاستحقاق:</strong> {tasks[0].due_date}
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-green-900 font-bold bg-green-100 p-2 rounded hover:bg-green-200">
                    📋 عرض البيانات الكاملة
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96 text-left border" dir="ltr">
                    {JSON.stringify(tasks[0], null, 2)}
                  </pre>
                </details>
              </>
            ) : (
              <div className="text-center py-4 text-red-600 font-bold text-lg">
                ⚠️ لا توجد مهام مخصصة لك!
                <div className="mt-2 text-sm text-gray-600">
                  تواصل مع مشرفك لإضافة مهام
                </div>
              </div>
            )}
          </div>
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
