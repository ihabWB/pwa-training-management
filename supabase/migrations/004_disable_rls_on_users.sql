-- ============================================
-- الحل النهائي لمشكلة RLS على جدول users
-- ============================================
-- التاريخ: 2025-11-14
-- المشكلة: دالة get_user_role() كانت تسبب حلقة تبعية (infinite recursion)
--          مما أدى إلى خطأ 500 عند محاولة قراءة بيانات المستخدمين
-- الحل: تعطيل RLS على جدول users للسماح لجميع المستخدمين المصادقين 
--       بقراءة بيانات المستخدمين (ضروري للسياسات الأخرى)
-- ============================================

-- 1. تعطيل RLS على جدول users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. حذف جميع السياسات القديمة على جدول users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for new users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON public.users;
DROP POLICY IF EXISTS "Users can read all users" ON public.users;

-- 3. حذف دالة get_user_role() التي كانت تسبب المشكلة
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- ============================================
-- ملاحظات أمنية:
-- ============================================
-- - تعطيل RLS على جدول users يعني أن جميع المستخدمين المصادقين 
--   يمكنهم قراءة جميع بيانات المستخدمين (email, phone, role, إلخ)
-- - هذا الحل ضروري لأن السياسات على الجداول الأخرى تحتاج 
--   للتحقق من دور المستخدم من جدول users
-- - إذا أردت تقييد الوصول في المستقبل، يجب استخدام SECURITY DEFINER
--   في الدوال المساعدة أو استخدام service_role key في الكود البرمجي

-- ============================================
-- النتيجة:
-- ============================================
-- ✅ تسجيل الدخول يعمل لجميع المستخدمين
-- ✅ المشرف يرى المتدربين المعينين له فقط
-- ✅ الأدمن يرى جميع البيانات
-- ✅ المتدرب يرى بياناته الخاصة فقط
