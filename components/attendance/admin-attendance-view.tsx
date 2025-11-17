'use client';

import { useState } from 'react';
import { CheckCircle, Clock, XCircle, Calendar, User, Building } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  trainee_id: string;
  trainee_name: string;
  trainee_email: string;
  institution_name: string | null;
  date: string;
  status: 'present' | 'absent' | 'excused' | 'late' | 'half_day';
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  absence_reason: string | null;
  approved: boolean;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
}

interface AdminAttendanceViewProps {
  records: AttendanceRecord[];
  locale: string;
}

export default function AdminAttendanceView({
  records,
  locale,
}: AdminAttendanceViewProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((record) => {
    // Apply approval filter
    if (filter === 'pending' && (record.approved === true || record.rejection_reason)) return false;
    if (filter === 'approved' && record.approved !== true) return false;
    if (filter === 'rejected' && !record.rejection_reason) return false;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        record.trainee_name.toLowerCase().includes(search) ||
        record.trainee_email.toLowerCase().includes(search) ||
        (record.institution_name && record.institution_name.toLowerCase().includes(search))
      );
    }

    return true;
  });

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const statusConfig = {
      present: {
        label: locale === 'ar' ? 'حاضر' : 'Present',
        className: 'bg-green-100 text-green-800',
      },
      absent: {
        label: locale === 'ar' ? 'غائب' : 'Absent',
        className: 'bg-red-100 text-red-800',
      },
      excused: {
        label: locale === 'ar' ? 'إجازة' : 'Excused',
        className: 'bg-blue-100 text-blue-800',
      },
      late: {
        label: locale === 'ar' ? 'متأخر' : 'Late',
        className: 'bg-yellow-100 text-yellow-800',
      },
      half_day: {
        label: locale === 'ar' ? 'نصف يوم' : 'Half Day',
        className: 'bg-purple-100 text-purple-800',
      },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getApprovalStatus = (record: AttendanceRecord) => {
    if (record.rejection_reason) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <XCircle size={16} />
          <span className="text-sm">{locale === 'ar' ? 'مرفوض' : 'Rejected'}</span>
        </div>
      );
    }

    if (record.approved) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle size={16} />
          <span className="text-sm">{locale === 'ar' ? 'مصادق عليه' : 'Approved'}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-yellow-600">
        <Clock size={16} />
        <span className="text-sm">{locale === 'ar' ? 'قيد المراجعة' : 'Pending'}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'ar' ? 'مصادق عليها' : 'Approved'}
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {locale === 'ar' ? 'مرفوضة' : 'Rejected'}
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder={locale === 'ar' ? 'بحث بالاسم أو البريد أو المؤسسة...' : 'Search by name, email, or institution...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'المتدرب' : 'Trainee'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'المؤسسة' : 'Institution'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'التاريخ' : 'Date'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'الحالة' : 'Status'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'الأوقات' : 'Times'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'حالة المصادقة' : 'Approval'}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'صودق بواسطة' : 'Approved By'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {locale === 'ar' ? 'لا توجد سجلات' : 'No records found'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="text-gray-400" size={16} />
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-900">
                        {record.institution_name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString(
                          locale === 'ar' ? 'ar-EG' : 'en-US'
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.check_in_time && record.check_out_time ? (
                      <div className="text-sm text-gray-900">
                        {record.check_in_time} - {record.check_out_time}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getApprovalStatus(record)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.approved_by_name || '-'}
                    </div>
                    {record.approved_at && (
                      <div className="text-xs text-gray-500">
                        {new Date(record.approved_at).toLocaleDateString(
                          locale === 'ar' ? 'ar-EG' : 'en-US'
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Notes and Reasons Section */}
      {filteredRecords.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {locale === 'ar' ? 'الملاحظات والأسباب' : 'Notes and Reasons'}
          </h3>
          <div className="space-y-4">
            {filteredRecords
              .filter((r) => r.notes || r.absence_reason || r.rejection_reason)
              .map((record) => (
                <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm text-gray-900">
                      {record.trainee_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.date).toLocaleDateString(
                        locale === 'ar' ? 'ar-EG' : 'en-US'
                      )}
                    </span>
                  </div>
                  {record.notes && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {locale === 'ar' ? 'ملاحظات:' : 'Notes:'}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{record.notes}</p>
                    </div>
                  )}
                  {record.absence_reason && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {locale === 'ar' ? 'سبب الغياب:' : 'Absence Reason:'}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{record.absence_reason}</p>
                    </div>
                  )}
                  {record.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <span className="text-xs font-medium text-red-600">
                        {locale === 'ar' ? 'سبب الرفض:' : 'Rejection Reason:'}
                      </span>
                      <p className="text-sm text-red-700 mt-1">{record.rejection_reason}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
