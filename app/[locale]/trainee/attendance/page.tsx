import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import TraineeAttendanceForm from '@/components/attendance/trainee-attendance-form';
import TraineeAttendanceHistory from '@/components/attendance/trainee-attendance-history';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default async function TraineeAttendancePage(props: {
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

  if (!userProfile || userProfile.role !== 'trainee') {
    redirect(`/${params.locale}/dashboard`);
  }

  // Get trainee data
  const { data: traineeData } = await supabase
    .from('trainees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!traineeData) {
    redirect(`/${params.locale}/dashboard`);
  }

  // Fetch attendance records
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('*')
    .eq('trainee_id', traineeData.id)
    .order('date', { ascending: false })
    .limit(30);

  // Calculate stats
  const totalRecords = attendanceRecords?.length || 0;
  const presentRecords = attendanceRecords?.filter(
    (r) => r.status === 'present'
  ).length || 0;
  const approvedRecords = attendanceRecords?.filter(
    (r) => r.approved === true
  ).length || 0;
  const pendingRecords = attendanceRecords?.filter(
    (r) => r.approved === false
  ).length || 0;

  const attendanceRate = totalRecords > 0 
    ? Math.round((presentRecords / totalRecords) * 100)
    : 0;

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
            {params.locale === 'ar' ? 'تسجيل الحضور' : 'Attendance Registration'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? 'سجل حضورك اليومي وتابع سجلاتك'
              : 'Register your daily attendance and track your records'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'معدل الحضور' : 'Attendance Rate'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {attendanceRate}%
                </p>
              </div>
              <Calendar className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'مصادق عليها' : 'Approved'}
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {approvedRecords}
                </p>
              </div>
              <CheckCircle className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
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
                  {params.locale === 'ar' ? 'إجمالي السجلات' : 'Total Records'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalRecords}
                </p>
              </div>
              <Calendar className="text-gray-400" size={32} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Form */}
          <div className="lg:col-span-1">
            <TraineeAttendanceForm
              traineeId={traineeData.id}
              locale={params.locale}
            />
          </div>

          {/* Attendance History */}
          <div className="lg:col-span-2">
            <TraineeAttendanceHistory
              records={attendanceRecords || []}
              locale={params.locale}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
