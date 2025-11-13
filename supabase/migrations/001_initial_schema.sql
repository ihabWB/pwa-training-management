-- ============================================
-- Palestinian Water Authority - Trainee Management System
-- Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'trainee');

-- User status enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'trainee',
  status user_status NOT NULL DEFAULT 'active',
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. INSTITUTIONS
-- ============================================

CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  location TEXT,
  description TEXT,
  focal_point_name TEXT,
  focal_point_phone TEXT,
  focal_point_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. SUPERVISORS
-- ============================================

CREATE TABLE public.supervisors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  position_title TEXT,
  position_title_ar TEXT,
  specialization TEXT,
  years_of_experience INTEGER,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. TRAINEES
-- ============================================

-- Trainee status enum
CREATE TYPE trainee_status AS ENUM ('active', 'completed', 'suspended', 'transferred', 'withdrawn');

CREATE TABLE public.trainees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  
  -- Personal Information
  national_id TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  address TEXT,
  
  -- Education
  university TEXT,
  major TEXT,
  graduation_year INTEGER,
  gpa DECIMAL(3, 2),
  
  -- Training Details
  start_date DATE NOT NULL,
  end_date DATE,
  expected_end_date DATE,
  status trainee_status DEFAULT 'active',
  
  -- Additional Info
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. SUPERVISOR-TRAINEE RELATIONSHIP (Many-to-Many)
-- ============================================

CREATE TABLE public.supervisor_trainee (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supervisor_id UUID REFERENCES public.supervisors(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES public.trainees(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  assigned_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(supervisor_id, trainee_id)
);

-- ============================================
-- 6. REPORTS
-- ============================================

-- Report type enum
CREATE TYPE report_type AS ENUM ('daily', 'weekly', 'monthly');

-- Report status enum
CREATE TYPE report_status AS ENUM ('pending', 'approved', 'rejected', 'revision_required');

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainee_id UUID REFERENCES public.trainees(id) ON DELETE CASCADE,
  report_type report_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Date tracking
  report_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Approval workflow
  status report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.supervisors(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  supervisor_comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_reports_trainee ON public.reports(trainee_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_date ON public.reports(report_date);

-- ============================================
-- 7. TASKS
-- ============================================

-- Task status enum
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'submitted', 'approved', 'rejected');

-- Task priority enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES public.trainees(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id),
  institution_id UUID REFERENCES public.institutions(id),
  
  -- Task details
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  due_date DATE,
  
  -- Completion
  completion_notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Review
  reviewed_by UUID REFERENCES public.supervisors(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_trainee ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- ============================================
-- 8. EVALUATIONS
-- ============================================

-- Evaluation type enum
CREATE TYPE evaluation_type AS ENUM ('monthly', 'quarterly', 'final', 'mid_term');

CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainee_id UUID REFERENCES public.trainees(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES public.supervisors(id) ON DELETE SET NULL,
  
  -- Evaluation details
  evaluation_type evaluation_type NOT NULL,
  evaluation_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  
  -- Scoring (out of 100)
  technical_skills_score INTEGER CHECK (technical_skills_score >= 0 AND technical_skills_score <= 100),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 100),
  teamwork_score INTEGER CHECK (teamwork_score >= 0 AND teamwork_score <= 100),
  initiative_score INTEGER CHECK (initiative_score >= 0 AND initiative_score <= 100),
  professionalism_score INTEGER CHECK (professionalism_score >= 0 AND professionalism_score <= 100),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Feedback
  strengths TEXT,
  areas_for_improvement TEXT,
  recommendations TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_evaluations_trainee ON public.evaluations(trainee_id);
CREATE INDEX idx_evaluations_date ON public.evaluations(evaluation_date);

-- ============================================
-- 9. ATTENDANCE
-- ============================================

CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused', 'late', 'half_day');

CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainee_id UUID REFERENCES public.trainees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  notes TEXT,
  recorded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(trainee_id, date)
);

CREATE INDEX idx_attendance_trainee ON public.attendance(trainee_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================

CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ar TEXT,
  message TEXT NOT NULL,
  message_ar TEXT,
  type notification_type DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

-- ============================================
-- 11. ACTIVITY LOGS
-- ============================================

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at);

-- ============================================
-- 12. SYSTEM SETTINGS
-- ============================================

CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
  ('max_file_size', '5242880'::jsonb, 'Maximum file upload size in bytes (5MB)'),
  ('allowed_file_types', '["pdf", "doc", "docx", "jpg", "jpeg", "png"]'::jsonb, 'Allowed file extensions'),
  ('report_reminder_days', '3'::jsonb, 'Days before report due date to send reminder'),
  ('task_reminder_days', '2'::jsonb, 'Days before task due date to send reminder');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supervisors_updated_at BEFORE UPDATE ON public.supervisors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainees_updated_at BEFORE UPDATE ON public.trainees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_trainee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- USERS table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (public.get_user_role() = 'admin');

-- TRAINEES table policies
CREATE POLICY "Trainees can view own data" ON public.trainees
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Supervisors can view assigned trainees" ON public.trainees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.supervisor_trainee st
      INNER JOIN public.supervisors s ON s.id = st.supervisor_id
      WHERE st.trainee_id = trainees.id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage trainees" ON public.trainees
  FOR ALL USING (public.get_user_role() = 'admin');

-- REPORTS table policies
CREATE POLICY "Trainees can manage own reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trainees WHERE id = reports.trainee_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can view assigned trainee reports" ON public.reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.supervisor_trainee st
      INNER JOIN public.supervisors s ON s.id = st.supervisor_id
      WHERE st.trainee_id = reports.trainee_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can review reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.supervisor_trainee st
      INNER JOIN public.supervisors s ON s.id = st.supervisor_id
      WHERE st.trainee_id = reports.trainee_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reports" ON public.reports
  FOR ALL USING (public.get_user_role() = 'admin');

-- TASKS table policies
CREATE POLICY "Trainees can view assigned tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trainees WHERE id = tasks.assigned_to AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trainees can update assigned tasks" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trainees WHERE id = tasks.assigned_to AND user_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can view institution tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.supervisors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tasks" ON public.tasks
  FOR ALL USING (public.get_user_role() = 'admin');

-- NOTIFICATIONS table policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Simple SELECT policies for read-only tables
CREATE POLICY "All authenticated users can view institutions" ON public.institutions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage institutions" ON public.institutions
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "All authenticated users can view supervisors" ON public.supervisors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage supervisors" ON public.supervisors
  FOR ALL USING (public.get_user_role() = 'admin');

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage buckets (run these in Supabase Dashboard > Storage)
-- 1. reports_attachments
-- 2. task_attachments
-- 3. profile_pictures
-- 4. evaluation_documents

-- Storage policies will be added via Supabase Dashboard

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Trainee Overview
CREATE OR REPLACE VIEW public.trainee_overview AS
SELECT 
  t.id,
  t.user_id,
  u.full_name,
  u.email,
  u.phone_number,
  t.status,
  i.name AS institution_name,
  t.start_date,
  t.end_date,
  COUNT(DISTINCT r.id) AS total_reports,
  COUNT(DISTINCT tk.id) AS total_tasks,
  AVG(e.overall_score) AS average_evaluation_score
FROM public.trainees t
LEFT JOIN public.users u ON t.user_id = u.id
LEFT JOIN public.institutions i ON t.institution_id = i.id
LEFT JOIN public.reports r ON t.id = r.trainee_id
LEFT JOIN public.tasks tk ON t.id = tk.assigned_to
LEFT JOIN public.evaluations e ON t.id = e.trainee_id
GROUP BY t.id, u.full_name, u.email, u.phone_number, t.status, i.name, t.start_date, t.end_date;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- This will be added separately for testing purposes
