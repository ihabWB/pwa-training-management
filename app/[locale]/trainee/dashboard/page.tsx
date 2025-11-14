import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import StatCard from '@/components/dashboard/stat-card';
import { FileText, ListTodo, TrendingUp, Calendar, Award, Clock } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import TraineeReportsTable from '@/components/trainee/trainee-reports-table';
import TraineeTasksTable from '@/components/trainee/trainee-tasks-table';
import TraineeEvaluationsTable from '@/components/trainee/trainee-evaluations-table';
import TraineeProfileCard from '@/components/trainee/trainee-profile-card';

export default async function TraineeDashboardPage({
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
  const { data: traineeData, error: traineeError } = await supabase
    .from('trainees')
    .select(`
      *,
      institutions (
        name,
        name_ar,
        address
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (traineeError) {
    console.error('Trainee fetch error:', traineeError);
  }

  if (!traineeData) {
    // Trainee record not found - redirect to complete profile or show error
    return (
      <DashboardLayout
        locale={locale}
        userRole={userProfile.role}
        userName={userProfile.full_name}
      >
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'ar' ? 'لم يتم العثور على بيانات المتدرب' : 'Trainee profile not found'}
            </h2>
            <p className="text-gray-600 mb-4">
              {locale === 'ar' 
                ? 'يرجى التواصل مع المدير لإكمال ملفك الشخصي' 
                : 'Please contact the administrator to complete your profile'}
            </p>
            <p className="text-sm text-gray-500">
              User ID: {user.id}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Combine trainee data with user profile
  const trainee = {
    ...traineeData,
    users: userProfile,
  };

  // Fetch trainee statistics
  const [
    { data: reportsData },
    { data: tasksData },
    { data: evaluationsData },
  ] = await Promise.all([
    supabase
      .from('reports')
      .select('*')
      .eq('trainee_id', trainee.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select('*')
      .eq('trainee_id', trainee.id)
      .order('due_date', { ascending: true }),
    supabase
      .from('evaluations')
      .select('*')
      .eq('trainee_id', trainee.id)
      .order('created_at', { ascending: false }),
  ]);

  const reports = reportsData || [];
  const tasks = tasksData || [];
  const evaluations = evaluationsData || [];

  // Calculate statistics
  const pendingReports = reports.filter((r) => r.status === 'pending').length;
  const approvedReports = reports.filter((r) => r.status === 'approved').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const averageScore =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
      : 0;

  // Calculate training progress
  const startDate = new Date(trainee.start_date);
  const endDate = new Date(trainee.expected_end_date);
  const today = new Date();
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysCompleted = Math.ceil(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPercentage = Math.min(
    Math.max((daysCompleted / totalDays) * 100, 0),
    100
  );

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
            {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'مرحباً بك في لوحة التحكم الخاصة بك'
              : 'Welcome to your dashboard'}
          </p>
        </div>

        {/* Profile Card */}
        <TraineeProfileCard
          trainee={trainee}
          locale={locale}
          progressPercentage={progressPercentage}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title={locale === 'ar' ? 'التقارير المعلقة' : 'Pending Reports'}
            value={pendingReports}
            icon={FileText}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          <StatCard
            title={locale === 'ar' ? 'المهام المعلقة' : 'Pending Tasks'}
            value={pendingTasks}
            icon={ListTodo}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title={locale === 'ar' ? 'متوسط التقييم' : 'Average Score'}
            value={averageScore.toFixed(1)}
            icon={Award}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title={locale === 'ar' ? 'نسبة الإنجاز' : 'Progress'}
            value={`${progressPercentage.toFixed(0)}%`}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title={locale === 'ar' ? 'إجمالي التقارير' : 'Total Reports'}
            value={reports.length}
            icon={FileText}
            iconColor="text-gray-600"
            iconBgColor="bg-gray-100"
          />
          <StatCard
            title={locale === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}
            value={tasks.length}
            icon={Clock}
            iconColor="text-gray-600"
            iconBgColor="bg-gray-100"
          />
        </div>

        {/* Reports Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'ar' ? 'تقاريري' : 'My Reports'}
          </h2>
          <TraineeReportsTable reports={reports} locale={locale} />
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'ar' ? 'مهامي' : 'My Tasks'}
          </h2>
          <TraineeTasksTable tasks={tasks} locale={locale} traineeId={trainee.id} />
        </div>

        {/* Evaluations Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'ar' ? 'تقييماتي' : 'My Evaluations'}
          </h2>
          <TraineeEvaluationsTable evaluations={evaluations} locale={locale} />
        </div>
      </div>
    </DashboardLayout>
  );
}
