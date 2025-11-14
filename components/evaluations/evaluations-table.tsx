'use client';

import { useState } from 'react';
import { Search, Award, Calendar, User, Plus } from 'lucide-react';
import ViewEvaluationDialog from './view-evaluation-dialog';
import AddEvaluationDialogEnhanced from './add-evaluation-dialog-enhanced';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Evaluation {
  id: string;
  trainee_id: string;
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

interface Trainee {
  id: string;
  user_id: string;
  institution_id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  institution: {
    id: string;
    name_ar: string;
    name_en: string;
  };
}

interface EvaluationsTableProps {
  evaluations: Evaluation[];
  locale: string;
  userRole?: string;
  supervisorId?: string | null;
  assignedTrainees?: Trainee[];
}

export default function EvaluationsTable({
  evaluations,
  locale,
  userRole,
  supervisorId,
  assignedTrainees = [],
}: EvaluationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>('');

  const t = {
    ar: {
      search: 'بحث عن تقييم...',
      type: 'النوع',
      all: 'الكل',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      mid_term: 'منتصف الفترة',
      final: 'نهائي',
      trainee: 'المتدرب',
      evaluationType: 'نوع التقييم',
      evaluationDate: 'التاريخ',
      overallScore: 'الدرجة الإجمالية',
      actions: 'الإجراءات',
      view: 'عرض',
      results: 'نتيجة',
      noEvaluations: 'لا توجد تقييمات',
      excellent: 'ممتاز',
      veryGood: 'جيد جداً',
      good: 'جيد',
      fair: 'مقبول',
      needsImprovement: 'يحتاج تحسين',
      addEvaluation: 'إضافة تقييم',
      selectTrainee: 'اختر المتدرب',
      pleaseSelectTrainee: 'الرجاء اختيار متدرب أولاً',
    },
    en: {
      search: 'Search for evaluation...',
      type: 'Type',
      all: 'All',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      mid_term: 'Mid-term',
      final: 'Final',
      trainee: 'Trainee',
      evaluationType: 'Evaluation Type',
      evaluationDate: 'Date',
      overallScore: 'Overall Score',
      actions: 'Actions',
      view: 'View',
      results: 'results',
      noEvaluations: 'No evaluations available',
      excellent: 'Excellent',
      veryGood: 'Very Good',
      good: 'Good',
      fair: 'Fair',
      needsImprovement: 'Needs Improvement',
      addEvaluation: 'Add Evaluation',
      selectTrainee: 'Select Trainee',
      pleaseSelectTrainee: 'Please select a trainee first',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const handleAddEvaluation = () => {
    if (!selectedTraineeId) {
      alert(text.pleaseSelectTrainee);
      return;
    }
    setIsAddDialogOpen(true);
  };

  // Filter evaluations
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.trainee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.institution_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === 'all' || evaluation.evaluation_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
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

  return (
    <div className="space-y-6">
      {/* Add Evaluation Section - Only for Supervisors */}
      {userRole === 'supervisor' && supervisorId && assignedTrainees.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">{text.selectTrainee}</label>
              <Select value={selectedTraineeId} onValueChange={setSelectedTraineeId}>
                <SelectTrigger>
                  <SelectValue placeholder={text.selectTrainee} />
                </SelectTrigger>
                <SelectContent>
                  {assignedTrainees.map((trainee) => (
                    <SelectItem key={trainee.id} value={trainee.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{trainee.user?.full_name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({locale === 'ar' ? trainee.institution?.name_ar : trainee.institution?.name_en})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddEvaluation} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {text.addEvaluation}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluations Table */}
      <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={text.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="all">{text.all}</option>
            <option value="monthly">{text.monthly}</option>
            <option value="quarterly">{text.quarterly}</option>
            <option value="mid_term">{text.mid_term}</option>
            <option value="final">{text.final}</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredEvaluations.length} {text.results}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{text.noEvaluations}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.trainee}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.evaluationType}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.evaluationDate}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.overallScore}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {evaluation.trainee_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {evaluation.institution_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                        evaluation.evaluation_type
                      )}`}
                    >
                      {text[evaluation.evaluation_type as keyof typeof text]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar size={16} className="text-gray-400" />
                      {new Date(evaluation.evaluation_date).toLocaleDateString(
                        locale === 'ar' ? 'ar-EG' : 'en-US'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-gray-400" />
                      <span
                        className={`px-2 py-1 text-sm font-bold rounded ${getScoreColor(
                          evaluation.overall_score
                        )}`}
                      >
                        {evaluation.overall_score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedEvaluation(evaluation);
                        setShowViewDialog(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {text.view}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>

      {/* View Evaluation Dialog */}
      {showViewDialog && selectedEvaluation && (
        <ViewEvaluationDialog
          isOpen={showViewDialog}
          onClose={() => {
            setShowViewDialog(false);
            setSelectedEvaluation(null);
          }}
          evaluation={selectedEvaluation}
          locale={locale}
        />
      )}

      {/* Add Evaluation Dialog */}
      {selectedTraineeId && (() => {
        const selectedTrainee = assignedTrainees.find(t => t.id === selectedTraineeId);
        if (!selectedTrainee) return null;
        
        return (
          <AddEvaluationDialogEnhanced
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSuccess={() => {
              setIsAddDialogOpen(false);
              window.location.reload();
            }}
            locale={locale}
            trainee={{
              id: selectedTrainee.id,
              user_id: selectedTrainee.user_id,
              full_name: selectedTrainee.user?.full_name || '',
              email: selectedTrainee.user?.email || '',
              institution_name: locale === 'ar' 
                ? selectedTrainee.institution?.name_ar || ''
                : selectedTrainee.institution?.name_en || '',
            }}
            supervisorId={supervisorId!}
          />
        );
      })()}
    </div>
  );
}
