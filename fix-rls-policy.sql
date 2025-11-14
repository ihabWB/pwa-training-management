-- RLS Policy Fix for Supervisors to see their trainees

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can read their assigned trainees" ON users;

-- Create new policy: Supervisors can read users who are their assigned trainees
CREATE POLICY "Supervisors can read their assigned trainees"
ON users
FOR SELECT
USING (
  -- User can read their own data
  auth.uid() = id
  OR
  -- Admins can read all users
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
  OR
  -- Supervisors can read their assigned trainees' user data
  EXISTS (
    SELECT 1 FROM supervisors s
    INNER JOIN supervisor_trainee st ON st.supervisor_id = s.id
    INNER JOIN trainees t ON t.id = st.trainee_id
    WHERE s.user_id = auth.uid()
    AND t.user_id = users.id
  )
);
