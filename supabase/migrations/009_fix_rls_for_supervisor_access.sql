-- Fix RLS policies to allow supervisors to read user and institution data

-- Allow supervisors to read users table (for trainee names)
DROP POLICY IF EXISTS "Supervisors can read assigned trainee users" ON users;
CREATE POLICY "Supervisors can read assigned trainee users"
  ON users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM supervisors
    )
  );

-- Allow supervisors to read institutions table (for trainee institutions)
DROP POLICY IF EXISTS "Supervisors can read institutions" ON institutions;
CREATE POLICY "Supervisors can read institutions"
  ON institutions FOR SELECTps://pwa-hydro360.vercel.app/en/evaluations
  USING (
    auth.uid() IN (
      SELECT user_id FROM supervisors
    )
  );

-- Also ensure users can read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to read institutions
DROP POLICY IF EXISTS "Authenticated users can read institutions" ON institutions;
CREATE POLICY "Authenticated users can read institutions"
  ON institutions FOR SELECT
  TO authenticated
  USING (true);
