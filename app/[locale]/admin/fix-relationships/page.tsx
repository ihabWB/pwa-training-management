import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default async function FixRelationshipsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
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

  // Get all trainees
  const { data: allTrainees } = await supabase
    .from('trainees')
    .select('*');

  // Check each trainee's user relationship
  const relationshipChecks = await Promise.all(
    (allTrainees || []).map(async (trainee: any) => {
      // Try to get user with join
      const { data: traineeWithUser } = await supabase
        .from('trainees')
        .select('*, user:users(*)')
        .eq('id', trainee.id)
        .single();

      // Try to get user directly
      const { data: userDirect } = await supabase
        .from('users')
        .select('*')
        .eq('id', trainee.user_id)
        .single();

      return {
        trainee_id: trainee.id,
        user_id: trainee.user_id,
        university: trainee.university,
        major: trainee.major,
        joinReturnsUser: !!traineeWithUser?.user,
        userExistsInTable: !!userDirect,
        userData: userDirect,
      };
    })
  );

  const brokenRelationships = relationshipChecks.filter(
    (check) => check.userExistsInTable && !check.joinReturnsUser
  );

  return (
    <DashboardLayout locale={locale} userRole="admin" userName={user.full_name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {locale === 'ar' ? 'تشخيص العلاقات' : 'Relationships Diagnostic'}
          </h1>
          <p className="text-gray-600 mt-2">
            {locale === 'ar'
              ? 'فحص العلاقات بين جدول المتدربين وجدول المستخدمين'
              : 'Check relationships between trainees and users tables'}
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">
              {locale === 'ar' ? 'إجمالي المتدربين' : 'Total Trainees'}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {relationshipChecks.length}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-sm text-green-600">
              {locale === 'ar' ? 'علاقات صحيحة' : 'Valid Relationships'}
            </div>
            <div className="text-2xl font-bold text-green-900">
              {relationshipChecks.filter((c) => c.joinReturnsUser).length}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <div className="text-sm text-red-600">
              {locale === 'ar' ? 'علاقات معطلة' : 'Broken Relationships'}
            </div>
            <div className="text-2xl font-bold text-red-900">
              {brokenRelationships.length}
            </div>
          </div>
        </div>

        {/* All Checks */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'جميع الفحوصات' : 'All Checks'}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Trainee ID
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    User ID
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    {locale === 'ar' ? 'الجامعة/التخصص' : 'University/Major'}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    {locale === 'ar' ? 'المستخدم موجود؟' : 'User Exists?'}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    {locale === 'ar' ? 'Join يعمل؟' : 'Join Works?'}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {relationshipChecks.map((check) => (
                  <tr
                    key={check.trainee_id}
                    className={
                      !check.userExistsInTable
                        ? 'bg-red-50'
                        : !check.joinReturnsUser
                        ? 'bg-yellow-50'
                        : 'bg-green-50'
                    }
                  >
                    <td className="px-4 py-2 text-sm font-mono">
                      {check.trainee_id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-2 text-sm font-mono">
                      {check.user_id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {check.university} / {check.major}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {check.userExistsInTable ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {check.joinReturnsUser ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {!check.userExistsInTable ? (
                        <span className="text-red-600 font-medium">
                          {locale === 'ar' ? 'المستخدم مفقود' : 'User Missing'}
                        </span>
                      ) : !check.joinReturnsUser ? (
                        <span className="text-yellow-600 font-medium">
                          {locale === 'ar' ? 'علاقة معطلة' : 'Broken Relationship'}
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          {locale === 'ar' ? 'طبيعي' : 'OK'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Data Details */}
        {relationshipChecks.some((c) => c.userData) && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              {locale === 'ar' ? 'بيانات المستخدمين' : 'User Data Details'}
            </h2>
            {relationshipChecks.map((check) => {
              if (!check.userData) return null;
              return (
                <div key={check.trainee_id} className="mb-4 p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">
                    Trainee: {check.trainee_id.substring(0, 8)}...
                  </h3>
                  <pre className="text-xs overflow-auto bg-white p-2 rounded">
                    {JSON.stringify(check.userData, null, 2)}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
