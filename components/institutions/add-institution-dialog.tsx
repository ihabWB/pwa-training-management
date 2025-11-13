'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

interface AddInstitutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function AddInstitutionDialog({
  isOpen,
  onClose,
  locale,
}: AddInstitutionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    location: '',
    focal_point_name: '',
    focal_point_phone: '',
    focal_point_email: '',
    address: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase
        .from('institutions')
        .insert({
          name: formData.name,
          name_ar: formData.name_ar,
          location: formData.location,
          focal_point_name: formData.focal_point_name,
          focal_point_phone: formData.focal_point_phone,
          focal_point_email: formData.focal_point_email,
          address: formData.address || null,
          description: formData.description || null,
        });

      if (insertError) throw insertError;

      // Success
      router.refresh();
      onClose();
      setFormData({
        name: '',
        name_ar: '',
        location: '',
        focal_point_name: '',
        focal_point_phone: '',
        focal_point_email: '',
        address: '',
        description: '',
      });
    } catch (err: any) {
      console.error('Error adding institution:', err);
      setError(err.message || 'Failed to add institution');
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
            {locale === 'ar' ? 'إضافة مؤسسة جديدة' : 'Add New Institution'}
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

          {/* Institution Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'معلومات المؤسسة' : 'Institution Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)'} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Gaza Water Utility"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)'} *
                </label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                  placeholder="شركة مياه غزة"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'الموقع' : 'Location'} *
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder={locale === 'ar' ? 'غزة' : 'Gaza'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'العنوان' : 'Address'}
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder={
                    locale === 'ar' ? 'شارع الوحدة، غزة' : 'Al-Wehda Street, Gaza'
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={
                  locale === 'ar'
                    ? 'وصف مختصر عن المؤسسة...'
                    : 'Brief description of the institution...'
                }
                rows={3}
              />
            </div>
          </div>

          {/* Focal Point Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {locale === 'ar' ? 'معلومات جهة الاتصال' : 'Focal Point Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'اسم جهة الاتصال' : 'Focal Point Name'} *
                </label>
                <Input
                  value={formData.focal_point_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      focal_point_name: e.target.value,
                    })
                  }
                  placeholder={locale === 'ar' ? 'أحمد محمد' : 'Ahmad Mohammad'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                </label>
                <Input
                  value={formData.focal_point_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      focal_point_phone: e.target.value,
                    })
                  }
                  placeholder="0599123456"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                </label>
                <Input
                  type="email"
                  value={formData.focal_point_email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      focal_point_email: e.target.value,
                    })
                  }
                  placeholder="contact@institution.ps"
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
                  {locale === 'ar' ? 'جاري الإضافة...' : 'Adding...'}
                </>
              ) : (
                locale === 'ar' ? 'إضافة مؤسسة' : 'Add Institution'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
