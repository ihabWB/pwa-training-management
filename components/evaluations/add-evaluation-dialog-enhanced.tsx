'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Award, Calendar, FileText, TrendingUp, CheckCircle2, AlertCircle, Target, Users } from 'lucide-react';
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

export default function AddEvaluationDialogEnhanced({
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
    technical_skills_score: 75,
    communication_score: 75,
    teamwork_score: 75,
    initiative_score: 75,
    professionalism_score: 75,
    strengths: '',
    areas_for_improvement: '',
    recommendations: '',
    notes: '',
  });

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`draft_evaluation_${trainee.id}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to load saved draft');
      }
    }
  }, [trainee.id]);

  useEffect(() => {
    localStorage.setItem(`draft_evaluation_${trainee.id}`, JSON.stringify(formData));
  }, [formData, trainee.id]);

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
      basicInfo: 'معلومات التقييم',
      scores: 'معايير التقييم',
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
      notes: 'ملاحظات إضافية',
      cancel: 'إلغاء',
      save: 'حفظ التقييم',
      saving: 'جاري الحفظ...',
      required: 'مطلوب',
      optional: 'اختياري',
      characters: 'حرف',
      excellent: 'ممتاز',
      veryGood: 'جيد جداً',
      good: 'جيد',
      fair: 'مقبول',
      needsImprovement: 'يحتاج تحسين',
      strengthsHint: 'اذكر نقاط القوة والإنجازات البارزة',
      improvementHint: 'حدد المجالات التي تحتاج إلى تطوير',
      recommendationsHint: 'قدم توصيات لتحسين الأداء',
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
      basicInfo: 'Evaluation Information',
      scores: 'Evaluation Criteria',
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
      notes: 'Additional Notes',
      cancel: 'Cancel',
      save: 'Save Evaluation',
      saving: 'Saving...',
      required: 'Required',
      optional: 'Optional',
      characters: 'characters',
      excellent: 'Excellent',
      veryGood: 'Very Good',
      good: 'Good',
      fair: 'Fair',
      needsImprovement: 'Needs Improvement',
      strengthsHint: 'Mention strengths and notable achievements',
      improvementHint: 'Identify areas that need development',
      recommendationsHint: 'Provide recommendations for performance improvement',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  // Calculate overall score
  const calculateOverallScore = () => {
    const scores = [
      formData.technical_skills_score,
      formData.communication_score,
      formData.teamwork_score,
      formData.initiative_score,
      formData.professionalism_score,
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return text.excellent;
    if (score >= 80) return text.veryGood;
    if (score >= 70) return text.good;
    if (score >= 60) return text.fair;
    return text.needsImprovement;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 80) return 'from-blue-500 to-blue-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'from-blue-500 to-blue-600';
      case 'quarterly': return 'from-green-500 to-green-600';
      case 'mid_term': return 'from-purple-500 to-purple-600';
      case 'final': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const overall_score = calculateOverallScore();

      // Insert evaluation with status 'pending'
      const { error } = await supabase.from('evaluations').insert({
        trainee_id: trainee.id,
        supervisor_id: supervisorId,
        evaluation_type: formData.evaluation_type,
        evaluation_date: formData.evaluation_date,
        period_start: formData.period_start || null,
        period_end: formData.period_end || null,
        technical_skills_score: formData.technical_skills_score,
        communication_score: formData.communication_score,
        teamwork_score: formData.teamwork_score,
        initiative_score: formData.initiative_score,
        professionalism_score: formData.professionalism_score,
        overall_score,
        strengths: formData.strengths,
        areas_for_improvement: formData.areas_for_improvement,
        recommendations: formData.recommendations || null,
        notes: formData.notes || null,
        status: 'pending', // التقييم يبدأ كـ pending
      });

      if (error) throw error;

      // Clear draft
      localStorage.removeItem(`draft_evaluation_${trainee.id}`);

      // Reset form
      setFormData({
        evaluation_type: 'monthly',
        evaluation_date: new Date().toISOString().split('T')[0],
        period_start: '',
        period_end: '',
        technical_skills_score: 75,
        communication_score: 75,
        teamwork_score: 75,
        initiative_score: 75,
        professionalism_score: 75,
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

  const overallScore = calculateOverallScore();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{text.addEvaluation}</h2>
            <p className="text-sm text-gray-600 mt-1">{trainee.full_name} • {trainee.institution_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Evaluation Type Selection - Highlighted */}
          <div className={`p-6 rounded-xl bg-gradient-to-r ${getTypeColor(formData.evaluation_type)} text-white shadow-lg`}>
            <div className="flex items-center gap-3 mb-4">
              <Award size={24} />
              <h2 className="text-xl font-bold">{text.evaluationType}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['monthly', 'quarterly', 'mid_term', 'final'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, evaluation_type: type as any })}
                  className={`p-4 rounded-lg transition-all ${
                    formData.evaluation_type === type
                      ? 'bg-white text-gray-900 shadow-md scale-105'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <div className="font-semibold">{text[type as keyof typeof text]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{text.basicInfo}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Evaluation Date */}
              <div className="space-y-2">
                <label htmlFor="evaluation_date" className="text-sm font-medium text-gray-700">
                  {text.evaluationDate} <span className="text-red-500">*</span>
                </label>
                <input
                  id="evaluation_date"
                  type="date"
                  value={formData.evaluation_date}
                  onChange={(e) => setFormData({ ...formData, evaluation_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Period Start */}
              <div className="space-y-2">
                <label htmlFor="period_start" className="text-sm font-medium text-gray-700">
                  {text.periodStart} <span className="text-gray-400">({text.optional})</span>
                </label>
                <input
                  id="period_start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Period End */}
              <div className="space-y-2">
                <label htmlFor="period_end" className="text-sm font-medium text-gray-700">
                  {text.periodEnd} <span className="text-gray-400">({text.optional})</span>
                </label>
                <input
                  id="period_end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Scores with Sliders */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{text.scores}</h3>
            </div>

            {/* Technical Skills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText size={16} />
                  {text.technicalSkills}
                </label>
                <span className="text-2xl font-bold text-blue-600">{formData.technical_skills_score}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.technical_skills_score}
                onChange={(e) => setFormData({ ...formData, technical_skills_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span className="font-semibold text-blue-600">{getScoreLabel(formData.technical_skills_score)}</span>
                <span>100%</span>
              </div>
            </div>

            {/* Communication */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users size={16} />
                  {text.communication}
                </label>
                <span className="text-2xl font-bold text-green-600">{formData.communication_score}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.communication_score}
                onChange={(e) => setFormData({ ...formData, communication_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span className="font-semibold text-green-600">{getScoreLabel(formData.communication_score)}</span>
                <span>100%</span>
              </div>
            </div>

            {/* Teamwork */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users size={16} />
                  {text.teamwork}
                </label>
                <span className="text-2xl font-bold text-purple-600">{formData.teamwork_score}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.teamwork_score}
                onChange={(e) => setFormData({ ...formData, teamwork_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span className="font-semibold text-purple-600">{getScoreLabel(formData.teamwork_score)}</span>
                <span>100%</span>
              </div>
            </div>

            {/* Initiative */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Target size={16} />
                  {text.initiative}
                </label>
                <span className="text-2xl font-bold text-orange-600">{formData.initiative_score}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.initiative_score}
                onChange={(e) => setFormData({ ...formData, initiative_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span className="font-semibold text-orange-600">{getScoreLabel(formData.initiative_score)}</span>
                <span>100%</span>
              </div>
            </div>

            {/* Professionalism */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {text.professionalism}
                </label>
                <span className="text-2xl font-bold text-indigo-600">{formData.professionalism_score}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.professionalism_score}
                onChange={(e) => setFormData({ ...formData, professionalism_score: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span className="font-semibold text-indigo-600">{getScoreLabel(formData.professionalism_score)}</span>
                <span>100%</span>
              </div>
            </div>

            {/* Overall Score Display */}
            <div className={`p-6 rounded-xl bg-gradient-to-r ${getScoreColor(overallScore)} text-white shadow-lg mt-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Award size={48} />
                  <div>
                    <div className="text-sm opacity-90">{text.overallScore}</div>
                    <div className="text-4xl font-bold">{overallScore}%</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{getScoreLabel(overallScore)}</div>
                  <div className="text-sm opacity-90">{locale === 'ar' ? 'محسوب تلقائياً' : 'Calculated automatically'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Strengths */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{text.strengths}</h3>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">{text.strengthsHint}</p>
              <textarea
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={locale === 'ar' ? 'اذكر نقاط القوة...' : 'Mention strengths...'}
                required
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              <div className="text-xs text-gray-500 text-left" dir="ltr">
                {formData.strengths.length} {text.characters}
              </div>
            </div>
          </div>

          {/* Section 4: Areas for Improvement */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertCircle className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{text.areasForImprovement}</h3>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">{text.improvementHint}</p>
              <textarea
                value={formData.areas_for_improvement}
                onChange={(e) => setFormData({ ...formData, areas_for_improvement: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={locale === 'ar' ? 'حدد المجالات...' : 'Identify areas...'}
                required
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
              <div className="text-xs text-gray-500 text-left" dir="ltr">
                {formData.areas_for_improvement.length} {text.characters}
              </div>
            </div>
          </div>

          {/* Section 5: Recommendations & Notes */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Target className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{text.recommendations}</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {text.recommendations} <span className="text-gray-400">({text.optional})</span>
              </label>
              <p className="text-xs text-gray-500">{text.recommendationsHint}</p>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={locale === 'ar' ? 'أضف توصيات...' : 'Add recommendations...'}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2 pt-4 border-t">
              <label className="text-sm font-medium text-gray-700">
                {text.notes} <span className="text-gray-400">({text.optional})</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={locale === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
              disabled={loading}
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {text.saving}
                </>
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
