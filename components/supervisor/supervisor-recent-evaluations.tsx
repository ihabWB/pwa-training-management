'use client';

import { useEffect, useState } from 'react';
import { Award, Calendar, User, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Evaluation {
  id: string;
  overall_score: number;
  evaluation_date: string;
  evaluation_type: string;
  trainee: any;
}

interface SupervisorRecentEvaluationsProps {
  supervisorId: string;
  locale: string;
}

export default function SupervisorRecentEvaluations({
  supervisorId,
  locale,
}: SupervisorRecentEvaluationsProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from('evaluations')
        .select(
          `
          id,
          overall_score,
          evaluation_date,
          evaluation_type,
          trainee:trainees(
            user:users(full_name)
          )
        `
        )
        .eq('supervisor_id', supervisorId)
        .order('evaluation_date', { ascending: false })
        .limit(5);

      setEvaluations(data || []);
      setLoading(false);
    };

    fetchEvaluations();
  }, [supervisorId]);

  const t = {
    ar: {
      recentEvaluations: 'التقييمات الأخيرة',
      viewAll: 'عرض الكل',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      midTerm: 'منتصف المدة',
      final: 'نهائي',
      noEvaluations: 'لا توجد تقييمات',
      loading: 'جاري التحميل...',
      excellent: 'ممتاز',
      veryGood: 'جيد جداً',
      good: 'جيد',
      fair: 'مقبول',
      needsImprovement: 'يحتاج تحسين',
    },
    en: {
      recentEvaluations: 'Recent Evaluations',
      viewAll: 'View All',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      midTerm: 'Mid-term',
      final: 'Final',
      noEvaluations: 'No evaluations yet',
      loading: 'Loading...',
      excellent: 'Excellent',
      veryGood: 'Very Good',
      good: 'Good',
      fair: 'Fair',
      needsImprovement: 'Needs Improvement',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const getTypeText = (type: string) => {
    switch (type) {
      case 'monthly':
        return text.monthly;
      case 'quarterly':
        return text.quarterly;
      case 'mid_term':
        return text.midTerm;
      case 'final':
        return text.final;
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'quarterly':
        return 'bg-purple-100 text-purple-800';
      case 'mid_term':
        return 'bg-orange-100 text-orange-800';
      case 'final':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return text.excellent;
    if (score >= 80) return text.veryGood;
    if (score >= 70) return text.good;
    if (score >= 60) return text.fair;
    return text.needsImprovement;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="text-purple-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">{text.recentEvaluations}</h2>
        </div>
        <Link
          href={`/${locale}/evaluations`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {text.viewAll}
        </Link>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-8">{text.loading}</p>
        ) : evaluations.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{text.noEvaluations}</p>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {evaluation.trainee?.user?.full_name}
                  </h3>
                  <div className="flex flex-col gap-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>
                        {new Date(evaluation.evaluation_date).toLocaleDateString(locale)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(
                          evaluation.evaluation_type
                        )}`}
                      >
                        {getTypeText(evaluation.evaluation_type)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      {evaluation.overall_score}%
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getScoreColor(
                      evaluation.overall_score
                    )}`}
                  >
                    {getScoreLabel(evaluation.overall_score)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
