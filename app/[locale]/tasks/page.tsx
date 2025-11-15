import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import TasksTable from '@/components/tasks/tasks-table';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ListTodo, Clock, CheckCircle, XCircle } from 'lucide-react';

export default async function TasksPage({
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

  // Fetch tasks based on user role
  let tasksQuery = supabase
    .from('tasks')
    .select(
      `
      *,
      trainees!tasks_assigned_to_fkey (
        user_id,
        users!inner (
          full_name
        ),
        institutions!inner (
          name,
          name_ar
        )
      ),
      assigned_by_user:users!tasks_assigned_by_fkey (
        full_name
      )
    `
    )
    .order('created_at', { ascending: false });

  // If supervisor, only show tasks they created or for their trainees
  if (userProfile.role === 'supervisor') {
    const { data: supervisorData } = await supabase
      .from('supervisors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (supervisorData) {
      const { data: assignedTrainees } = await supabase
        .from('supervisor_trainee')
        .select('trainee_id')
        .eq('supervisor_id', supervisorData.id);

      const traineeIds = (assignedTrainees || []).map((t) => t.trainee_id);

      if (traineeIds.length > 0) {
        tasksQuery = tasksQuery.in('assigned_to', traineeIds);
      } else {
        tasksQuery = tasksQuery.eq('assigned_to', 'none');
      }
    }
  }

  // If trainee, only show their own tasks
  if (userProfile.role === 'trainee') {
    const { data: traineeData } = await supabase
      .from('trainees')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (traineeData) {
      tasksQuery = tasksQuery.eq('assigned_to', traineeData.id);
    } else {
      tasksQuery = tasksQuery.eq('assigned_to', 'none');
    }
  }

  const { data: tasksData, error: tasksError } = await tasksQuery;

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
  }

  // Transform tasks data
  const tasks = (tasksData || []).map((task: any) => {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      trainee_id: task.assigned_to,
      trainee_name: task.trainees?.users?.full_name || 'Unknown',
      institution_name:
        params.locale === 'ar'
          ? task.trainees?.institutions?.name_ar || 'Unknown'
          : task.trainees?.institutions?.name || 'Unknown',
      assigned_by_name: task.assigned_by_user?.full_name || 'N/A',
      due_date: task.due_date,
      priority: task.priority,
      status: task.status,
      created_at: task.created_at,
      completed_at: task.completed_at,
    };
  });

  // Fetch trainees for the add task dialog (for admin and supervisors)
  let traineesData: any[] = [];
  if (userProfile.role === 'admin') {
    const { data } = await supabase
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
          name,
          name_ar
        )
      `
      )
      .eq('status', 'active');

    traineesData = (data || []).map((t: any) => ({
      id: t.id,
      user_id: t.user_id,
      full_name: t.users.full_name,
      email: t.users.email,
      institution_name:
        params.locale === 'ar' ? t.institutions.name_ar : t.institutions.name,
    }));
  } else if (userProfile.role === 'supervisor') {
    const { data: supervisorData } = await supabase
      .from('supervisors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (supervisorData) {
      const { data: assignedTrainees } = await supabase
        .from('supervisor_trainee')
        .select(
          `
          trainee_id,
          trainees!inner (
            id,
            user_id,
            users!inner (
              full_name,
              email
            ),
            institutions!inner (
              name,
              name_ar
            )
          )
        `
        )
        .eq('supervisor_id', supervisorData.id);

      traineesData = (assignedTrainees || []).map((st: any) => ({
        id: st.trainees.id,
        user_id: st.trainees.user_id,
        full_name: st.trainees.users.full_name,
        email: st.trainees.users.email,
        institution_name:
          params.locale === 'ar'
            ? st.trainees.institutions.name_ar
            : st.trainees.institutions.name,
      }));
    }
  }

  // Calculate stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter(
      (t) =>
        t.status !== 'completed' &&
        t.status !== 'cancelled' &&
        new Date(t.due_date) < new Date()
    ).length,
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
            {params.locale === 'ar' ? 'إدارة المهام' : 'Manage Tasks'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? 'إنشاء وتعيين ومتابعة المهام للمتدربين'
              : 'Create, assign, and track trainee tasks'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <ListTodo className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'قيد الانتظار' : 'Pending'}
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
                  {params.locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.in_progress}
                </p>
              </div>
              <Clock className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'مكتملة' : 'Completed'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'متأخرة' : 'Overdue'}
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.overdue}
                </p>
              </div>
              <XCircle className="text-red-400" size={32} />
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <TasksTable
          tasks={tasks}
          locale={params.locale}
          userRole={userProfile.role}
          currentUserId={user.id}
          trainees={traineesData}
        />
      </div>
    </DashboardLayout>
  );
}
