'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locale: string;
  trainees: Array<{
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    institution_name: string;
  }>;
  currentUserId: string;
}

export default function AddTaskDialog({
  isOpen,
  onClose,
  onSuccess,
  locale,
  trainees,
  currentUserId,
}: AddTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const t = {
    ar: {
      addTask: 'إضافة مهمة جديدة',
      taskTitle: 'عنوان المهمة',
      taskDescription: 'وصف المهمة',
      assignTo: 'تعيين إلى',
      selectTrainees: 'اختر المتدربين',
      selectedCount: 'متدرب محدد',
      selectAll: 'تحديد الكل',
      deselectAll: 'إلغاء تحديد الكل',
      dueDate: 'تاريخ الاستحقاق',
      priority: 'الأولوية',
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      required: 'هذا الحقل مطلوب',
      selectAtLeastOne: 'يرجى اختيار متدرب واحد على الأقل',
    },
    en: {
      addTask: 'Add New Task',
      taskTitle: 'Task Title',
      taskDescription: 'Task Description',
      assignTo: 'Assign To',
      selectTrainees: 'Select Trainees',
      selectedCount: 'selected',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      dueDate: 'Due Date',
      priority: 'Priority',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      required: 'This field is required',
      selectAtLeastOne: 'Please select at least one trainee',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const toggleTraineeSelection = (traineeId: string) => {
    setSelectedTrainees((prev) =>
      prev.includes(traineeId)
        ? prev.filter((id) => id !== traineeId)
        : [...prev, traineeId]
    );
  };

  const selectAllTrainees = () => {
    setSelectedTrainees(trainees.map((t) => t.id));
  };

  const deselectAllTrainees = () => {
    setSelectedTrainees([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTrainees.length === 0) {
      alert(text.selectAtLeastOne);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Insert task for each selected trainee
      const tasksToInsert = selectedTrainees.map((traineeId) => ({
        title: formData.title,
        description: formData.description,
        assigned_to: traineeId,
        assigned_by: currentUserId,
        due_date: formData.due_date,
        priority: formData.priority,
        status: 'pending',
      }));

      const { error } = await supabase.from('tasks').insert(tasksToInsert);

      if (error) throw error;

      // Reset form
      setFormData({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
      });
      setSelectedTrainees([]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{text.addTask}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {text.taskTitle} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {text.taskDescription} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {text.assignTo} <span className="text-red-500">*</span>
            </label>
            
            {/* Selection Actions */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <span className="text-sm text-gray-600">
                {selectedTrainees.length} {text.selectedCount}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllTrainees}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {text.selectAll}
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={deselectAllTrainees}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  {text.deselectAll}
                </button>
              </div>
            </div>

            {/* Trainees List */}
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
              {trainees.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {locale === 'ar' ? 'لا يوجد متدربين متاحين' : 'No trainees available'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {trainees.map((trainee) => (
                    <label
                      key={trainee.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTrainees.includes(trainee.id)}
                        onChange={() => toggleTraineeSelection(trainee.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className={`flex-1 ${locale === 'ar' ? 'mr-3' : 'ml-3'}`}>
                        <div className="text-sm font-medium text-gray-900">
                          {trainee.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trainee.institution_name}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Due Date and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.dueDate} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.priority} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <option value="low">{text.low}</option>
                <option value="medium">{text.medium}</option>
                <option value="high">{text.high}</option>
                <option value="urgent">{text.urgent}</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
