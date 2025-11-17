'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Clock, FileText, AlertCircle } from 'lucide-react';

interface TraineeAttendanceFormProps {
  traineeId: string;
  locale: string;
}

export default function TraineeAttendanceForm({
  traineeId,
  locale,
}: TraineeAttendanceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'present' | 'absent'>('present');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    notes: '',
    absence_reason: '',
  });

  const t = {
    ar: {
      title: 'تسجيل حضور جديد',
      attendanceType: 'نوع الحضور',
      present: 'حضور',
      absent: 'غياب',
      date: 'التاريخ',
      checkIn: 'وقت الدخول',
      checkOut: 'وقت الخروج',
      notes: 'ملاحظات',
      absenceReason: 'سبب الغياب',
      submit: 'تأكيد',
      submitting: 'جاري التسجيل...',
      success: 'تم تسجيل الحضور بنجاح',
      error: 'فشل تسجيل الحضور',
      duplicate: 'لديك تسجيل حضور لهذا اليوم بالفعل',
    },
    en: {
      title: 'Register New Attendance',
      attendanceType: 'Attendance Type',
      present: 'Present',
      absent: 'Absent',
      date: 'Date',
      checkIn: 'Check-in Time',
      checkOut: 'Check-out Time',
      notes: 'Notes',
      absenceReason: 'Absence Reason',
      submit: 'Submit',
      submitting: 'Submitting...',
      success: 'Attendance registered successfully',
      error: 'Failed to register attendance',
      duplicate: 'You already have an attendance record for this date',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if attendance already exists for this date
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('trainee_id', traineeId)
        .eq('date', formData.date)
        .single();

      if (existing) {
        alert(text.duplicate);
        setLoading(false);
        return;
      }

      // Prepare attendance data
      const attendanceData: any = {
        trainee_id: traineeId,
        date: formData.date,
        status: attendanceType,
        approved: false,
      };

      if (attendanceType === 'present') {
        attendanceData.check_in_time = formData.check_in_time || null;
        attendanceData.check_out_time = formData.check_out_time || null;
        attendanceData.notes = formData.notes || null;
      } else {
        attendanceData.notes = formData.absence_reason;
      }

      const { error } = await supabase
        .from('attendance')
        .insert(attendanceData);

      if (error) throw error;

      alert(text.success);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        check_in_time: '',
        check_out_time: '',
        notes: '',
        absence_reason: '',
      });
      
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      alert(text.error + ': ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-blue-600" />
        {text.title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Attendance Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {text.attendanceType}
          </label>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setAttendanceType('present')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                attendanceType === 'present'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {text.present}
            </button>
            <button
              type="button"
              onClick={() => setAttendanceType('absent')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                attendanceType === 'absent'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {text.absent}
            </button>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {text.date} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {attendanceType === 'present' ? (
          <>
            {/* Check-in Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                {text.checkIn}
              </label>
              <input
                type="time"
                value={formData.check_in_time}
                onChange={(e) =>
                  setFormData({ ...formData, check_in_time: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Check-out Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                {text.checkOut}
              </label>
              <input
                type="time"
                value={formData.check_out_time}
                onChange={(e) =>
                  setFormData({ ...formData, check_out_time: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-4 h-4 inline mr-1" />
                {text.notes}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </>
        ) : (
          <>
            {/* Absence Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {text.absenceReason} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.absence_reason}
                onChange={(e) =>
                  setFormData({ ...formData, absence_reason: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                placeholder={locale === 'ar' ? 'اذكر سبب الغياب...' : 'State reason for absence...'}
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? text.submitting : text.submit}
        </button>
      </form>
    </div>
  );
}
