'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

interface Institution {
  id: string;
  name: string;
  name_ar: string;
}

interface AddSupervisorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  locale: string;
}

export default function AddSupervisorDialog({
  isOpen,
  onClose,
  institutions,
  locale,
}: AddSupervisorDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    institution_id: '',
    position_title: '',
    position_title_ar: '',
    specialization: '',
    years_of_experience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            role: 'supervisor',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Create user profile
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: formData.email,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        role: 'supervisor',
        status: 'active',
        profile_completed: true,
      });

      if (userError) throw userError;

      // 3. Create supervisor record
      const { error: supervisorError } = await supabase.from('supervisors').insert({
        user_id: authData.user.id,
        institution_id: formData.institution_id,
        position_title: formData.position_title,
        position_title_ar: formData.position_title_ar,
        specialization: formData.specialization,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
      });

      if (supervisorError) throw supervisorError;

      // Success
      router.refresh();
      onClose();
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone_number: '',
        institution_id: '',
        position_title: '',
        position_title_ar: '',
        specialization: '',
        years_of_experience: '',
      });
    } catch (err: any) {
      console.error('Error adding supervisor:', err);
      setError(err.message || 'Failed to add supervisor');
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
            {locale === 'ar' ? 'إضافة مشرف جديد' : 'Add New Supervisor'}
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
                  placeholder={locale === 'ar' ? 'خالد أحمد حسن' : 'Khaled Ahmad Hassan'}
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
                  placeholder="0598333444"
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
                  placeholder="supervisor@example.com"
                  required
                />
              </div>

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
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'معلومات العمل' : 'Work Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'المؤسسة' : 'Institution'} *
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'المنصب (عربي)' : 'Position (Arabic)'} *
                </label>
                <Input
                  value={formData.position_title_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, position_title_ar: e.target.value })
                  }
                  placeholder={locale === 'ar' ? 'مهندس أول' : 'Senior Engineer'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'المنصب (إنجليزي)' : 'Position (English)'} *
                </label>
                <Input
                  value={formData.position_title}
                  onChange={(e) =>
                    setFormData({ ...formData, position_title: e.target.value })
                  }
                  placeholder="Senior Engineer"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'التخصص' : 'Specialization'} *
                </label>
                <Input
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  placeholder={
                    locale === 'ar'
                      ? 'هندسة المياه والصرف الصحي'
                      : 'Water and Sanitation Engineering'
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={(e) =>
                    setFormData({ ...formData, years_of_experience: e.target.value })
                  }
                  placeholder="5"
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
                  {locale === 'ar' ? 'جاري الإضافة...' : 'Adding...'}
                </>
              ) : (
                locale === 'ar' ? 'إضافة مشرف' : 'Add Supervisor'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
