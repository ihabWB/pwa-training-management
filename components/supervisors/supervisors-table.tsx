'use client';

import { useState } from 'react';
import { Search, UserCheck, Edit, Trash2, Eye, UserPlus, Users, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AddSupervisorDialog from './add-supervisor-dialog';
import AssignTraineeDialog from './assign-trainee-dialog';
import SupervisorTraineesModal from './supervisor-trainees-modal';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { exportSupervisorsToExcel } from '@/lib/export/excel';
import { exportSupervisorsToPDF } from '@/lib/export/pdf';

interface Supervisor {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  institution_name: string;
  institution_name_ar: string;
  position_title: string;
  position_title_ar: string;
  specialization: string;
  trainee_count: number;
  created_at: string;
}

interface Institution {
  id: string;
  name: string;
  name_ar: string;
}

interface Trainee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  institution_name: string;
  major: string;
}

interface SupervisorsTableProps {
  supervisors: Supervisor[];
  institutions: Institution[];
  availableTrainees: Trainee[];
  locale: string;
}

export default function SupervisorsTable({
  supervisors,
  institutions,
  availableTrainees,
  locale,
}: SupervisorsTableProps) {
  const router = useRouter();
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [traineesModalState, setTraineesModalState] = useState<{
    isOpen: boolean;
    supervisorId: string;
    supervisorName: string;
  }>({
    isOpen: false,
    supervisorId: '',
    supervisorName: '',
  });
  const [assignDialogState, setAssignDialogState] = useState<{
    isOpen: boolean;
    supervisorId: string;
    supervisorName: string;
  }>({
    isOpen: false,
    supervisorId: '',
    supervisorName: '',
  });

  const filteredSupervisors = supervisors.filter((sup) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sup.full_name.toLowerCase().includes(searchLower) ||
      sup.email.toLowerCase().includes(searchLower) ||
      sup.position_title?.toLowerCase().includes(searchLower) ||
      sup.position_title_ar?.toLowerCase().includes(searchLower) ||
      sup.specialization?.toLowerCase().includes(searchLower)
    );
  });

  const openAssignDialog = (supervisor: Supervisor) => {
    setAssignDialogState({
      isOpen: true,
      supervisorId: supervisor.id,
      supervisorName: supervisor.full_name,
    });
  };

  const openTraineesModal = (supervisor: Supervisor) => {
    setTraineesModalState({
      isOpen: true,
      supervisorId: supervisor.id,
      supervisorName: supervisor.full_name,
    });
  };

  const handleDelete = async (supervisorId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المشرف؟' : 'Are you sure you want to delete this supervisor?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('supervisors')
        .delete()
        .eq('id', supervisorId);

      if (error) throw error;

      router.refresh();
      alert(locale === 'ar' ? 'تم حذف المشرف بنجاح' : 'Supervisor deleted successfully');
    } catch (error) {
      console.error('Error deleting supervisor:', error);
      alert(locale === 'ar' ? 'حدث خطأ أثناء حذف المشرف' : 'Error deleting supervisor');
    }
  };

  const handleView = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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

        {/* Export and Add Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportSupervisorsToExcel(filteredSupervisors, locale)}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            {locale === 'ar' ? 'Excel' : 'Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportSupervisorsToPDF(filteredSupervisors, locale)}
            className="flex items-center gap-2"
          >
            <FileDown size={18} />
            {locale === 'ar' ? 'PDF' : 'PDF'}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserCheck size={18} className="mr-2" />
            {locale === 'ar' ? 'إضافة مشرف' : 'Add Supervisor'}
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {locale === 'ar'
          ? `عرض ${filteredSupervisors.length} من ${supervisors.length} مشرف`
          : `Showing ${filteredSupervisors.length} of ${supervisors.length} supervisors`}
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
                  {locale === 'ar' ? 'المؤسسة' : 'Institution'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'القسم/المنصب' : 'Department/Position'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'التخصص' : 'Specialization'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'المتدربون' : 'Trainees'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSupervisors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </td>
                </tr>
              ) : (
                filteredSupervisors.map((supervisor) => (
                  <tr key={supervisor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {supervisor.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {supervisor.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {supervisor.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {locale === 'ar'
                        ? supervisor.institution_name_ar
                        : supervisor.institution_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {locale === 'ar'
                          ? supervisor.position_title_ar
                          : supervisor.position_title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {supervisor.specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {locale === 'ar'
                        ? supervisor.institution_name_ar
                        : supervisor.institution_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openTraineesModal(supervisor)}
                          className="hover:opacity-80 transition-opacity"
                          title={locale === 'ar' ? 'عرض المتدربين' : 'View trainees'}
                        >
                          <Badge className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200">
                            <Users size={14} className="mr-1" />
                            {supervisor.trainee_count || 0}
                          </Badge>
                        </button>
                        <button
                          onClick={() => openAssignDialog(supervisor)}
                          className="text-blue-600 hover:text-blue-900"
                          title={locale === 'ar' ? 'تعيين متدربين' : 'Assign trainees'}
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleView(supervisor)}
                          className="text-blue-600 hover:text-blue-900"
                          title={locale === 'ar' ? 'عرض' : 'View'}
                        >
                          <Eye size={18} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(supervisor.id)}
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

      {/* Add Supervisor Dialog */}
      <AddSupervisorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        institutions={institutions}
        locale={locale}
      />

      {/* Assign Trainee Dialog */}
      <AssignTraineeDialog
        isOpen={assignDialogState.isOpen}
        onClose={() =>
          setAssignDialogState({
            isOpen: false,
            supervisorId: '',
            supervisorName: '',
          })
        }
        supervisorId={assignDialogState.supervisorId}
        supervisorName={assignDialogState.supervisorName}
        availableTrainees={availableTrainees}
        locale={locale}
      />

      {/* Supervisor Trainees Modal */}
      <SupervisorTraineesModal
        isOpen={traineesModalState.isOpen}
        onClose={() =>
          setTraineesModalState({
            isOpen: false,
            supervisorId: '',
            supervisorName: '',
          })
        }
        supervisorId={traineesModalState.supervisorId}
        supervisorName={traineesModalState.supervisorName}
        locale={locale}
      />

      {/* View Supervisor Dialog */}
      {selectedSupervisor && (
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
                {locale === 'ar' ? 'تفاصيل المشرف' : 'Supervisor Details'}
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
                <p className="text-gray-900">{selectedSupervisor.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <p className="text-gray-900">{selectedSupervisor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <p className="text-gray-900">{selectedSupervisor.phone_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'المؤسسة' : 'Institution'}
                </label>
                <p className="text-gray-900">
                  {locale === 'ar'
                    ? selectedSupervisor.institution_name_ar
                    : selectedSupervisor.institution_name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'المسمى الوظيفي' : 'Position Title'}
                </label>
                <p className="text-gray-900">
                  {locale === 'ar'
                    ? selectedSupervisor.position_title_ar
                    : selectedSupervisor.position_title}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'التخصص' : 'Specialization'}
                </label>
                <p className="text-gray-900">{selectedSupervisor.specialization}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'عدد المتدربين' : 'Trainee Count'}
                </label>
                <p className="text-gray-900">{selectedSupervisor.trainee_count || 0}</p>
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
    </div>
  );
}
