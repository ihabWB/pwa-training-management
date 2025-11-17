'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Clock, AlertCircle, User, Calendar as CalendarIcon } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  trainee_id: string;
  trainee_name: string;
  trainee_email: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  approved: boolean;
  approved_at: string | null;
  rejection_reason: string | null;
}

interface SupervisorAttendanceReviewProps {
  records: AttendanceRecord[];
  locale: string;
  currentUserId: string;
}

export default function SupervisorAttendanceReview({
  records,
  locale,
  currentUserId,
}: SupervisorAttendanceReviewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const t = {
    ar: {
      title: 'سجلات الحضور',
      all: 'الكل',
      pending: 'قيد المراجعة',
      approved: 'مصادق عليها',
      noRecords: 'لا توجد سجلات',
      trainee: 'المتدرب',
      date: 'التاريخ',
      status: 'الحالة',
      checkIn: 'الدخول',
      checkOut: 'الخروج',
      notes: 'ملاحظات',
      actions: 'الإجراءات',
      approve: 'مصادقة',
      reject: 'رفض',
      approveTitle: 'مصادقة الحضور',
      rejectTitle: 'رفض الحضور',
      approveConfirm: 'هل أنت متأكد من المصادقة على هذا السجل؟',
      rejectConfirm: 'هل أنت متأكد من رفض هذا السجل؟',
      rejectionReason: 'سبب الرفض',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      processing: 'جاري المعالجة...',
      success: 'تم التحديث بنجاح',
      error: 'فشل التحديث',
      present: 'حاضر',
      absent: 'غائب',
      excused: 'غياب بعذر',
      late: 'متأخر',
      halfDay: 'نصف يوم',
    },
    en: {
      title: 'Attendance Records',
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      noRecords: 'No records found',
      trainee: 'Trainee',
      date: 'Date',
      status: 'Status',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      notes: 'Notes',
      actions: 'Actions',
      approve: 'Approve',
      reject: 'Reject',
      approveTitle: 'Approve Attendance',
      rejectTitle: 'Reject Attendance',
      approveConfirm: 'Are you sure you want to approve this record?',
      rejectConfirm: 'Are you sure you want to reject this record?',
      rejectionReason: 'Rejection Reason',
      cancel: 'Cancel',
      confirm: 'Confirm',
      processing: 'Processing...',
      success: 'Updated successfully',
      error: 'Update failed',
      present: 'Present',
      absent: 'Absent',
      excused: 'Excused',
      late: 'Late',
      halfDay: 'Half Day',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const statusLabels = {
    ar: {
      present: 'حاضر',
      absent: 'غائب',
      excused: 'غياب بعذر',
      late: 'متأخر',
      half_day: 'نصف يوم',
    },
    en: {
      present: 'Present',
      absent: 'Absent',
      excused: 'Excused',
      late: 'Late',
      half_day: 'Half Day',
    },
  };

  const filteredRecords = records.filter((record) => {
    if (filter === 'pending') return !record.approved && !record.rejection_reason;
    if (filter === 'approved') return record.approved;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'excused':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      case 'half_day':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setApprovalAction('approve');
    setShowApprovalDialog(true);
  };

  const handleReject = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setApprovalAction('reject');
    setRejectionReason('');
    setShowApprovalDialog(true);
  };

  const processApproval = async () => {
    if (!selectedRecord) return;

    if (approvalAction === 'reject' && !rejectionReason.trim()) {
      alert(locale === 'ar' ? 'يرجى إدخال سبب الرفض' : 'Please enter rejection reason');
      return;
    }

    setProcessing(true);

    try {
      const updateData: any = {
        approved: approvalAction === 'approve',
        approved_by: currentUserId,
        approved_at: new Date().toISOString(),
      };

      if (approvalAction === 'reject') {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('attendance')
        .update(updateData)
        .eq('id', selectedRecord.id);

      if (error) throw error;

      alert(text.success);
      setShowApprovalDialog(false);
      setSelectedRecord(null);
      setRejectionReason('');
      router.refresh();
    } catch (error) {
      console.error('Error processing approval:', error);
      alert(text.error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{text.title}</h2>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {text.all}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              filter === 'pending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {text.pending}
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              filter === 'approved'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {text.approved}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{text.noRecords}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {text.trainee}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {text.date}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {text.status}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {text.checkIn}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {text.checkOut}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {text.notes}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {text.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.trainee_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.trainee_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString(
                      locale === 'ar' ? 'ar-EG' : 'en-US'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {statusLabels[locale as 'ar' | 'en'][record.status as keyof typeof statusLabels.ar]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.check_in_time || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.check_out_time || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {record.notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.approved ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {text.approved}
                      </span>
                    ) : record.rejection_reason ? (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        {locale === 'ar' ? 'مرفوض' : 'Rejected'}
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(record)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium"
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          {text.approve}
                        </button>
                        <button
                          onClick={() => handleReject(record)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-medium"
                        >
                          <XCircle className="w-3 h-3 inline mr-1" />
                          {text.reject}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Approval Dialog */}
      {showApprovalDialog && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {approvalAction === 'approve' ? text.approveTitle : text.rejectTitle}
              </h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{text.trainee}:</p>
                <p className="font-medium">{selectedRecord.trainee_name}</p>
                <p className="text-sm text-gray-600 mt-2">{text.date}:</p>
                <p className="font-medium">
                  {new Date(selectedRecord.date).toLocaleDateString(
                    locale === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </p>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                {approvalAction === 'approve' ? text.approveConfirm : text.rejectConfirm}
              </p>

              {approvalAction === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {text.rejectionReason} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    placeholder={locale === 'ar' ? 'اذكر سبب الرفض...' : 'State reason for rejection...'}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApprovalDialog(false);
                    setSelectedRecord(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  disabled={processing}
                >
                  {text.cancel}
                </button>
                <button
                  onClick={processApproval}
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                  disabled={processing}
                >
                  {processing ? text.processing : text.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
