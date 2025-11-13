# Palestinian Water Authority - Trainee Management System

نظام إدارة برنامج تدريب مهندسين حديثي التخرج - سلطة المياه الفلسطينية

## المميزات

- ✅ إدارة متكاملة للمتدربين والمشرفين والمؤسسات
- ✅ نظام تقارير يومية/أسبوعية/شهرية
- ✅ نظام المهام والتقييمات
- ✅ لوحات تحكم متعددة حسب الصلاحيات
- ✅ دعم اللغتين العربية والإنجليزية
- ✅ تصدير البيانات (Excel/CSV)
- ✅ إشعارات وتنبيهات

## التقنيات المستخدمة

- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **Database:** Supabase
- **Hosting:** Firebase
- **Auth:** Supabase Auth

## البدء

```bash
# تثبيت المكتبات
npm install

# تشغيل المشروع
npm run dev
```

## إعداد البيئة

أنشئ ملف `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## الصلاحيات

- **Admin**: إدارة كاملة للنظام
- **Supervisor**: متابعة المتدربين والتقييم
- **Trainee**: رفع التقارير والمهام
