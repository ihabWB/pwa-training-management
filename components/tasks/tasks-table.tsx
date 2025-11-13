'use client';

import { useState } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, Calendar, User } from 'lucide-react';
import AddTaskDialog from './add-task-dialog';
import UpdateTaskStatusDialog from './update-task-status-dialog';

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

interface TasksTableProps {
  tasks: Task[];
  locale: string;
  userRole: string;
  currentUserId: string;
  trainees: Array<{
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    institution_name: string;
  }>;
}

export default function TasksTable({
  tasks,
  locale,
  userRole,
  currentUserId,
  trainees,
}: TasksTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const t = {
    ar: {
      search: 'بحث عن مهمة...',
      addTask: 'إضافة مهمة',
      status: 'الحالة',
      priority: 'الأولوية',
      all: 'الكل',
      pending: 'قيد الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغى',
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      urgent: 'عاجلة',
      trainee: 'المتدرب',
      title: 'العنوان',
      dueDate: 'تاريخ الاستحقاق',
      assignedBy: 'معين من قبل',
      actions: 'الإجراءات',
      view: 'عرض',
      results: 'نتيجة',
      noTasks: 'لا توجد مهام',
      overdue: 'متأخرة',
      dueToday: 'مستحقة اليوم',
    },
    en: {
      search: 'Search for a task...',
      addTask: 'Add Task',
      status: 'Status',
      priority: 'Priority',
      all: 'All',
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      trainee: 'Trainee',
      title: 'Title',
      dueDate: 'Due Date',
      assignedBy: 'Assigned By',
      actions: 'Actions',
      view: 'View',
      results: 'results',
      noTasks: 'No tasks available',
      overdue: 'Overdue',
      dueToday: 'Due Today',
    },
  };

  const text = t[locale as 'ar' | 'en'];

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.trainee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.institution_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const isDueToday = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate === today;
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

          {/* Add Task Button - Only for Admin and Supervisor */}
          {(userRole === 'admin' || userRole === 'supervisor') && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>+</span>
              {text.addTask}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="all">{text.all}</option>
            <option value="pending">{text.pending}</option>
            <option value="in_progress">{text.in_progress}</option>
            <option value="completed">{text.completed}</option>
            <option value="cancelled">{text.cancelled}</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <option value="all">{text.all}</option>
            <option value="low">{text.low}</option>
            <option value="medium">{text.medium}</option>
            <option value="high">{text.high}</option>
            <option value="urgent">{text.urgent}</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredTasks.length} {text.results}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{text.noTasks}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.trainee}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.title}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.priority}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.dueDate}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.status}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {text.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.trainee_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.institution_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{task.title}</div>
                    {isOverdue(task.due_date, task.status) && (
                      <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                        <AlertCircle size={12} />
                        {text.overdue}
                      </div>
                    )}
                    {isDueToday(task.due_date, task.status) && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                        <Clock size={12} />
                        {text.dueToday}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {text[task.priority as keyof typeof text]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar size={16} className="text-gray-400" />
                      {new Date(task.due_date).toLocaleDateString(
                        locale === 'ar' ? 'ar-EG' : 'en-US'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {text[task.status as keyof typeof text]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowUpdateDialog(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {text.view}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Task Dialog */}
      {showAddDialog && (
        <AddTaskDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => window.location.reload()}
          locale={locale}
          trainees={trainees}
          currentUserId={currentUserId}
        />
      )}

      {/* Update Task Status Dialog */}
      {showUpdateDialog && selectedTask && (
        <UpdateTaskStatusDialog
          isOpen={showUpdateDialog}
          onClose={() => {
            setShowUpdateDialog(false);
            setSelectedTask(null);
          }}
          onSuccess={() => window.location.reload()}
          task={selectedTask}
          locale={locale}
          userRole={userRole}
        />
      )}
    </div>
  );
}
