-- ============================================
-- إصلاح: تعيين المتدربين للمشرفين
-- Fix: Assign Trainees to Supervisors
-- ============================================

-- Option 1: Assign specific trainee to supervisor
-- استبدل SUPERVISOR_ID و TRAINEE_ID بالقيم الفعلية
INSERT INTO public.supervisor_trainee (supervisor_id, trainee_id, assigned_at)
VALUES ('2f41342c-ce0b-4ce0-a809-364a5a572caf', 'TRAINEE_ID_HERE', NOW())
ON CONFLICT (supervisor_id, trainee_id) DO NOTHING;

-- Option 2: Assign ALL trainees to this supervisor
-- تعيين جميع المتدربين لهذا المشرف
INSERT INTO public.supervisor_trainee (supervisor_id, trainee_id, assigned_at)
SELECT '2f41342c-ce0b-4ce0-a809-364a5a572caf', id, NOW()
FROM public.trainees
ON CONFLICT (supervisor_id, trainee_id) DO NOTHING;

-- Option 3: Check current assignments
-- فحص التعيينات الحالية
SELECT 
  st.*,
  s.id as supervisor_id,
  su.full_name as supervisor_name,
  t.id as trainee_id,
  tu.full_name as trainee_name,
  i.name_ar as institution_name
FROM public.supervisor_trainee st
JOIN public.supervisors s ON st.supervisor_id = s.id
JOIN public.users su ON s.user_id = su.id
JOIN public.trainees t ON st.trainee_id = t.id
JOIN public.users tu ON t.user_id = tu.id
LEFT JOIN public.institutions i ON t.institution_id = i.id
WHERE s.id = '2f41342c-ce0b-4ce0-a809-364a5a572caf';

-- Option 4: Get all trainees (to find IDs)
-- الحصول على جميع المتدربين (لمعرفة معرفاتهم)
SELECT 
  t.id,
  u.full_name,
  u.email,
  i.name_ar as institution
FROM public.trainees t
JOIN public.users u ON t.user_id = u.id
LEFT JOIN public.institutions i ON t.institution_id = i.id
ORDER BY u.full_name;
