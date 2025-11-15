import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import TraineeEvaluationsTable from '@/components/trainee/trainee-evaluations-table';

export const revalidate = 30;

export default async function MyEvaluationsPage({
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

  // Fetch evaluations - المتدرب يرى فقط التقييمات المعتمدة
  const { data: evaluations, error: evalError } = await supabase
    .from('evaluations')
    .select('*')
    .eq('trainee_id', traineeData.id)
    .eq('status', 'approved') // فقط التقييمات المعتمدة
    .order('evaluation_date', { ascending: false });

  console.log('🔍 Trainee ID:', traineeData.id);
  console.log('🔍 Evaluations found:', evaluations?.length || 0);
  console.log('🔍 Evaluations error:', evalError);
  console.log('🔍 First evaluation:', evaluations?.[0]);

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
            {locale === 'ar' ? 'تقييماتي' : 'My Evaluations'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'عرض تقييماتك وأدائك'
              : 'View your evaluations and performance'}
          </p>
        </div>

        {/* Debug Info - معلومات التشخيص */}
        <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-purple-900 mb-4 text-xl">🔍 معلومات التشخيص (Debug Info)</h3>
          <div className="bg-white rounded p-4 text-sm font-mono space-y-2 text-right">
            <div className="border-b pb-2 bg-blue-100 p-2 rounded">
              <strong className="text-lg">معرف المتدرب (Trainee ID):</strong> 
              <div className="text-xs mt-1 font-mono text-gray-600">{traineeData.id}</div>
            </div>
            <div className="border-b pb-2">
              <strong>عدد التقييمات المعتمدة:</strong> {evaluations?.length || 0}
            </div>
            {evaluations && evaluations.length > 0 ? (
              <>
                <div className="border-b pb-2 bg-yellow-50 p-2 rounded">
                  <strong>التقييم الأول - النوع:</strong> {evaluations[0].evaluation_type}
                </div>
                <div className="border-b pb-2 bg-yellow-50 p-2 rounded">
                  <strong>التاريخ:</strong> {evaluations[0].evaluation_date}
                </div>
                <div className="border-b pb-2 bg-green-50 p-2 rounded">
                  <strong>الدرجة الإجمالية:</strong> {evaluations[0].overall_score}%
                </div>
                <div className="border-b pb-2 bg-blue-50 p-2 rounded">
                  <strong>الحالة (Status):</strong> <span className="font-bold text-green-600">{evaluations[0].status || 'غير محدد'}</span>
                </div>
                <div className="border-b pb-2">
                  <strong>نقاط القوة:</strong> {evaluations[0].strengths || 'لا يوجد'}
                </div>
                <div className="border-b pb-2">
                  <strong>مجالات التحسين:</strong> {evaluations[0].areas_for_improvement || 'لا يوجد'}
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-purple-900 font-bold bg-purple-100 p-2 rounded hover:bg-purple-200">
                    📋 عرض البيانات الكاملة
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96 text-left border" dir="ltr">
                    {JSON.stringify(evaluations[0], null, 2)}
                  </pre>
                </details>
              </>
            ) : (
              <div className="text-center py-4 text-red-600 font-bold text-lg">
                ⚠️ لا توجد تقييمات معتمدة!
                <div className="mt-2 text-sm text-gray-600">
                  التقييمات تظهر فقط بعد اعتمادها من قبل الإدارة
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluations Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <TraineeEvaluationsTable evaluations={evaluations || []} locale={locale} />
        </div>
      </div>
    </DashboardLayout>
  );
}
