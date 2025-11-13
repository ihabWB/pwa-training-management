'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

interface AddReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  traineeId: string;
  traineeName: string;
  locale: string;
}

export default function AddReportDialog({
  isOpen,
  onClose,
  traineeId,
  traineeName,
  locale,
}: AddReportDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    report_type: 'daily' as 'daily' | 'weekly' | 'monthly',
    title: '',
    content: '',
    work_done: '',
    challenges: '',
    next_steps: '',
    attachment_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Get current period based on report type
      const today = new Date();
      const periodStart = new Date(today);
      const periodEnd = new Date(today);

      if (formData.report_type === 'weekly') {
        const dayOfWeek = today.getDay();
        periodStart.setDate(today.getDate() - dayOfWeek);
        periodEnd.setDate(periodStart.getDate() + 6);
      } else if (formData.report_type === 'monthly') {
        periodStart.setDate(1);
        periodEnd.setMonth(periodEnd.getMonth() + 1, 0);
      }

      const { error: insertError } = await supabase.from('reports').insert({
        trainee_id: traineeId,
        report_type: formData.report_type,
        title: formData.title,
        content: formData.content,
        work_done: formData.work_done,
        challenges: formData.challenges || null,
        next_steps: formData.next_steps || null,
        attachment_url: formData.attachment_url || null,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        status: 'pending',
      });

      if (insertError) throw insertError;

      // Success
      router.refresh();
      onClose();
      setFormData({
        report_type: 'daily',
        title: '',
        content: '',
        work_done: '',
        challenges: '',
        next_steps: '',
        attachment_url: '',
      });
    } catch (err: any) {
      console.error('Error adding report:', err);
      setError(err.message || 'Failed to add report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {locale === 'ar' ? 'إضافة تقرير جديد' : 'Add New Report'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {locale === 'ar' ? `المتدرب: ${traineeName}` : `Trainee: ${traineeName}`}
            </p>
          </div>
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

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'نوع التقرير' : 'Report Type'} *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['daily', 'weekly', 'monthly'].map((type) => (
                <label
                  key={type}
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.report_type === type
                      ? 'border-primary bg-blue-50 text-primary'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_type"
                    value={type}
                    checked={formData.report_type === type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        report_type: e.target.value as any,
                      })
                    }
                    className="sr-only"
                  />
                  <span className="font-medium">
                    {locale === 'ar'
                      ? type === 'daily'
                        ? 'يومي'
                        : type === 'weekly'
                        ? 'أسبوعي'
                        : 'شهري'
                      : type === 'daily'
                      ? 'Daily'
                      : type === 'weekly'
                      ? 'Weekly'
                      : 'Monthly'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'عنوان التقرير' : 'Report Title'} *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={
                locale === 'ar'
                  ? 'تقرير عن أعمال اليوم...'
                  : 'Report on today\'s work...'
              }
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'ملخص التقرير' : 'Report Summary'} *
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={
                locale === 'ar'
                  ? 'ملخص عام عن الأعمال المنجزة...'
                  : 'General summary of accomplished work...'
              }
              rows={4}
              required
            />
          </div>

          {/* Work Done */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الأعمال المنجزة' : 'Work Completed'} *
            </label>
            <Textarea
              value={formData.work_done}
              onChange={(e) =>
                setFormData({ ...formData, work_done: e.target.value })
              }
              placeholder={
                locale === 'ar'
                  ? '- إنجاز المهمة الأولى\n- العمل على المشروع الثاني\n- اجتماع مع الفريق'
                  : '- Completed first task\n- Worked on second project\n- Team meeting'
              }
              rows={5}
              required
            />
          </div>

          {/* Challenges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'التحديات والصعوبات' : 'Challenges & Difficulties'}
            </label>
            <Textarea
              value={formData.challenges}
              onChange={(e) =>
                setFormData({ ...formData, challenges: e.target.value })
              }
              placeholder={
                locale === 'ar'
                  ? 'التحديات التي واجهتني...'
                  : 'Challenges I faced...'
              }
              rows={3}
            />
          </div>

          {/* Next Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'الخطوات القادمة' : 'Next Steps'}
            </label>
            <Textarea
              value={formData.next_steps}
              onChange={(e) =>
                setFormData({ ...formData, next_steps: e.target.value })
              }
              placeholder={
                locale === 'ar'
                  ? 'الخطط للفترة القادمة...'
                  : 'Plans for the next period...'
              }
              rows={3}
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'ar' ? 'رابط المرفقات' : 'Attachment URL'}
            </label>
            <Input
              type="url"
              value={formData.attachment_url}
              onChange={(e) =>
                setFormData({ ...formData, attachment_url: e.target.value })
              }
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {locale === 'ar'
                ? 'يمكنك رفع الملفات على Google Drive أو Dropbox ولصق الرابط هنا'
                : 'You can upload files to Google Drive or Dropbox and paste the link here'}
            </p>
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
                <>
                  <Upload className="mr-2" size={18} />
                  {locale === 'ar' ? 'إضافة تقرير' : 'Add Report'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
