import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import AddEvaluationDialog from '@/components/evaluations/add-evaluation-dialog';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Award, User, Calendar, TrendingUp } from 'lucide-react';
import SupervisorTraineesTable from '@/components/supervisors/supervisor-trainees-table';

export default async function SupervisorTraineesPage({
  params,
}: {
  params: { locale: string; supervisorId: string };
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

  if (!userProfile || userProfile.role !== 'admin') {
    redirect(`/${params.locale}/dashboard`);
  }

  // Get supervisor details
  const { data: supervisorData } = await supabase
    .from('supervisors')
    .select(
      `
      *,
      users!inner (
        full_name,
        email
      ),
      institutions!inner (
        name,
        name_ar
      )
    `
    )
    .eq('id', params.supervisorId)
    .single();

  if (!supervisorData) {
    redirect(`/${params.locale}/supervisors`);
  }

  // Get assigned trainees
  const { data: assignedTraineesData } = await supabase
    .from('supervisor_trainee')
    .select(
      `
      trainee_id,
      trainees!inner (
        id,
        user_id,
        users!inner (
          full_name,
          email
        ),
        institutions!inner (
          name,
          name_ar
        ),
        university,
        major
      )
    `
    )
    .eq('supervisor_id', params.supervisorId);

  const trainees = (assignedTraineesData || []).map((st: any) => ({
    id: st.trainees.id,
    user_id: st.trainees.user_id,
    full_name: st.trainees.users.full_name,
    email: st.trainees.users.email,
    institution_name:
      params.locale === 'ar'
        ? st.trainees.institutions.name_ar
        : st.trainees.institutions.name,
    university: st.trainees.university,
    major: st.trainees.major,
  }));

  // Get evaluations count for each trainee
  const { data: evaluationsData } = await supabase
    .from('evaluations')
    .select('trainee_id, overall_score')
    .eq('supervisor_id', params.supervisorId);

  const evaluationStats = trainees.map((trainee) => {
    const traineeEvals = (evaluationsData || []).filter(
      (e: any) => e.trainee_id === trainee.id
    );
    return {
      ...trainee,
      evaluations_count: traineeEvals.length,
      avg_score:
        traineeEvals.length > 0
          ? Math.round(
              traineeEvals.reduce((sum: number, e: any) => sum + e.overall_score, 0) /
                traineeEvals.length
            )
          : 0,
    };
  });

  return (
    <DashboardLayout
      locale={params.locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <a
              href={`/${params.locale}/supervisors`}
              className="hover:text-blue-600"
            >
              {params.locale === 'ar' ? 'المشرفون' : 'Supervisors'}
            </a>
            <span>/</span>
            <span>{supervisorData.users.full_name}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {params.locale === 'ar' ? 'متدربو المشرف' : "Supervisor's Trainees"}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? 'عرض وتقييم المتدربين المعينين'
              : 'View and evaluate assigned trainees'}
          </p>
        </div>

        {/* Supervisor Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {params.locale === 'ar' ? 'المشرف' : 'Supervisor'}
              </label>
              <div className="flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {supervisorData.users.full_name}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {params.locale === 'ar' ? 'المؤسسة' : 'Institution'}
              </label>
              <div className="text-base text-gray-900">
                {params.locale === 'ar'
                  ? supervisorData.institutions.name_ar
                  : supervisorData.institutions.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {params.locale === 'ar' ? 'عدد المتدربين' : 'Trainees Count'}
              </label>
              <div className="text-2xl font-bold text-blue-600">
                {trainees.length}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'إجمالي التقييمات' : 'Total Evaluations'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {evaluationStats.reduce((sum, t) => sum + t.evaluations_count, 0)}
                </p>
              </div>
              <Award className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'متوسط الدرجات' : 'Average Score'}
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {evaluationStats.length > 0 &&
                  evaluationStats.some((t) => t.avg_score > 0)
                    ? Math.round(
                        evaluationStats
                          .filter((t) => t.avg_score > 0)
                          .reduce((sum, t) => sum + t.avg_score, 0) /
                          evaluationStats.filter((t) => t.avg_score > 0).length
                      )
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'تم تقييمهم' : 'Evaluated'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {evaluationStats.filter((t) => t.evaluations_count > 0).length}
                </p>
              </div>
              <User className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'بانتظار التقييم' : 'Pending Evaluation'}
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {evaluationStats.filter((t) => t.evaluations_count === 0).length}
                </p>
              </div>
              <Calendar className="text-orange-400" size={32} />
            </div>
          </div>
        </div>

        {/* Trainees Table */}
        <SupervisorTraineesTable
          trainees={evaluationStats}
          supervisorId={params.supervisorId}
          locale={params.locale}
        />
      </div>
    </DashboardLayout>
  );
}
