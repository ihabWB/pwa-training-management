'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewReportFormProps {
  traineeId: string;
  locale: string;
}

export default function NewReportForm({ traineeId, locale }: NewReportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    report_type: 'daily',
    title: '',
    content: '',
    report_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          trainee_id: traineeId,
          report_type: formData.report_type,
          title: formData.title,
          content: formData.content,
          report_date: formData.report_date,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Redirect back to reports list
      router.push(`/${locale}/trainee/my-reports`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'فشل في إضافة التقرير');
    } finally {
      setLoading(false);
    }
  };

  const t = {
    ar: {
      reportType: 'نوع التقرير',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      title: 'عنوان التقرير',
      content: 'محتوى التقرير',
      reportDate: 'تاريخ التقرير',
      submit: 'إرسال التقرير',
      cancel: 'إلغاء',
      submitting: 'جاري الإرسال...',
    },
    en: {
      reportType: 'Report Type',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      title: 'Report Title',
      content: 'Report Content',
      reportDate: 'Report Date',
      submit: 'Submit Report',
      cancel: 'Cancel',
      submitting: 'Submitting...',
    },
  };

  const text = t[locale as keyof typeof t] || t.en;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Report Type */}
      <div className="space-y-2">
        <label htmlFor="report_type" className="text-sm font-medium text-gray-700">
          {text.reportType}
        </label>
        <select
          id="report_type"
          value={formData.report_type}
          onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="daily">{text.daily}</option>
          <option value="weekly">{text.weekly}</option>
          <option value="monthly">{text.monthly}</option>
        </select>
      </div>

      {/* Report Date */}
      <div className="space-y-2">
        <label htmlFor="report_date" className="text-sm font-medium text-gray-700">
          {text.reportDate}
        </label>
        <Input
          id="report_date"
          type="date"
          value={formData.report_date}
          onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
          required
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          {text.title}
        </label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={locale === 'ar' ? 'مثال: تقرير عمل يوم الأحد' : 'Example: Sunday Work Report'}
          required
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-gray-700">
          {text.content}
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={locale === 'ar' ? 'اكتب تفاصيل التقرير هنا...' : 'Write report details here...'}
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          {text.cancel}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? text.submitting : text.submit}
        </Button>
      </div>
    </form>
  );
}
