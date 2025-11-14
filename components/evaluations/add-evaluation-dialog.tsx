'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AddEvaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locale: string;
  trainee: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    institution_name: string;
  };
  supervisorId: string;
}

export default function AddEvaluationDialog({
  isOpen,
  onClose,
  onSuccess,
  locale,
  trainee,
  supervisorId,
}: AddEvaluationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    evaluation_type: 'monthly' as 'monthly' | 'quarterly' | 'final' | 'mid_term',
    evaluation_date: new Date().toISOString().split('T')[0],
    period_start: '',
    period_end: '',
    technical_skills_score: '',
    communication_score: '',
    teamwork_score: '',
    initiative_score: '',
    professionalism_score: '',
    strengths: '',
    areas_for_improvement: '',
    recommendations: '',
    notes: '',
  });

  const t = {
    ar: {
      addEvaluation: 'إضافة تقييم جديد',
      trainee: 'المتدرب',
      evaluationType: 'نوع التقييم',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      mid_term: 'منتصف الفترة',
      final: 'نهائي',
      evaluationDate: 'تاريخ التقييم',
      period: 'الفترة',
      periodStart: 'بداية الفترة',
      periodEnd: 'نهاية الفترة',
      scores: 'الدرجات (من 100)',
      technicalSkills: 'المهارات التقنية',
      communication: 'التواصل',
      teamwork: 'العمل الجماعي',
      initiative: 'المبادرة',
      professionalism: 'الاحترافية',
      feedback: 'التغذية الراجعة',
      strengths: 'نقاط القوة',
      areasForImprovement: 'مجالات التحسين',
      recommendations: 'التوصيات',
      notes: 'ملاحظات إضافية',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      required: 'مطلوب',
      optional: 'اختياري',
    },
    en: {
      addEvaluation: 'Add New Evaluation',
      trainee: 'Trainee',
      evaluationType: 'Evaluation Type',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      mid_term: 'Mid-term',
      final: 'Final',
      evaluationDate: 'Evaluation Date',
      period: 'Period',
      periodStart: 'Period Start',
      periodEnd: 'Period End',
      scores: 'Scores (out of 100)',
      technicalSkills: 'Technical Skills',
      communication: 'Communication',
      teamwork: 'Teamwork',
      initiative: 'Initiative',
      professionalism: 'Professionalism',
      feedback: 'Feedback',
      strengths: 'Strengths',
      areasForImprovement: 'Areas for Improvement',
      recommendations: 'Recommendations',
      notes: 'Additional Notes',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      required: 'Required',
      optional: 'Optional',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Calculate overall score (average of all scores)
      const scores = [
        parseInt(formData.technical_skills_score),
        parseInt(formData.communication_score),
        parseInt(formData.teamwork_score),
        parseInt(formData.initiative_score),
        parseInt(formData.professionalism_score),
      ];
      const overall_score = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );

      // Insert evaluation
      const { error } = await supabase.from('evaluations').insert({
        trainee_id: trainee.id,
        supervisor_id: supervisorId,
        evaluation_type: formData.evaluation_type,
        evaluation_date: formData.evaluation_date,
        period_start: formData.period_start || null,
        period_end: formData.period_end || null,
        technical_skills_score: parseInt(formData.technical_skills_score),
        communication_score: parseInt(formData.communication_score),
        teamwork_score: parseInt(formData.teamwork_score),
        initiative_score: parseInt(formData.initiative_score),
        professionalism_score: parseInt(formData.professionalism_score),
        overall_score,
        strengths: formData.strengths,
        areas_for_improvement: formData.areas_for_improvement,
        recommendations: formData.recommendations || null,
        notes: formData.notes || null,
        status: 'pending', // التقييم يبدأ معلقاً حتى يعتمده الإدمن
      });

      if (error) throw error;

      // Reset form
      setFormData({
        evaluation_type: 'monthly',
        evaluation_date: new Date().toISOString().split('T')[0],
        period_start: '',
        period_end: '',
        technical_skills_score: '',
        communication_score: '',
        teamwork_score: '',
        initiative_score: '',
        professionalism_score: '',
        strengths: '',
        areas_for_improvement: '',
        recommendations: '',
        notes: '',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating evaluation:', error);
      alert('Error creating evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{text.addEvaluation}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trainee Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {text.trainee}
            </label>
            <div className="text-base font-semibold text-gray-900">
              {trainee.full_name}
            </div>
            <div className="text-sm text-gray-600">{trainee.institution_name}</div>
          </div>

          {/* Evaluation Type and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.evaluationType} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.evaluation_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    evaluation_type: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <option value="monthly">{text.monthly}</option>
                <option value="quarterly">{text.quarterly}</option>
                <option value="mid_term">{text.mid_term}</option>
                <option value="final">{text.final}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.evaluationDate} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.evaluation_date}
                onChange={(e) =>
                  setFormData({ ...formData, evaluation_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.periodStart} <span className="text-gray-400">({text.optional})</span>
              </label>
              <input
                type="date"
                value={formData.period_start}
                onChange={(e) =>
                  setFormData({ ...formData, period_start: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.periodEnd} <span className="text-gray-400">({text.optional})</span>
              </label>
              <input
                type="date"
                value={formData.period_end}
                onChange={(e) =>
                  setFormData({ ...formData, period_end: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Scores Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{text.scores}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technical Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {text.technicalSkills} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.technical_skills_score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      technical_skills_score: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Communication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {text.communication} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.communication_score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      communication_score: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Teamwork */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {text.teamwork} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.teamwork_score}
                  onChange={(e) =>
                    setFormData({ ...formData, teamwork_score: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Initiative */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {text.initiative} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.initiative_score}
                  onChange={(e) =>
                    setFormData({ ...formData, initiative_score: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Professionalism */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {text.professionalism} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.professionalism_score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      professionalism_score: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{text.feedback}</h3>
            
            {/* Strengths */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.strengths} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.strengths}
                onChange={(e) =>
                  setFormData({ ...formData, strengths: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Areas for Improvement */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.areasForImprovement} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.areas_for_improvement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    areas_for_improvement: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Recommendations */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.recommendations} <span className="text-gray-400">({text.optional})</span>
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) =>
                  setFormData({ ...formData, recommendations: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.notes} <span className="text-gray-400">({text.optional})</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                text.saving
              ) : (
                <>
                  <Plus size={20} />
                  {text.save}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
