'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Trainee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  institution_name: string;
  major: string;
}

interface AssignTraineeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supervisorId: string;
  supervisorName: string;
  availableTrainees: Trainee[];
  locale: string;
}

export default function AssignTraineeDialog({
  isOpen,
  onClose,
  supervisorId,
  supervisorName,
  availableTrainees,
  locale,
}: AssignTraineeDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Create assignments for each selected trainee
      const assignments = selectedTrainees.map((traineeId) => ({
        supervisor_id: supervisorId,
        trainee_id: traineeId,
        assigned_date: new Date().toISOString().split('T')[0],
      }));

      const { error: assignError } = await supabase
        .from('supervisor_trainee')
        .insert(assignments);

      if (assignError) throw assignError;

      // Success
      router.refresh();
      onClose();
      setSelectedTrainees([]);
    } catch (err: any) {
      console.error('Error assigning trainees:', err);
      setError(err.message || 'Failed to assign trainees');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrainee = (traineeId: string) => {
    setSelectedTrainees((prev) =>
      prev.includes(traineeId)
        ? prev.filter((id) => id !== traineeId)
        : [...prev, traineeId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {locale === 'ar' ? 'تعيين متدربين' : 'Assign Trainees'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {locale === 'ar' ? `إلى المشرف: ${supervisorName}` : `To supervisor: ${supervisorName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {availableTrainees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {locale === 'ar'
                ? 'لا يوجد متدربون متاحون للتعيين'
                : 'No trainees available for assignment'}
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-2">
                {locale === 'ar'
                  ? `اختر المتدربين (${selectedTrainees.length} محددين)`
                  : `Select trainees (${selectedTrainees.length} selected)`}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableTrainees.map((trainee) => (
                  <label
                    key={trainee.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTrainees.includes(trainee.id)}
                      onChange={() => toggleTrainee(trainee.id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {trainee.full_name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {trainee.email} • {trainee.institution_name}
                      </div>
                      <div className="text-xs text-gray-500">{trainee.major}</div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedTrainees.length === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  {locale === 'ar' ? 'جاري التعيين...' : 'Assigning...'}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2" size={18} />
                  {locale === 'ar'
                    ? `تعيين (${selectedTrainees.length})`
                    : `Assign (${selectedTrainees.length})`}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
