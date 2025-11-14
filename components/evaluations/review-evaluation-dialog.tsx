'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, XCircle, Award, Calendar, User, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Evaluation {
  id: string;
  trainee_name: string;
  supervisor_name: string;
  evaluation_type: 'monthly' | 'quarterly' | 'final' | 'mid_term';
  evaluation_date: string;
  period_start: string | null;
  period_end: string | null;
  technical_skills_score: number;
  communication_score: number;
  teamwork_score: number;
  initiative_score: number;
  professionalism_score: number;
  overall_score: number;
  strengths: string;
  areas_for_improvement: string;
  recommendations: string | null;
  notes: string | null;
  status?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  admin_feedback?: string | null;
}

interface ReviewEvaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation | null;
  locale: string;
}

export default function ReviewEvaluationDialog({
  isOpen,
  onClose,
  evaluation,
  locale,
}: ReviewEvaluationDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminFeedback, setAdminFeedback] = useState('');

  const handleReview = async (newStatus: 'approved' | 'rejected') => {
    if (!evaluation) return;
    
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('evaluations')
        .update({
          status: newStatus,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          admin_feedback: adminFeedback || null,
        })
        .eq('id', evaluation.id);

      if (updateError) throw updateError;

      // Success
      router.refresh();
      onClose();
      setAdminFeedback('');
    } catch (err: any) {
      console.error('Error reviewing evaluation:', err);
      setError(err.message || 'Failed to review evaluation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !evaluation) return null;

  const evaluationTypeLabels = {
    monthly: locale === 'ar' ? 'شهري' : 'Monthly',
    quarterly: locale === 'ar' ? 'ربع سنوي' : 'Quarterly',
    mid_term: locale === 'ar' ? 'منتصف الفترة' : 'Mid-term',
    final: locale === 'ar' ? 'نهائي' : 'Final',
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return locale === 'ar' ? 'ممتاز' : 'Excellent';
    if (score >= 80) return locale === 'ar' ? 'جيد جداً' : 'Very Good';
    if (score >= 70) return locale === 'ar' ? 'جيد' : 'Good';
    if (score >= 60) return locale === 'ar' ? 'مقبول' : 'Fair';
    return locale === 'ar' ? 'يحتاج تحسين' : 'Needs Improvement';
  };

  const ScoreBar = ({ score, label }: { score: number; label: string }) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all"
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {locale === 'ar' ? 'مراجعة التقييم' : 'Review Evaluation'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {evaluation.trainee_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="text-gray-400" size={20} />
              <div>
                <div className="text-xs text-gray-500">
                  {locale === 'ar' ? 'المشرف' : 'Supervisor'}
                </div>
                <div className="font-medium text-gray-900">{evaluation.supervisor_name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <div className="text-xs text-gray-500">
                  {locale === 'ar' ? 'نوع التقييم' : 'Evaluation Type'}
                </div>
                <div className="font-medium text-gray-900">
                  {evaluationTypeLabels[evaluation.evaluation_type]}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Award size={48} className="text-blue-600" />
                <div>
                  <div className="text-sm text-gray-600">
                    {locale === 'ar' ? 'الدرجة الإجمالية' : 'Overall Score'}
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    {evaluation.overall_score}%
                  </div>
                </div>
              </div>
              <div className={`px-6 py-3 rounded-lg font-bold text-lg ${getScoreColor(evaluation.overall_score)}`}>
                {getScoreLabel(evaluation.overall_score)}
              </div>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ar' ? 'الدرجات التفصيلية' : 'Detailed Scores'}
            </h3>
            <ScoreBar
              score={evaluation.technical_skills_score}
              label={locale === 'ar' ? 'المهارات التقنية' : 'Technical Skills'}
            />
            <ScoreBar
              score={evaluation.communication_score}
              label={locale === 'ar' ? 'التواصل' : 'Communication'}
            />
            <ScoreBar
              score={evaluation.teamwork_score}
              label={locale === 'ar' ? 'العمل الجماعي' : 'Teamwork'}
            />
            <ScoreBar
              score={evaluation.initiative_score}
              label={locale === 'ar' ? 'المبادرة' : 'Initiative'}
            />
            <ScoreBar
              score={evaluation.professionalism_score}
              label={locale === 'ar' ? 'الاحترافية' : 'Professionalism'}
            />
          </div>

          {/* Strengths */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              {locale === 'ar' ? 'نقاط القوة' : 'Strengths'}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {evaluation.strengths}
            </p>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">
              {locale === 'ar' ? 'مجالات التحسين' : 'Areas for Improvement'}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {evaluation.areas_for_improvement}
            </p>
          </div>

          {/* Recommendations */}
          {evaluation.recommendations && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                {locale === 'ar' ? 'التوصيات' : 'Recommendations'}
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {evaluation.recommendations}
              </p>
            </div>
          )}

          {/* Notes */}
          {evaluation.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {locale === 'ar' ? 'ملاحظات' : 'Notes'}
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {evaluation.notes}
              </p>
            </div>
          )}

          {/* Admin Feedback */}
          {evaluation.status === 'pending' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {locale === 'ar' ? 'ملاحظات الإدارة' : 'Admin Feedback'}
              </label>
              <textarea
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder={
                  locale === 'ar'
                    ? 'أضف ملاحظاتك هنا...'
                    : 'Add your feedback here...'
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          )}

          {/* Actions */}
          {(!evaluation.status || evaluation.status === 'pending') && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleReview('rejected')}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <XCircle size={18} />
                )}
                {locale === 'ar' ? 'رفض' : 'Reject'}
              </button>
              <button
                onClick={() => handleReview('approved')}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Check size={18} />
                )}
                {locale === 'ar' ? 'اعتماد' : 'Approve'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
