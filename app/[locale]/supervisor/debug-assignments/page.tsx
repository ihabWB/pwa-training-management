import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function DebugAssignmentsPage({
  params,
}: {
  params: { locale: string };
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${params.locale}/login`);
  }

  // Get supervisor data
  const { data: supervisorData, error: supervisorError } = await supabase
    .from('supervisors')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get all supervisor_trainee records for this supervisor
  const { data: assignments, error: assignmentsError } = await supabase
    .from('supervisor_trainee')
    .select(`
      *,
      trainee:trainees(
        id,
        user_id,
        institution_id,
        user:users(id, full_name, email),
        institution:institutions(id, name_ar, name_en)
      )
    `)
    .eq('supervisor_id', supervisorData?.id || '');

  // Get all trainees
  const { data: allTrainees } = await supabase
    .from('trainees')
    .select(`
      id,
      user_id,
      institution_id,
      user:users(id, full_name, email),
      institution:institutions(id, name_ar, name_en)
    `);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug: Supervisor Assignments</h1>

      {/* Supervisor Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Supervisor Info</h2>
        {supervisorError ? (
          <pre className="bg-red-50 p-4 rounded text-red-700">
            Error: {JSON.stringify(supervisorError, null, 2)}
          </pre>
        ) : (
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(supervisorData, null, 2)}
          </pre>
        )}
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Assignments ({assignments?.length || 0})
        </h2>
        {assignmentsError ? (
          <pre className="bg-red-50 p-4 rounded text-red-700">
            Error: {JSON.stringify(assignmentsError, null, 2)}
          </pre>
        ) : (
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(assignments, null, 2)}
          </pre>
        )}
      </div>

      {/* All Trainees */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          All Trainees ({allTrainees?.length || 0})
        </h2>
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Institution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allTrainees?.map((trainee: any) => (
                <tr key={trainee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trainee.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trainee.user?.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trainee.user?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trainee.institution?.name_ar || trainee.institution?.name_en || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Fix Section */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">
          🔧 Quick Fix Instructions
        </h2>
        <div className="space-y-2 text-sm">
          <p className="font-medium">To assign trainees to this supervisor, run this SQL:</p>
          <pre className="bg-white p-4 rounded border border-yellow-300 overflow-auto">
{`-- Assign a trainee to supervisor
INSERT INTO supervisor_trainee (supervisor_id, trainee_id, assigned_at)
VALUES ('${supervisorData?.id}', 'TRAINEE_ID_HERE', NOW())
ON CONFLICT (supervisor_id, trainee_id) DO NOTHING;

-- Or assign all trainees to this supervisor
INSERT INTO supervisor_trainee (supervisor_id, trainee_id, assigned_at)
SELECT '${supervisorData?.id}', id, NOW()
FROM trainees
ON CONFLICT (supervisor_id, trainee_id) DO NOTHING;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
