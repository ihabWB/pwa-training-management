'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

interface AddTraineeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Array<{ id: string; name: string; name_ar: string }>;
  locale: string;
  traineeToEdit?: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    institution_id?: string;
    university: string;
    major: string;
    graduation_year: number;
    start_date: string;
    expected_end_date: string;
  };
}

export default function AddTraineeDialog({
  isOpen,
  onClose,
  institutions,
  locale,
  traineeToEdit,
}: AddTraineeDialogProps) {
  const t = useTranslations('trainees');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = !!traineeToEdit;

  const [formData, setFormData] = useState({
    email: traineeToEdit?.email || '',
    password: '',
    full_name: traineeToEdit?.full_name || '',
    phone_number: traineeToEdit?.phone_number || '',
    institution_id: traineeToEdit?.institution_id || '',
    university: traineeToEdit?.university || '',
    major: traineeToEdit?.major || '',
    graduation_year: traineeToEdit?.graduation_year || new Date().getFullYear(),
    start_date: traineeToEdit?.start_date || '',
    expected_end_date: traineeToEdit?.expected_end_date || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      if (isEditMode && traineeToEdit) {
        // Edit mode - update existing trainee
        
        // 1. Update user profile
        const { error: userError } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            phone_number: formData.phone_number,
          })
          .eq('id', traineeToEdit.user_id);

        if (userError) throw userError;

        // 2. Update trainee record
        const { error: traineeError } = await supabase
          .from('trainees')
          .update({
            institution_id: formData.institution_id || null,
            university: formData.university,
            major: formData.major,
            graduation_year: formData.graduation_year,
            start_date: formData.start_date,
            expected_end_date: formData.expected_end_date,
          })
          .eq('id', traineeToEdit.id);

        if (traineeError) throw traineeError;

        alert(locale === 'ar' ? 'تم تحديث المتدرب بنجاح' : 'Trainee updated successfully');
      } else {
        // Add mode - create new trainee
        
        // Validate required fields
        if (!formData.institution_id) {
          throw new Error(locale === 'ar' ? 'يرجى اختيار المؤسسة' : 'Please select an institution');
        }
        
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              phone_number: formData.phone_number,
              role: 'trainee',
            },
          },
        });

        if (authError) {
          console.error('Auth error:', authError);
          throw new Error(`Auth error: ${authError.message}`);
        }
        if (!authData.user) {
          throw new Error('Failed to create user');
        }

        console.log('User created:', authData.user.id);

        // 2. Create user profile
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          role: 'trainee',
          status: 'active',
          profile_completed: true,
        });

        if (userError) {
          console.error('User profile error:', userError);
          throw new Error(`User profile error: ${userError.message}`);
        }

        console.log('User profile created');

        // 3. Create trainee record
        const { error: traineeError } = await supabase.from('trainees').insert({
          user_id: authData.user.id,
          institution_id: formData.institution_id,
          university: formData.university,
          major: formData.major,
          graduation_year: formData.graduation_year,
          start_date: formData.start_date,
          expected_end_date: formData.expected_end_date,
          status: 'active',
        });

        if (traineeError) {
          console.error('Trainee record error:', traineeError);
          throw new Error(`Trainee record error: ${traineeError.message}`);
        }

        console.log('Trainee record created successfully');

        alert(locale === 'ar' ? 'تم إضافة المتدرب بنجاح' : 'Trainee added successfully');
      }

      // Success
      router.refresh();
      onClose();
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone_number: '',
        institution_id: '',
        university: '',
        major: '',
        graduation_year: new Date().getFullYear(),
        start_date: '',
        expected_end_date: '',
      });
    } catch (err: any) {
      console.error('Error adding trainee:', err);
      setError(err.message || 'Failed to add trainee');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode 
              ? (locale === 'ar' ? 'تعديل متدرب' : 'Edit Trainee')
              : (locale === 'ar' ? 'إضافة متدرب جديد' : 'Add New Trainee')
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder={locale === 'ar' ? 'أحمد محمد علي' : 'Ahmad Mohammad Ali'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                </label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  placeholder="0599123456"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="trainee@example.com"
                  required
                  disabled={isEditMode}
                  className={isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
              </div>

              {!isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'كلمة المرور' : 'Password'} *
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'المعلومات الأكاديمية' : 'Academic Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'الجامعة' : 'University'} *
                </label>
                <Input
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value })
                  }
                  placeholder={
                    locale === 'ar'
                      ? 'الجامعة الإسلامية - غزة'
                      : 'Islamic University - Gaza'
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'التخصص' : 'Major'} *
                </label>
                <Input
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  placeholder={
                    locale === 'ar' ? 'هندسة مدنية' : 'Civil Engineering'
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'سنة التخرج' : 'Graduation Year'} *
                </label>
                <Input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      graduation_year: parseInt(e.target.value),
                    })
                  }
                  min={2015}
                  max={new Date().getFullYear()}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'المؤسسة التدريبية' : 'Training Institution'} *
                </label>
                <select
                  value={formData.institution_id}
                  onChange={(e) =>
                    setFormData({ ...formData, institution_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">
                    {locale === 'ar' ? 'اختر المؤسسة' : 'Select Institution'}
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {locale === 'ar' ? inst.name_ar : inst.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Training Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'فترة التدريب' : 'Training Period'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'تاريخ البدء' : 'Start Date'} *
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'تاريخ الانتهاء المتوقع' : 'Expected End Date'} *
                </label>
                <Input
                  type="date"
                  value={formData.expected_end_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expected_end_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  {isEditMode
                    ? (locale === 'ar' ? 'جاري التحديث...' : 'Updating...')
                    : (locale === 'ar' ? 'جاري الإضافة...' : 'Adding...')
                  }
                </>
              ) : (
                isEditMode
                  ? (locale === 'ar' ? 'تحديث البيانات' : 'Update Trainee')
                  : (locale === 'ar' ? 'إضافة متدرب' : 'Add Trainee')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
