import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default async function SupervisorDebugPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
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
  const { data: supervisor, error: supervisorError } = await supabase
    .from('supervisors')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get all supervisor_trainee records
  const { data: allAssignments, error: assignmentsError } = await supabase
    .from('supervisor_trainee')
    .select('*')
    .eq('supervisor_id', supervisor?.id || 'none');

  // Get trainees data
  const { data: allTrainees, error: traineesError } = await supabase
    .from('trainees')
    .select('*, users(*), institutions(*)');

  // Get with inner joins
  const { data: assignedWithInner, error: innerError } = await supabase
    .from('supervisor_trainee')
    .select(
      `
      id,
      is_primary,
      assigned_date,
      trainee:trainees!inner(
        id,
        user_id,
        institution_id,
        status,
        university,
        major,
        start_date,
        expected_end_date,
        user:users!inner(full_name, email, phone_number),
        institution:institutions!inner(name, name_ar, location)
      )
    `
    )
    .eq('supervisor_id', supervisor?.id || 'none');

  // Get without inner joins
  const { data: assignedWithoutInner, error: outerError } = await supabase
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
    .eq('supervisor_id', supervisor?.id || 'none');

  return (
    <DashboardLayout locale={locale} userRole="supervisor" userName={user.full_name}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Supervisor Debug Info</h1>

        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">User Info</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Supervisor Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Supervisor Record</h2>
          {supervisorError && (
            <div className="text-red-600 mb-2">Error: {supervisorError.message}</div>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(supervisor, null, 2)}
          </pre>
        </div>

        {/* All Assignments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            Supervisor-Trainee Assignments ({allAssignments?.length || 0})
          </h2>
          {assignmentsError && (
            <div className="text-red-600 mb-2">Error: {assignmentsError.message}</div>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(allAssignments, null, 2)}
          </pre>
        </div>

        {/* All Trainees */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            All Trainees in Database ({allTrainees?.length || 0})
          </h2>
          {traineesError && (
            <div className="text-red-600 mb-2">Error: {traineesError.message}</div>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(allTrainees, null, 2)}
          </pre>
        </div>

        {/* With Inner Joins */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            Assigned Trainees WITH !inner ({assignedWithInner?.length || 0})
          </h2>
          {innerError && (
            <div className="text-red-600 mb-2">Error: {innerError.message}</div>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(assignedWithInner, null, 2)}
          </pre>
        </div>

        {/* Without Inner Joins */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            Assigned Trainees WITHOUT !inner ({assignedWithoutInner?.length || 0})
          </h2>
          {outerError && (
            <div className="text-red-600 mb-2">Error: {outerError.message}</div>
          )}
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(assignedWithoutInner, null, 2)}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}
