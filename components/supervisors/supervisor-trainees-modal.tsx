'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, User, Building2, GraduationCap, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface SupervisorTraineesModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervisorId: string;
  supervisorName: string;
  locale: string;
}

interface TraineeData {
  id: string;
  trainee_id: string;
  is_primary: boolean;
  assigned_date: string;
  trainee: {
    id: string;
    status: string;
    university: string;
    major: string;
    start_date: string;
    expected_end_date: string;
    user: {
      full_name: string;
      email: string;
      phone_number: string;
    };
    institution: {
      name: string;
      name_ar: string;
    };
  };
}

export default function SupervisorTraineesModal({
  isOpen,
  onClose,
  supervisorId,
  supervisorName,
  locale,
}: SupervisorTraineesModalProps) {
  const [trainees, setTrainees] = useState<TraineeData[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && supervisorId) {
      fetchTrainees();
    }
  }, [isOpen, supervisorId]);

  const fetchTrainees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('supervisor_trainee')
        .select(
          `
          id,
          trainee_id,
          is_primary,
          assigned_date,
          trainee:trainees(
            id,
            status,
            university,
            major,
            start_date,
            expected_end_date,
            user:users(
              full_name,
              email,
              phone_number
            ),
            institution:institutions(
              name,
              name_ar
            )
          )
        `
        )
        .eq('supervisor_id', supervisorId)
        .order('assigned_date', { ascending: false });

      if (error) throw error;

      // Filter out trainees with null user data and set state
      setTrainees((data || []).filter((t: any) => t.trainee?.user) as any);
    } catch (error) {
      console.error('Error fetching trainees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من إلغاء تعيين هذا المتدرب؟' : 'Are you sure you want to unassign this trainee?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('supervisor_trainee')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      // Refresh the list
      await fetchTrainees();
      alert(locale === 'ar' ? 'تم إلغاء التعيين بنجاح' : 'Trainee unassigned successfully');
    } catch (error) {
      console.error('Error unassigning trainee:', error);
      alert(locale === 'ar' ? 'حدث خطأ أثناء إلغاء التعيين' : 'Error unassigning trainee');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {locale === 'ar' ? 'متدربو المشرف' : 'Supervisor Trainees'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {supervisorName} ({trainees.length}{' '}
              {locale === 'ar' ? 'متدرب' : 'trainees'})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">
              {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        ) : trainees.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {locale === 'ar' ? 'لا يوجد متدربون معينون لهذا المشرف' : 'No trainees assigned to this supervisor'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trainees.map((item) => {
              const trainee = item.trainee;
              if (!trainee?.user) return null;

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Trainee Name and Email */}
                      <div className="flex items-center gap-2 mb-2">
                        <User size={18} className="text-blue-600" />
                        <h4 className="font-semibold text-gray-900">
                          {trainee.user.full_name}
                        </h4>
                        {item.is_primary && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {locale === 'ar' ? 'مشرف أساسي' : 'Primary'}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            trainee.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : trainee.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {trainee.status === 'active'
                            ? locale === 'ar'
                              ? 'نشط'
                              : 'Active'
                            : trainee.status === 'completed'
                            ? locale === 'ar'
                              ? 'مكتمل'
                              : 'Completed'
                            : locale === 'ar'
                            ? 'غير نشط'
                            : 'Inactive'}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 size={16} />
                          <span>
                            {locale === 'ar'
                              ? trainee.institution.name_ar
                              : trainee.institution.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <GraduationCap size={16} />
                          <span>
                            {trainee.university} - {trainee.major}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>
                            {locale === 'ar' ? 'البدء: ' : 'Start: '}
                            {new Date(trainee.start_date).toLocaleDateString(
                              locale === 'ar' ? 'ar-SA' : 'en-US'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>
                            {locale === 'ar' ? 'الانتهاء: ' : 'End: '}
                            {new Date(trainee.expected_end_date).toLocaleDateString(
                              locale === 'ar' ? 'ar-SA' : 'en-US'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-2 text-sm text-gray-500">
                        <span>{trainee.user.email}</span>
                        {trainee.user.phone_number && (
                          <>
                            {' • '}
                            <span>{trainee.user.phone_number}</span>
                          </>
                        )}
                      </div>

                      {/* Assignment Date */}
                      <div className="mt-2 text-xs text-gray-400">
                        {locale === 'ar' ? 'تاريخ التعيين: ' : 'Assigned: '}
                        {new Date(item.assigned_date).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-US'
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleUnassign(item.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                      title={locale === 'ar' ? 'إلغاء التعيين' : 'Unassign'}
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            {locale === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
