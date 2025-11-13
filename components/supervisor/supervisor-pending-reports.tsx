'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Calendar, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  report_date: string;
  frequency: string;
  trainee: any;
}

interface SupervisorPendingReportsProps {
  traineeIds: string[];
  locale: string;
}

export default function SupervisorPendingReports({
  traineeIds,
  locale,
}: SupervisorPendingReportsProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from('reports')
        .select(
          `
          id,
          title,
          report_date,
          frequency,
          trainee:trainees(
            user:users(full_name)
          )
        `
        )
        .in('trainee_id', traineeIds)
        .eq('status', 'pending')
        .order('report_date', { ascending: false })
        .limit(5);

      setReports(data || []);
      setLoading(false);
    };

    if (traineeIds.length > 0) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [traineeIds]);

  const t = {
    ar: {
      pendingReports: 'التقارير المعلقة',
      viewAll: 'عرض الكل',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      noReports: 'لا توجد تقارير معلقة',
      loading: 'جاري التحميل...',
    },
    en: {
      pendingReports: 'Pending Reports',
      viewAll: 'View All',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      noReports: 'No pending reports',
      loading: 'Loading...',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return text.daily;
      case 'weekly':
        return text.weekly;
      case 'monthly':
        return text.monthly;
      default:
        return frequency;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      case 'monthly':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-orange-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">{text.pendingReports}</h2>
        </div>
        <Link
          href={`/${locale}/reports`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {text.viewAll}
        </Link>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-8">{text.loading}</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{text.noReports}</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                  <div className="flex flex-col gap-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{report.trainee?.user?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{new Date(report.report_date).toLocaleDateString(locale)}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getFrequencyColor(
                    report.frequency
                  )}`}
                >
                  {getFrequencyText(report.frequency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
