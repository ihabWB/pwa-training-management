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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainee_id: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const t = {
    ar: {
      addTask: 'إضافة مهمة جديدة',
      taskTitle: 'عنوان المهمة',
      taskDescription: 'وصف المهمة',
      assignTo: 'تعيين إلى',
      selectTrainee: 'اختر متدرب',
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
    },
    en: {
      addTask: 'Add New Task',
      taskTitle: 'Task Title',
      taskDescription: 'Task Description',
      assignTo: 'Assign To',
      selectTrainee: 'Select Trainee',
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
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Insert task
      const { error } = await supabase.from('tasks').insert({
        title: formData.title,
        description: formData.description,
        assigned_to: formData.trainee_id,
        assigned_by: currentUserId,
        due_date: formData.due_date,
        priority: formData.priority,
        status: 'pending',
      });

      if (error) throw error;

      // Reset form
      setFormData({
        title: '',
        description: '',
        trainee_id: '',
        due_date: '',
        priority: 'medium',
      });

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {text.assignTo} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.trainee_id}
              onChange={(e) =>
                setFormData({ ...formData, trainee_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <option value="">{text.selectTrainee}</option>
              {trainees.map((trainee) => (
                <option key={trainee.id} value={trainee.id}>
                  {trainee.full_name} - {trainee.institution_name}
                </option>
              ))}
            </select>
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
