'use client';

import { useState } from 'react';
import { Search, FileText, Eye, Calendar, Filter, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReviewReportDialog from './review-report-dialog';
import { exportReportsToExcel } from '@/lib/export/excel';
import { exportReportsToPDF, exportSingleReportToPDF } from '@/lib/export/pdf';

interface Report {
  id: string;
  trainee_id: string;
  trainee_name: string;
  institution_name: string;
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
  reviewed_by?: string;
  reviewed_at?: string;
  feedback?: string;
}

interface ReportsTableProps {
  reports: Report[];
  locale: string;
  userRole: 'admin' | 'supervisor' | 'trainee';
}

export default function ReportsTable({
  reports,
  locale,
  userRole,
}: ReportsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reviewDialog, setReviewDialog] = useState<{
    isOpen: boolean;
    report: Report | null;
  }>({
    isOpen: false,
    report: null,
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    ar: { pending: 'قيد الانتظار', approved: 'مقبول', rejected: 'مرفوض' },
    en: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' },
  };

  const typeColors = {
    daily: 'bg-green-100 text-green-800',
    weekly: 'bg-blue-100 text-blue-800',
    monthly: 'bg-purple-100 text-purple-800',
  };

  const typeLabels = {
    ar: { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' },
    en: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' },
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.trainee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.institution_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' || report.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const openReviewDialog = (report: Report) => {
    setReviewDialog({ isOpen: true, report });
  };

  return (
    <div className="space-y-4">
      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{locale === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
            <option value="daily">{locale === 'ar' ? 'يومي' : 'Daily'}</option>
            <option value="weekly">{locale === 'ar' ? 'أسبوعي' : 'Weekly'}</option>
            <option value="monthly">{locale === 'ar' ? 'شهري' : 'Monthly'}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{locale === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
            <option value="pending">
              {locale === 'ar' ? 'قيد الانتظار' : 'Pending'}
            </option>
            <option value="approved">{locale === 'ar' ? 'مقبول' : 'Approved'}</option>
            <option value="rejected">{locale === 'ar' ? 'مرفوض' : 'Rejected'}</option>
          </select>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportReportsToExcel(filteredReports, locale)}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            {locale === 'ar' ? 'Excel' : 'Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportReportsToPDF(filteredReports, locale)}
            className="flex items-center gap-2"
          >
            <FileDown size={18} />
            {locale === 'ar' ? 'PDF' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {locale === 'ar'
          ? `عرض ${filteredReports.length} من ${reports.length} تقرير`
          : `Showing ${filteredReports.length} of ${reports.length} reports`}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'المتدرب' : 'Trainee'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'العنوان' : 'Title'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'النوع' : 'Type'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'الفترة' : 'Period'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'تاريخ التقديم' : 'Submitted'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {locale === 'ar' ? 'لا توجد تقارير' : 'No reports found'}
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.trainee_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.institution_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={typeColors[report.report_type]}>
                        {typeLabels[locale as 'ar' | 'en'][report.report_type]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(report.period_start).toLocaleDateString(locale, {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          -
                          {new Date(report.period_end).toLocaleDateString(locale, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[report.status]}>
                        {statusLabels[locale as 'ar' | 'en'][report.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(report.submitted_at).toLocaleDateString(locale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openReviewDialog(report)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          title={locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <Eye size={18} />
                          {locale === 'ar' ? 'عرض' : 'View'}
                        </button>
                        {(userRole === 'admin' || userRole === 'supervisor') && (
                          <button
                            onClick={() => exportSingleReportToPDF(report, locale)}
                            className="text-white bg-red-600 hover:bg-red-700 flex items-center gap-1 px-3 py-1 rounded shadow-sm hover:shadow transition-all"
                            title={locale === 'ar' ? 'تصدير التقرير كملف PDF' : 'Export Report as PDF'}
                          >
                            <FileDown size={18} />
                            {locale === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dialog */}
      <ReviewReportDialog
        isOpen={reviewDialog.isOpen}
        onClose={() => setReviewDialog({ isOpen: false, report: null })}
        report={reviewDialog.report}
        locale={locale}
      />
    </div>
  );
}
