import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import SettingsContent from '@/components/settings/settings-content';

export default async function SettingsPage({
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

  if (!userProfile) {
    redirect(`/${locale}/login`);
  }

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
            {locale === 'ar' ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'إدارة إعدادات الحساب والتفضيلات'
              : 'Manage your account settings and preferences'}
          </p>
        </div>

        {/* Settings Content */}
        <SettingsContent
          user={userProfile}
          locale={locale}
          email={user.email || ''}
        />
      </div>
    </DashboardLayout>
  );
}
