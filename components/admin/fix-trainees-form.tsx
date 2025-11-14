'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

interface OrphanedUser {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
}

interface Institution {
  id: string;
  name: string;
  name_ar: string;
}

interface FixTraineesFormProps {
  orphanedUsers: OrphanedUser[];
  institutions: Institution[];
  locale: string;
}

export default function FixTraineesForm({
  orphanedUsers,
  institutions,
  locale,
}: FixTraineesFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (userId: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }));
  };

  const handleFixUser = async (user: OrphanedUser) => {
    setLoading(user.id);
    try {
      const userData = formData[user.id] || {};

      if (!userData.institution_id) {
        alert(locale === 'ar' ? 'يرجى اختيار المؤسسة' : 'Please select an institution');
        return;
      }

      const today = new Date();
      const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

      const { error } = await supabase.from('trainees').insert({
        user_id: user.id,
        institution_id: userData.institution_id,
        university: userData.university || 'جامعة فلسطين',
        major: userData.major || 'غير محدد',
        graduation_year: userData.graduation_year || new Date().getFullYear(),
        start_date: userData.start_date || today.toISOString().split('T')[0],
        expected_end_date: userData.expected_end_date || oneYearLater.toISOString().split('T')[0],
        status: 'active',
        phone: userData.phone || user.phone_number || '',
        date_of_birth: userData.date_of_birth || null,
        address: userData.address || '',
      });

      if (error) {
        console.error('Error creating trainee record:', error);
        alert(`Error: ${error.message}`);
        return;
      }

      alert(locale === 'ar' ? 'تم إصلاح السجل بنجاح!' : 'Record fixed successfully!');
      router.refresh();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteUser = async (user: OrphanedUser) => {
    if (!confirm(locale === 'ar' 
      ? `هل أنت متأكد من حذف المستخدم "${user.full_name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
      : `Are you sure you want to delete user "${user.full_name}"? This action cannot be undone.`
    )) {
      return;
    }

    setLoading(user.id);
    try {
      // Delete from auth.users (will cascade to users table)
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        console.error('Error deleting user:', error);
        alert(`Error: ${error.message}`);
        return;
      }

      alert(locale === 'ar' ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {orphanedUsers.map((user) => (
        <Card key={user.id} className="p-6">
          <div className="space-y-4">
            {/* User Info */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">
                User ID: <code className="bg-gray-100 px-1 rounded">{user.id}</code>
              </p>
              <p className="text-xs text-gray-500">
                {locale === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'} {new Date(user.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'المؤسسة' : 'Institution'} <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData[user.id]?.institution_id || ''}
                  onChange={(e) => handleInputChange(user.id, 'institution_id', e.target.value)}
                  disabled={loading === user.id}
                >
                  <option value="">{locale === 'ar' ? 'اختر المؤسسة' : 'Select Institution'}</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {locale === 'ar' ? inst.name_ar : inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'الجامعة' : 'University'}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData[user.id]?.university || ''}
                  onChange={(e) => handleInputChange(user.id, 'university', e.target.value)}
                  placeholder={locale === 'ar' ? 'جامعة فلسطين' : 'Palestine University'}
                  disabled={loading === user.id}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'التخصص' : 'Major'}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData[user.id]?.major || ''}
                  onChange={(e) => handleInputChange(user.id, 'major', e.target.value)}
                  placeholder={locale === 'ar' ? 'التخصص' : 'Major'}
                  disabled={loading === user.id}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'سنة التخرج' : 'Graduation Year'}
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData[user.id]?.graduation_year || ''}
                  onChange={(e) => handleInputChange(user.id, 'graduation_year', parseInt(e.target.value))}
                  placeholder="2024"
                  disabled={loading === user.id}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData[user.id]?.start_date || ''}
                  onChange={(e) => handleInputChange(user.id, 'start_date', e.target.value)}
                  disabled={loading === user.id}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'تاريخ الانتهاء المتوقع' : 'Expected End Date'}
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData[user.id]?.expected_end_date || ''}
                  onChange={(e) => handleInputChange(user.id, 'expected_end_date', e.target.value)}
                  disabled={loading === user.id}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleFixUser(user)}
                disabled={loading === user.id}
                className="flex-1"
              >
                {loading === user.id ? (
                  <>{locale === 'ar' ? 'جاري الإصلاح...' : 'Fixing...'}</>
                ) : (
                  <>{locale === 'ar' ? 'إصلاح السجل' : 'Fix Record'}</>
                )}
              </Button>
              <Button
                onClick={() => handleDeleteUser(user)}
                disabled={loading === user.id}
                variant="destructive"
              >
                {locale === 'ar' ? 'حذف المستخدم' : 'Delete User'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
