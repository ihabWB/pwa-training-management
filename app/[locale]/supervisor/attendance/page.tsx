import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import SupervisorAttendanceReview from '@/components/attendance/supervisor-attendance-review';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default async function SupervisorAttendancePage({
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

  if (!userProfile || userProfile.role !== 'supervisor') {
    redirect(`/${params.locale}/dashboard`);
  }

  // Get supervisor data
  const { data: supervisor } = await supabase
    .from('supervisors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!supervisor) {
    redirect(`/${params.locale}/dashboard`);
  }

  // Get trainees assigned to this supervisor
  const { data: assignments } = await supabase
    .from('supervisor_trainee')
    .select('trainee_id')
    .eq('supervisor_id', supervisor.id);

  const traineeIds = (assignments || []).map((a: any) => a.trainee_id);

  // Fetch attendance records for assigned trainees
  let attendanceRecords: any[] = [];
  
  if (traineeIds.length > 0) {
    const { data } = await supabase
      .from('attendance')
      .select(`
        *,
        trainees!inner (
          id,
          users!inner (
            full_name,
            email
          )
        )
      `)
      .in('trainee_id', traineeIds)
      .order('date', { ascending: false })
      .limit(100);

    attendanceRecords = (data || []).map((record: any) => ({
      ...record,
      trainee_name: record.trainees?.users?.full_name || 'Unknown',
      trainee_email: record.trainees?.users?.email || '',
    }));
  }

  // Calculate stats
  const totalRecords = attendanceRecords.length;
  const approvedRecords = attendanceRecords.filter((r) => r.approved === true).length;
  const pendingRecords = attendanceRecords.filter((r) => r.approved === false && !r.rejection_reason).length;
  const rejectedRecords = attendanceRecords.filter((r) => r.rejection_reason).length;

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
            {params.locale === 'ar' ? 'مراجعة الحضور' : 'Attendance Review'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? 'راجع وصادق على سجلات حضور المتدربين'
              : 'Review and approve trainee attendance records'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'إجمالي السجلات' : 'Total Records'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalRecords}
                </p>
              </div>
              <Calendar className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'قيد المراجعة' : 'Pending Review'}
                </p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {pendingRecords}
                </p>
              </div>
              <Clock className="text-yellow-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'مصادق عليها' : 'Approved'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {approvedRecords}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'مرفوضة' : 'Rejected'}
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {rejectedRecords}
                </p>
              </div>
              <XCircle className="text-red-400" size={32} />
            </div>
          </div>
        </div>

        {/* Attendance Review Table */}
        <SupervisorAttendanceReview
          records={attendanceRecords}
          locale={params.locale}
          currentUserId={user.id}
        />
      </div>
    </DashboardLayout>
  );
}
