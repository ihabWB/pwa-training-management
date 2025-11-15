-- Migration: Fix RLS policies for tasks table to allow supervisors to create tasks
-- Created: 2025-11-15
-- Description: Add INSERT and UPDATE policies for supervisors to manage tasks for their assigned trainees

-- Drop existing supervisor policy if exists (we'll recreate it)
DROP POLICY IF EXISTS "Supervisors can view institution tasks" ON public.tasks;

-- Allow supervisors to SELECT tasks for their assigned trainees
CREATE POLICY "Supervisors can view their trainees tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM public.supervisors s
      JOIN public.supervisor_trainee st ON st.supervisor_id = s.id
      WHERE s.user_id = auth.uid() 
        AND st.trainee_id = tasks.assigned_to
    )
  );

-- Allow supervisors to INSERT tasks for their assigned trainees
CREATE POLICY "Supervisors can create tasks for their trainees" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.supervisors s
      JOIN public.supervisor_trainee st ON st.supervisor_id = s.id
      WHERE s.user_id = auth.uid() 
        AND st.trainee_id = tasks.assigned_to
    )
  );

-- Allow supervisors to UPDATE tasks for their assigned trainees
CREATE POLICY "Supervisors can update their trainees tasks" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 
      FROM public.supervisors s
      JOIN public.supervisor_trainee st ON st.supervisor_id = s.id
      WHERE s.user_id = auth.uid() 
        AND st.trainee_id = tasks.assigned_to
    )
  );

-- Allow supervisors to DELETE tasks for their assigned trainees
CREATE POLICY "Supervisors can delete their trainees tasks" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 
      FROM public.supervisors s
      JOIN public.supervisor_trainee st ON st.supervisor_id = s.id
      WHERE s.user_id = auth.uid() 
        AND st.trainee_id = tasks.assigned_to
    )
  );

-- Add comment
COMMENT ON TABLE public.tasks IS 'Tasks table with RLS policies: trainees can view/update their tasks, supervisors can manage tasks for their assigned trainees, admins can manage all tasks';
