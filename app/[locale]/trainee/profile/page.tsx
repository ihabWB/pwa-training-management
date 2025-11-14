import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import TraineeProfileCard from '@/components/trainee/trainee-profile-card';

export default async function TraineeProfilePage({
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

  if (!userProfile || userProfile.role !== 'trainee') {
    redirect(`/${locale}/dashboard`);
  }

  // Get trainee details
  const { data: traineeData, error: traineeError } = await supabase
    .from('trainees')
    .select(`
      *,
      institutions (
        name,
        name_ar,
        location
      )
    `)
    .eq('user_id', user.id)
    .single();

  if (traineeError) {
    console.error('Trainee fetch error:', traineeError);
  }

  if (!traineeData) {
    return (
      <DashboardLayout
        locale={locale}
        userRole={userProfile.role}
        userName={userProfile.full_name}
      >
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 max-w-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {locale === 'ar' ? 'الملف الشخصي غير مكتمل' : 'Incomplete Profile'}
                </h2>
                <p className="text-gray-700 mb-4">
                  {locale === 'ar' 
                    ? 'يرجى التواصل مع المدير لإكمال ملفك الشخصي' 
                    : 'Please contact the administrator to complete your profile'}
                </p>
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'معلومات للمدير:' : 'Information for Administrator:'}
                  </p>
                  <p className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                    User ID: {user.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const trainee = {
    ...traineeData,
    users: userProfile,
  };

  // Calculate training progress
  const startDate = new Date(trainee.start_date);
  const endDate = new Date(trainee.expected_end_date);
  const today = new Date();
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysCompleted = Math.ceil(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPercentage = Math.min(
    Math.max((daysCompleted / totalDays) * 100, 0),
    100
  );

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
            {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'معلومات الملف الشخصي الخاص بك'
              : 'Your profile information'}
          </p>
        </div>

        {/* Profile Card */}
        <TraineeProfileCard
          trainee={trainee}
          locale={locale}
          progressPercentage={progressPercentage}
        />

        {/* Additional Profile Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <p className="text-base text-gray-900">{userProfile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                {locale === 'ar' ? 'الهاتف' : 'Phone'}
              </label>
              <p className="text-base text-gray-900">{trainee.phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                {locale === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
              </label>
              <p className="text-base text-gray-900">
                {trainee.date_of_birth
                  ? new Date(trainee.date_of_birth).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')
                  : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                {locale === 'ar' ? 'المؤسسة' : 'Institution'}
              </label>
              <p className="text-base text-gray-900">
                {locale === 'ar' ? trainee.institutions?.name_ar : trainee.institutions?.name}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">
                {locale === 'ar' ? 'العنوان' : 'Address'}
              </label>
              <p className="text-base text-gray-900">{trainee.address || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
