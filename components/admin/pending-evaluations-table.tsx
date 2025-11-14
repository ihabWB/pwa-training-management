'use client';

import { useState } from 'react';
import { Award, Calendar, User, Building2, Search, Filter } from 'lucide-react';
import ReviewEvaluationDialog from '@/components/evaluations/review-evaluation-dialog';

interface Evaluation {
  id: string;
  trainee_name: string;
  supervisor_name: string;
  institution_name: string;
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

interface PendingEvaluationsTableProps {
  evaluations: Evaluation[];
  locale: string;
}

export default function PendingEvaluationsTable({
  evaluations,
  locale,
}: PendingEvaluationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const t = {
    ar: {
      search: 'بحث عن تقييم...',
      status: 'الحالة',
      all: 'الكل',
      pending: 'معلقة',
      approved: 'معتمدة',
      rejected: 'مرفوضة',
      trainee: 'المتدرب',
      supervisor: 'المشرف',
      institution: 'المؤسسة',
      type: 'النوع',
      date: 'التاريخ',
      score: 'الدرجة',
      actions: 'الإجراءات',
      review: 'مراجعة',
      noEvaluations: 'لا توجد تقييمات',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      mid_term: 'منتصف الفترة',
      final: 'نهائي',
    },
    en: {
      search: 'Search evaluation...',
      status: 'Status',
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      trainee: 'Trainee',
      supervisor: 'Supervisor',
      institution: 'Institution',
      type: 'Type',
      date: 'Date',
      score: 'Score',
      actions: 'Actions',
      review: 'Review',
      noEvaluations: 'No evaluations found',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      mid_term: 'Mid-term',
      final: 'Final',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  // Filter evaluations
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.trainee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.supervisor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.institution_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || evaluation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800';
      case 'quarterly':
        return 'bg-green-100 text-green-800';
      case 'mid_term':
        return 'bg-purple-100 text-purple-800';
      case 'final':
        return 'bg-red-100 text-red-800';
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

  return (
    <div className="space-y-4 p-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={text.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{text.all}</option>
            <option value="pending">{text.pending}</option>
            <option value="approved">{text.approved}</option>
            <option value="rejected">{text.rejected}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{text.noEvaluations}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.trainee}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.supervisor}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.type}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.date}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.score}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{evaluation.supervisor_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                        evaluation.evaluation_type
                      )}`}
                    >
                      {text[evaluation.evaluation_type as keyof typeof text]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar size={16} className="text-gray-400" />
                      {new Date(evaluation.evaluation_date).toLocaleDateString(
                        locale === 'ar' ? 'ar-EG' : 'en-US'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        evaluation.status || 'pending'
                      )}`}
                    >
                      {text[(evaluation.status || 'pending') as keyof typeof text]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedEvaluation(evaluation);
                        setShowReviewDialog(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {text.review}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Dialog */}
      {showReviewDialog && selectedEvaluation && (
        <ReviewEvaluationDialog
          isOpen={showReviewDialog}
          onClose={() => {
            setShowReviewDialog(false);
            setSelectedEvaluation(null);
          }}
          evaluation={selectedEvaluation}
          locale={locale}
        />
      )}
    </div>
  );
}
