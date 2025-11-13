# دليل إعداد المشروع - نظام إدارة المتدربين
# Palestinian Water Authority - Trainee Management System Setup Guide

## 📋 المتطلبات الأساسية / Prerequisites

1. **Node.js** - الإصدار 18 أو أحدث
2. **npm** أو **yarn** أو **pnpm**
3. **حساب Supabase** - مجاني من supabase.com
4. **حساب Firebase** - مجاني من firebase.google.com

---

## 🚀 خطوات الإعداد / Setup Steps

### 1. تثبيت المكتبات / Install Dependencies

```bash
npm install
```

### 2. إعداد قاعدة البيانات Supabase

#### أ. إنشاء مشروع جديد في Supabase
1. اذهب إلى https://supabase.com/dashboard
2. انقر على "New Project"
3. اختر اسم المشروع وكلمة المرور للقاعدة

#### ب. تنفيذ Schema
1. اذهب إلى **SQL Editor** في لوحة Supabase
2. افتح ملف `supabase/migrations/001_initial_schema.sql`
3. انسخ المحتوى كاملاً
4. الصقه في SQL Editor
5. اضغط **Run**

#### ج. إعداد Storage Buckets
1. اذهب إلى **Storage** في Supabase
2. أنشئ Buckets التالية:
   - `reports_attachments` (Public)
   - `task_attachments` (Public)
   - `profile_pictures` (Public)
   - `evaluation_documents` (Private)

#### د. الحصول على API Keys
1. اذهب إلى **Settings** > **API**
2. انسخ:
   - Project URL
   - anon/public key

### 3. إعداد ملف البيئة / Environment Variables

```bash
# انسخ ملف المثال
cp .env.example .env.local
```

افتح `.env.local` وأضف البيانات:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. تشغيل المشروع / Run Development Server

```bash
npm run dev
```

افتح المتصفح على: http://localhost:3000

---

## 📊 إضافة بيانات تجريبية / Add Sample Data

### إنشاء مستخدم Admin أول

1. اذهب إلى **Authentication** في Supabase
2. انقر **Add User**
3. أدخل:
   - Email: `admin@pwa.ps`
   - Password: `Admin@123456`
4. اذهب إلى **SQL Editor** ونفذ:

```sql
-- إضافة المستخدم إلى جدول users
INSERT INTO public.users (id, email, full_name, role, status, profile_completed)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@pwa.ps'),
  'admin@pwa.ps',
  'System Administrator',
  'admin',
  'active',
  true
);
```

### إضافة مؤسسات تجريبية

```sql
INSERT INTO public.institutions (name, name_ar, location, focal_point_name, focal_point_phone, focal_point_email) VALUES
  ('Water Supply Company - Gaza', 'شركة مياه الساحل - غزة', 'Gaza City', 'أحمد محمد', '0599123456', 'ahmad@water-gaza.ps'),
  ('Water Supply Company - Ramallah', 'شركة مياه رام الله', 'Ramallah', 'سارة علي', '0598765432', 'sara@water-ram.ps'),
  ('Water Supply Company - Nablus', 'شركة مياه نابلس', 'Nablus', 'خالد حسن', '0597654321', 'khaled@water-nablus.ps');
```

---

## 🔐 تسجيل الدخول / Login Credentials

بعد إنشاء المستخدم الأول:

- **Email:** `admin@pwa.ps`
- **Password:** `Admin@123456`

---

## 🏗️ هيكل المشروع / Project Structure

```
pwatrain/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Localization (ar/en)
│   │   ├── login/               # Login page
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── trainees/            # Trainees management
│   │   ├── supervisors/         # Supervisors management
│   │   ├── institutions/        # Institutions management
│   │   ├── reports/             # Reports management
│   │   ├── tasks/               # Tasks management
│   │   └── evaluations/         # Evaluations management
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # UI components
│   └── layout/                  # Layout components
├── lib/
│   ├── supabase/                # Supabase client & auth
│   └── utils.ts                 # Utility functions
├── types/
│   └── database.ts              # TypeScript types
├── messages/
│   ├── ar.json                  # Arabic translations
│   └── en.json                  # English translations
├── supabase/
│   └── migrations/              # Database migrations
└── package.json
```

---

## 📱 الميزات الأساسية / Core Features

### ✅ تم التنفيذ / Implemented

1. ✅ قاعدة بيانات كاملة مع RLS
2. ✅ نظام المصادقة (Supabase Auth)
3. ✅ دعم اللغتين (العربية/الإنجليزية)
4. ✅ واجهة مستخدم عصرية (TailwindCSS)
5. ✅ مكونات UI قابلة لإعادة الاستخدام

### 🔜 قيد التطوير / In Progress

1. 🔜 لوحات التحكم (Admin/Supervisor/Trainee)
2. 🔜 نظام التقارير والمهام
3. 🔜 نظام التقييمات
4. 🔜 تصدير البيانات (Excel/CSV/PDF)
5. 🔜 الإشعارات والتنبيهات
6. 🔜 Firebase Hosting & Functions

---

## 🛠️ الأوامر المتاحة / Available Commands

```bash
# تشغيل السيرفر التطويري
npm run dev

# بناء المشروع للإنتاج
npm run build

# تشغيل المشروع في وضع الإنتاج
npm run start

# فحص الأخطاء
npm run lint
```

---

## 📝 ملاحظات مهمة / Important Notes

### 1. الأمان
- **لا تشارك** ملف `.env.local` أبداً
- استخدم كلمات مرور قوية
- فعّل Two-Factor Authentication في Supabase

### 2. Row Level Security (RLS)
- جميع الجداول محمية بـ RLS
- المستخدمون يرون فقط البيانات المصرح لهم

### 3. رفع الملفات
- الحد الأقصى لحجم الملف: **5MB**
- الصيغ المدعومة: PDF, DOC, DOCX, JPG, PNG

### 4. اللغات
- اللغة الافتراضية: **العربية**
- تبديل اللغة من Navbar

---

## 🐛 حل المشاكل / Troubleshooting

### مشكلة: لا يمكن الاتصال بـ Supabase

**الحل:**
1. تأكد من صحة `NEXT_PUBLIC_SUPABASE_URL`
2. تأكد من صحة `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. تأكد من تفعيل RLS Policies

### مشكلة: خطأ في تسجيل الدخول

**الحل:**
1. تأكد من تنفيذ SQL Schema كاملاً
2. تأكد من إضافة المستخدم في جدول `users`
3. تحقق من دور المستخدم (role)

### مشكلة: الصور لا تظهر

**الحل:**
1. تأكد من إنشاء Storage Buckets
2. تأكد من أن Buckets مضبوطة على Public
3. تحقق من Storage Policies

---

## 📞 الدعم / Support

للمساعدة أو الاستفسارات:
- البريد الإلكتروني: support@pwa.ps
- الوثائق: [اقرأ الوثائق الكاملة]

---

## 📄 الترخيص / License

هذا المشروع مخصص لسلطة المياه الفلسطينية والبنك الدولي.
جميع الحقوق محفوظة © 2025
