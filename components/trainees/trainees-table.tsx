'use client';

import { useState } from 'react';
import { Search, UserPlus, Edit, Trash2, Eye, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AddTraineeDialog from './add-trainee-dialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { exportTraineesToExcel } from '@/lib/export/excel';
import { exportTraineesToPDF } from '@/lib/export/pdf';

interface Trainee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  institution_id: string;
  institution_name: string;
  institution_name_ar: string;
  university: string;
  major: string;
  graduation_year: number;
  start_date: string;
  expected_end_date: string;
  status: 'active' | 'completed' | 'suspended' | 'withdrawn';
  created_at: string;
}

interface Institution {
  id: string;
  name: string;
  name_ar: string;
}

interface TraineesTableProps {
  trainees: Trainee[];
  institutions: Institution[];
  locale: string;
}

export default function TraineesTable({
  trainees,
  institutions,
  locale,
}: TraineesTableProps) {
  const router = useRouter();
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    withdrawn: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    ar: {
      active: 'نشط',
      completed: 'مكتمل',
      suspended: 'موقوف',
      withdrawn: 'منسحب',
    },
    en: {
      active: 'Active',
      completed: 'Completed',
      suspended: 'Suspended',
      withdrawn: 'Withdrawn',
    },
  };

  const filteredTrainees = trainees.filter((trainee) => {
    const matchesSearch =
      trainee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.university.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || trainee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (traineeId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المتدرب؟' : 'Are you sure you want to delete this trainee?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('trainees')
        .delete()
        .eq('id', traineeId);

      if (error) throw error;

      router.refresh();
      alert(locale === 'ar' ? 'تم حذف المتدرب بنجاح' : 'Trainee deleted successfully');
    } catch (error) {
      console.error('Error deleting trainee:', error);
      alert(locale === 'ar' ? 'حدث خطأ أثناء حذف المتدرب' : 'Error deleting trainee');
    }
  };

  const handleView = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{locale === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
            <option value="active">{locale === 'ar' ? 'نشط' : 'Active'}</option>
            <option value="completed">{locale === 'ar' ? 'مكتمل' : 'Completed'}</option>
            <option value="suspended">{locale === 'ar' ? 'موقوف' : 'Suspended'}</option>
            <option value="withdrawn">{locale === 'ar' ? 'منسحب' : 'Withdrawn'}</option>
          </select>
        </div>

        {/* Export and Add Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportTraineesToExcel(filteredTrainees, locale)}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            {locale === 'ar' ? 'Excel' : 'Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportTraineesToPDF(filteredTrainees, locale)}
            className="flex items-center gap-2"
          >
            <FileDown size={18} />
            {locale === 'ar' ? 'PDF' : 'PDF'}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus size={18} className="mr-2" />
            {locale === 'ar' ? 'إضافة متدرب' : 'Add Trainee'}
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {locale === 'ar'
          ? `عرض ${filteredTrainees.length} من ${trainees.length} متدرب`
          : `Showing ${filteredTrainees.length} of ${trainees.length} trainees`}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'الاسم' : 'Name'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'المؤسسة' : 'Institution'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'الجامعة' : 'University'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'التخصص' : 'Major'}
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
              {filteredTrainees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </td>
                </tr>
              ) : (
                filteredTrainees.map((trainee) => (
                  <tr key={trainee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trainee.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trainee.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {trainee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {locale === 'ar'
                        ? trainee.institution_name_ar
                        : trainee.institution_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {trainee.university}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {trainee.major}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[trainee.status]}>
                        {statusLabels[locale === 'ar' ? 'ar' : 'en'][trainee.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleView(trainee)}
                          className="text-blue-600 hover:text-blue-900"
                          title={locale === 'ar' ? 'عرض' : 'View'}
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(trainee)}
                          className="text-green-600 hover:text-green-900"
                          title={locale === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(trainee.id)}
                          className="text-red-600 hover:text-red-900"
                          title={locale === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trainee Dialog */}
      <AddTraineeDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        institutions={institutions}
        locale={locale}
      />

      {/* View Trainee Dialog */}
      {selectedTrainee && (
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {locale === 'ar' ? 'تفاصيل المتدرب' : 'Trainee Details'}
              </h3>
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <p className="text-gray-900">{selectedTrainee.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <p className="text-gray-900">{selectedTrainee.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <p className="text-gray-900">{selectedTrainee.phone_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'المؤسسة' : 'Institution'}
                </label>
                <p className="text-gray-900">
                  {locale === 'ar'
                    ? selectedTrainee.institution_name_ar
                    : selectedTrainee.institution_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الجامعة' : 'University'}
                </label>
                <p className="text-gray-900">{selectedTrainee.university}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'التخصص' : 'Major'}
                </label>
                <p className="text-gray-900">{selectedTrainee.major}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'سنة التخرج' : 'Graduation Year'}
                </label>
                <p className="text-gray-900">{selectedTrainee.graduation_year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </label>
                <Badge className={statusColors[selectedTrainee.status]}>
                  {statusLabels[locale as 'ar' | 'en'][selectedTrainee.status]}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                </label>
                <p className="text-gray-900">
                  {new Date(selectedTrainee.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'تاريخ الانتهاء المتوقع' : 'Expected End Date'}
                </label>
                <p className="text-gray-900">
                  {new Date(selectedTrainee.expected_end_date).toLocaleDateString()}
                </p>
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

      {/* Edit Trainee Dialog */}
      {selectedTrainee && (
        <AddTraineeDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTrainee(null);
          }}
          institutions={institutions}
          locale={locale}
          traineeToEdit={{
            id: selectedTrainee.id,
            user_id: selectedTrainee.user_id,
            full_name: selectedTrainee.full_name,
            email: selectedTrainee.email,
            phone_number: selectedTrainee.phone_number,
            institution_id: selectedTrainee.institution_id,
            university: selectedTrainee.university,
            major: selectedTrainee.major,
            graduation_year: selectedTrainee.graduation_year,
            start_date: selectedTrainee.start_date,
            expected_end_date: selectedTrainee.expected_end_date,
          }}
        />
      )}
    </div>
  );
}
