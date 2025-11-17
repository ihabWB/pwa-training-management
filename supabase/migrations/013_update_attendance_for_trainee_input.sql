-- Update attendance table to support trainee self-registration and supervisor approval
-- This migration adds fields needed for trainee input and supervisor verification

-- Add approval fields to attendance table
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update RLS policies for attendance

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Supervisors can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Trainees can view own attendance" ON public.attendance;

-- Trainees can insert their own attendance
CREATE POLICY "Trainees can create own attendance" ON public.attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trainees
      WHERE id = attendance.trainee_id AND user_id = auth.uid()
    )
  );

-- Trainees can view their own attendance
CREATE POLICY "Trainees can view own attendance" ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trainees
      WHERE id = attendance.trainee_id AND user_id = auth.uid()
    )
  );

-- Trainees can update their own unapproved attendance
CREATE POLICY "Trainees can update own unapproved attendance" ON public.attendance
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trainees
      WHERE id = attendance.trainee_id AND user_id = auth.uid()
    )
    AND approved = FALSE
  );

-- Supervisors can view attendance of their trainees
CREATE POLICY "Supervisors can view trainees attendance" ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.supervisors s ON s.user_id = u.id
      JOIN public.supervisor_trainee st ON st.supervisor_id = s.id
      WHERE u.id = auth.uid() 
      AND st.trainee_id = attendance.trainee_id
      AND u.role = 'supervisor'
    )
  );

-- Supervisors can approve/reject attendance of their trainees
CREATE POLICY "Supervisors can approve trainees attendance" ON public.attendance
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.supervisors s ON s.user_id = u.id
      JOIN public.supervisor_trainee st ON st.supervisor_id = s.id
      WHERE u.id = auth.uid() 
      AND st.trainee_id = attendance.trainee_id
      AND u.role = 'supervisor'
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all attendance" ON public.attendance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster approval queries
CREATE INDEX IF NOT EXISTS idx_attendance_approved ON public.attendance(approved);
CREATE INDEX IF NOT EXISTS idx_attendance_approved_by ON public.attendance(approved_by);
