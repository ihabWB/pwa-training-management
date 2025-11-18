-- Create announcements system for admin to post announcements and workshops
-- Announcements will appear in trainee and supervisor dashboards

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  content TEXT NOT NULL,
  content_ar TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'workshop', 'circular')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  target_all BOOLEAN DEFAULT FALSE,
  
  -- Workshop specific fields
  workshop_date TIMESTAMP WITH TIME ZONE,
  workshop_type TEXT, -- 'online', 'in-person', 'hybrid'
  workshop_location TEXT,
  workshop_location_ar TEXT,
  
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create announcement recipients table (for targeted announcements)
CREATE TABLE IF NOT EXISTS public.announcement_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL REFERENCES public.trainees(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, trainee_id)
);

-- RLS Policies for announcements

-- Admins can do everything
CREATE POLICY "Admins can manage all announcements" ON public.announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trainees can view announcements targeted to them or all
CREATE POLICY "Trainees can view their announcements" ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE AND (
      target_all = TRUE OR
      EXISTS (
        SELECT 1 FROM public.trainees t
        JOIN public.announcement_recipients ar ON ar.trainee_id = t.id
        WHERE t.user_id = auth.uid() 
        AND ar.announcement_id = announcements.id
      )
    )
  );

-- Supervisors can view announcements of their trainees
CREATE POLICY "Supervisors can view trainees announcements" ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.supervisors s ON s.user_id = u.id
      JOIN public.supervisor_trainee st ON st.supervisor_id = s.id
      JOIN public.announcement_recipients ar ON ar.trainee_id = st.trainee_id
      WHERE u.id = auth.uid() 
      AND ar.announcement_id = announcements.id
      AND u.role = 'supervisor'
    )
  );

-- RLS Policies for announcement_recipients

-- Admins can manage all recipients
CREATE POLICY "Admins can manage all recipients" ON public.announcement_recipients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trainees can view their own recipient records
CREATE POLICY "Trainees can view own recipient records" ON public.announcement_recipients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trainees
      WHERE id = announcement_recipients.trainee_id AND user_id = auth.uid()
    )
  );

-- Trainees can update their own read status
CREATE POLICY "Trainees can update own read status" ON public.announcement_recipients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trainees
      WHERE id = announcement_recipients.trainee_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trainees
      WHERE id = announcement_recipients.trainee_id AND user_id = auth.uid()
    )
  );

-- Supervisors can view recipient records of their trainees
CREATE POLICY "Supervisors can view trainees recipient records" ON public.announcement_recipients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.supervisors s ON s.user_id = u.id
      JOIN public.supervisor_trainee st ON st.supervisor_id = s.id
      WHERE u.id = auth.uid() 
      AND st.trainee_id = announcement_recipients.trainee_id
      AND u.role = 'supervisor'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_type ON public.announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON public.announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_announcement ON public.announcement_recipients(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_trainee ON public.announcement_recipients(trainee_id);
CREATE INDEX IF NOT EXISTS idx_announcement_recipients_read_at ON public.announcement_recipients(read_at);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_recipients ENABLE ROW LEVEL SECURITY;
