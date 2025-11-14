'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  FileText, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Target,
  TrendingUp,
  CheckCircle2,
  Save
} from 'lucide-react';

interface NewReportFormProps {
  traineeId: string;
  locale: string;
}

export default function NewReportForm({ traineeId, locale }: NewReportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    report_type: 'daily',
    title: '',
    content: '',
    work_done: '',
    challenges: '',
    next_steps: '',
    hours_worked: '',
    productivity_level: 3,
    report_date: new Date().toISOString().split('T')[0],
  });

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('draft_report');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to load saved draft');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('draft_report', JSON.stringify(formData));
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          trainee_id: traineeId,
          report_type: formData.report_type,
          title: formData.title,
          content: formData.content || null,
          work_done: formData.work_done || null,
          challenges: formData.challenges || null,
          next_steps: formData.next_steps || null,
          hours_worked: formData.hours_worked ? parseFloat(formData.hours_worked) : null,
          productivity_level: formData.productivity_level,
          report_date: formData.report_date,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Clear draft
      localStorage.removeItem('draft_report');

      // Redirect back to reports list
      router.push(`/${locale}/trainee/my-reports`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'فشل في إضافة التقرير');
    } finally {
      setLoading(false);
    }
  };

  const t = {
    ar: {
      // Types
      reportType: 'نوع التقرير',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      
      // Sections
      basicInfo: 'المعلومات الأساسية',
      workDetails: 'تفاصيل العمل',
      challenges: 'التحديات والصعوبات',
      nextSteps: 'الخطوات القادمة',
      
      // Fields
      title: 'عنوان التقرير',
      reportDate: 'تاريخ التقرير',
      hoursWorked: 'عدد ساعات العمل',
      productivityLevel: 'مستوى الإنتاجية',
      workDone: 'العمل المنجز',
      challengesFaced: 'التحديات المواجهة',
      nextStepsPlanned: 'الخطوات القادمة',
      additionalNotes: 'ملاحظات إضافية',
      
      // Buttons
      submit: 'إرسال التقرير',
      cancel: 'إلغاء',
      submitting: 'جاري الإرسال...',
      saveDraft: 'حفظ كمسودة',
      
      // Placeholders
      titlePlaceholder: 'مثال: تقرير عمل يوم الأحد',
      workDonePlaceholder: 'صف الأعمال والمهام التي أنجزتها...',
      challengesPlaceholder: 'ما هي الصعوبات التي واجهتها؟',
      nextStepsPlaceholder: 'ما هي خططك للفترة القادمة؟',
      notesPlaceholder: 'أي ملاحظات أو تعليقات إضافية...',
      
      // Hints
      workDoneHint: 'اذكر المهام التي أنجزتها بالتفصيل',
      challengesHint: 'شارك أي صعوبات واجهتها وكيف تعاملت معها',
      nextStepsHint: 'خطط عملك للفترة القادمة',
      
      // Progress
      veryLow: 'منخفض جداً',
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      veryHigh: 'عالي جداً',
      
      // Character count
      characters: 'حرف',
    },
    en: {
      reportType: 'Report Type',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      basicInfo: 'Basic Information',
      workDetails: 'Work Details',
      challenges: 'Challenges',
      nextSteps: 'Next Steps',
      title: 'Report Title',
      reportDate: 'Report Date',
      hoursWorked: 'Hours Worked',
      productivityLevel: 'Productivity Level',
      workDone: 'Work Done',
      challengesFaced: 'Challenges Faced',
      nextStepsPlanned: 'Next Steps',
      additionalNotes: 'Additional Notes',
      submit: 'Submit Report',
      cancel: 'Cancel',
      submitting: 'Submitting...',
      saveDraft: 'Save Draft',
      titlePlaceholder: 'Example: Sunday Work Report',
      workDonePlaceholder: 'Describe the work and tasks you completed...',
      challengesPlaceholder: 'What difficulties did you face?',
      nextStepsPlaceholder: 'What are your plans for the next period?',
      notesPlaceholder: 'Any additional notes or comments...',
      workDoneHint: 'List the tasks you completed in detail',
      challengesHint: 'Share any difficulties and how you handled them',
      nextStepsHint: 'Your work plans for the coming period',
      veryLow: 'Very Low',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      veryHigh: 'Very High',
      characters: 'characters',
    },
  };

  const text = t[locale as keyof typeof t] || t.en;

  const getProductivityLabel = (level: number) => {
    const labels = [text.veryLow, text.low, text.medium, text.high, text.veryHigh];
    return labels[level - 1];
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'from-blue-500 to-blue-600';
      case 'weekly': return 'from-green-500 to-green-600';
      case 'monthly': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Report Type Selection - Highlighted */}
      <div className={`p-6 rounded-xl bg-gradient-to-r ${getReportTypeColor(formData.report_type)} text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-4">
          <FileText size={24} />
          <h2 className="text-xl font-bold">{text.reportType}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['daily', 'weekly', 'monthly'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, report_type: type })}
              className={`p-4 rounded-lg transition-all ${
                formData.report_type === type
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Report Date */}
          <div className="space-y-2">
            <label htmlFor="report_date" className="text-sm font-medium text-gray-700">
              {text.reportDate}
            </label>
            <Input
              id="report_date"
              type="date"
              value={formData.report_date}
              onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
              required
            />
          </div>

          {/* Hours Worked */}
          <div className="space-y-2">
            <label htmlFor="hours_worked" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock size={16} />
              {text.hoursWorked}
            </label>
            <Input
              id="hours_worked"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.hours_worked}
              onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
              placeholder="8.0"
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            {text.title}
          </label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={text.titlePlaceholder}
            required
          />
        </div>

        {/* Productivity Level */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <TrendingUp size={16} />
            {text.productivityLevel}
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="5"
              value={formData.productivity_level}
              onChange={(e) => setFormData({ ...formData, productivity_level: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{text.veryLow}</span>
              <span className="font-semibold text-blue-600">{getProductivityLabel(formData.productivity_level)}</span>
              <span>{text.veryHigh}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Work Done */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle2 className="text-green-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{text.workDetails}</h3>
        </div>

        <div className="space-y-2">
          <label htmlFor="work_done" className="text-sm font-medium text-gray-700">
            {text.workDone}
          </label>
          <p className="text-xs text-gray-500">{text.workDoneHint}</p>
          <textarea
            id="work_done"
            value={formData.work_done}
            onChange={(e) => setFormData({ ...formData, work_done: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={text.workDonePlaceholder}
            required
          />
          <div className="text-xs text-gray-500 text-left" dir="ltr">
            {formData.work_done.length} {text.characters}
          </div>
        </div>
      </div>

      {/* Section 3: Challenges */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <AlertCircle className="text-yellow-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{text.challenges}</h3>
        </div>

        <div className="space-y-2">
          <label htmlFor="challenges" className="text-sm font-medium text-gray-700">
            {text.challengesFaced}
          </label>
          <p className="text-xs text-gray-500">{text.challengesHint}</p>
          <textarea
            id="challenges"
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={text.challengesPlaceholder}
          />
          <div className="text-xs text-gray-500 text-left" dir="ltr">
            {formData.challenges.length} {text.characters}
          </div>
        </div>
      </div>

      {/* Section 4: Next Steps */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Target className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{text.nextSteps}</h3>
        </div>

        <div className="space-y-2">
          <label htmlFor="next_steps" className="text-sm font-medium text-gray-700">
            {text.nextStepsPlanned}
          </label>
          <p className="text-xs text-gray-500">{text.nextStepsHint}</p>
          <textarea
            id="next_steps"
            value={formData.next_steps}
            onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={text.nextStepsPlaceholder}
          />
          <div className="text-xs text-gray-500 text-left" dir="ltr">
            {formData.next_steps.length} {text.characters}
          </div>
        </div>

        {/* Additional Notes (Optional) */}
        <div className="space-y-2 pt-4 border-t">
          <label htmlFor="content" className="text-sm font-medium text-gray-700">
            {text.additionalNotes} <span className="text-gray-400 font-normal">(اختياري)</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={text.notesPlaceholder}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="gap-2"
        >
          {text.cancel}
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {text.submitting}
            </>
          ) : (
            <>
              <ArrowRight size={18} />
              {text.submit}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
