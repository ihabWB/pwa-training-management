'use client';

import { useState } from 'react';
import { Award, Eye, Star, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Evaluation {
  id: string;
  title: string;
  description: string;
  score: number;
  feedback: string | null;
  evaluation_date: string;
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

  const handleView = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsViewDialogOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-100 text-green-800';
    if (score >= 3.5) return 'bg-blue-100 text-blue-800';
    if (score >= 2.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return locale === 'ar' ? 'ممتاز' : 'Excellent';
    if (score >= 3.5) return locale === 'ar' ? 'جيد جداً' : 'Very Good';
    if (score >= 2.5) return locale === 'ar' ? 'جيد' : 'Good';
    return locale === 'ar' ? 'مقبول' : 'Acceptable';
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (evaluations.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          {locale === 'ar' ? 'لا توجد تقييمات' : 'No evaluations found'}
        </p>
      </div>
    );
  }

  // Calculate average
  const averageScore =
    evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;

  return (
    <>
      {/* Average Score Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {locale === 'ar' ? 'متوسط التقييمات' : 'Average Score'}
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {(averageScore || 0).toFixed(2)} / 5.0
              </p>
            </div>
          </div>
          <div className="text-right">
            {renderStars(Math.round(averageScore || 0))}
            <p className="text-sm text-gray-600 mt-1">
              {evaluations.length} {locale === 'ar' ? 'تقييمات' : 'evaluations'}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'العنوان' : 'Title'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'التاريخ' : 'Date'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'الدرجة' : 'Score'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'التقدير' : 'Grade'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {evaluations.map((evaluation) => (
              <tr key={evaluation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-gray-400 ml-3" />
                    <div className="text-sm font-medium text-gray-900">
                      {evaluation.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(evaluation.evaluation_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {(evaluation.score || 0).toFixed(1)}
                    </span>
                    {renderStars(evaluation.score || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`w-fit ${getScoreColor(evaluation.score || 0)}`}>
                    {getScoreLabel(evaluation.score || 0)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(evaluation)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-4 h-4 ml-1" />
                    {locale === 'ar' ? 'عرض' : 'View'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Dialog */}
      {selectedEvaluation && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            isViewDialogOpen ? '' : 'hidden'
          }`}
          onClick={() => setIsViewDialogOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {locale === 'ar' ? 'تفاصيل التقييم' : 'Evaluation Details'}
              </h3>
              <Badge className={`${getScoreColor(selectedEvaluation.score)}`}>
                {getScoreLabel(selectedEvaluation.score)}
              </Badge>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'العنوان' : 'Title'}
                </label>
                <p className="text-gray-900 mt-1">{selectedEvaluation.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedEvaluation.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {locale === 'ar' ? 'الدرجة' : 'Score'}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">
                      {(selectedEvaluation.score || 0).toFixed(1)}
                    </span>
                    <span className="text-gray-500">/ 5.0</span>
                  </div>
                  <div className="mt-2">{renderStars(selectedEvaluation.score || 0)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {locale === 'ar' ? 'تاريخ التقييم' : 'Evaluation Date'}
                  </label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedEvaluation.evaluation_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedEvaluation.feedback && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <label className="text-sm font-medium text-purple-900">
                      {locale === 'ar' ? 'التعليقات' : 'Feedback'}
                    </label>
                  </div>
                  <p className="text-purple-800 whitespace-pre-wrap">
                    {selectedEvaluation.feedback}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
