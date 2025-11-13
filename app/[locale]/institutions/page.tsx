import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import InstitutionsTable from '@/components/institutions/institutions-table';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function InstitutionsPage({
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

  if (!userProfile || userProfile.role !== 'admin') {
    redirect(`/${params.locale}/dashboard`);
  }

  // Fetch institutions with counts
  const { data: institutionsData, error: institutionsError } = await supabase
    .from('institutions')
    .select(
      `
      *,
      trainees(count),
      supervisors(count)
    `
    )
    .order('created_at', { ascending: false });

  if (institutionsError) {
    console.error('Error fetching institutions:', institutionsError);
  }

  // Transform data for table
  const institutions = (institutionsData || []).map((inst: any) => ({
    id: inst.id,
    name: inst.name,
    name_ar: inst.name_ar,
    location: inst.location,
    focal_point_name: inst.focal_point_name,
    focal_point_phone: inst.focal_point_phone,
    focal_point_email: inst.focal_point_email,
    address: inst.address,
    description: inst.description,
    trainee_count: inst.trainees?.[0]?.count || 0,
    supervisor_count: inst.supervisors?.[0]?.count || 0,
    created_at: inst.created_at,
  }));

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
            {params.locale === 'ar' ? 'إدارة المؤسسات' : 'Manage Institutions'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? `عرض وإدارة جميع المؤسسات التدريبية (${institutions.length} مؤسسة)`
              : `View and manage all training institutions (${institutions.length} institutions)`}
          </p>
        </div>

        {/* Institutions Table */}
        <InstitutionsTable
          institutions={institutions}
          locale={params.locale}
        />
      </div>
    </DashboardLayout>
  );
}
