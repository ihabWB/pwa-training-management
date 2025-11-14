-- ============================================
-- تحسين جدول التقارير بإضافة حقول جديدة
-- ============================================

-- إضافة حقول جديدة لجدول reports
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS work_done TEXT,
  ADD COLUMN IF NOT EXISTS challenges TEXT,
  ADD COLUMN IF NOT EXISTS next_steps TEXT,
  ADD COLUMN IF NOT EXISTS hours_worked DECIMAL(4, 2),
  ADD COLUMN IF NOT EXISTS productivity_level INTEGER CHECK (productivity_level >= 1 AND productivity_level <= 5);

-- إضافة تعليقات توضيحية
COMMENT ON COLUMN public.reports.work_done IS 'العمل المنجز خلال الفترة';
COMMENT ON COLUMN public.reports.challenges IS 'التحديات والصعوبات المواجهة';
COMMENT ON COLUMN public.reports.next_steps IS 'الخطوات القادمة والخطط';
COMMENT ON COLUMN public.reports.hours_worked IS 'عدد ساعات العمل';
COMMENT ON COLUMN public.reports.productivity_level IS 'مستوى الإنتاجية من 1 إلى 5';

-- تحديث الحقل content ليصبح اختيارياً (nullable)
-- لأننا الآن نستخدم work_done, challenges, next_steps
ALTER TABLE public.reports
  ALTER COLUMN content DROP NOT NULL;
