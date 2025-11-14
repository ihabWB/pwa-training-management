-- ============================================
-- تحسين جدول التقييمات لإضافة سير العمل (Workflow)
-- ============================================

-- إضافة حالة التقييم (مثل التقارير)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evaluation_status') THEN
    CREATE TYPE evaluation_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- إضافة حقول جديدة لجدول evaluations
ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS status evaluation_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS admin_feedback TEXT;

-- إضافة تعليقات توضيحية
COMMENT ON COLUMN public.evaluations.status IS 'حالة التقييم: pending (معلق), approved (معتمد), rejected (مرفوض)';
COMMENT ON COLUMN public.evaluations.approved_by IS 'الإدارة التي اعتمدت التقييم';
COMMENT ON COLUMN public.evaluations.approved_at IS 'تاريخ اعتماد التقييم';
COMMENT ON COLUMN public.evaluations.admin_feedback IS 'ملاحظات الإدارة على التقييم';

-- إنشاء index للأداء
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON public.evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_approved_by ON public.evaluations(approved_by);
