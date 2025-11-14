'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface BrokenTrainee {
  trainee: any;
  authUserExists: boolean;
  authUserEmail?: string;
}

interface FixTraineeUsersFormProps {
  brokenTrainees: BrokenTrainee[];
  locale: string;
}

export default function FixTraineeUsersForm({
  brokenTrainees,
  locale,
}: FixTraineeUsersFormProps) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleCreateUserRecord = async (traineeData: BrokenTrainee) => {
    const traineeId = traineeData.trainee.id;
    setLoading((prev) => ({ ...prev, [traineeId]: true }));
    setError((prev) => ({ ...prev, [traineeId]: '' }));

    try {
      // Create user record in users table
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: traineeData.trainee.user_id,
          email: traineeData.authUserEmail || 'unknown@email.com',
          full_name: 'اسم مؤقت - يرجى التحديث',
          phone_number: '',
          role: 'trainee',
          status: 'active',
          profile_completed: false,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess((prev) => ({ ...prev, [traineeId]: true }));
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error('Error creating user record:', err);
      setError((prev) => ({ ...prev, [traineeId]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [traineeId]: false }));
    }
  };

  const handleDeleteTrainee = async (traineeId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المتدرب؟' : 'Are you sure you want to delete this trainee?')) {
      return;
    }

    setLoading((prev) => ({ ...prev, [traineeId]: true }));
    setError((prev) => ({ ...prev, [traineeId]: '' }));

    try {
      // Delete trainee record (this will also delete supervisor_trainee records due to CASCADE)
      const { error: deleteError } = await supabase
        .from('trainees')
        .delete()
        .eq('id', traineeId);

      if (deleteError) {
        throw deleteError;
      }

      setSuccess((prev) => ({ ...prev, [traineeId]: true }));
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error('Error deleting trainee:', err);
      setError((prev) => ({ ...prev, [traineeId]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [traineeId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {brokenTrainees.map((item) => {
        const trainee = item.trainee;
        const traineeId = trainee.id;

        return (
          <div key={traineeId} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              {/* Trainee Info */}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {locale === 'ar' ? 'معلومات المتدرب' : 'Trainee Information'}
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Trainee ID:</span> {trainee.id}
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span> {trainee.user_id}
                  </div>
                  <div>
                    <span className="font-medium">{locale === 'ar' ? 'الجامعة' : 'University'}:</span>{' '}
                    {trainee.university}
                  </div>
                  <div>
                    <span className="font-medium">{locale === 'ar' ? 'التخصص' : 'Major'}:</span>{' '}
                    {trainee.major}
                  </div>
                  <div>
                    <span className="font-medium">{locale === 'ar' ? 'المؤسسة' : 'Institution'}:</span>{' '}
                    {locale === 'ar' ? trainee.institutions?.name_ar : trainee.institutions?.name}
                  </div>
                  <div>
                    <span className="font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}:</span>{' '}
                    {trainee.status}
                  </div>
                </div>
              </div>

              {/* Auth User Status */}
              <div className={`p-3 rounded ${item.authUserExists ? 'bg-blue-50' : 'bg-red-50'}`}>
                <p className={item.authUserExists ? 'text-blue-900' : 'text-red-900'}>
                  {item.authUserExists ? (
                    <>
                      <strong>{locale === 'ar' ? '✓ يوجد حساب مصادقة' : '✓ Auth User Exists'}</strong>
                      <br />
                      <span className="text-sm">Email: {item.authUserEmail}</span>
                      <br />
                      <span className="text-sm text-blue-700">
                        {locale === 'ar'
                          ? 'المشكلة: السجل موجود في auth.users ولكن مفقود في public.users'
                          : 'Issue: Record exists in auth.users but missing in public.users'}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>{locale === 'ar' ? '✗ لا يوجد حساب مصادقة' : '✗ No Auth User'}</strong>
                      <br />
                      <span className="text-sm text-red-700">
                        {locale === 'ar'
                          ? 'المشكلة: لا يوجد حساب في auth.users ولا في public.users'
                          : 'Issue: No account in auth.users or public.users'}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Error/Success Messages */}
              {error[traineeId] && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 text-sm">{error[traineeId]}</p>
                </div>
              )}

              {success[traineeId] && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-green-800 text-sm">
                    {locale === 'ar' ? '✓ تم بنجاح!' : '✓ Success!'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {item.authUserExists && (
                  <button
                    onClick={() => handleCreateUserRecord(item)}
                    disabled={loading[traineeId] || success[traineeId]}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading[traineeId]
                      ? locale === 'ar'
                        ? 'جاري الإنشاء...'
                        : 'Creating...'
                      : locale === 'ar'
                      ? 'إنشاء سجل المستخدم'
                      : 'Create User Record'}
                  </button>
                )}

                <button
                  onClick={() => handleDeleteTrainee(traineeId)}
                  disabled={loading[traineeId] || success[traineeId]}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading[traineeId]
                    ? locale === 'ar'
                      ? 'جاري الحذف...'
                      : 'Deleting...'
                    : locale === 'ar'
                    ? 'حذف المتدرب'
                    : 'Delete Trainee'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
