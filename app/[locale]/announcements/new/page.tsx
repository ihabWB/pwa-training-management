import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import AddAnnouncementForm from '@/components/announcements/add-announcement-form';

export default async function NewAnnouncementPage({
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
    institution: params.locale === 'ar' ? t.institutions?.name_ar : t.institutions?.name,
  }));

  return (
    <DashboardLayout
      locale={params.locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {params.locale === 'ar' ? 'إعلان جديد' : 'New Announcement'}
          </h1>
          <p className="text-gray-600 mt-1">
            {params.locale === 'ar'
              ? 'إنشاء إعلان أو تعميم أو ورشة جديدة'
              : 'Create a new announcement, circular, or workshop'}
          </p>
        </div>

        <AddAnnouncementForm
          trainees={traineesList}
          locale={params.locale}
        />
      </div>
    </DashboardLayout>
  );
}
