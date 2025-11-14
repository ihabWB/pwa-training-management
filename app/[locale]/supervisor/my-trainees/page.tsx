import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import DashboardLayout from '@/components/layout/dashboard-layout';
import SupervisorTraineesList from '@/components/supervisor/supervisor-trainees-list';

export const revalidate = 30;

export default async function MyTraineesPage({
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
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!supervisor) {
    redirect(`/${locale}/dashboard`);
  }

  // Get assigned trainees - using separate queries to avoid join issues
  const { data: assignments } = await supabase
    .from('supervisor_trainee')
    .select('id, trainee_id, is_primary, assigned_date')
    .eq('supervisor_id', supervisor.id)
    .order('assigned_date', { ascending: false });

  console.log('Supervisor ID:', supervisor.id);
  console.log('Assignments found:', assignments?.length || 0);

  // Get trainee details separately
  const traineeIds = (assignments || []).map((a: any) => a.trainee_id);
  console.log('Trainee IDs:', traineeIds);
  
  let trainees: any[] = [];
  
  if (traineeIds.length > 0) {
    const { data: traineesData } = await supabase
      .from('trainees')
      .select('id, user_id, institution_id, status, university, major, start_date, expected_end_date')
      .in('id', traineeIds);

    console.log('Trainees data found:', traineesData?.length || 0);

    // Get user details
    const userIds = (traineesData || []).map((t: any) => t.user_id);
    console.log('User IDs:', userIds);
    
    const { data: usersData } = await supabase
      .from('users')
      .select('id, full_name, email, phone_number')
      .in('id', userIds);

    console.log('Users data found:', usersData?.length || 0);

    // Get institution details
    const institutionIds = (traineesData || []).map((t: any) => t.institution_id);
    console.log('Institution IDs:', institutionIds);
    
    const { data: institutionsData } = await supabase
      .from('institutions')
      .select('id, name, name_ar, location')
      .in('id', institutionIds);

    console.log('Institutions data found:', institutionsData?.length || 0);

    // Combine all data
    trainees = (traineesData || []).map((trainee: any) => {
      const assignment = assignments?.find((a: any) => a.trainee_id === trainee.id);
      const user = usersData?.find((u: any) => u.id === trainee.user_id);
      const institution = institutionsData?.find((i: any) => i.id === trainee.institution_id);

      return {
        ...trainee,
        user,
        institution,
        is_primary_supervisor: assignment?.is_primary || false,
        assigned_date: assignment?.assigned_date,
      };
    }).filter((t: any) => t.user && t.institution); // Only include trainees with complete data
    
    console.log('Final trainees count:', trainees.length);
    console.log('Trainees:', JSON.stringify(trainees, null, 2));
  }

  return (
    <DashboardLayout locale={locale} userRole="supervisor" userName={user.full_name}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'ar' ? 'متدربيني' : 'My Trainees'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? `إدارة ومتابعة المتدربين المكلف بالإشراف عليهم (${trainees.length} متدرب)`
              : `Manage and monitor trainees under your supervision (${trainees.length} trainees)`}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'إجمالي المتدربين' : 'Total Trainees'}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{trainees.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'النشطون' : 'Active'}
            </div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {trainees.filter((t: any) => t.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'المكتملون' : 'Completed'}
            </div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {trainees.filter((t: any) => t.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'الإشراف الأساسي' : 'Primary Supervisor'}
            </div>
            <div className="mt-2 text-3xl font-bold text-purple-600">
              {trainees.filter((t: any) => t.is_primary_supervisor).length}
            </div>
          </div>
        </div>

        {/* Trainees List */}
        <div className="bg-white rounded-lg shadow">
          <SupervisorTraineesList
            trainees={trainees}
            supervisorId={supervisor.id}
            locale={locale}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
