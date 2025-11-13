'use client';

import { useState } from 'react';
import { Search, Award, User, BookOpen, GraduationCap } from 'lucide-react';
import AddEvaluationDialog from '../evaluations/add-evaluation-dialog';

interface Trainee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  institution_name: string;
  university: string;
  major: string;
  evaluations_count: number;
  avg_score: number;
}

interface SupervisorTraineesTableProps {
  trainees: Trainee[];
  supervisorId: string;
  locale: string;
}

export default function SupervisorTraineesTable({
  trainees,
  supervisorId,
  locale,
}: SupervisorTraineesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);

  const t = {
    ar: {
      search: 'بحث عن متدرب...',
      trainee: 'المتدرب',
      university: 'الجامعة',
      major: 'التخصص',
      evaluations: 'التقييمات',
      avgScore: 'متوسط الدرجات',
      actions: 'الإجراءات',
      addEvaluation: 'إضافة تقييم',
      viewEvaluations: 'عرض التقييمات',
      noTrainees: 'لا يوجد متدربون معينون',
      results: 'نتيجة',
      notEvaluated: 'لم يُقيّم بعد',
    },
    en: {
      search: 'Search for trainee...',
      trainee: 'Trainee',
      university: 'University',
      major: 'Major',
      evaluations: 'Evaluations',
      avgScore: 'Avg. Score',
      actions: 'Actions',
      addEvaluation: 'Add Evaluation',
      viewEvaluations: 'View Evaluations',
      noTrainees: 'No trainees assigned',
      results: 'results',
      notEvaluated: 'Not evaluated yet',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const filteredTrainees = trainees.filter((trainee) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      trainee.full_name.toLowerCase().includes(searchLower) ||
      trainee.email.toLowerCase().includes(searchLower) ||
      trainee.university.toLowerCase().includes(searchLower) ||
      trainee.major.toLowerCase().includes(searchLower)
    );
  });

  const getScoreColor = (score: number) => {
    if (score === 0) return 'bg-gray-100 text-gray-600';
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
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

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredTrainees.length} {text.results}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredTrainees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{text.noTrainees}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.trainee}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.university}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.major}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.evaluations}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.avgScore}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrainees.map((trainee) => (
                <tr key={trainee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {trainee.full_name}
                        </div>
                        <div className="text-xs text-gray-500">{trainee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <GraduationCap size={16} className="text-gray-400" />
                      {trainee.university}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <BookOpen size={16} className="text-gray-400" />
                      {trainee.major}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                        {trainee.evaluations_count}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-gray-400" />
                      {trainee.avg_score > 0 ? (
                        <span
                          className={`px-2 py-1 text-sm font-bold rounded ${getScoreColor(
                            trainee.avg_score
                          )}`}
                        >
                          {trainee.avg_score}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">{text.notEvaluated}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedTrainee(trainee);
                        setShowEvaluationDialog(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Award size={16} />
                      {text.addEvaluation}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Evaluation Dialog */}
      {showEvaluationDialog && selectedTrainee && (
        <AddEvaluationDialog
          isOpen={showEvaluationDialog}
          onClose={() => {
            setShowEvaluationDialog(false);
            setSelectedTrainee(null);
          }}
          onSuccess={() => window.location.reload()}
          locale={locale}
          trainee={{
            id: selectedTrainee.id,
            user_id: selectedTrainee.user_id,
            full_name: selectedTrainee.full_name,
            email: selectedTrainee.email,
            institution_name: selectedTrainee.institution_name,
          }}
          supervisorId={supervisorId}
        />
      )}
    </div>
  );
}
