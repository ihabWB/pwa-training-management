'use client';

import { X, Calendar, User, Award, TrendingUp, TrendingDown, FileText } from 'lucide-react';

interface Evaluation {
  id: string;
  trainee_name: string;
  institution_name: string;
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
  created_at: string;
}

interface ViewEvaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation;
  locale: string;
}

export default function ViewEvaluationDialog({
  isOpen,
  onClose,
  evaluation,
  locale,
}: ViewEvaluationDialogProps) {
  const t = {
    ar: {
      evaluationDetails: 'تفاصيل التقييم',
      trainee: 'المتدرب',
      institution: 'المؤسسة',
      supervisor: 'المشرف',
      evaluationType: 'نوع التقييم',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      mid_term: 'منتصف الفترة',
      final: 'نهائي',
      evaluationDate: 'تاريخ التقييم',
      period: 'فترة التقييم',
      to: 'إلى',
      scores: 'الدرجات',
      technicalSkills: 'المهارات التقنية',
      communication: 'التواصل',
      teamwork: 'العمل الجماعي',
      initiative: 'المبادرة',
      professionalism: 'الاحترافية',
      overallScore: 'الدرجة الإجمالية',
      feedback: 'التغذية الراجعة',
      strengths: 'نقاط القوة',
      areasForImprovement: 'مجالات التحسين',
      recommendations: 'التوصيات',
      notes: 'ملاحظات',
      close: 'إغلاق',
      excellent: 'ممتاز',
      veryGood: 'جيد جداً',
      good: 'جيد',
      fair: 'مقبول',
      needsImprovement: 'يحتاج تحسين',
    },
    en: {
      evaluationDetails: 'Evaluation Details',
      trainee: 'Trainee',
      institution: 'Institution',
      supervisor: 'Supervisor',
      evaluationType: 'Evaluation Type',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      mid_term: 'Mid-term',
      final: 'Final',
      evaluationDate: 'Evaluation Date',
      period: 'Evaluation Period',
      to: 'to',
      scores: 'Scores',
      technicalSkills: 'Technical Skills',
      communication: 'Communication',
      teamwork: 'Teamwork',
      initiative: 'Initiative',
      professionalism: 'Professionalism',
      overallScore: 'Overall Score',
      feedback: 'Feedback',
      strengths: 'Strengths',
      areasForImprovement: 'Areas for Improvement',
      recommendations: 'Recommendations',
      notes: 'Notes',
      close: 'Close',
      excellent: 'Excellent',
      veryGood: 'Very Good',
      good: 'Good',
      fair: 'Fair',
      needsImprovement: 'Needs Improvement',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-700 bg-green-100';
    if (score >= 80) return 'text-blue-700 bg-blue-100';
    if (score >= 70) return 'text-yellow-700 bg-yellow-100';
    if (score >= 60) return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return text.excellent;
    if (score >= 80) return text.veryGood;
    if (score >= 70) return text.good;
    if (score >= 60) return text.fair;
    return text.needsImprovement;
  };

  const ScoreBar = ({ score, label }: { score: number; label: string }) => (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            score >= 90
              ? 'bg-green-600'
              : score >= 80
              ? 'bg-blue-600'
              : score >= 70
              ? 'bg-yellow-600'
              : score >= 60
              ? 'bg-orange-600'
              : 'bg-red-600'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{text.evaluationDetails}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.trainee}
              </label>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="text-base font-semibold text-gray-900">
                  {evaluation.trainee_name}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.institution}
              </label>
              <div className="text-base text-gray-900">{evaluation.institution_name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.supervisor}
              </label>
              <div className="text-base text-gray-900">{evaluation.supervisor_name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.evaluationType}
              </label>
              <div className="text-base font-medium text-blue-700">
                {text[evaluation.evaluation_type as keyof typeof text]}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.evaluationDate}
              </label>
              <div className="flex items-center gap-2 text-base text-gray-900">
                <Calendar size={16} className="text-gray-400" />
                {new Date(evaluation.evaluation_date).toLocaleDateString(
                  locale === 'ar' ? 'ar-EG' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </div>
            </div>

            {evaluation.period_start && evaluation.period_end && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {text.period}
                </label>
                <div className="text-base text-gray-900">
                  {new Date(evaluation.period_start).toLocaleDateString(
                    locale === 'ar' ? 'ar-EG' : 'en-US'
                  )}{' '}
                  {text.to}{' '}
                  {new Date(evaluation.period_end).toLocaleDateString(
                    locale === 'ar' ? 'ar-EG' : 'en-US'
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Overall Score */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Award size={32} className="text-blue-600" />
                <div>
                  <div className="text-sm text-gray-600">{text.overallScore}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {evaluation.overall_score}%
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-semibold ${getScoreColor(evaluation.overall_score)}`}>
                {getScoreLabel(evaluation.overall_score)}
              </div>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{text.scores}</h3>
            <div className="space-y-1">
              <ScoreBar
                score={evaluation.technical_skills_score}
                label={text.technicalSkills}
              />
              <ScoreBar
                score={evaluation.communication_score}
                label={text.communication}
              />
              <ScoreBar score={evaluation.teamwork_score} label={text.teamwork} />
              <ScoreBar score={evaluation.initiative_score} label={text.initiative} />
              <ScoreBar
                score={evaluation.professionalism_score}
                label={text.professionalism}
              />
            </div>
          </div>

          {/* Feedback */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{text.feedback}</h3>

            {/* Strengths */}
            <div className="mb-4 bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-green-600" />
                <label className="text-sm font-medium text-green-900">
                  {text.strengths}
                </label>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {evaluation.strengths}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="mb-4 bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={20} className="text-orange-600" />
                <label className="text-sm font-medium text-orange-900">
                  {text.areasForImprovement}
                </label>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {evaluation.areas_for_improvement}
              </div>
            </div>

            {/* Recommendations */}
            {evaluation.recommendations && (
              <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={20} className="text-blue-600" />
                  <label className="text-sm font-medium text-blue-900">
                    {text.recommendations}
                  </label>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {evaluation.recommendations}
                </div>
              </div>
            )}

            {/* Notes */}
            {evaluation.notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {text.notes}
                </label>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {evaluation.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            {text.close}
          </button>
        </div>
      </div>
    </div>
  );
}
