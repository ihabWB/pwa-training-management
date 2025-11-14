'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestRLSPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function test() {
      const testUserId = '574ec276-7b29-41ce-9a71-d65b1ab3f711';

      // Test 1: Direct query by ID
      const { data: test1, error: error1 } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId)
        .single();

      console.log('Test 1 - Direct query:', test1, error1);

      // Test 2: Query with in
      const { data: test2, error: error2 } = await supabase
        .from('users')
        .select('*')
        .in('id', [testUserId]);

      console.log('Test 2 - In query:', test2, error2);

      // Test 3: Get all users
      const { data: test3, error: error3 } = await supabase
        .from('users')
        .select('*')
        .limit(10);

      console.log('Test 3 - All users:', test3, error3);

      // Test 4: Get current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);

      // Test 5: Try with service role (won't work from client, but let's see the error)
      const { data: test5, error: error5 } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId);

      console.log('Test 5 - Another try:', test5, error5);

      setResults({
        testUserId,
        test1: { data: test1, error: error1?.message },
        test2: { data: test2, error: error2?.message },
        test3: { data: test3, error: error3?.message, count: test3?.length },
        currentUser: user?.id,
        test5: { data: test5, error: error5?.message },
      });
      setLoading(false);
    }

    test();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">RLS Test</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p>Testing...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">RLS (Row Level Security) Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h3 className="font-bold text-yellow-900 mb-2">Expected Results:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• If Test 1 and Test 2 return null/empty: <strong>RLS is blocking access</strong></li>
            <li>• If Test 3 shows users but Test 1/2 don't: <strong>Specific user is blocked</strong></li>
            <li>• If all tests return empty: <strong>RLS policy issue</strong></li>
            <li>• If tests return data: <strong>User exists and is accessible</strong></li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">Next Steps:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Check the console for detailed error messages</li>
            <li>2. If RLS is blocking, we need to update the policy</li>
            <li>3. If user doesn't exist, we need to create it</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
