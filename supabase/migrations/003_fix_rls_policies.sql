-- ============================================
-- Fix RLS Policies for supervisor_trainee
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage supervisor-trainee assignments" ON public.supervisor_trainee;
DROP POLICY IF EXISTS "Supervisors can view their assignments" ON public.supervisor_trainee;
DROP POLICY IF EXISTS "Admins can manage supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Supervisors can view own profile" ON public.supervisors;
DROP POLICY IF EXISTS "All authenticated users can view supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Admins can manage all evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Supervisors can create evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Supervisors can view own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Trainees can view own evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Supervisors can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Trainees can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
DROP POLICY IF EXISTS "All authenticated users can view settings" ON public.settings;

-- Add RLS policies for supervisor_trainee table
CREATE POLICY "Admins can manage supervisor-trainee assignments" ON public.supervisor_trainee
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Supervisors can view their assignments" ON public.supervisor_trainee
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.supervisors 
      WHERE id = supervisor_trainee.supervisor_id AND user_id = auth.uid()
    )
  );

-- Add missing policies for supervisors table
CREATE POLICY "Admins can manage supervisors" ON public.supervisors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Supervisors can view own profile" ON public.supervisors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "All authenticated users can view supervisors" ON public.supervisors
  FOR SELECT USING (auth.role() = 'authenticated');

-- Add missing policies for evaluations table
CREATE POLICY "Admins can manage all evaluations" ON public.evaluations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Supervisors can create evaluations" ON public.evaluations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.supervisors 
      WHERE id = evaluations.supervisor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can view own evaluations" ON public.evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.supervisors 
      WHERE id = evaluations.supervisor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trainees can view own evaluations" ON public.evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trainees 
      WHERE id = evaluations.trainee_id AND user_id = auth.uid()
    )
  );

-- Add missing policies for attendance table
CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Supervisors can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.supervisors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Trainees can view own attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trainees 
      WHERE id = attendance.trainee_id AND user_id = auth.uid()
    )
  );

-- Add missing policies for activity_logs table
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (user_id = auth.uid());

-- Add missing policies for settings table
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can view settings" ON public.settings
  FOR SELECT USING (auth.role() = 'authenticated');
