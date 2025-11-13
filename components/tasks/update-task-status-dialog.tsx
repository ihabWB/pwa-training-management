'use client';

import { useState } from 'react';
import { X, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Task {
  id: string;
  title: string;
  description: string;
  trainee_id: string;
  trainee_name: string;
  institution_name: string;
  assigned_by_name: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completed_at: string | null;
}

interface UpdateTaskStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task;
  locale: string;
  userRole: string;
}

export default function UpdateTaskStatusDialog({
  isOpen,
  onClose,
  onSuccess,
  task,
  locale,
  userRole,
}: UpdateTaskStatusDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(task.status);

  const t = {
    ar: {
      taskDetails: 'تفاصيل المهمة',
      title: 'العنوان',
      description: 'الوصف',
      trainee: 'المتدرب',
      institution: 'المؤسسة',
      assignedBy: 'معين من قبل',
      dueDate: 'تاريخ الاستحقاق',
      priority: 'الأولوية',
      status: 'الحالة',
      createdAt: 'تاريخ الإنشاء',
      completedAt: 'تاريخ الإكمال',
      attachment: 'المرفق',
      viewAttachment: 'عرض المرفق',
      updateStatus: 'تحديث الحالة',
      pending: 'قيد الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغى',
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      overdue: 'متأخرة',
    },
    en: {
      taskDetails: 'Task Details',
      title: 'Title',
      description: 'Description',
      trainee: 'Trainee',
      institution: 'Institution',
      assignedBy: 'Assigned By',
      dueDate: 'Due Date',
      priority: 'Priority',
      status: 'Status',
      createdAt: 'Created At',
      completedAt: 'Completed At',
      attachment: 'Attachment',
      viewAttachment: 'View Attachment',
      updateStatus: 'Update Status',
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
      overdue: 'Overdue',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  const handleUpdateStatus = async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      const updateData: any = {
        status: newStatus,
      };

      // If marking as completed, set completed_at
      if (newStatus === 'completed' && task.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      // If changing from completed to something else, clear completed_at
      if (newStatus !== 'completed' && task.status === 'completed') {
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isOverdue =
    task.status !== 'completed' &&
    task.status !== 'cancelled' &&
    new Date(task.due_date) < new Date();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-gray-700';
      case 'medium':
        return 'text-blue-700';
      case 'high':
        return 'text-orange-700';
      case 'urgent':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'high':
        return <AlertCircle size={20} className="text-orange-600" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{text.taskDetails}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Overdue Warning */}
          {isOverdue && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <div className="font-medium text-red-900">{text.overdue}</div>
                <div className="text-sm text-red-700">
                  {locale === 'ar'
                    ? 'هذه المهمة تجاوزت تاريخ الاستحقاق'
                    : 'This task is past its due date'}
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              {text.title}
            </label>
            <div className="text-base font-semibold text-gray-900">
              {task.title}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              {text.description}
            </label>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
              {task.description}
            </div>
          </div>

          {/* Trainee and Institution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.trainee}
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <User size={16} className="text-gray-400" />
                {task.trainee_name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.institution}
              </label>
              <div className="text-sm text-gray-900">
                {task.institution_name}
              </div>
            </div>
          </div>

          {/* Assigned By */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              {text.assignedBy}
            </label>
            <div className="text-sm text-gray-900">{task.assigned_by_name}</div>
          </div>

          {/* Due Date and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.dueDate}
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Calendar size={16} className="text-gray-400" />
                {new Date(task.due_date).toLocaleDateString(
                  locale === 'ar' ? 'ar-EG' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.priority}
              </label>
              <div className={`flex items-center gap-2 font-medium ${getPriorityColor(task.priority)}`}>
                {getPriorityIcon(task.priority)}
                {text[task.priority as keyof typeof text]}
              </div>
            </div>
          </div>

          {/* Created At and Completed At */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {text.createdAt}
              </label>
              <div className="text-sm text-gray-900">
                {new Date(task.created_at).toLocaleDateString(
                  locale === 'ar' ? 'ar-EG' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}
              </div>
            </div>
            {task.completed_at && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {text.completedAt}
                </label>
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle size={16} />
                  {new Date(task.completed_at).toLocaleDateString(
                    locale === 'ar' ? 'ar-EG' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Update - Only for trainee or admin */}
          {(userRole === 'trainee' || userRole === 'admin' || userRole === 'supervisor') && (
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {text.updateStatus}
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <option value="pending">{text.pending}</option>
                <option value="in_progress">{text.in_progress}</option>
                <option value="completed">{text.completed}</option>
                {userRole !== 'trainee' && (
                  <option value="cancelled">{text.cancelled}</option>
                )}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={loading}
          >
            {text.cancel}
          </button>
          {(userRole === 'trainee' || userRole === 'admin' || userRole === 'supervisor') &&
            newStatus !== task.status && (
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? text.saving : text.save}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
