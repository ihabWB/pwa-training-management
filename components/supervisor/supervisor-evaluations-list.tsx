'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AddEvaluationDialogEnhanced from '@/components/evaluations/add-evaluation-dialog-enhanced';
import { Plus, Search, Filter } from 'lucide-react';

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

interface Evaluation {
  id: string;
  trainee_id: string;
  supervisor_id: string;
  overall_score: number;
  technical_skills: number;
  communication: number;
  teamwork: number;
  initiative: number;
  professionalism: number;
  strengths: string | null;
  areas_for_improvement: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_at: string | null;
  admin_feedback: string | null;
  created_at: string;
  trainee: Trainee;
}

interface SupervisorEvaluationsListProps {
  evaluations: Evaluation[];
  assignedTrainees: Trainee[];
  supervisorId: string;
  locale: string;
}

export default function SupervisorEvaluationsList({
  evaluations,
  assignedTrainees,
  supervisorId,
  locale,
}: SupervisorEvaluationsListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const text =
    locale === 'ar'
      ? {
          addEvaluation: 'إضافة تقييم',
          selectTrainee: 'اختر المتدرب',
          pleaseSelectTrainee: 'الرجاء اختيار متدرب أولاً',
          search: 'البحث',
          filterByStatus: 'تصفية حسب الحالة',
          all: 'الكل',
          pending: 'معلق',
          approved: 'معتمد',
          rejected: 'مرفوض',
          trainee: 'المتدرب',
          institution: 'المؤسسة',
          overallScore: 'الدرجة الكلية',
          status: 'الحالة',
          date: 'التاريخ',
          noEvaluations: 'لا توجد تقييمات',
          noEvaluationsDescription: 'قم بإضافة تقييم جديد للبدء',
          viewDetails: 'عرض التفاصيل',
          technicalSkills: 'المهارات التقنية',
          communication: 'التواصل',
          teamwork: 'العمل الجماعي',
          initiative: 'المبادرة',
          professionalism: 'الاحترافية',
        }
      : {
          addEvaluation: 'Add Evaluation',
          selectTrainee: 'Select Trainee',
          pleaseSelectTrainee: 'Please select a trainee first',
          search: 'Search',
          filterByStatus: 'Filter by Status',
          all: 'All',
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
          trainee: 'Trainee',
          institution: 'Institution',
          overallScore: 'Overall Score',
          status: 'Status',
          date: 'Date',
          noEvaluations: 'No Evaluations',
          noEvaluationsDescription: 'Add a new evaluation to get started',
          viewDetails: 'View Details',
          technicalSkills: 'Technical Skills',
          communication: 'Communication',
          teamwork: 'Teamwork',
          initiative: 'Initiative',
          professionalism: 'Professionalism',
        };

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
      evaluation.trainee?.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.trainee?.institution?.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.trainee?.institution?.name_en?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {text.pending}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {text.approved}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {text.rejected}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 dark:text-green-400';
    if (score >= 3.5) return 'text-blue-600 dark:text-blue-400';
    if (score >= 2.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Add Evaluation Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">{text.selectTrainee}</label>
            <Select value={selectedTraineeId} onValueChange={setSelectedTraineeId}>
              <SelectTrigger>
                <SelectValue placeholder={text.selectTrainee} />
              </SelectTrigger>
              <SelectContent>
                {assignedTrainees.map((trainee) => (
                  <SelectItem 
                    key={trainee.id} 
                    value={trainee.id}
                    label={trainee.user?.full_name || 'متدرب'}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{trainee.user?.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {locale === 'ar' ? trainee.institution?.name_ar : trainee.institution?.name_en}
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

      {/* Filters Section */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={text.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{text.all}</SelectItem>
                <SelectItem value="pending">{text.pending}</SelectItem>
                <SelectItem value="approved">{text.approved}</SelectItem>
                <SelectItem value="rejected">{text.rejected}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Evaluations Table */}
      {filteredEvaluations.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">{text.noEvaluations}</h3>
          <p className="text-muted-foreground">{text.noEvaluationsDescription}</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">{text.trainee}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">{text.institution}</th>
                  <th className="px-6 py-3 text-center text-sm font-medium">{text.overallScore}</th>
                  <th className="px-6 py-3 text-center text-sm font-medium">{text.status}</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">{text.date}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEvaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{evaluation.trainee?.user?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{evaluation.trainee?.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {locale === 'ar'
                          ? evaluation.trainee?.institution?.name_ar
                          : evaluation.trainee?.institution?.name_en}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
                        {evaluation.overall_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">/ 5.0</div>
                    </td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(evaluation.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {new Date(evaluation.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
            supervisorId={supervisorId}
          />
        );
      })()}
    </div>
  );
}
