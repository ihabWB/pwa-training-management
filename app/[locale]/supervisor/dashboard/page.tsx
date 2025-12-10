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
import AnnouncementsWidget from '@/components/announcements/announcements-widget';

export default async function SupervisorDashboardPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
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

  // Get assigned trainees - using separate queries to avoid join issues
  const { data: assignments } = await supabase
    .from('supervisor_trainee')
    .select('trainee_id')
    .eq('supervisor_id', supervisor.id);

  const traineeIds = (assignments || []).map((a: any) => a.trainee_id);

  let trainees: any[] = [];

  if (traineeIds.length > 0) {
    const { data: traineesData } = await supabase
      .from('trainees')
      .select('id, user_id, institution_id, status')
      .in('id', traineeIds);

    // Get user details
    const userIds = (traineesData || []).map((t: any) => t.user_id);
    const { data: usersData } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds);

    // Get institution details
    const institutionIds = (traineesData || []).map((t: any) => t.institution_id);
    const { data: institutionsData } = await supabase
      .from('institutions')
      .select('id, name, name_ar')
      .in('id', institutionIds);

    // Combine all data
    trainees = (traineesData || []).map((trainee: any) => {
      const user = usersData?.find((u: any) => u.id === trainee.user_id);
      const institution = institutionsData?.find((i: any) => i.id === trainee.institution_id);

      return {
        ...trainee,
        user,
        institution,
      };
    }).filter((t: any) => t.user && t.institution);
  }

  // Get trainee IDs for reports/tasks queries
  const finalTraineeIds = trainees.map((t: any) => t.id);

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
    .in('trainee_id', finalTraineeIds.length > 0 ? finalTraineeIds : ['none'])
    .eq('status', 'pending');
  const pendingReports = pendingReportsData.data?.length || 0;

  const pendingTasksData = await supabase
    .from('tasks')
    .select('*')
    .in('assigned_to', finalTraineeIds.length > 0 ? finalTraineeIds : ['none'])
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

  // Fetch announcements for supervisor's trainees
  const { data: announcementsData } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  const announcements = announcementsData || [];

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

        {/* Announcements Widget */}
        {announcements.length > 0 && (
          <AnnouncementsWidget
            announcements={announcements}
            locale={locale}
          />
        )}

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
