import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportSingleReportToPDFWithArabic = async (report: any, locale: string) => {
  // Create a temporary container for the report
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  const statusLabels: any = {
    pending: locale === 'ar' ? 'قيد الانتظار' : 'Pending',
    approved: locale === 'ar' ? 'مقبول' : 'Approved',
    rejected: locale === 'ar' ? 'مرفوض' : 'Rejected',
  };

  const typeLabels: any = {
    daily: locale === 'ar' ? 'تقرير يومي' : 'Daily Report',
    weekly: locale === 'ar' ? 'تقرير أسبوعي' : 'Weekly Report',
    monthly: locale === 'ar' ? 'تقرير شهري' : 'Monthly Report',
  };

  const statusColors: any = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
  };

  // Build HTML content
  container.innerHTML = `
    <div style="font-family: Arial, sans-serif;">
      <!-- Header -->
      <div style="margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
        <h1 style="color: #1f2937; margin: 0 0 10px 0; font-size: 28px;">
          ${locale === 'ar' ? 'تقرير التدريب' : 'Training Report'}
        </h1>
        <div style="background: #ede9fe; color: #7c3aed; padding: 8px 16px; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">
          ${typeLabels[report.report_type] || report.report_type}
        </div>
      </div>

      <!-- Report Information -->
      <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; font-weight: 700;">
          ${locale === 'ar' ? 'معلومات التقرير' : 'Report Information'}
        </h2>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
            <span style="font-weight: 600; color: #6b7280; ${locale === 'ar' ? 'margin-left: 10px;' : 'margin-right: 10px;'}">
              ${locale === 'ar' ? 'المتدرب:' : 'Trainee:'}
            </span>
            <span style="color: #1f2937;">${report.trainee_name}</span>
          </div>
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
            <span style="font-weight: 600; color: #6b7280; ${locale === 'ar' ? 'margin-left: 10px;' : 'margin-right: 10px;'}">
              ${locale === 'ar' ? 'المؤسسة:' : 'Institution:'}
            </span>
            <span style="color: #1f2937;">${report.institution_name}</span>
          </div>
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
            <span style="font-weight: 600; color: #6b7280; ${locale === 'ar' ? 'margin-left: 10px;' : 'margin-right: 10px;'}">
              ${locale === 'ar' ? 'الفترة:' : 'Period:'}
            </span>
            <span style="color: #1f2937;">
              ${new Date(report.period_start).toLocaleDateString(locale)} - ${new Date(report.period_end).toLocaleDateString(locale)}
            </span>
          </div>
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
            <span style="font-weight: 600; color: #6b7280; ${locale === 'ar' ? 'margin-left: 10px;' : 'margin-right: 10px;'}">
              ${locale === 'ar' ? 'تاريخ التقديم:' : 'Submitted:'}
            </span>
            <span style="color: #1f2937;">${new Date(report.submitted_at).toLocaleString(locale)}</span>
          </div>
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''} align-items: center;">
            <span style="font-weight: 600; color: #6b7280; ${locale === 'ar' ? 'margin-left: 10px;' : 'margin-right: 10px;'}">
              ${locale === 'ar' ? 'الحالة:' : 'Status:'}
            </span>
            <span style="background: ${statusColors[report.status]}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">
              ${statusLabels[report.status] || report.status}
            </span>
          </div>
        </div>
      </div>

      <!-- Title -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          ${locale === 'ar' ? 'العنوان' : 'Title'}
        </h3>
        <p style="color: #1f2937; line-height: 1.6; margin: 0; font-size: 14px;">
          ${report.title}
        </p>
      </div>

      <!-- Content -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          ${locale === 'ar' ? 'المحتوى' : 'Content'}
        </h3>
        <p style="color: #1f2937; line-height: 1.8; margin: 0; white-space: pre-wrap; font-size: 14px;">
          ${report.content}
        </p>
      </div>

      <!-- Work Done -->
      ${report.work_done ? `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          ${locale === 'ar' ? 'الأعمال المنجزة' : 'Work Done'}
        </h3>
        <p style="color: #1f2937; line-height: 1.8; margin: 0; white-space: pre-wrap; font-size: 14px;">
          ${report.work_done}
        </p>
      </div>
      ` : ''}

      <!-- Challenges -->
      ${report.challenges ? `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          ${locale === 'ar' ? 'التحديات' : 'Challenges'}
        </h3>
        <p style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; color: #78350f; line-height: 1.8; margin: 0; white-space: pre-wrap; font-size: 14px; border-radius: 4px;">
          ${report.challenges}
        </p>
      </div>
      ` : ''}

      <!-- Next Steps -->
      ${report.next_steps ? `
      <div style="margin-bottom: 25px;">
        <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          ${locale === 'ar' ? 'الخطوات القادمة' : 'Next Steps'}
        </h3>
        <p style="background: #dbeafe; border-right: 4px solid #3b82f6; padding: 15px; color: #1e3a8a; line-height: 1.8; margin: 0; white-space: pre-wrap; font-size: 14px; border-radius: 4px;">
          ${report.next_steps}
        </p>
      </div>
      ` : ''}

      <!-- Feedback -->
      ${report.feedback && report.reviewed_at ? `
      <div style="margin-top: 30px; border-top: 3px solid #10b981; padding-top: 20px;">
        <h3 style="color: #10b981; font-size: 16px; margin: 0 0 10px 0; font-weight: 700;">
          ${locale === 'ar' ? 'ملاحظات المشرف' : 'Supervisor Feedback'}
        </h3>
        <p style="color: #6b7280; font-size: 12px; font-style: italic; margin: 0 0 15px 0;">
          ${locale === 'ar' ? 'تمت المراجعة في:' : 'Reviewed on:'} ${new Date(report.reviewed_at).toLocaleString(locale)}
        </p>
        <p style="background: #d1fae5; border: 2px solid #10b981; padding: 15px; color: #065f46; line-height: 1.8; margin: 0; white-space: pre-wrap; font-size: 14px; border-radius: 4px;">
          ${report.feedback}
        </p>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
        ${locale === 'ar' ? 'تم الإنشاء في' : 'Generated on'} ${new Date().toLocaleString(locale)}
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    const fileName = `report-${report.trainee_name.replace(/\s+/g, '-')}-${new Date(report.submitted_at).toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};
