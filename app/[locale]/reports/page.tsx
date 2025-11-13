import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

// Lazy load the table component
const ReportsTable = dynamic(() => import('@/components/reports/reports-table'), {
  loading: () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  ),
});

// إعادة التحقق من البيانات كل 30 ثانية (التقارير تتغير بسرعة)
export const revalidate = 30;

export default async function ReportsPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${params.locale}/login`);
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    redirect(`/${params.locale}/login`);
  }

  // Fetch reports based on user role
  let reportsQuery = supabase
    .from('reports')
    .select(
      `
      *,
      trainees!inner (
        user_id,
        users!inner (
          full_name
        ),
        institutions!inner (
          name,
          name_ar
        )
      )
    `
    )
    .order('submitted_at', { ascending: false });

  // If supervisor, only show reports from their trainees
  if (userProfile.role === 'supervisor') {
    const { data: supervisorData } = await supabase
      .from('supervisors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (supervisorData) {
      const { data: assignedTrainees } = await supabase
        .from('supervisor_trainee')
        .select('trainee_id')
        .eq('supervisor_id', supervisorData.id);

      const traineeIds = (assignedTrainees || []).map((t) => t.trainee_id);

      if (traineeIds.length > 0) {
        reportsQuery = reportsQuery.in('trainee_id', traineeIds);
      } else {
        reportsQuery = reportsQuery.eq('trainee_id', 'none'); // No trainees assigned
      }
    }
  }

  // If trainee, only show their own reports
  if (userProfile.role === 'trainee') {
    const { data: traineeData } = await supabase
      .from('trainees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (traineeData) {
      reportsQuery = reportsQuery.eq('trainee_id', traineeData.id);
    } else {
      reportsQuery = reportsQuery.eq('trainee_id', 'none');
    }
  }

  const { data: reportsData, error: reportsError } = await reportsQuery;

  if (reportsError) {
    console.error('Error fetching reports:', reportsError);
  }

  // Transform reports data
  const reports = (reportsData || []).map((report: any) => ({
    id: report.id,
    trainee_id: report.trainee_id,
    trainee_name: report.trainees.users.full_name,
    institution_name:
      params.locale === 'ar'
        ? report.trainees.institutions.name_ar
        : report.trainees.institutions.name,
    report_type: report.report_type,
    title: report.title,
    content: report.content,
    work_done: report.work_done,
    challenges: report.challenges,
    next_steps: report.next_steps,
    attachment_url: report.attachment_url,
    period_start: report.period_start,
    period_end: report.period_end,
    status: report.status,
    submitted_at: report.submitted_at,
    reviewed_by: report.reviewed_by,
    reviewed_at: report.reviewed_at,
    feedback: report.feedback,
  }));

  // Calculate stats
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    approved: reports.filter((r) => r.status === 'approved').length,
    rejected: reports.filter((r) => r.status === 'rejected').length,
  };

  return (
    <DashboardLayout
      locale={params.locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {params.locale === 'ar' ? 'إدارة التقارير' : 'Manage Reports'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? 'عرض ومراجعة التقارير اليومية والأسبوعية والشهرية'
              : 'View and review daily, weekly, and monthly reports'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'إجمالي التقارير' : 'Total Reports'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <FileText className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'قيد الانتظار' : 'Pending'}
                </p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <Clock className="text-yellow-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'مقبولة' : 'Approved'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'مرفوضة' : 'Rejected'}
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="text-red-400" size={32} />
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <ReportsTable
          reports={reports}
          locale={params.locale}
          userRole={userProfile.role}
        />
      </div>
    </DashboardLayout>
  );
}
