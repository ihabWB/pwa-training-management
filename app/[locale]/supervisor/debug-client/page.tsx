'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';

export default function SupervisorDebugClient() {
  const params = useParams();
  const locale = params.locale as string;
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);

        if (!user) {
          setDebugInfo({ error: 'No user logged in' });
          setLoading(false);
          return;
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('User profile:', userProfile);

        // Get supervisor record
        const { data: supervisor, error: supervisorError } = await supabase
          .from('supervisors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('Supervisor record:', supervisor);
        console.log('Supervisor error:', supervisorError);

        if (!supervisor) {
          setDebugInfo({ 
            error: 'No supervisor record found',
            userProfile,
            supervisorError 
          });
          setLoading(false);
          return;
        }

        // Get assignments
        const { data: assignments, error: assignmentsError } = await supabase
          .from('supervisor_trainee')
          .select('id, trainee_id, is_primary, assigned_date')
          .eq('supervisor_id', supervisor.id);

        console.log('Assignments:', assignments);
        console.log('Assignments error:', assignmentsError);

        const traineeIds = (assignments || []).map((a: any) => a.trainee_id);
        console.log('Trainee IDs:', traineeIds);

        let traineesData = null;
        let usersData = null;
        let institutionsData = null;

        if (traineeIds.length > 0) {
          // Get trainees
          const { data: td, error: traineesError } = await supabase
            .from('trainees')
            .select('*')
            .in('id', traineeIds);

          console.log('Trainees data:', td);
          console.log('Trainees error:', traineesError);
          traineesData = td;

          // Get users
          const userIds = (td || []).map((t: any) => t.user_id);
          console.log('User IDs to fetch:', userIds);

          const { data: ud, error: usersError } = await supabase
            .from('users')
            .select('*')
            .in('id', userIds);

          console.log('Users data:', ud);
          console.log('Users error:', usersError);
          usersData = ud;

          // Get institutions
          const institutionIds = (td || []).map((t: any) => t.institution_id);
          console.log('Institution IDs to fetch:', institutionIds);

          const { data: id, error: institutionsError } = await supabase
            .from('institutions')
            .select('*')
            .in('id', institutionIds);

          console.log('Institutions data:', id);
          console.log('Institutions error:', institutionsError);
          institutionsData = id;
        }

        setDebugInfo({
          user,
          userProfile,
          supervisor,
          assignments,
          traineeIds,
          traineesData,
          usersData,
          institutionsData,
        });
      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: String(error) });
      } finally {
        setLoading(false);
      }
    }

    fetchDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Supervisor Debug (Client-Side)</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Supervisor Debug (Client-Side)</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {debugInfo?.assignments && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              Assignments ({debugInfo.assignments.length})
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(debugInfo.assignments, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo?.traineesData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              Trainees Data ({debugInfo.traineesData.length})
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(debugInfo.traineesData, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo?.usersData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              Users Data ({debugInfo.usersData.length})
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(debugInfo.usersData, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo?.institutionsData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              Institutions Data ({debugInfo.institutionsData.length})
            </h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(debugInfo.institutionsData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
