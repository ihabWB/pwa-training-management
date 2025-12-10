import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import SupervisorEvaluationsList from '@/components/supervisor/supervisor-evaluations-list';

export default async function SupervisorEvaluationsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${params.locale}/login`);
  }

  // Get supervisor data
  const { data: supervisorData } = await supabase
    .from('supervisors')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!supervisorData) {
    redirect(`/${params.locale}/login`);
  }

  // Get all evaluations created by this supervisor
  const { data: evaluations, error: evalError } = await supabase
    .from('evaluations')
    .select(`
      *,
      trainee:trainees(
        id,
        user_id,
        institution_id,
        user:users(id, full_name, email, avatar_url),
        institution:institutions(id, name_ar, name_en)
      )
    `)
    .eq('supervisor_id', supervisorData.id)
    .order('created_at', { ascending: false });

  console.log('SERVER - Supervisor Evaluations:', evaluations);
  console.log('SERVER - Evaluations Error:', evalError);
  console.log('SERVER - First evaluation status:', evaluations?.[0]?.status);

  // Get all trainees assigned to this supervisor - using separate queries
  const { data: assignments } = await supabase
    .from('supervisor_trainee')
    .select('trainee_id')
    .eq('supervisor_id', supervisorData.id);

  let assignedTrainees: any[] = [];
  const traineeIds = (assignments || []).map((a: any) => a.trainee_id);
  
  if (traineeIds.length > 0) {
    const { data: traineesData } = await supabase
      .from('trainees')
      .select('id, user_id, institution_id')
      .in('id', traineeIds);

    if (traineesData && traineesData.length > 0) {
      // Get user details
      const userIds = traineesData.map((t: any) => t.user_id).filter(Boolean);
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      // Get institution details
      const institutionIds = traineesData.map((t: any) => t.institution_id).filter(Boolean);
      const { data: institutionsData } = await supabase
        .from('institutions')
        .select('id, name_ar, name_en')
        .in('id', institutionIds);

      // Combine the data - flatten for serialization
      assignedTrainees = traineesData.map((trainee: any) => {
        const user = usersData?.find((u: any) => u.id === trainee.user_id);
        const institution = institutionsData?.find((i: any) => i.id === trainee.institution_id);
        
        return {
          id: trainee.id,
          user_id: trainee.user_id,
          institution_id: trainee.institution_id,
          user: user ? {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            avatar_url: user.avatar_url
          } : null,
          institution: institution ? {
            id: institution.id,
            name_ar: institution.name_ar,
            name_en: institution.name_en
          } : null
        };
      });
    }
  }

  const text =
    params.locale === 'ar'
      ? {
          title: 'التقييمات',
          description: 'إدارة وعرض جميع تقييمات المتدربين',
          totalEvaluations: 'إجمالي التقييمات',
          avgScore: 'متوسط الدرجات',
          pendingApproval: 'معلقة الاعتماد',
          approved: 'معتمدة',
        }
      : {
          title: 'Evaluations',
          description: 'Manage and view all trainee evaluations',
          totalEvaluations: 'Total Evaluations',
          avgScore: 'Average Score',
          pendingApproval: 'Pending Approval',
          approved: 'Approved',
        };

  // Calculate statistics
  const totalEvaluations = evaluations?.length || 0;
  const avgScore =
    evaluations && evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.overall_score, 0) / evaluations.length
      : 0;
  const pendingCount = evaluations?.filter((e) => e.status === 'pending').length || 0;
  const approvedCount = evaluations?.filter((e) => e.status === 'approved').length || 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{text.title}</h1>
        <p className="text-muted-foreground">{text.description}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{text.totalEvaluations}</p>
              <h3 className="text-2xl font-bold mt-2">{totalEvaluations}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{text.avgScore}</p>
              <h3 className="text-2xl font-bold mt-2">{(avgScore || 0).toFixed(1)}/5</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{text.pendingApproval}</p>
              <h3 className="text-2xl font-bold mt-2">{pendingCount}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{text.approved}</p>
              <h3 className="text-2xl font-bold mt-2">{approvedCount}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluations List with Add Button */}
      <SupervisorEvaluationsList
        evaluations={evaluations || []}
        assignedTrainees={assignedTrainees}
        supervisorId={supervisorData.id}
        locale={params.locale}
      />
    </div>
  );
}
