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

  // Get assigned trainees with full details
  const { data: assignedTrainees } = await supabase
    .from('supervisor_trainee')
    .select(
      `
      id,
      is_primary,
      assigned_date,
      trainee:trainees(
        id,
        user_id,
        institution_id,
        status,
        university,
        major,
        start_date,
        expected_end_date,
        user:users(full_name, email, phone_number),
        institution:institutions(name, name_ar, location)
      )
    `
    )
    .eq('supervisor_id', supervisor.id)
    .order('assigned_date', { ascending: false });

  // Filter out null trainees and map the data
  const trainees = assignedTrainees
    ?.filter((at: any) => at.trainee !== null)
    .map((at: any) => ({
      ...at.trainee,
      is_primary_supervisor: at.is_primary,
      assigned_date: at.assigned_date,
    })) || [];

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
