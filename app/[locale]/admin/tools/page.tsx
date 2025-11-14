import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AlertTriangle, ArrowRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminToolsPage({
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
            {locale === 'ar' ? 'أدوات الإدارة' : 'Admin Tools'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'أدوات لإدارة وإصلاح مشاكل النظام'
              : 'Tools for managing and fixing system issues'}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fix Trainees Tool */}
          <Link href={`/${locale}/admin/fix-trainees`}>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {locale === 'ar' ? 'إصلاح سجلات المتدربين' : 'Fix Trainee Records'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {locale === 'ar'
                  ? 'إصلاح المتدربين الذين لديهم حسابات لكن بدون سجلات كاملة في النظام'
                  : 'Fix trainees who have accounts but incomplete records in the system'}
              </p>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  {locale === 'ar' ? 'فتح الأداة' : 'Open Tool'}
                </Button>
              </div>
            </div>
          </Link>

          {/* Placeholder for future tools */}
          <div className="bg-gray-50 rounded-lg shadow border border-gray-200 p-6 opacity-50">
            <div className="flex items-start justify-between">
              <div className="flex-shrink-0 bg-gray-200 rounded-lg p-3">
                <Settings className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-500">
              {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {locale === 'ar'
                ? 'أدوات إضافية ستتوفر قريباً'
                : 'Additional tools will be available soon'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg shadow border border-gray-200 p-6 opacity-50">
            <div className="flex items-start justify-between">
              <div className="flex-shrink-0 bg-gray-200 rounded-lg p-3">
                <Settings className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-500">
              {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {locale === 'ar'
                ? 'أدوات إضافية ستتوفر قريباً'
                : 'Additional tools will be available soon'}
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {locale === 'ar' ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
          </h3>
          <p className="text-sm text-blue-700">
            {locale === 'ar'
              ? 'إذا واجهت أي مشاكل في النظام، يمكنك استخدام الأدوات أعلاه لإصلاحها. إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني.'
              : 'If you encounter any issues in the system, you can use the tools above to fix them. If the problem persists, please contact technical support.'}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
