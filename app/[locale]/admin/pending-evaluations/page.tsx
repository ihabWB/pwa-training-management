import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import PendingEvaluationsTable from '@/components/admin/pending-evaluations-table';
import { Award, Clock, CheckCircle, XCircle } from 'lucide-react';

export const revalidate = 0; // Always fetch fresh data

export default async function PendingEvaluationsPage({
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

  if (!userProfile || userProfile.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  // Fetch all evaluations with trainee and supervisor info
  const { data: evaluations } = await supabase
    .from('evaluations')
    .select(`
      *,
      trainees:trainee_id (
        user:users (full_name),
        institutions (name, name_ar)
      ),
      supervisors:supervisor_id (
        user:users (full_name)
      )
    `)
    .order('evaluation_date', { ascending: false });

  // Format evaluations data
  const formattedEvaluations = evaluations?.map((evaluation: any) => ({
    id: evaluation.id,
    trainee_name: evaluation.trainees?.user?.full_name || 'Unknown',
    supervisor_name: evaluation.supervisors?.user?.full_name || 'Unknown',
    institution_name: locale === 'ar' 
      ? evaluation.trainees?.institutions?.name_ar 
      : evaluation.trainees?.institutions?.name,
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
    status: evaluation.status,
    approved_at: evaluation.approved_at,
    admin_feedback: evaluation.admin_feedback,
  })) || [];

  // Calculate stats
  const stats = {
    total: formattedEvaluations.length,
    pending: formattedEvaluations.filter((e) => e.status === 'pending').length,
    approved: formattedEvaluations.filter((e) => e.status === 'approved').length,
    rejected: formattedEvaluations.filter((e) => e.status === 'rejected').length,
  };

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
            {locale === 'ar' ? 'مراجعة التقييمات' : 'Review Evaluations'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'مراجعة واعتماد تقييمات المتدربين'
              : 'Review and approve trainee evaluations'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {locale === 'ar' ? 'المجموع' : 'Total'}
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
                  {locale === 'ar' ? 'معلقة' : 'Pending'}
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
                  {locale === 'ar' ? 'معتمدة' : 'Approved'}
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
                  {locale === 'ar' ? 'مرفوضة' : 'Rejected'}
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="text-red-400" size={32} />
            </div>
          </div>
        </div>

        {/* Evaluations Table */}
        <div className="bg-white rounded-lg shadow">
          <PendingEvaluationsTable 
            evaluations={formattedEvaluations} 
            locale={locale} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
