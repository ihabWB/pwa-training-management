import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import DashboardLayout from '@/components/layout/dashboard-layout';
import StatCard from '@/components/dashboard/stat-card';
import {
  Users,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Award,
  TrendingUp,
} from 'lucide-react';
import SupervisorTraineesList from '@/components/supervisor/supervisor-trainees-list';
import SupervisorPendingReports from '@/components/supervisor/supervisor-pending-reports';
import SupervisorRecentEvaluations from '@/components/supervisor/supervisor-recent-evaluations';

export default async function SupervisorDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!user || user.role !== 'supervisor') {
    redirect(`/${locale}/dashboard`);
  }

  // Get supervisor data
  const { data: supervisor } = await supabase
    .from('supervisors')
    .select(
      `
      *,
      institution:institutions(name, name_ar)
    `
    )
    .eq('user_id', user.id)
    .single();

  if (!supervisor) {
    redirect(`/${locale}/dashboard`);
  }

  // Get assigned trainees
  const { data: assignedTrainees } = await supabase
    .from('supervisor_trainee')
    .select(
      `
      trainee:trainees(
        id,
        user_id,
        institution_id,
        status,
        user:users(full_name, email),
        institution:institutions(name, name_ar)
      )
    `
    )
    .eq('supervisor_id', supervisor.id);

  // Filter out trainees with missing data
  const trainees = assignedTrainees
    ?.filter((at: any) => at.trainee && at.trainee.user && at.trainee.institution)
    .map((at: any) => at.trainee) || [];
  const traineeIds = trainees.map((t: any) => t.id);

  // Get statistics
  const totalTraineesData = await supabase
    .from('supervisor_trainee')
    .select('*')
    .eq('supervisor_id', supervisor.id);
  const totalTrainees = totalTraineesData.data?.length || 0;

  const activeTraineesData = await supabase
    .from('supervisor_trainee')
    .select('trainee:trainees!inner(*)')
    .eq('supervisor_id', supervisor.id)
    .eq('trainee.status', 'active');
  const activeTrainees = activeTraineesData.data?.length || 0;

  const pendingReportsData = await supabase
    .from('reports')
    .select('*')
    .in('trainee_id', traineeIds)
    .eq('status', 'pending');
  const pendingReports = pendingReportsData.data?.length || 0;

  const pendingTasksData = await supabase
    .from('tasks')
    .select('*')
    .in('assigned_to', traineeIds)
    .in('status', ['pending', 'in_progress']);
  const pendingTasks = pendingTasksData.data?.length || 0;

  const { data: evaluationsData } = await supabase
    .from('evaluations')
    .select('overall_score')
    .eq('supervisor_id', supervisor.id);

  const avgScore =
    evaluationsData && evaluationsData.length > 0
      ? Math.round(
          evaluationsData.reduce((sum: number, e: any) => sum + e.overall_score, 0) /
            evaluationsData.length
        )
      : 0;

  const thisMonthEvaluationsData = await supabase
    .from('evaluations')
    .select('*')
    .eq('supervisor_id', supervisor.id)
    .gte('evaluation_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
  const thisMonthEvaluations = thisMonthEvaluationsData.data?.length || 0;

  const t = {
    ar: {
      supervisorDashboard: 'لوحة تحكم المشرف',
      welcome: 'مرحباً',
      myTrainees: 'متدربيني',
      activeTrainees: 'المتدربون النشطون',
      pendingReports: 'التقارير المعلقة',
      pendingTasks: 'المهام المعلقة',
      avgEvaluationScore: 'متوسط التقييمات',
      thisMonthEvaluations: 'تقييمات هذا الشهر',
      overview: 'نظرة عامة',
      reportsAwaitingReview: 'التقارير في انتظار المراجعة',
      recentEvaluations: 'التقييمات الأخيرة',
    },
    en: {
      supervisorDashboard: 'Supervisor Dashboard',
      welcome: 'Welcome',
      myTrainees: 'My Trainees',
      activeTrainees: 'Active Trainees',
      pendingReports: 'Pending Reports',
      pendingTasks: 'Pending Tasks',
      avgEvaluationScore: 'Avg. Evaluation Score',
      thisMonthEvaluations: 'This Month Evaluations',
      overview: 'Overview',
      reportsAwaitingReview: 'Reports Awaiting Review',
      recentEvaluations: 'Recent Evaluations',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  return (
    <DashboardLayout locale={locale} userRole="supervisor" userName={user.full_name}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {text.welcome}, {user.full_name}
          </h1>
          <p className="text-blue-100">
            {locale === 'ar' ? supervisor.institution.name_ar : supervisor.institution.name}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title={text.myTrainees}
            value={totalTrainees || 0}
            icon={Users}
          />
          <StatCard
            title={text.activeTrainees}
            value={activeTrainees || 0}
            icon={CheckCircle}
          />
          <StatCard
            title={text.pendingReports}
            value={pendingReports || 0}
            icon={ClipboardList}
          />
          <StatCard
            title={text.pendingTasks}
            value={pendingTasks || 0}
            icon={AlertCircle}
          />
          <StatCard
            title={text.avgEvaluationScore}
            value={`${avgScore}%`}
            icon={Award}
          />
          <StatCard
            title={text.thisMonthEvaluations}
            value={thisMonthEvaluations || 0}
            icon={TrendingUp}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Trainees */}
          <SupervisorTraineesList
            trainees={trainees}
            supervisorId={supervisor.id}
            locale={locale}
          />

          {/* Pending Reports */}
          <SupervisorPendingReports
            traineeIds={traineeIds}
            locale={locale}
          />
        </div>

        {/* Recent Evaluations */}
        <SupervisorRecentEvaluations
          supervisorId={supervisor.id}
          locale={locale}
        />
      </div>
    </DashboardLayout>
  );
}
