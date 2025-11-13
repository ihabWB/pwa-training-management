import * as XLSX from 'xlsx';

interface ExportData {
  [key: string]: any;
}

export const exportToExcel = (
  data: ExportData[],
  filename: string,
  sheetName: string = 'Sheet1'
) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportTraineesToExcel = (trainees: any[], locale: string) => {
  const data = trainees.map((trainee) => ({
    [locale === 'ar' ? 'الاسم الكامل' : 'Full Name']: trainee.full_name,
    [locale === 'ar' ? 'البريد الإلكتروني' : 'Email']: trainee.email,
    [locale === 'ar' ? 'رقم الهاتف' : 'Phone Number']: trainee.phone_number,
    [locale === 'ar' ? 'المؤسسة' : 'Institution']:
      locale === 'ar' ? trainee.institution_name_ar : trainee.institution_name,
    [locale === 'ar' ? 'الجامعة' : 'University']: trainee.university,
    [locale === 'ar' ? 'التخصص' : 'Major']: trainee.major,
    [locale === 'ar' ? 'سنة التخرج' : 'Graduation Year']: trainee.graduation_year,
    [locale === 'ar' ? 'تاريخ البدء' : 'Start Date']: new Date(
      trainee.start_date
    ).toLocaleDateString(),
    [locale === 'ar' ? 'تاريخ الانتهاء المتوقع' : 'Expected End Date']: new Date(
      trainee.expected_end_date
    ).toLocaleDateString(),
    [locale === 'ar' ? 'الحالة' : 'Status']:
      locale === 'ar'
        ? {
            active: 'نشط',
            completed: 'مكتمل',
            suspended: 'موقوف',
            withdrawn: 'منسحب',
          }[trainee.status]
        : trainee.status,
  }));

  exportToExcel(
    data,
    `trainees-${new Date().toISOString().split('T')[0]}`,
    locale === 'ar' ? 'المتدربين' : 'Trainees'
  );
};

export const exportInstitutionsToExcel = (institutions: any[], locale: string) => {
  const data = institutions.map((inst) => ({
    [locale === 'ar' ? 'اسم المؤسسة' : 'Institution Name']:
      locale === 'ar' ? inst.name_ar : inst.name,
    [locale === 'ar' ? 'العنوان' : 'Address']: inst.address,
    [locale === 'ar' ? 'رقم الهاتف' : 'Phone']: inst.phone,
    [locale === 'ar' ? 'البريد الإلكتروني' : 'Email']: inst.email,
    [locale === 'ar' ? 'عدد المتدربين' : 'Trainee Count']: inst.trainee_count || 0,
    [locale === 'ar' ? 'عدد المشرفين' : 'Supervisor Count']:
      inst.supervisor_count || 0,
  }));

  exportToExcel(
    data,
    `institutions-${new Date().toISOString().split('T')[0]}`,
    locale === 'ar' ? 'المؤسسات' : 'Institutions'
  );
};

export const exportSupervisorsToExcel = (supervisors: any[], locale: string) => {
  const data = supervisors.map((sup) => ({
    [locale === 'ar' ? 'الاسم الكامل' : 'Full Name']: sup.full_name,
    [locale === 'ar' ? 'البريد الإلكتروني' : 'Email']: sup.email,
    [locale === 'ar' ? 'رقم الهاتف' : 'Phone Number']: sup.phone_number,
    [locale === 'ar' ? 'المؤسسة' : 'Institution']:
      locale === 'ar' ? sup.institution_name_ar : sup.institution_name,
    [locale === 'ar' ? 'المسمى الوظيفي' : 'Position']:
      locale === 'ar' ? sup.position_title_ar : sup.position_title,
    [locale === 'ar' ? 'عدد المتدربين' : 'Trainee Count']: sup.trainee_count || 0,
  }));

  exportToExcel(
    data,
    `supervisors-${new Date().toISOString().split('T')[0]}`,
    locale === 'ar' ? 'المشرفين' : 'Supervisors'
  );
};

export const exportReportsToExcel = (reports: any[], locale: string) => {
  const data = reports.map((report) => ({
    [locale === 'ar' ? 'اسم المتدرب' : 'Trainee Name']: report.trainee_name,
    [locale === 'ar' ? 'العنوان' : 'Title']: report.title,
    [locale === 'ar' ? 'الوصف' : 'Description']: report.description,
    [locale === 'ar' ? 'تاريخ التقديم' : 'Submission Date']: new Date(
      report.submission_date
    ).toLocaleDateString(),
    [locale === 'ar' ? 'الحالة' : 'Status']:
      locale === 'ar'
        ? {
            pending: 'قيد المراجعة',
            approved: 'موافق عليه',
            rejected: 'مرفوض',
          }[report.status]
        : report.status,
    [locale === 'ar' ? 'التعليقات' : 'Feedback']: report.feedback || '-',
  }));

  exportToExcel(
    data,
    `reports-${new Date().toISOString().split('T')[0]}`,
    locale === 'ar' ? 'التقارير' : 'Reports'
  );
};
