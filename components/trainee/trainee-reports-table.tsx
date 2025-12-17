'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, FileText, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Edit, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Report {
  id: string;
  title: string;
  content: string | null;
  work_done: string | null;
  challenges: string | null;
  next_steps: string | null;
  report_type: string;
  report_date: string;
  hours_worked: number | null;
  productivity_level: number;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
}

interface TraineeReportsTableProps {
  reports: Report[];
  locale: string;
}

export default function TraineeReportsTable({
  reports,
  locale,
}: TraineeReportsTableProps) {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    ar: {
      pending: 'قيد المراجعة',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
    },
    en: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    },
  };

  const typeLabels = {
    ar: {
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
    },
    en: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    },
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا التقرير؟' : 'Are you sure you want to delete this report?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success(locale === 'ar' ? 'تم حذف التقرير بنجاح' : 'Report deleted successfully');
      setIsViewDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast.error(locale === 'ar' ? 'فشل حذف التقرير' : 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          {locale === 'ar' ? 'لا توجد تقارير' : 'No reports found'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'العنوان' : 'Title'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'تاريخ التقديم' : 'Submission Date'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'الحالة' : 'Status'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 ml-3" />
                    <div className="text-sm font-medium text-gray-900">
                      {report.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(report.submitted_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`flex items-center gap-1 w-fit ${
                      statusColors[report.status]
                    }`}
                  >
                    {statusIcons[report.status]}
                    {statusLabels[locale === 'ar' ? 'ar' : 'en'][report.status]}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(report)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    {locale === 'ar' ? 'عرض' : 'View'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Dialog */}
      {selectedReport && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
            isViewDialogOpen ? '' : 'hidden'
          }`}
          onClick={() => setIsViewDialogOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">
                      {selectedReport.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-blue-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedReport.report_date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-white/20 rounded">
                      {typeLabels[locale === 'ar' ? 'ar' : 'en'][selectedReport.report_type as keyof typeof typeLabels.ar]}
                    </span>
                  </div>
                </div>
                <Badge
                  className={`flex items-center gap-1 ${statusColors[selectedReport.status]}`}
                >
                  {statusIcons[selectedReport.status]}
                  {statusLabels[locale === 'ar' ? 'ar' : 'en'][selectedReport.status]}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Report Details */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                {selectedReport.hours_worked && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      {locale === 'ar' ? 'ساعات العمل:' : 'Hours Worked:'}
                    </span>
                    <p className="text-lg font-semibold text-gray-900">{selectedReport.hours_worked}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    {locale === 'ar' ? 'مستوى الإنتاجية:' : 'Productivity Level:'}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < selectedReport.productivity_level
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              {selectedReport.content && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {locale === 'ar' ? 'محتوى التقرير' : 'Report Content'}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.content}</p>
                </div>
              )}

              {/* Work Done */}
              {selectedReport.work_done && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {locale === 'ar' ? 'الأعمال المنجزة' : 'Work Completed'}
                  </h4>
                  <p className="text-green-800 whitespace-pre-wrap">{selectedReport.work_done}</p>
                </div>
              )}

              {/* Challenges */}
              {selectedReport.challenges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {locale === 'ar' ? 'التحديات والصعوبات' : 'Challenges'}
                  </h4>
                  <p className="text-yellow-800 whitespace-pre-wrap">{selectedReport.challenges}</p>
                </div>
              )}

              {/* Next Steps */}
              {selectedReport.next_steps && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {locale === 'ar' ? 'الخطوات القادمة' : 'Next Steps'}
                  </h4>
                  <p className="text-purple-800 whitespace-pre-wrap">{selectedReport.next_steps}</p>
                </div>
              )}

              {/* Feedback */}
              {selectedReport.feedback && selectedReport.reviewed_at && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">
                      {locale === 'ar' ? 'ملاحظات المشرف' : 'Supervisor Feedback'}
                    </h4>
                  </div>
                  <p className="text-blue-800 whitespace-pre-wrap mb-2">{selectedReport.feedback}</p>
                  <p className="text-sm text-blue-600">
                    {locale === 'ar' ? 'تمت المراجعة في:' : 'Reviewed on:'}{' '}
                    {new Date(selectedReport.reviewed_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-lg border-t flex items-center justify-between">
              <div className="flex gap-2">
                {selectedReport.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleDelete(selectedReport.id)}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      {isDeleting 
                        ? (locale === 'ar' ? 'جاري الحذف...' : 'Deleting...') 
                        : (locale === 'ar' ? 'حذف' : 'Delete')}
                    </Button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
              >
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
