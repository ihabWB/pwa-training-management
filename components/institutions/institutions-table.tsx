'use client';

import { useState } from 'react';
import { Search, Building2, Edit, Trash2, Eye, Users, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AddInstitutionDialog from './add-institution-dialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { exportInstitutionsToExcel } from '@/lib/export/excel';
import { exportInstitutionsToPDF } from '@/lib/export/pdf';

interface Institution {
  id: string;
  name: string;
  name_ar: string;
  location: string;
  focal_point_name: string;
  focal_point_phone: string;
  focal_point_email: string;
  address?: string;
  trainee_count?: number;
  supervisor_count?: number;
  created_at: string;
}

interface InstitutionsTableProps {
  institutions: Institution[];
  locale: string;
}

export default function InstitutionsTable({
  institutions,
  locale,
}: InstitutionsTableProps) {
  const router = useRouter();
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredInstitutions = institutions.filter((inst) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      inst.name.toLowerCase().includes(searchLower) ||
      inst.name_ar.toLowerCase().includes(searchLower) ||
      inst.location.toLowerCase().includes(searchLower) ||
      inst.focal_point_name.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (institutionId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذه المؤسسة؟' : 'Are you sure you want to delete this institution?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('institutions')
        .delete()
        .eq('id', institutionId);

      if (error) throw error;

      router.refresh();
      alert(locale === 'ar' ? 'تم حذف المؤسسة بنجاح' : 'Institution deleted successfully');
    } catch (error) {
      console.error('Error deleting institution:', error);
      alert(locale === 'ar' ? 'حدث خطأ أثناء حذف المؤسسة' : 'Error deleting institution');
    }
  };

  const handleView = (institution: Institution) => {
    setSelectedInstitution(institution);
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
            onClick={() => exportInstitutionsToExcel(filteredInstitutions, locale)}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            {locale === 'ar' ? 'Excel' : 'Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportInstitutionsToPDF(filteredInstitutions, locale)}
            className="flex items-center gap-2"
          >
            <FileDown size={18} />
            {locale === 'ar' ? 'PDF' : 'PDF'}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Building2 size={18} className="mr-2" />
            {locale === 'ar' ? 'إضافة مؤسسة' : 'Add Institution'}
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {locale === 'ar'
          ? `عرض ${filteredInstitutions.length} من ${institutions.length} مؤسسة`
          : `Showing ${filteredInstitutions.length} of ${institutions.length} institutions`}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstitutions.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
          </div>
        ) : (
          filteredInstitutions.map((inst) => (
            <div
              key={inst.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {locale === 'ar' ? inst.name_ar : inst.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{inst.location}</p>
                </div>
                <Building2 className="text-blue-600" size={24} />
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {inst.trainee_count || 0}{' '}
                    {locale === 'ar' ? 'متدرب' : 'trainees'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {inst.supervisor_count || 0}{' '}
                    {locale === 'ar' ? 'مشرف' : 'supervisors'}
                  </span>
                </div>
              </div>

              {/* Focal Point */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {locale === 'ar' ? 'جهة الاتصال' : 'Focal Point'}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {inst.focal_point_name}
                </p>
                <p className="text-sm text-gray-600">{inst.focal_point_phone}</p>
                <p className="text-sm text-gray-600">{inst.focal_point_email}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button 
                  onClick={() => handleView(inst)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Eye size={16} />
                  {locale === 'ar' ? 'عرض' : 'View'}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors">
                  <Edit size={16} />
                  {locale === 'ar' ? 'تعديل' : 'Edit'}
                </button>
                <button 
                  onClick={() => handleDelete(inst.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                  {locale === 'ar' ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Institution Dialog */}
      <AddInstitutionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        locale={locale}
      />

      {/* View Institution Dialog */}
      {selectedInstitution && (
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
                {locale === 'ar' ? 'تفاصيل المؤسسة' : 'Institution Details'}
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
                  {locale === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                </label>
                <p className="text-gray-900">{selectedInstitution.name_ar}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                </label>
                <p className="text-gray-900">{selectedInstitution.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'الموقع' : 'Location'}
                </label>
                <p className="text-gray-900">{selectedInstitution.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'العنوان' : 'Address'}
                </label>
                <p className="text-gray-900">{selectedInstitution.address || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'اسم نقطة الاتصال' : 'Focal Point Name'}
                </label>
                <p className="text-gray-900">{selectedInstitution.focal_point_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'هاتف نقطة الاتصال' : 'Focal Point Phone'}
                </label>
                <p className="text-gray-900">{selectedInstitution.focal_point_phone}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'بريد نقطة الاتصال' : 'Focal Point Email'}
                </label>
                <p className="text-gray-900">{selectedInstitution.focal_point_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'عدد المتدربين' : 'Trainee Count'}
                </label>
                <p className="text-gray-900">{selectedInstitution.trainee_count || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'ar' ? 'عدد المشرفين' : 'Supervisor Count'}
                </label>
                <p className="text-gray-900">{selectedInstitution.supervisor_count || 0}</p>
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
