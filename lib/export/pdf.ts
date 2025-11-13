import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Note: Arabic text in PDF requires Arabic font. Using English for now.
// For full Arabic support, you'll need to embed an Arabic font.

export const exportTraineesToPDF = (trainees: any[], locale: string) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(locale === 'ar' ? 'Trainees Report' : 'Trainees Report', 14, 22);

  // Add date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

  // Prepare table data
  const headers = [
    [
      locale === 'ar' ? 'Name' : 'Name',
      locale === 'ar' ? 'Email' : 'Email',
      locale === 'ar' ? 'Institution' : 'Institution',
      locale === 'ar' ? 'University' : 'University',
      locale === 'ar' ? 'Status' : 'Status',
    ],
  ];

  const data = trainees.map((t) => [
    t.full_name,
    t.email,
    locale === 'ar' ? t.institution_name_ar : t.institution_name,
    t.university,
    locale === 'ar'
      ? {
          active: 'Active',
          completed: 'Completed',
          suspended: 'Suspended',
          withdrawn: 'Withdrawn',
        }[t.status as string] || t.status
      : t.status,
  ]);

  // Generate table
  autoTable(doc, {
    head: headers,
    body: data,
    startY: 35,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Save PDF
  doc.save(`trainees-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportInstitutionsToPDF = (institutions: any[], locale: string) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(
    locale === 'ar' ? 'Institutions Report' : 'Institutions Report',
    14,
    22
  );

  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

  const headers = [
    [
      locale === 'ar' ? 'Name' : 'Name',
      locale === 'ar' ? 'Address' : 'Address',
      locale === 'ar' ? 'Phone' : 'Phone',
      locale === 'ar' ? 'Trainees' : 'Trainees',
      locale === 'ar' ? 'Supervisors' : 'Supervisors',
    ],
  ];

  const data = institutions.map((inst) => [
    locale === 'ar' ? inst.name_ar : inst.name,
    inst.address,
    inst.phone,
    inst.trainee_count || 0,
    inst.supervisor_count || 0,
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 35,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`institutions-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportSupervisorsToPDF = (supervisors: any[], locale: string) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(
    locale === 'ar' ? 'Supervisors Report' : 'Supervisors Report',
    14,
    22
  );

  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

  const headers = [
    [
      locale === 'ar' ? 'Name' : 'Name',
      locale === 'ar' ? 'Email' : 'Email',
      locale === 'ar' ? 'Institution' : 'Institution',
      locale === 'ar' ? 'Position' : 'Position',
      locale === 'ar' ? 'Trainees' : 'Trainees',
    ],
  ];

  const data = supervisors.map((sup) => [
    sup.full_name,
    sup.email,
    locale === 'ar' ? sup.institution_name_ar : sup.institution_name,
    locale === 'ar' ? sup.position_title_ar : sup.position_title,
    sup.trainee_count || 0,
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 35,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [46, 204, 113], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`supervisors-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportReportsToPDF = (reports: any[], locale: string) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(locale === 'ar' ? 'Reports' : 'Reports', 14, 22);

  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

  const headers = [
    [
      locale === 'ar' ? 'Trainee' : 'Trainee',
      locale === 'ar' ? 'Title' : 'Title',
      locale === 'ar' ? 'Date' : 'Date',
      locale === 'ar' ? 'Status' : 'Status',
    ],
  ];

  const data = reports.map((report) => [
    report.trainee_name,
    report.title,
    new Date(report.submission_date).toLocaleDateString(),
    locale === 'ar'
      ? {
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected',
        }[report.status as string] || report.status
      : report.status,
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 35,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [231, 76, 60], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`reports-${new Date().toISOString().split('T')[0]}.pdf`);
};
