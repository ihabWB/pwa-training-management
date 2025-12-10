import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import AdminAttendanceView from '@/components/attendance/admin-attendance-view';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Calendar, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

export default async function AttendancePage(props: {
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

  if (!userProfile) {
    redirect(`/${params.locale}/login`);
  }

  // Redirect based on role
  if (userProfile.role === 'trainee') {
    redirect(`/${params.locale}/trainee/attendance`);
  }

  if (userProfile.role === 'supervisor') {
    redirect(`/${params.locale}/supervisor/attendance`);
  }

  // Admin can see all attendance records
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select(`
      *,
      trainees!inner (
        id,
        users!inner (
          full_name,
          email
        ),
        institutions (
          name,
          name_ar
        )
      ),
      approved_by_user:users!attendance_approved_by_fkey (
        full_name
      )
    `)
    .order('date', { ascending: false })
    .limit(200);

  const records = (attendanceRecords || []).map((record: any) => ({
    ...record,
    trainee_name: record.trainees?.users?.full_name || 'Unknown',
    trainee_email: record.trainees?.users?.email || '',
    institution_name: params.locale === 'ar' 
      ? record.trainees?.institutions?.name_ar 
      : record.trainees?.institutions?.name,
    approved_by_name: record.approved_by_user?.full_name || null,
  }));

  // Calculate stats
  const totalRecords = records.length;
  const approvedRecords = records.filter((r: any) => r.approved === true).length;
  const pendingRecords = records.filter((r: any) => r.approved === false && !r.rejection_reason).length;
  const rejectedRecords = records.filter((r: any) => r.rejection_reason).length;
  const uniqueTrainees = new Set(records.map((r: any) => r.trainee_id)).size;

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
            {params.locale === 'ar' ? 'إدارة الحضور' : 'Attendance Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? 'عرض وإدارة جميع سجلات الحضور'
              : 'View and manage all attendance records'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  {params.locale === 'ar' ? 'المتدربون' : 'Trainees'}
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {uniqueTrainees}
                </p>
              </div>
              <Users className="text-blue-400" size={32} />
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

        {/* Attendance View */}
        <AdminAttendanceView
          records={records}
          locale={params.locale}
        />
      </div>
    </DashboardLayout>
  );
}
