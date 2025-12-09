'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Check, XCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { exportSingleReportToPDF } from '@/lib/export/pdf';

interface Report {
  id: string;
  trainee_name: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  title: string;
  content: string;
  work_done: string;
  challenges?: string;
  next_steps?: string;
  attachment_url?: string;
  period_start: string;
  period_end: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

interface ReviewReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  locale: string;
}

export default function ReviewReportDialog({
  isOpen,
  onClose,
  report,
  locale,
}: ReviewReportDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleReview = async (newStatus: 'approved' | 'rejected') => {
    if (!report) return;
    
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get supervisor ID from user ID
      const { data: supervisorData, error: supervisorError } = await supabase
        .from('supervisors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (supervisorError) {
        // If not a supervisor, try to get admin (admins can also review)
        // For now, just use null if not a supervisor
        console.warn('User is not a supervisor:', supervisorError);
      }

      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: newStatus,
          reviewed_by: supervisorData?.id || null,
          reviewed_at: new Date().toISOString(),
          feedback: feedback || null,
        })
        .eq('id', report.id);

      if (updateError) throw updateError;

      // Success
      router.refresh();
      onClose();
      setFeedback('');
    } catch (err: any) {
      console.error('Error reviewing report:', err);
      setError(err.message || 'Failed to review report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !report) return null;

  const reportTypeLabels = {
    ar: { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' },
    en: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
              <Badge
                className={
                  report.report_type === 'daily'
                    ? 'bg-green-100 text-green-800'
                    : report.report_type === 'weekly'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }
              >
                {reportTypeLabels[locale as 'ar' | 'en'][report.report_type]}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {locale === 'ar' ? 'المتدرب: ' : 'Trainee: '}
              {report.trainee_name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {locale === 'ar' ? 'الفترة: ' : 'Period: '}
              {new Date(report.period_start).toLocaleDateString(locale)} -{' '}
              {new Date(report.period_end).toLocaleDateString(locale)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleReportToPDF(report, locale)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              title={locale === 'ar' ? 'تصدير التقرير كملف PDF' : 'Export Report as PDF'}
            >
              <FileDown size={18} />
              <span className="text-sm font-medium">
                {locale === 'ar' ? 'تصدير PDF' : 'Export PDF'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {locale === 'ar' ? 'ملخص التقرير' : 'Report Summary'}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
              {report.content}
            </div>
          </div>

          {/* Work Done */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              {locale === 'ar' ? 'الأعمال المنجزة' : 'Work Completed'}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
              {report.work_done}
            </div>
          </div>

          {/* Challenges */}
          {report.challenges && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {locale === 'ar' ? 'التحديات والصعوبات' : 'Challenges & Difficulties'}
              </h3>
              <div className="bg-yellow-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                {report.challenges}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {report.next_steps && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {locale === 'ar' ? 'الخطوات القادمة' : 'Next Steps'}
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                {report.next_steps}
              </div>
            </div>
          )}

          {/* Attachment */}
          {report.attachment_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {locale === 'ar' ? 'المرفقات' : 'Attachments'}
              </h3>
              <a
                href={report.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {locale === 'ar' ? 'عرض المرفق' : 'View Attachment'} ↗
              </a>
            </div>
          )}

          {/* Feedback */}
          {report.status === 'pending' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {locale === 'ar' ? 'ملاحظات وتعليقات' : 'Feedback & Comments'}
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  locale === 'ar'
                    ? 'أضف ملاحظاتك وتعليقاتك هنا...'
                    : 'Add your feedback and comments here...'
                }
                rows={4}
              />
            </div>
          )}

          {/* Actions */}
          {report.status === 'pending' && (
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
              <Button
                onClick={() => handleReview('rejected')}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <XCircle className="mr-2" size={18} />
                )}
                {locale === 'ar' ? 'رفض' : 'Reject'}
              </Button>
              <Button
                onClick={() => handleReview('approved')}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Check className="mr-2" size={18} />
                )}
                {locale === 'ar' ? 'قبول' : 'Approve'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
