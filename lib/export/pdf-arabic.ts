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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6;">
      <!-- Header with Logo Area -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; margin: -40px -40px 30px -40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="text-align: center;">
          <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; letter-spacing: 0.5px;">
            ${locale === 'ar' ? '🎓 تقرير التدريب' : '🎓 Training Report'}
          </h1>
          <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-size: 15px; font-weight: 600;">
            ${typeLabels[report.report_type] || report.report_type}
          </div>
        </div>
      </div>

      <!-- Report Information Card -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #3b82f6; border-radius: 15px; padding: 25px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 20px; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
          <div style="background: #3b82f6; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; ${locale === 'ar' ? 'margin-left: 15px;' : 'margin-right: 15px;'}">
            <span style="color: white; font-size: 24px;">ℹ️</span>
          </div>
          <h2 style="color: #1e40af; font-size: 22px; margin: 0; font-weight: 700;">
            ${locale === 'ar' ? 'معلومات التقرير' : 'Report Information'}
          </h2>
        </div>
        
        <div style="display: grid; gap: 15px; background: white; padding: 20px; border-radius: 10px;">
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''} padding: 12px; background: #f8fafc; border-radius: 8px; border-right: 4px solid #3b82f6;">
            <span style="font-weight: 700; color: #3b82f6; min-width: 120px; ${locale === 'ar' ? 'text-align: right; margin-left: 15px;' : 'margin-right: 15px;'}">
              👤 ${locale === 'ar' ? 'المتدرب:' : 'Trainee:'}
            </span>
            <span style="color: #1f2937; flex: 1; font-weight: 500;">${report.trainee_name}</span>
          </div>
          
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''} padding: 12px; background: #f8fafc; border-radius: 8px; border-right: 4px solid #8b5cf6;">
            <span style="font-weight: 700; color: #8b5cf6; min-width: 120px; ${locale === 'ar' ? 'text-align: right; margin-left: 15px;' : 'margin-right: 15px;'}">
              🏢 ${locale === 'ar' ? 'المؤسسة:' : 'Institution:'}
            </span>
            <span style="color: #1f2937; flex: 1; font-weight: 500;">${report.institution_name}</span>
          </div>
          
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''} padding: 12px; background: #f8fafc; border-radius: 8px; border-right: 4px solid #10b981;">
            <span style="font-weight: 700; color: #10b981; min-width: 120px; ${locale === 'ar' ? 'text-align: right; margin-left: 15px;' : 'margin-right: 15px;'}">
              📅 ${locale === 'ar' ? 'الفترة:' : 'Period:'}
            </span>
            <span style="color: #1f2937; flex: 1; font-weight: 500;">
              ${new Date(report.period_start).toLocaleDateString(locale, {year: 'numeric', month: 'long', day: 'numeric'})} 
              <span style="color: #6b7280;">→</span> 
              ${new Date(report.period_end).toLocaleDateString(locale, {year: 'numeric', month: 'long', day: 'numeric'})}
            </span>
          </div>
          
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''} padding: 12px; background: #f8fafc; border-radius: 8px; border-right: 4px solid #f59e0b;">
            <span style="font-weight: 700; color: #f59e0b; min-width: 120px; ${locale === 'ar' ? 'text-align: right; margin-left: 15px;' : 'margin-right: 15px;'}">
              🕒 ${locale === 'ar' ? 'تاريخ التقديم:' : 'Submitted:'}
            </span>
            <span style="color: #1f2937; flex: 1; font-weight: 500;">${new Date(report.submitted_at).toLocaleString(locale, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
          </div>
          
          <div style="display: flex; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''} align-items: center; padding: 12px; background: #f8fafc; border-radius: 8px; border-right: 4px solid ${statusColors[report.status]};">
            <span style="font-weight: 700; color: ${statusColors[report.status]}; min-width: 120px; ${locale === 'ar' ? 'text-align: right; margin-left: 15px;' : 'margin-right: 15px;'}">
              ⭐ ${locale === 'ar' ? 'الحالة:' : 'Status:'}
            </span>
            <span style="background: ${statusColors[report.status]}; color: white; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              ${statusLabels[report.status] || report.status}
            </span>
          </div>
        </div>
      </div>

      <!-- Title Section -->
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 15px; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; ${locale === 'ar' ? 'margin-left: 12px;' : 'margin-right: 12px;'}">
            <span style="color: white; font-size: 20px;">📌</span>
          </div>
          <h3 style="color: #be185d; font-size: 18px; margin: 0; font-weight: 700;">
            ${locale === 'ar' ? 'عنوان التقرير' : 'Report Title'}
          </h3>
        </div>
        <p style="color: #1f2937; line-height: 1.8; margin: 0; font-size: 15px; padding: 15px; background: #fdf2f8; border-radius: 10px; font-weight: 500;">
          ${report.title}
        </p>
      </div>

      <!-- Content Section -->
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 15px; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; ${locale === 'ar' ? 'margin-left: 12px;' : 'margin-right: 12px;'}">
            <span style="color: white; font-size: 20px;">📝</span>
          </div>
          <h3 style="color: #1e40af; font-size: 18px; margin: 0; font-weight: 700;">
            ${locale === 'ar' ? 'محتوى التقرير' : 'Report Content'}
          </h3>
        </div>
        <div style="color: #374151; line-height: 2; margin: 0; white-space: pre-wrap; font-size: 14px; padding: 20px; background: #f0f9ff; border-radius: 10px; border-right: 4px solid #3b82f6;">
          ${report.content}
        </div>
      </div>

      <!-- Work Done Section -->
      ${report.work_done ? `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 15px; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; ${locale === 'ar' ? 'margin-left: 12px;' : 'margin-right: 12px;'}">
            <span style="color: white; font-size: 20px;">✅</span>
          </div>
          <h3 style="color: #059669; font-size: 18px; margin: 0; font-weight: 700;">
            ${locale === 'ar' ? 'الأعمال المنجزة' : 'Work Completed'}
          </h3>
        </div>
        <div style="color: #065f46; line-height: 2; margin: 0; white-space: pre-wrap; font-size: 14px; padding: 20px; background: #d1fae5; border-radius: 10px; border-right: 4px solid #10b981;">
          ${report.work_done}
        </div>
      </div>
      ` : ''}

      <!-- Challenges Section -->
      ${report.challenges ? `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 15px; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; ${locale === 'ar' ? 'margin-left: 12px;' : 'margin-right: 12px;'}">
            <span style="color: white; font-size: 20px;">⚠️</span>
          </div>
          <h3 style="color: #d97706; font-size: 18px; margin: 0; font-weight: 700;">
            ${locale === 'ar' ? 'التحديات والصعوبات' : 'Challenges & Difficulties'}
          </h3>
        </div>
        <div style="color: #92400e; line-height: 2; margin: 0; white-space: pre-wrap; font-size: 14px; padding: 20px; background: #fef3c7; border-radius: 10px; border-right: 4px solid #f59e0b;">
          ${report.challenges}
        </div>
      </div>
      ` : ''}

      <!-- Next Steps Section -->
      ${report.next_steps ? `
      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 15px; padding: 25px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 15px; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; ${locale === 'ar' ? 'margin-left: 12px;' : 'margin-right: 12px;'}">
            <span style="color: white; font-size: 20px;">🎯</span>
          </div>
          <h3 style="color: #6d28d9; font-size: 18px; margin: 0; font-weight: 700;">
            ${locale === 'ar' ? 'الخطوات القادمة' : 'Next Steps & Plans'}
          </h3>
        </div>
        <div style="color: #4c1d95; line-height: 2; margin: 0; white-space: pre-wrap; font-size: 14px; padding: 20px; background: #ede9fe; border-radius: 10px; border-right: 4px solid #8b5cf6;">
          ${report.next_steps}
        </div>
      </div>
      ` : ''}

      <!-- Feedback Section -->
      ${report.feedback && report.reviewed_at ? `
      <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 3px solid #10b981; border-radius: 15px; padding: 30px; margin-top: 30px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
        <div style="display: flex; align-items: center; margin-bottom: 20px; ${locale === 'ar' ? 'flex-direction: row-reverse;' : ''}">
          <div style="background: #10b981; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; ${locale === 'ar' ? 'margin-left: 15px;' : 'margin-right: 15px;'} box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <span style="color: white; font-size: 26px;">💬</span>
          </div>
          <div style="flex: 1;">
            <h3 style="color: #065f46; font-size: 20px; margin: 0 0 5px 0; font-weight: 700;">
              ${locale === 'ar' ? 'ملاحظات المشرف' : 'Supervisor Feedback'}
            </h3>
            <p style="color: #047857; font-size: 13px; font-style: italic; margin: 0;">
              ${locale === 'ar' ? '📅 تمت المراجعة في:' : '📅 Reviewed on:'} ${new Date(report.reviewed_at).toLocaleString(locale, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
            </p>
          </div>
        </div>
        <div style="background: white; border: 2px solid #10b981; padding: 20px; color: #065f46; line-height: 2; margin: 0; white-space: pre-wrap; font-size: 14px; border-radius: 10px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
          ${report.feedback}
        </div>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 15px; text-align: center;">
        <div style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">
          <span style="font-weight: 600;">${locale === 'ar' ? '🌐 سلطة المياه الفلسطينية' : '🌐 Palestinian Water Authority'}</span>
        </div>
        <div style="color: #9ca3af; font-size: 12px;">
          ${locale === 'ar' ? '📄 تم إنشاء هذا المستند في:' : '📄 Document generated on:'} ${new Date().toLocaleString(locale, {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
        </div>
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
