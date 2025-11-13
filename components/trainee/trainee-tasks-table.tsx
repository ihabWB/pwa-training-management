'use client';

import { useState } from 'react';
import { Eye, ListTodo, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  created_at: string;
}

interface TraineeTasksTableProps {
  tasks: Task[];
  locale: string;
  traineeId: string;
}

export default function TraineeTasksTable({
  tasks,
  locale,
  traineeId,
}: TraineeTasksTableProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  const statusLabels = {
    ar: {
      pending: 'معلقة',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتملة',
    },
    en: {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
    },
  };

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      router.refresh();
      setIsViewDialogOpen(false);
      alert(
        locale === 'ar'
          ? 'تم تحديث حالة المهمة بنجاح'
          : 'Task status updated successfully'
      );
    } catch (error) {
      console.error('Error updating task:', error);
      alert(
        locale === 'ar' ? 'فشل تحديث حالة المهمة' : 'Failed to update task status'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <ListTodo className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          {locale === 'ar' ? 'لا توجد مهام' : 'No tasks found'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'العنوان' : 'Title'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'الحالة' : 'Status'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {locale === 'ar' ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => {
              const isOverdue =
                task.status !== 'completed' &&
                new Date(task.due_date) < new Date();
              return (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ListTodo className="w-5 h-5 text-gray-400 ml-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.title}
                        </div>
                        {isOverdue && (
                          <span className="text-xs text-red-600">
                            {locale === 'ar' ? 'متأخرة' : 'Overdue'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 ml-1" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`w-fit ${statusColors[task.status]}`}>
                      {statusLabels[locale === 'ar' ? 'ar' : 'en'][task.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(task)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      {locale === 'ar' ? 'عرض' : 'View'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View/Update Dialog */}
      {selectedTask && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
            isViewDialogOpen ? '' : 'hidden'
          }`}
          onClick={() => setIsViewDialogOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {locale === 'ar' ? 'تفاصيل المهمة' : 'Task Details'}
              </h3>
              <Badge className={`${statusColors[selectedTask.status]}`}>
                {statusLabels[locale === 'ar' ? 'ar' : 'en'][selectedTask.status]}
              </Badge>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'العنوان' : 'Title'}
                </label>
                <p className="text-gray-900 mt-1">{selectedTask.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {selectedTask.description}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(selectedTask.due_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {locale === 'ar' ? 'تحديث الحالة' : 'Update Status'}
                </label>
                <div className="flex gap-2">
                  {selectedTask.status !== 'in_progress' && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedTask.id, 'in_progress')
                      }
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {locale === 'ar' ? 'بدء العمل' : 'Start Working'}
                    </button>
                  )}
                  {selectedTask.status !== 'completed' && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedTask.id, 'completed')
                      }
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 inline ml-1" />
                      {locale === 'ar' ? 'إكمال' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
