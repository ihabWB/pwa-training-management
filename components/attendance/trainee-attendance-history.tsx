'use client';

import { CheckCircle, XCircle, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  approved: boolean;
  approved_at: string | null;
  rejection_reason: string | null;
}

interface TraineeAttendanceHistoryProps {
  records: AttendanceRecord[];
  locale: string;
}

export default function TraineeAttendanceHistory({
  records,
  locale,
}: TraineeAttendanceHistoryProps) {
  const t = {
    ar: {
      title: 'سجل الحضور',
      noRecords: 'لا توجد سجلات حضور',
      date: 'التاريخ',
      status: 'الحالة',
      checkIn: 'الدخول',
      checkOut: 'الخروج',
      notes: 'ملاحظات',
      approval: 'الحالة',
      approved: 'مصادق',
      pending: 'قيد المراجعة',
      rejected: 'مرفوض',
      present: 'حاضر',
      absent: 'غائب',
      excused: 'غياب بعذر',
      late: 'متأخر',
      halfDay: 'نصف يوم',
      rejectionReason: 'سبب الرفض',
    },
    en: {
      title: 'Attendance History',
      noRecords: 'No attendance records found',
      date: 'Date',
      status: 'Status',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      notes: 'Notes',
      approval: 'Approval',
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
      present: 'Present',
      absent: 'Absent',
      excused: 'Excused',
      late: 'Late',
      halfDay: 'Half Day',
      rejectionReason: 'Rejection Reason',
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

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {text.title}
        </h2>
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{text.noRecords}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {text.title}
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {text.date}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {text.status}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {text.checkIn}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {text.checkOut}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {text.approval}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(record.date).toLocaleDateString(
                    locale === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      record.status
                    )}`}
                  >
                    {statusLabels[locale as 'ar' | 'en'][record.status as keyof typeof statusLabels.ar]}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.check_in_time || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.check_out_time || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {record.approved === true ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">{text.approved}</span>
                    </span>
                  ) : record.rejection_reason ? (
                    <div>
                      <span className="flex items-center gap-1 text-red-600 mb-1">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">{text.rejected}</span>
                      </span>
                      <p className="text-xs text-gray-500 italic">
                        {record.rejection_reason}
                      </p>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">{text.pending}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes section */}
      {records.some((r) => r.notes) && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">{text.notes}:</h3>
          {records
            .filter((r) => r.notes)
            .map((record) => (
              <div
                key={record.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {new Date(record.date).toLocaleDateString(
                      locale === 'ar' ? 'ar-EG' : 'en-US'
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-700" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  {record.notes}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
