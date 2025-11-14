import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import FixTraineesForm from '@/components/admin/fix-trainees-form';

export default async function FixTraineesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile || userProfile.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  // Find users with trainee role but no trainee record
  const { data: orphanedUsers } = await supabase
    .from('users')
    .select('id, email, full_name, phone_number, created_at')
    .eq('role', 'trainee')
    .order('created_at', { ascending: false });

  // Check which ones don't have trainee records
  const usersWithoutTraineeRecord = [];
  if (orphanedUsers) {
    for (const user of orphanedUsers) {
      const { data: traineeRecord } = await supabase
        .from('trainees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!traineeRecord) {
        usersWithoutTraineeRecord.push(user);
      }
    }
  }

  // Get institutions for the form
  const { data: institutions } = await supabase
    .from('institutions')
    .select('*')
    .order('name');

  return (
    <DashboardLayout
      locale={locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'ar' ? 'إصلاح سجلات المتدربين' : 'Fix Trainee Records'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'إضافة سجلات المتدربين المفقودة للمستخدمين الموجودين'
              : 'Add missing trainee records for existing users'}
          </p>
        </div>

        {/* Statistics */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                {locale === 'ar' ? 'تحذير' : 'Warning'}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {locale === 'ar'
                    ? `تم العثور على ${usersWithoutTraineeRecord.length} مستخدم بدور "متدرب" بدون سجل في جدول المتدربين`
                    : `Found ${usersWithoutTraineeRecord.length} user(s) with "trainee" role but no trainee record`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fix Form */}
        {usersWithoutTraineeRecord.length > 0 ? (
          <FixTraineesForm
            orphanedUsers={usersWithoutTraineeRecord}
            institutions={institutions || []}
            locale={locale}
          />
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-green-900">
              {locale === 'ar' ? 'لا توجد مشاكل!' : 'No Issues Found!'}
            </h3>
            <p className="mt-1 text-sm text-green-700">
              {locale === 'ar'
                ? 'جميع المتدربين لديهم سجلات كاملة'
                : 'All trainees have complete records'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
