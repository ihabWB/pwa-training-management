'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function MyTraineesTestPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('=== Starting fetch ===');
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        console.log('1. Current user:', user?.id);

        if (!user) {
          setData({ error: 'No user' });
          setLoading(false);
          return;
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        console.log('2. User profile:', userProfile);

        // Get supervisor record
        const { data: supervisor, error: supError } = await supabase
          .from('supervisors')
          .select('*')
          .eq('user_id', user.id)
          .single();
        console.log('3. Supervisor:', supervisor);
        console.log('3. Supervisor error:', supError);

        if (!supervisor) {
          setData({ error: 'No supervisor record', supError, userProfile });
          setLoading(false);
          return;
        }

        // Get assignments
        const { data: assignments, error: assignError } = await supabase
          .from('supervisor_trainee')
          .select('id, trainee_id, is_primary, assigned_date')
          .eq('supervisor_id', supervisor.id)
          .order('assigned_date', { ascending: false });
        console.log('4. Assignments:', assignments);
        console.log('4. Assignment error:', assignError);

        const traineeIds = (assignments || []).map((a: any) => a.trainee_id);
        console.log('5. Trainee IDs:', traineeIds);

        let finalTrainees: any[] = [];

        if (traineeIds.length > 0) {
          // Get trainees
          const { data: traineesData, error: traineesError } = await supabase
            .from('trainees')
            .select('id, user_id, institution_id, status, university, major, start_date, expected_end_date')
            .in('id', traineeIds);
          console.log('6. Trainees data:', traineesData);
          console.log('6. Trainees error:', traineesError);

          if (traineesData && traineesData.length > 0) {
            // Get user details
            const userIds = traineesData.map((t: any) => t.user_id).filter(Boolean);
            console.log('7. User IDs to fetch:', userIds);

            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('id, full_name, email, phone_number')
              .in('id', userIds);
            console.log('8. Users data:', usersData);
            console.log('8. Users error:', usersError);

            // Get institutions
            const institutionIds = traineesData.map((t: any) => t.institution_id).filter(Boolean);
            console.log('9. Institution IDs to fetch:', institutionIds);

            const { data: institutionsData, error: insError } = await supabase
              .from('institutions')
              .select('id, name, name_ar, location')
              .in('id', institutionIds);
            console.log('10. Institutions data:', institutionsData);
            console.log('10. Institutions error:', insError);

            // Combine data
            finalTrainees = traineesData.map((trainee: any) => {
              const assignment = assignments?.find((a: any) => a.trainee_id === trainee.id);
              const userRecord = usersData?.find((u: any) => u.id === trainee.user_id);
              const institution = institutionsData?.find((i: any) => i.id === trainee.institution_id);

              console.log(`Combining trainee ${trainee.id}:`, {
                hasUser: !!userRecord,
                hasInstitution: !!institution,
                userRecord,
                institution
              });

              return {
                ...trainee,
                user: userRecord,
                institution,
                is_primary_supervisor: assignment?.is_primary || false,
                assigned_date: assignment?.assigned_date,
              };
            });

            console.log('11. Before filter:', finalTrainees.length, finalTrainees);

            finalTrainees = finalTrainees.filter((t: any) => {
              const keep = t.user && t.institution;
              if (!keep) {
                console.log('Filtering out:', t.id, 'user:', !!t.user, 'institution:', !!t.institution);
              }
              return keep;
            });

            console.log('12. After filter:', finalTrainees.length, finalTrainees);
          }
        }

        setData({
          user,
          userProfile,
          supervisor,
          assignments,
          traineeIds,
          finalTrainees,
        });
      } catch (error) {
        console.error('Error:', error);
        setData({ error: String(error) });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">My Trainees Test (Client-Side)</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Raw Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        {data?.finalTrainees && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              Trainees Found: {data.finalTrainees.length}
            </h2>
            {data.finalTrainees.length === 0 ? (
              <p className="text-red-600">No trainees with complete data!</p>
            ) : (
              <div className="space-y-4">
                {data.finalTrainees.map((trainee: any) => (
                  <div key={trainee.id} className="border p-4 rounded">
                    <h3 className="font-bold">{trainee.user?.full_name || 'No name'}</h3>
                    <p className="text-sm text-gray-600">{trainee.user?.email || 'No email'}</p>
                    <p className="text-sm">
                      {locale === 'ar' ? trainee.institution?.name_ar : trainee.institution?.name}
                    </p>
                    <p className="text-sm">{trainee.university} - {trainee.major}</p>
                    <p className="text-xs text-gray-500">Status: {trainee.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
