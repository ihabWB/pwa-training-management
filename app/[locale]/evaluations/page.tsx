import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import EvaluationsTable from '@/components/evaluations/evaluations-table';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Award, TrendingUp, Users, Calendar } from 'lucide-react';

export default async function EvaluationsPage({
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

  // Fetch evaluations based on user role
  let evaluationsQuery = supabase
    .from('evaluations')
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
      ),
      supervisors!inner (
        users!inner (
          full_name
        )
      )
    `
    )
    .order('evaluation_date', { ascending: false });

  // If supervisor, only show evaluations they created
  if (userProfile.role === 'supervisor') {
    const { data: supervisorData } = await supabase
      .from('supervisors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (supervisorData) {
      evaluationsQuery = evaluationsQuery.eq('supervisor_id', supervisorData.id);
    } else {
      evaluationsQuery = evaluationsQuery.eq('supervisor_id', 'none');
    }
  }

  // If trainee, only show their own evaluations (approved only)
  if (userProfile.role === 'trainee') {
    const { data: traineeData } = await supabase
      .from('trainees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (traineeData) {
      evaluationsQuery = evaluationsQuery
        .eq('trainee_id', traineeData.id)
        .eq('status', 'approved');
    } else {
      evaluationsQuery = evaluationsQuery.eq('trainee_id', 'none');
    }
  }

  const { data: evaluationsData, error: evaluationsError } = await evaluationsQuery;

  if (evaluationsError) {
    console.error('Error fetching evaluations:', evaluationsError);
  }

  // Debug: Log evaluations data
  console.log('📊 Evaluations Data:', evaluationsData);
  console.log('📊 Total Count:', evaluationsData?.length || 0);
  console.log('📊 First Evaluation Status:', evaluationsData?.[0]?.status);
  console.log('📊 Error:', evaluationsError);

  // Transform evaluations data
  const evaluations = (evaluationsData || []).map((evaluation: any) => ({
    id: evaluation.id,
    trainee_id: evaluation.trainee_id,
    trainee_name: evaluation.trainees.users.full_name,
    institution_name:
      params.locale === 'ar'
        ? evaluation.trainees.institutions.name_ar
        : evaluation.trainees.institutions.name,
    supervisor_name: evaluation.supervisors.users.full_name,
    evaluation_type: evaluation.evaluation_type,
    evaluation_date: evaluation.evaluation_date,
    period_start: evaluation.period_start,
    period_end: evaluation.period_end,
    technical_skills_score: evaluation.technical_skills_score,
    communication_score: evaluation.communication_score,
    teamwork_score: evaluation.teamwork_score,
    initiative_score: evaluation.initiative_score,
    professionalism_score: evaluation.professionalism_score,
    overall_score: evaluation.overall_score,
    strengths: evaluation.strengths,
    areas_for_improvement: evaluation.areas_for_improvement,
    recommendations: evaluation.recommendations,
    notes: evaluation.notes,
    created_at: evaluation.created_at,
  }));

  // Calculate stats
  const stats = {
    total: evaluations.length,
    avgScore: evaluations.length > 0
      ? Math.round(
          evaluations.reduce((sum, e) => sum + e.overall_score, 0) /
            evaluations.length
        )
      : 0,
    excellent: evaluations.filter((e) => e.overall_score >= 90).length,
    thisMonth: evaluations.filter((e) => {
      const evalDate = new Date(e.evaluation_date);
      const now = new Date();
      return (
        evalDate.getMonth() === now.getMonth() &&
        evalDate.getFullYear() === now.getFullYear()
      );
    }).length,
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
            {params.locale === 'ar' ? 'إدارة التقييمات' : 'Manage Evaluations'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? 'عرض وإدارة تقييمات أداء المتدربين'
              : 'View and manage trainee performance evaluations'}
          </p>
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
                  {stats.total}
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
                  {stats.avgScore}%
                </p>
              </div>
              <TrendingUp className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'ممتاز (90%+)' : 'Excellent (90%+)'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.excellent}
                </p>
              </div>
              <Users className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'هذا الشهر' : 'This Month'}
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.thisMonth}
                </p>
              </div>
              <Calendar className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* Debug Info - معلومات التشخيص */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-yellow-900 mb-4 text-xl">🔍 معلومات التشخيص (Diagnostic Info)</h3>
          <div className="bg-white rounded p-4 text-sm font-mono space-y-2 text-right">
            <div className="border-b pb-2">
              <strong>عدد التقييمات:</strong> {evaluations.length}
            </div>
            <div className="border-b pb-2">
              <strong>دورك:</strong> {userProfile.role}
            </div>
            <div className="border-b pb-2">
              <strong>هل يوجد تقييمات؟</strong> {evaluationsData && evaluationsData.length > 0 ? 'نعم ✅' : 'لا ❌'}
            </div>
            {evaluationsData && evaluationsData.length > 0 ? (
              <>
                <div className="border-b pb-2 bg-red-50 p-2 rounded">
                  <strong className="text-red-700">حقل الحالة (status):</strong>{' '}
                  <span className="font-bold text-lg">
                    {evaluationsData[0]?.status !== undefined 
                      ? `"${evaluationsData[0].status}" ✅` 
                      : 'غير موجود في قاعدة البيانات ❌'}
                  </span>
                </div>
                <div className="border-b pb-2">
                  <strong>ID التقييم الأول:</strong> {evaluationsData[0]?.id}
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-yellow-900 font-bold bg-yellow-100 p-2 rounded hover:bg-yellow-200">
                    📋 عرض كل البيانات (Click to expand)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96 text-left border" dir="ltr">
                    {JSON.stringify(evaluationsData[0], null, 2)}
                  </pre>
                </details>
              </>
            ) : (
              <div className="text-center py-4 text-gray-600">
                لا توجد تقييمات لعرضها
              </div>
            )}
          </div>
        </div>

        {/* Evaluations Table */}
        <EvaluationsTable 
          evaluations={evaluations} 
          locale={params.locale}
        />
      </div>
    </DashboardLayout>
  );
}
