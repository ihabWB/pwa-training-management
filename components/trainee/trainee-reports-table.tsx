'use client';

import { useState } from 'react';
import { Eye, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string | null;
  submission_date: string;
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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    approved: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
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
                  {new Date(report.submission_date).toLocaleDateString()}
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
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            isViewDialogOpen ? '' : 'hidden'
          }`}
          onClick={() => setIsViewDialogOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {locale === 'ar' ? 'تفاصيل التقرير' : 'Report Details'}
              </h3>
              <Badge
                className={`flex items-center gap-1 ${
                  statusColors[selectedReport.status]
                }`}
              >
                {statusIcons[selectedReport.status]}
                {statusLabels[locale === 'ar' ? 'ar' : 'en'][selectedReport.status]}
              </Badge>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'العنوان' : 'Title'}
                </label>
                <p className="text-gray-900 mt-1">{selectedReport.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'تاريخ التقديم' : 'Submission Date'}
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(selectedReport.submission_date).toLocaleDateString()}
                </p>
              </div>
              {selectedReport.feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <label className="text-sm font-medium text-blue-900">
                      {locale === 'ar' ? 'التعليقات' : 'Feedback'}
                    </label>
                  </div>
                  <p className="text-blue-800 whitespace-pre-wrap">
                    {selectedReport.feedback}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
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
