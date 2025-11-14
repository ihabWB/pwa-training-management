'use client';

import { useState } from 'react';
import { Users, Award, Plus } from 'lucide-react';
import Link from 'next/link';
import AddEvaluationDialogEnhanced from '@/components/evaluations/add-evaluation-dialog-enhanced';

interface Trainee {
  id: string;
  user_id: string;
  institution_id: string;
  status: string;
  user: {
    full_name: string;
    email: string;
  };
  institution: {
    name: string;
    name_ar: string;
  };
}

interface SupervisorTraineesListProps {
  trainees: Trainee[];
  supervisorId: string;
  locale: string;
}

export default function SupervisorTraineesList({
  trainees,
  supervisorId,
  locale,
}: SupervisorTraineesListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>('');
  
  const t = {
    ar: {
      myTrainees: 'متدربيني',
      viewAll: 'عرض الكل',
      active: 'نشط',
      inactive: 'غير نشط',
      completed: 'مكتمل',
      viewDetails: 'عرض التفاصيل',
      noTrainees: 'لا يوجد متدربون معينون',
      addEvaluation: 'إضافة تقييم',
    },
    en: {
      myTrainees: 'My Trainees',
      viewAll: 'View All',
      active: 'Active',
      inactive: 'Inactive',
      completed: 'Completed',
      viewDetails: 'View Details',
      noTrainees: 'No trainees assigned',
      addEvaluation: 'Add Evaluation',
    },
  };

  const text = t[locale as keyof typeof t] || t.en;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return text.active;
      case 'completed':
        return text.completed;
      case 'inactive':
        return text.inactive;
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-blue-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">{text.myTrainees}</h2>
        </div>
        <Link
          href={`/${locale}/supervisors/${supervisorId}/trainees`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {text.viewAll}
        </Link>
      </div>

      <div className="p-6">
        {trainees.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{text.noTrainees}</p>
        ) : (
          <div className="space-y-4">
            {trainees.slice(0, 5).map((trainee) => {
              // Skip trainees with missing user or institution data
              if (!trainee.user || !trainee.institution) {
                return null;
              }
              
              return (
                <div
                  key={trainee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {trainee.user.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {locale === 'ar'
                        ? trainee.institution.name_ar
                        : trainee.institution.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        trainee.status
                      )}`}
                    >
                      {getStatusText(trainee.status)}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTraineeId(trainee.id);
                        setIsAddDialogOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      {text.addEvaluation}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Add Evaluation Dialog */}
      {selectedTraineeId && (
        <AddEvaluationDialogEnhanced
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setSelectedTraineeId('');
          }}
          onSuccess={() => {
            setIsAddDialogOpen(false);
            setSelectedTraineeId('');
            // Refresh page to show new evaluation
            window.location.reload();
          }}
          trainee={{
            id: selectedTraineeId,
            user_id: trainees.find(t => t.id === selectedTraineeId)?.user_id || '',
            full_name: trainees.find(t => t.id === selectedTraineeId)?.user?.full_name || '',
            email: trainees.find(t => t.id === selectedTraineeId)?.user?.email || '',
            institution_name: locale === 'ar' 
              ? trainees.find(t => t.id === selectedTraineeId)?.institution?.name_ar || ''
              : trainees.find(t => t.id === selectedTraineeId)?.institution?.name || '',
          }}
          supervisorId={supervisorId}
          locale={locale}
        />
      )}
    </div>
  );
}
