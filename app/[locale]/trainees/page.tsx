import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Lazy load the heavy table component
const TraineesTable = dynamic(() => import('@/components/trainees/trainees-table'), {
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

// إعادة التحقق من البيانات كل 60 ثانية
export const revalidate = 60;

export default async function TraineesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
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

  // Fetch all trainees with their institutions
  const { data: traineesData, error: traineesError } = await supabase
    .from('trainees')
    .select(`
      *,
      users!inner (
        full_name,
        email,
        phone_number
      ),
      institutions!inner (
        name,
        name_ar
      )
    `)
    .order('created_at', { ascending: false });

  if (traineesError) {
    console.error('Error fetching trainees:', traineesError);
  }

  // Fetch institutions for the add dialog
  const { data: institutionsData } = await supabase
    .from('institutions')
    .select('id, name, name_ar')
    .order('name');

  // Transform the data for the table
  const trainees = (traineesData || []).map((t: any) => ({
    id: t.id,
    user_id: t.user_id,
    full_name: t.users.full_name,
    email: t.users.email,
    phone_number: t.users.phone_number,
    institution_id: t.institution_id,
    institution_name: t.institutions.name,
    institution_name_ar: t.institutions.name_ar,
    university: t.university,
    major: t.major,
    graduation_year: t.graduation_year,
    status: t.status,
    start_date: t.start_date,
    expected_end_date: t.expected_end_date,
    created_at: t.created_at,
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
            {params.locale === 'ar' ? 'إدارة المتدربين' : 'Manage Trainees'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? `عرض وإدارة جميع المتدربين في البرنامج (${trainees.length} متدرب)`
              : `View and manage all trainees in the program (${trainees.length} trainees)`}
          </p>
        </div>

        {/* Trainees Table */}
        <TraineesTable
          trainees={trainees}
          institutions={institutions}
          locale={params.locale}
        />
      </div>
    </DashboardLayout>
  );
}

