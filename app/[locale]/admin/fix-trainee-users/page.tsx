import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import DashboardLayout from '@/components/layout/dashboard-layout';
import FixTraineeUsersForm from '@/components/admin/fix-trainee-users-form';

export default async function FixTraineeUsersPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!user || user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  // Find trainees with missing or null user records
  const { data: allTrainees } = await supabase
    .from('trainees')
    .select('*, users(*), institutions(name, name_ar)');

  const brokenTrainees = allTrainees?.filter((t: any) => !t.users) || [];

  // Get auth users to check if user_id exists in auth but not in users table
  const authUserChecks = await Promise.all(
    brokenTrainees.map(async (trainee: any) => {
      const { data: authUser } = await supabase.auth.admin.getUserById(trainee.user_id);
      return {
        trainee,
        authUserExists: !!authUser.user,
        authUserEmail: authUser.user?.email,
      };
    })
  );

  return (
    <DashboardLayout locale={locale} userRole="admin" userName={user.full_name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'ar' ? 'إصلاح سجلات المستخدمين للمتدربين' : 'Fix Trainee User Records'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar'
              ? 'المتدربين الذين لديهم سجل في trainees ولكن ليس لديهم سجل في users'
              : 'Trainees that have a record in trainees but no record in users table'}
          </p>
        </div>

        {brokenTrainees.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900">
              {locale === 'ar' ? '✓ لا توجد مشاكل!' : '✓ No Issues Found!'}
            </h3>
            <p className="text-green-700 mt-2">
              {locale === 'ar'
                ? 'جميع المتدربين لديهم سجلات مستخدمين صحيحة.'
                : 'All trainees have valid user records.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900">
                {locale === 'ar'
                  ? `⚠️ تم العثور على ${brokenTrainees.length} متدرب بدون سجل مستخدم`
                  : `⚠️ Found ${brokenTrainees.length} trainee(s) without user records`}
              </h3>
            </div>

            <FixTraineeUsersForm
              brokenTrainees={authUserChecks}
              locale={locale}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
