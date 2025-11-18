'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bell, Calendar, Megaphone, Users, CheckSquare, Square } from 'lucide-react';

interface Trainee {
  id: string;
  name: string;
  email: string;
  institution: string | null;
}

interface Announcement {
  id: string;
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
  type: string;
  priority: string;
  target_all: boolean;
  workshop_date: string | null;
  workshop_type: string | null;
  workshop_location: string | null;
  workshop_location_ar: string | null;
  expires_at: string | null;
  is_pinned: boolean;
  announcement_recipients: Array<{ trainee_id: string }>;
}

interface EditAnnouncementFormProps {
  announcement: Announcement;
  trainees: Trainee[];
  locale: string;
}

export default function EditAnnouncementForm({
  announcement,
  trainees,
  locale,
}: EditAnnouncementFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract date and time from workshop_date
  const getDateAndTime = (workshopDate: string | null) => {
    if (!workshopDate) return { date: '', time: '' };
    const [date, timeWithZone] = workshopDate.split('T');
    const time = timeWithZone ? timeWithZone.substring(0, 5) : '';
    return { date, time };
  };

  const { date: initialDate, time: initialTime } = getDateAndTime(announcement.workshop_date);

  const [formData, setFormData] = useState({
    title: announcement.title,
    title_ar: announcement.title_ar,
    content: announcement.content,
    content_ar: announcement.content_ar,
    type: announcement.type,
    priority: announcement.priority,
    target_all: announcement.target_all,
    workshop_date: initialDate,
    workshop_time: initialTime,
    workshop_type: announcement.workshop_type || '',
    workshop_location: announcement.workshop_location || '',
    workshop_location_ar: announcement.workshop_location_ar || '',
    expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : '',
    is_pinned: announcement.is_pinned,
  });

  const [selectedTrainees, setSelectedTrainees] = useState<string[]>(
    announcement.announcement_recipients.map(r => r.trainee_id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.title || !formData.title_ar || !formData.content || !formData.content_ar) {
        alert(locale === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
        setLoading(false);
        return;
      }

      if (!formData.target_all && selectedTrainees.length === 0) {
        alert(locale === 'ar' ? 'الرجاء اختيار متدرب واحد على الأقل' : 'Please select at least one trainee');
        setLoading(false);
        return;
      }

      // Combine workshop date and time
      let workshopDateTime = null;
      if (formData.type === 'workshop' && formData.workshop_date) {
        if (formData.workshop_time) {
          workshopDateTime = `${formData.workshop_date}T${formData.workshop_time}:00`;
        } else {
          workshopDateTime = `${formData.workshop_date}T00:00:00`;
        }
      }

      // Update announcement
      const { error: announcementError } = await supabase
        .from('announcements')
        .update({
          title: formData.title,
          title_ar: formData.title_ar,
          content: formData.content,
          content_ar: formData.content_ar,
          type: formData.type,
          priority: formData.priority,
          target_all: formData.target_all,
          workshop_date: workshopDateTime,
          workshop_type: formData.type === 'workshop' ? formData.workshop_type : null,
          workshop_location: formData.type === 'workshop' ? formData.workshop_location : null,
          workshop_location_ar: formData.type === 'workshop' ? formData.workshop_location_ar : null,
          expires_at: formData.expires_at || null,
          is_pinned: formData.is_pinned,
        })
        .eq('id', announcement.id);

      if (announcementError) throw announcementError;

      // Update recipients if not targeting all
      // First, delete existing recipients
      await supabase
        .from('announcement_recipients')
        .delete()
        .eq('announcement_id', announcement.id);

      // Then, create new recipients if needed
      if (!formData.target_all && selectedTrainees.length > 0) {
        const recipients = selectedTrainees.map((traineeId) => ({
          announcement_id: announcement.id,
          trainee_id: traineeId,
        }));

        const { error: recipientsError } = await supabase
          .from('announcement_recipients')
          .insert(recipients);

        if (recipientsError) throw recipientsError;
      }

      alert(locale === 'ar' ? 'تم تحديث الإعلان بنجاح' : 'Announcement updated successfully');
      router.push(`/${locale}/announcements`);
      router.refresh();
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert(locale === 'ar' ? 'حدث خطأ أثناء تحديث الإعلان' : 'Error updating announcement');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrainee = (traineeId: string) => {
    setSelectedTrainees((prev) =>
      prev.includes(traineeId)
        ? prev.filter((id) => id !== traineeId)
        : [...prev, traineeId]
    );
  };

  const selectAll = () => {
    setSelectedTrainees(trainees.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedTrainees([]);
  };

  const filteredTrainees = trainees.filter((trainee) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      trainee.name.toLowerCase().includes(search) ||
      trainee.email.toLowerCase().includes(search) ||
      (trainee.institution && trainee.institution.toLowerCase().includes(search))
    );
  });

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'ar' ? 'النوع' : 'Type'} *
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'announcement' })}
            className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              formData.type === 'announcement'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Bell size={20} />
            <span className="font-medium">{locale === 'ar' ? 'إعلان' : 'Announcement'}</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'workshop' })}
            className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              formData.type === 'workshop'
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar size={20} />
            <span className="font-medium">{locale === 'ar' ? 'ورشة' : 'Workshop'}</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'circular' })}
            className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              formData.type === 'circular'
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Megaphone size={20} />
            <span className="font-medium">{locale === 'ar' ? 'تعميم' : 'Circular'}</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'العنوان (بالإنجليزية)' : 'Title (English)'} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'العنوان (بالعربية)' : 'Title (Arabic)'} *
          </label>
          <input
            type="text"
            value={formData.title_ar}
            onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="rtl"
            required
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'المحتوى (بالإنجليزية)' : 'Content (English)'} *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'المحتوى (بالعربية)' : 'Content (Arabic)'} *
          </label>
          <textarea
            value={formData.content_ar}
            onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            dir="rtl"
            required
          />
        </div>
      </div>

      {/* Workshop Details */}
      {formData.type === 'workshop' && (
        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {locale === 'ar' ? 'تفاصيل الورشة' : 'Workshop Details'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'التاريخ' : 'Date'}
              </label>
              <input
                type="date"
                value={formData.workshop_date}
                onChange={(e) => setFormData({ ...formData, workshop_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الوقت' : 'Time'}
              </label>
              <input
                type="time"
                value={formData.workshop_time}
                onChange={(e) => setFormData({ ...formData, workshop_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'نوع الورشة' : 'Workshop Type'}
            </label>
            <select
              value={formData.workshop_type}
              onChange={(e) => setFormData({ ...formData, workshop_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{locale === 'ar' ? 'اختر النوع' : 'Select Type'}</option>
              <option value="online">{locale === 'ar' ? 'عن بُعد' : 'Online'}</option>
              <option value="in-person">{locale === 'ar' ? 'حضوري' : 'In-Person'}</option>
              <option value="hybrid">{locale === 'ar' ? 'مختلط' : 'Hybrid'}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الموقع (بالإنجليزية)' : 'Location (English)'}
              </label>
              <input
                type="text"
                value={formData.workshop_location}
                onChange={(e) => setFormData({ ...formData, workshop_location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Ramallah Training Center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'الموقع (بالعربية)' : 'Location (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.workshop_location_ar}
                onChange={(e) => setFormData({ ...formData, workshop_location_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="rtl"
                placeholder="مثال: مركز التدريب - رام الله"
              />
            </div>
          </div>
        </div>
      )}

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'ar' ? 'الأولوية' : 'Priority'}
        </label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="normal">{locale === 'ar' ? 'عادي' : 'Normal'}</option>
          <option value="important">{locale === 'ar' ? 'هام' : 'Important'}</option>
          <option value="urgent">{locale === 'ar' ? 'عاجل' : 'Urgent'}</option>
        </select>
      </div>

      {/* Expiry Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'ar' ? 'تاريخ الانتهاء (اختياري)' : 'Expiry Date (Optional)'}
        </label>
        <input
          type="date"
          value={formData.expires_at}
          onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Target Selection */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="target_all"
            checked={formData.target_all}
            onChange={(e) => setFormData({ ...formData, target_all: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="target_all" className="text-sm font-medium text-gray-700 cursor-pointer">
            {locale === 'ar' ? 'إرسال للجميع (جميع المتدربين)' : 'Send to All (All Trainees)'}
          </label>
        </div>

        {!formData.target_all && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                {locale === 'ar' ? 'اختر المتدربين' : 'Select Trainees'} ({selectedTrainees.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {locale === 'ar' ? 'اختيار الكل' : 'Select All'}
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {locale === 'ar' ? 'إلغاء الكل' : 'Deselect All'}
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder={locale === 'ar' ? 'بحث بالاسم أو البريد أو المؤسسة...' : 'Search by name, email, or institution...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            />

            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {filteredTrainees.map((trainee) => (
                <div
                  key={trainee.id}
                  onClick={() => toggleTrainee(trainee.id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  {selectedTrainees.includes(trainee.id) ? (
                    <CheckSquare className="text-blue-600 flex-shrink-0" size={20} />
                  ) : (
                    <Square className="text-gray-400 flex-shrink-0" size={20} />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{trainee.name}</div>
                    <div className="text-sm text-gray-500">{trainee.email}</div>
                    {trainee.institution && (
                      <div className="text-xs text-gray-400">{trainee.institution}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_pinned"
          checked={formData.is_pinned}
          onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="is_pinned" className="text-sm font-medium text-gray-700 cursor-pointer">
          {locale === 'ar' ? 'تثبيت الإعلان (يظهر في الأعلى)' : 'Pin Announcement (Show at Top)'}
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-6 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
        >
          {loading
            ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
            : (locale === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {locale === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </form>
  );
}
