'use client';

import { useState } from 'react';
import { Award, Eye, Calendar, TrendingUp, Target, MessageSquare, X } from 'lucide-react';

interface Evaluation {
  id: string;
  evaluation_type: string;
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
  status: string;
  admin_feedback: string | null;
  created_at: string;
}

interface TraineeEvaluationsTableProps {
  evaluations: Evaluation[];
  locale: string;
}

export default function TraineeEvaluationsTable({
  evaluations,
  locale,
}: TraineeEvaluationsTableProps) {
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const t = {
    ar: {
      noEvaluations: 'لا توجد تقييمات معتمدة',
      noEvaluationsDesc: 'ستظهر التقييمات هنا بعد اعتمادها من قبل الإدارة',
      averageScore: 'متوسط التقييمات',
      evaluations: 'تقييمات',
      type: 'النوع',
      date: 'التاريخ',
      overallScore: 'الدرجة الإجمالية',
      grade: 'التقدير',
      actions: 'الإجراءات',
      view: 'عرض',
      evaluationDetails: 'تفاصيل التقييم',
      evaluationType: 'نوع التقييم',
      evaluationDate: 'تاريخ التقييم',
      evaluationPeriod: 'فترة التقييم',
      to: 'إلى',
      scores: 'الدرجات التفصيلية',
      technicalSkills: 'المهارات التقنية',
      communication: 'التواصل',
      teamwork: 'العمل الجماعي',
      initiative: 'المبادرة',
      professionalism: 'الاحترافية',
      strengths: 'نقاط القوة',
      areasForImprovement: 'مجالات التحسين',
      recommendations: 'التوصيات',
      notes: 'ملاحظات',
      adminFeedback: 'ملاحظات الإدارة',
      close: 'إغلاق',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      mid_term: 'منتصف الفترة',
      final: 'نهائي',
      excellent: 'ممتاز',
      veryGood: 'جيد جداً',
      good: 'جيد',
      fair: 'مقبول',
      needsImprovement: 'يحتاج تحسين',
    },
    en: {
      noEvaluations: 'No approved evaluations',
      noEvaluationsDesc: 'Evaluations will appear here after being approved by administration',
      averageScore: 'Average Score',
      evaluations: 'evaluations',
      type: 'Type',
      date: 'Date',
      overallScore: 'Overall Score',
      grade: 'Grade',
      actions: 'Actions',
      view: 'View',
      evaluationDetails: 'Evaluation Details',
      evaluationType: 'Evaluation Type',
      evaluationDate: 'Evaluation Date',
      evaluationPeriod: 'Evaluation Period',
      to: 'to',
      scores: 'Detailed Scores',
      technicalSkills: 'Technical Skills',
      communication: 'Communication',
      teamwork: 'Teamwork',
      initiative: 'Initiative',
      professionalism: 'Professionalism',
      strengths: 'Strengths',
      areasForImprovement: 'Areas for Improvement',
      recommendations: 'Recommendations',
      notes: 'Notes',
      adminFeedback: 'Admin Feedback',
      close: 'Close',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      mid_term: 'Mid-Term',
      final: 'Final',
      excellent: 'Excellent',
      veryGood: 'Very Good',
      good: 'Good',
      fair: 'Fair',
      needsImprovement: 'Needs Improvement',
    },
  };

  const text = t[locale as keyof typeof t] || t.en;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return text.excellent;
    if (score >= 80) return text.veryGood;
    if (score >= 70) return text.good;
    if (score >= 60) return text.fair;
    return text.needsImprovement;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'quarterly':
        return 'bg-purple-100 text-purple-800';
      case 'mid_term':
        return 'bg-yellow-100 text-yellow-800';
      case 'final':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-16">
        <Award className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{text.noEvaluations}</h3>
        <p className="text-gray-500">{text.noEvaluationsDesc}</p>
      </div>
    );
  }

  // Calculate average
  const averageScore = evaluations.reduce((sum, e) => sum + e.overall_score, 0) / evaluations.length;

  return (
    <>
      {/* Average Score Card */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-blue-200 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{text.averageScore}</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">
                {Math.round(averageScore)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {evaluations.length} {text.evaluations}
              </p>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-full border-2 font-bold text-lg ${getScoreColor(averageScore)}`}>
            {getScoreLabel(averageScore)}
          </div>
        </div>
      </div>

      {/* Evaluations Cards */}
      <div className="space-y-4">
        {evaluations.map((evaluation) => (
          <div
            key={evaluation.id}
            className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(evaluation.evaluation_type)}`}>
                      {text[evaluation.evaluation_type as keyof typeof text]}
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(evaluation.evaluation_date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {evaluation.overall_score}%
                  </div>
                  <div className={`px-3 py-1 rounded-full border-2 text-sm font-semibold ${getScoreColor(evaluation.overall_score)}`}>
                    {getScoreLabel(evaluation.overall_score)}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{text.technicalSkills}</div>
                  <div className="text-lg font-bold text-gray-900">{evaluation.technical_skills_score}%</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{text.communication}</div>
                  <div className="text-lg font-bold text-gray-900">{evaluation.communication_score}%</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{text.teamwork}</div>
                  <div className="text-lg font-bold text-gray-900">{evaluation.teamwork_score}%</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{text.initiative}</div>
                  <div className="text-lg font-bold text-gray-900">{evaluation.initiative_score}%</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">{text.professionalism}</div>
                  <div className="text-lg font-bold text-gray-900">{evaluation.professionalism_score}%</div>
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => {
                  setSelectedEvaluation(evaluation);
                  setIsViewDialogOpen(true);
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                {text.view}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Dialog */}
      {isViewDialogOpen && selectedEvaluation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">{text.evaluationDetails}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {new Date(selectedEvaluation.evaluation_date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Overall Score Banner */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">{text.overallScore}</p>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold text-gray-900">
                        {selectedEvaluation.overall_score}%
                      </div>
                      <div className={`px-4 py-2 rounded-full border-2 font-bold ${getScoreColor(selectedEvaluation.overall_score)}`}>
                        {getScoreLabel(selectedEvaluation.overall_score)}
                      </div>
                    </div>
                  </div>
                  <div className={`px-6 py-3 rounded-full text-sm font-medium ${getTypeColor(selectedEvaluation.evaluation_type)}`}>
                    {text[selectedEvaluation.evaluation_type as keyof typeof text]}
                  </div>
                </div>
              </div>

              {/* Evaluation Period */}
              {selectedEvaluation.period_start && selectedEvaluation.period_end && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {text.evaluationPeriod}
                  </p>
                  <p className="text-gray-900">
                    {new Date(selectedEvaluation.period_start).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                    {' '}{text.to}{' '}
                    {new Date(selectedEvaluation.period_end).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
              )}

              {/* Detailed Scores */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  {text.scores}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Technical Skills */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">{text.technicalSkills}</p>
                      <span className="text-2xl font-bold text-gray-900">{selectedEvaluation.technical_skills_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          selectedEvaluation.technical_skills_score >= 80 ? 'bg-green-500' :
                          selectedEvaluation.technical_skills_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedEvaluation.technical_skills_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Communication */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">{text.communication}</p>
                      <span className="text-2xl font-bold text-gray-900">{selectedEvaluation.communication_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          selectedEvaluation.communication_score >= 80 ? 'bg-green-500' :
                          selectedEvaluation.communication_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedEvaluation.communication_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Teamwork */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">{text.teamwork}</p>
                      <span className="text-2xl font-bold text-gray-900">{selectedEvaluation.teamwork_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          selectedEvaluation.teamwork_score >= 80 ? 'bg-green-500' :
                          selectedEvaluation.teamwork_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedEvaluation.teamwork_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Initiative */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">{text.initiative}</p>
                      <span className="text-2xl font-bold text-gray-900">{selectedEvaluation.initiative_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          selectedEvaluation.initiative_score >= 80 ? 'bg-green-500' :
                          selectedEvaluation.initiative_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedEvaluation.initiative_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Professionalism */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">{text.professionalism}</p>
                      <span className="text-2xl font-bold text-gray-900">{selectedEvaluation.professionalism_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          selectedEvaluation.professionalism_score >= 80 ? 'bg-green-500' :
                          selectedEvaluation.professionalism_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedEvaluation.professionalism_score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {selectedEvaluation.strengths && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {text.strengths}
                  </p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEvaluation.strengths}
                  </p>
                </div>
              )}

              {/* Areas for Improvement */}
              {selectedEvaluation.areas_for_improvement && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {text.areasForImprovement}
                  </p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEvaluation.areas_for_improvement}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {selectedEvaluation.recommendations && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {text.recommendations}
                  </p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEvaluation.recommendations}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedEvaluation.notes && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {text.notes}
                  </p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEvaluation.notes}
                  </p>
                </div>
              )}

              {/* Admin Feedback */}
              {selectedEvaluation.admin_feedback && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {text.adminFeedback}
                  </p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEvaluation.admin_feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl border-t-2 border-gray-200">
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
              >
                {text.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
