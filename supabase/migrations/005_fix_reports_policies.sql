-- ============================================
-- إصلاح سياسات RLS لجدول reports
-- تطبيق الآلية المتوازية: المشرف والأدمن يريان التقارير معًا
-- ============================================

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.reports;

-- إنشاء سياسة جديدة للأدمن بدون استخدام get_user_role()
CREATE POLICY "Admins can manage all reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- التأكد من السياسات الحالية:
-- ============================================
-- ✅ "Trainees can manage own reports" - المتدرب يدير تقاريره
-- ✅ "Supervisors can view assigned trainee reports" - المشرف يرى تقارير متدربيه
-- ✅ "Supervisors can review reports" - المشرف يراجع ويعتمد التقارير
-- ✅ "Admins can manage all reports" - الأدمن يرى ويدير جميع التقارير

-- ============================================
-- ملاحظة: الآلية المتوازية الآن مفعلة:
-- - المتدرب يرفع تقرير (pending)
-- - المشرف يراه فورًا ويراجعه
-- - الأدمن يراه فورًا أيضًا للمتابعة
-- - المشرف يعتمد/يرفض (approved/rejected/revision_required)
-- - الأدمن يستطيع التدخل في أي وقت
-- ============================================
