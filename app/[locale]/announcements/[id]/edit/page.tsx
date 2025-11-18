import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import EditAnnouncementForm from '@/components/announcements/edit-announcement-form';

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
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

  // Fetch the announcement
  const { data: announcement, error: announcementError } = await supabase
    .from('announcements')
    .select(`
      *,
      announcement_recipients (
        trainee_id
      )
    `)
    .eq('id', id)
    .single();

  if (announcementError || !announcement) {
    redirect(`/${locale}/announcements`);
  }

  // Fetch all trainees for selection
  const { data: trainees } = await supabase
    .from('trainees')
    .select(`
      id,
      users!inner (
        full_name,
        email
      ),
      institutions (
        name,
        name_ar
      )
    `)
    .order('users(full_name)', { ascending: true });

  const traineesList = (trainees || []).map((t: any) => ({
    id: t.id,
    name: t.users.full_name,
    email: t.users.email,
    institution: locale === 'ar' ? t.institutions?.name_ar : t.institutions?.name,
  }));

  return (
    <DashboardLayout
      locale={locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'ar' ? 'تعديل الإعلان' : 'Edit Announcement'}
          </h1>
          <p className="text-gray-600 mt-1">
            {locale === 'ar'
              ? 'تعديل الإعلان أو التعميم أو الورشة'
              : 'Edit announcement, circular, or workshop'}
          </p>
        </div>

        <EditAnnouncementForm
          announcement={announcement}
          trainees={traineesList}
          locale={locale}
        />
      </div>
    </DashboardLayout>
  );
}
