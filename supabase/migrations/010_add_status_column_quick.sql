-- Migration: Add status column to evaluations table (Quick Fix)
-- Created: 2025-11-14
-- Description: Add status column with default 'pending' value

-- إضافة عمود status
ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- تحديث التقييمات الموجودة
UPDATE public.evaluations SET status = 'pending' WHERE status IS NULL;

-- إضافة index للأداء
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON public.evaluations(status);

-- إضافة comment
COMMENT ON COLUMN public.evaluations.status IS 'حالة التقييم: pending, approved, rejected';
