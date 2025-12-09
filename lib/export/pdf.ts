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
  doc.text(locale === 'ar' ? 'Training Reports' : 'Training Reports', 14, 22);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Total Reports: ${reports.length}`, 14, 36);

  const headers = [
    [
      locale === 'ar' ? 'Trainee' : 'Trainee',
      locale === 'ar' ? 'Type' : 'Type',
      locale === 'ar' ? 'Title' : 'Title',
      locale === 'ar' ? 'Period' : 'Period',
      locale === 'ar' ? 'Status' : 'Status',
    ],
  ];

  const typeLabels: any = {
    daily: locale === 'ar' ? 'Daily' : 'Daily',
    weekly: locale === 'ar' ? 'Weekly' : 'Weekly',
    monthly: locale === 'ar' ? 'Monthly' : 'Monthly',
  };

  const statusLabels: any = {
    pending: locale === 'ar' ? 'Pending' : 'Pending',
    approved: locale === 'ar' ? 'Approved' : 'Approved',
    rejected: locale === 'ar' ? 'Rejected' : 'Rejected',
  };

  const data = reports.map((report) => [
    report.trainee_name,
    typeLabels[report.report_type] || report.report_type,
    report.title.substring(0, 30) + (report.title.length > 30 ? '...' : ''),
    `${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}`,
    statusLabels[report.status] || report.status,
  ]);

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 42,
    styles: { font: 'helvetica', fontSize: 8 },
    headStyles: { fillColor: [231, 76, 60], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 10, right: 10 },
  });

  doc.save(`all-reports-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportSingleReportToPDF = (report: any, locale: string) => {
  const doc = new jsPDF();
  
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Training Report' : 'Training Report', margin, yPos);
  yPos += 10;

  // Report Type Badge
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const typeLabels: any = {
    daily: locale === 'ar' ? 'Daily Report' : 'Daily Report',
    weekly: locale === 'ar' ? 'Weekly Report' : 'Weekly Report',
    monthly: locale === 'ar' ? 'Monthly Report' : 'Monthly Report',
  };
  doc.setTextColor(100, 100, 100);
  doc.text(typeLabels[report.report_type] || report.report_type, margin, yPos);
  yPos += 8;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Reset color
  doc.setTextColor(0, 0, 0);

  // Report Info Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Report Information' : 'Report Information', margin, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Trainee Name
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Trainee:' : 'Trainee:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(report.trainee_name, margin + 30, yPos);
  yPos += 5;

  // Institution
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Institution:' : 'Institution:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(report.institution_name, margin + 30, yPos);
  yPos += 5;

  // Period
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Period:' : 'Period:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}`,
    margin + 30,
    yPos
  );
  yPos += 5;

  // Submitted Date
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Submitted:' : 'Submitted:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(report.submitted_at).toLocaleString(), margin + 30, yPos);
  yPos += 5;

  // Status
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Status:' : 'Status:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  const statusColors: any = {
    pending: [241, 196, 15],
    approved: [46, 204, 113],
    rejected: [231, 76, 60],
  };
  const statusLabels: any = {
    pending: locale === 'ar' ? 'Pending' : 'Pending',
    approved: locale === 'ar' ? 'Approved' : 'Approved',
    rejected: locale === 'ar' ? 'Rejected' : 'Rejected',
  };
  const color = statusColors[report.status] || [100, 100, 100];
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(statusLabels[report.status] || report.status, margin + 30, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Title Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Title' : 'Title', margin, yPos);
  yPos += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const titleLines = doc.splitTextToSize(report.title, contentWidth);
  doc.text(titleLines, margin, yPos);
  yPos += (titleLines.length * 5) + 6;

  // Content Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(locale === 'ar' ? 'Content' : 'Content', margin, yPos);
  yPos += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const contentLines = doc.splitTextToSize(report.content, contentWidth);
  
  // Check if we need a new page
  if (yPos + (contentLines.length * 5) > doc.internal.pageSize.height - 20) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.text(contentLines, margin, yPos);
  yPos += (contentLines.length * 5) + 6;

  // Work Done Section
  if (report.work_done) {
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(locale === 'ar' ? 'Work Done' : 'Work Done', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const workLines = doc.splitTextToSize(report.work_done, contentWidth);
    doc.text(workLines, margin, yPos);
    yPos += (workLines.length * 5) + 6;
  }

  // Challenges Section
  if (report.challenges) {
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(locale === 'ar' ? 'Challenges' : 'Challenges', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const challengeLines = doc.splitTextToSize(report.challenges, contentWidth);
    doc.text(challengeLines, margin, yPos);
    yPos += (challengeLines.length * 5) + 6;
  }

  // Next Steps Section
  if (report.next_steps) {
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(locale === 'ar' ? 'Next Steps' : 'Next Steps', margin, yPos);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const stepsLines = doc.splitTextToSize(report.next_steps, contentWidth);
    doc.text(stepsLines, margin, yPos);
    yPos += (stepsLines.length * 5) + 6;
  }

  // Feedback Section (if reviewed)
  if (report.feedback && report.reviewed_at) {
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos += 5;
    doc.setDrawColor(46, 204, 113);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 204, 113);
    doc.text(locale === 'ar' ? 'Supervisor Feedback' : 'Supervisor Feedback', margin, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Reviewed on: ${new Date(report.reviewed_at).toLocaleString()}`, margin, yPos);
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    const feedbackLines = doc.splitTextToSize(report.feedback, contentWidth);
    doc.text(feedbackLines, margin, yPos);
    yPos += (feedbackLines.length * 5);
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  const fileName = `report-${report.trainee_name.replace(/\s+/g, '-')}-${new Date(report.submitted_at).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

