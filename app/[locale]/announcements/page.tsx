import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Bell, Plus, Calendar, Users, Megaphone } from 'lucide-react';
import Link from 'next/link';
import AnnouncementsList from '@/components/announcements/announcements-list';

export default async function AnnouncementsPage({
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

  if (!userProfile || userProfile.role !== 'admin') {
    redirect(`/${params.locale}/dashboard`);
  }

  // Fetch all announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select(`
      *,
      created_by_user:users!announcements_created_by_fkey (
        full_name
      ),
      announcement_recipients (
        id,
        trainee_id,
        read_at
      )
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  // Calculate stats
  const totalAnnouncements = announcements?.length || 0;
  const activeAnnouncements = announcements?.filter((a: any) => a.is_active).length || 0;
  const workshops = announcements?.filter((a: any) => a.type === 'workshop').length || 0;
  const circulars = announcements?.filter((a: any) => a.type === 'circular').length || 0;

  return (
    <DashboardLayout
      locale={params.locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {params.locale === 'ar' ? 'إدارة الإعلانات' : 'Announcements Management'}
            </h1>
            <p className="text-gray-600 mt-1">
              {params.locale === 'ar'
                ? 'إنشاء وإدارة الإعلانات والتعاميم والورش'
                : 'Create and manage announcements, circulars, and workshops'}
            </p>
          </div>
          <Link
            href={`/${params.locale}/announcements/new`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>{params.locale === 'ar' ? 'إعلان جديد' : 'New Announcement'}</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'إجمالي الإعلانات' : 'Total Announcements'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalAnnouncements}
                </p>
              </div>
              <Bell className="text-gray-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'النشطة' : 'Active'}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {activeAnnouncements}
                </p>
              </div>
              <Megaphone className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'الورش' : 'Workshops'}
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {workshops}
                </p>
              </div>
              <Calendar className="text-purple-400" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {params.locale === 'ar' ? 'التعاميم' : 'Circulars'}
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {circulars}
                </p>
              </div>
              <Users className="text-blue-400" size={32} />
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <AnnouncementsList
          announcements={announcements || []}
          locale={params.locale}
        />
      </div>
    </DashboardLayout>
  );
}
