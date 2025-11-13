-- ============================================
-- بيانات تجريبية للاختبار
-- Sample Data for Testing
-- ============================================

-- إضافة مؤسسات تجريبية
INSERT INTO public.institutions (name, name_ar, location, focal_point_name, focal_point_phone, focal_point_email) VALUES
  ('Coastal Water Utility - Gaza', 'شركة مياه الساحل - غزة', 'Gaza City', 'أحمد محمد الفرا', '0599123456', 'ahmad.farra@water-gaza.ps'),
  ('Ramallah Water Utility', 'شركة مياه رام الله', 'Ramallah', 'سارة علي حسن', '0598765432', 'sara.ali@water-ram.ps'),
  ('Nablus Water Utility', 'شركة مياه نابلس', 'Nablus', 'خالد حسن قاسم', '0597654321', 'khaled.hassan@water-nablus.ps'),
  ('Hebron Water Authority', 'سلطة مياه الخليل', 'Hebron', 'مريم أحمد زيد', '0596543210', 'mariam.ahmad@water-hebron.ps'),
  ('Bethlehem Water Department', 'دائرة مياه بيت لحم', 'Bethlehem', 'يوسف محمود عيسى', '0595432109', 'youssef.issa@water-beth.ps');

-- الحصول على IDs المؤسسات
DO $$
DECLARE
  gaza_id UUID;
  ramallah_id UUID;
  nablus_id UUID;
  hebron_id UUID;
  bethlehem_id UUID;
BEGIN
  -- Get institution IDs
  SELECT id INTO gaza_id FROM public.institutions WHERE name LIKE '%Gaza%' LIMIT 1;
  SELECT id INTO ramallah_id FROM public.institutions WHERE name LIKE '%Ramallah%' LIMIT 1;
  SELECT id INTO nablus_id FROM public.institutions WHERE name LIKE '%Nablus%' LIMIT 1;
  SELECT id INTO hebron_id FROM public.institutions WHERE name LIKE '%Hebron%' LIMIT 1;
  SELECT id INTO bethlehem_id FROM public.institutions WHERE name LIKE '%Bethlehem%' LIMIT 1;
END $$;

-- ============================================
-- ملاحظة مهمة: إنشاء المستخدمين
-- IMPORTANT: Creating Users
-- ============================================
-- 
-- يجب إنشاء المستخدمين عبر Supabase Dashboard > Authentication أولاً
-- ثم إضافة بياناتهم في جدول users
-- 
-- خطوات إنشاء مستخدم Admin تجريبي:
-- Steps to create a test Admin user:
-- 
-- 1. اذهب إلى: Supabase Dashboard > Authentication > Users
--    Go to: Supabase Dashboard > Authentication > Users
-- 
-- 2. اضغط "Add User" ثم "Create new user"
--    Click "Add User" then "Create new user"
-- 
-- 3. املأ البيانات التالية:
--    Fill in the following data:
--    Email: admin@pwa.ps
--    Password: Admin@123456
--    Auto Confirm User: ✓ (مهم / Important)
-- 
-- 4. بعد إنشاء المستخدم، انسخ الـ User UID
--    After creating the user, copy the User UID
-- 
-- 5. نفذ SQL التالي (استبدل 'USER-UUID-HERE' بالـ UID الفعلي):
--    Execute the following SQL (replace 'USER-UUID-HERE' with actual UID):
-- 
-- INSERT INTO public.users (id, email, full_name, phone_number, role, status, profile_completed)
-- VALUES (
--   'USER-UUID-HERE',  -- استبدل هذا بالـ UUID الفعلي من Authentication
--   'admin@pwa.ps',
--   'مدير النظام',
--   '0599000000',
--   'admin',
--   'active',
--   true
-- );
-- 
-- ============================================
-- مثال: إنشاء متدرب تجريبي
-- Example: Creating a test trainee
-- ============================================
-- 
-- 1. أنشئ مستخدم في Authentication (نفس الخطوات أعلاه):
--    Email: trainee1@pwa.ps
--    Password: Trainee@123
-- 
-- 2. نفذ (استبدل USER-UUID و INSTITUTION-UUID):
-- 
-- INSERT INTO public.users (id, email, full_name, phone_number, role, status, profile_completed)
-- VALUES (
--   'TRAINEE-USER-UUID-HERE',
--   'trainee1@pwa.ps',
--   'أحمد محمد علي',
--   '0599111222',
--   'trainee',
--   'active',
--   true
-- );
--
-- INSERT INTO public.trainees (
--   user_id, 
--   institution_id, 
--   start_date, 
--   expected_end_date, 
--   university, 
--   major, 
--   graduation_year, 
--   status
-- )
-- VALUES (
--   'TRAINEE-USER-UUID-HERE',
--   (SELECT id FROM public.institutions WHERE name LIKE '%Gaza%' LIMIT 1),
--   '2024-01-15',
--   '2024-07-15',
--   'الجامعة الإسلامية - غزة',
--   'هندسة مدنية',
--   2023,
--   'active'
-- );
-- 
-- ============================================
-- مثال: إنشاء مشرف تجريبي
-- Example: Creating a test supervisor
-- ============================================
-- 
-- 1. أنشئ مستخدم في Authentication:
--    Email: supervisor1@pwa.ps
--    Password: Super@123
-- 
-- 2. نفذ:
-- 
-- INSERT INTO public.users (id, email, full_name, phone_number, role, status, profile_completed)
-- VALUES (
--   'SUPERVISOR-USER-UUID-HERE',
--   'supervisor1@pwa.ps',
--   'خالد أحمد حسن',
--   '0598333444',
--   'supervisor',
--   'active',
--   true
-- );
--
-- INSERT INTO public.supervisors (
--   user_id,
--   institution_id,
--   department,
--   position,
--   specialization
-- )
-- VALUES (
--   'SUPERVISOR-USER-UUID-HERE',
--   (SELECT id FROM public.institutions WHERE name LIKE '%Gaza%' LIMIT 1),
--   'قسم الهندسة',
--   'مهندس أول',
--   'هندسة المياه والصرف الصحي'
-- );

-- إضافة إعدادات إضافية
INSERT INTO public.settings (key, value, description) VALUES
  ('training_duration_months', '6'::jsonb, 'Default training period in months'),
  ('min_attendance_rate', '80'::jsonb, 'Minimum attendance rate percentage'),
  ('report_frequency', '{"daily": true, "weekly": true, "monthly": true}'::jsonb, 'Enabled report frequencies'),
  ('evaluation_frequency', '"monthly"'::jsonb, 'Default evaluation frequency')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Storage Policies for File Uploads
-- ============================================

-- Note: Execute these in Supabase Dashboard > Storage after creating buckets

-- Policy for reports_attachments bucket:
-- CREATE POLICY "Authenticated users can upload reports"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'reports_attachments');

-- CREATE POLICY "Users can view their own reports"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'reports_attachments');

-- CREATE POLICY "Admins can view all reports"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'reports_attachments' 
--   AND EXISTS (
--     SELECT 1 FROM public.users 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );

COMMENT ON TABLE public.institutions IS 'جدول المؤسسات التدريبية';
COMMENT ON TABLE public.trainees IS 'جدول المتدربين';
COMMENT ON TABLE public.supervisors IS 'جدول المشرفين';
COMMENT ON TABLE public.reports IS 'جدول التقارير';
COMMENT ON TABLE public.tasks IS 'جدول المهام';
COMMENT ON TABLE public.evaluations IS 'جدول التقييمات';
