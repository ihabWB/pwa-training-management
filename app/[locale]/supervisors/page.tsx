import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Lazy load the table component
const SupervisorsTable = dynamic(() => import('@/components/supervisors/supervisors-table'), {
  loading: () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  ),
});

// إعادة التحقق من البيانات كل 60 ثانية
export const revalidate = 60;

export default async function SupervisorsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
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

  // Fetch supervisors with their institution and trainee count
  const { data: supervisorsData, error: supervisorsError } = await supabase
    .from('supervisors')
    .select(
      `
      *,
      users!inner (
        full_name,
        email,
        phone_number
      ),
      institutions!inner (
        name,
        name_ar
      ),
      supervisor_trainee(count)
    `
    )
    .order('created_at', { ascending: false });

  if (supervisorsError) {
    console.error('Error fetching supervisors:', supervisorsError);
  }

  // Fetch institutions for the add dialog
  const { data: institutionsData } = await supabase
    .from('institutions')
    .select('id, name, name_ar')
    .order('name');

  // Fetch all active trainees for assignment
  const { data: traineesData } = await supabase
    .from('trainees')
    .select(
      `
      id,
      user_id,
      users!inner (
        full_name,
        email
      ),
      institutions!inner (
        name
      ),
      major
    `
    )
    .eq('status', 'active')
    .order('users(full_name)');

  // Transform supervisors data
  const supervisors = (supervisorsData || []).map((sup: any) => ({
    id: sup.id,
    user_id: sup.user_id,
    full_name: sup.users.full_name,
    email: sup.users.email,
    phone_number: sup.users.phone_number,
    institution_name: sup.institutions.name,
    institution_name_ar: sup.institutions.name_ar,
    position_title: sup.position_title,
    position_title_ar: sup.position_title_ar,
    specialization: sup.specialization,
    trainee_count: sup.supervisor_trainee?.[0]?.count || 0,
    created_at: sup.created_at,
  }));

  // Transform trainees data
  const availableTrainees = (traineesData || []).map((t: any) => ({
    id: t.id,
    user_id: t.user_id,
    full_name: t.users.full_name,
    email: t.users.email,
    institution_name: t.institutions.name,
    major: t.major,
  }));

  const institutions = institutionsData || [];

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
            {params.locale === 'ar' ? 'إدارة المشرفين' : 'Manage Supervisors'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? `عرض وإدارة جميع المشرفين وربطهم بالمتدربين (${supervisors.length} مشرف)`
              : `View and manage all supervisors and assign trainees (${supervisors.length} supervisors)`}
          </p>
        </div>

        {/* Supervisors Table */}
        <SupervisorsTable
          supervisors={supervisors}
          institutions={institutions}
          availableTrainees={availableTrainees}
          locale={params.locale}
        />
      </div>
    </DashboardLayout>
  );
}
