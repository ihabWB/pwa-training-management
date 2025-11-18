'use client';

import { Bell, Calendar, Megaphone, MapPin, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Announcement {
  id: string;
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
  type: 'announcement' | 'workshop' | 'circular';
  priority: 'normal' | 'important' | 'urgent';
  workshop_date: string | null;
  workshop_type: string | null;
  workshop_location: string | null;
  workshop_location_ar: string | null;
  created_at: string;
  is_pinned: boolean;
}

interface AnnouncementsWidgetProps {
  announcements: Announcement[];
  locale: string;
  traineeId?: string;
}

export default function AnnouncementsWidget({
  announcements,
  locale,
  traineeId,
}: AnnouncementsWidgetProps) {
  const router = useRouter();
  const supabase = createClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workshop':
        return <Calendar size={18} className="text-purple-600" />;
      case 'circular':
        return <Megaphone size={18} className="text-green-600" />;
      default:
        return <Bell size={18} className="text-blue-600" />;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'important':
        return 'border-l-4 border-orange-500 bg-orange-50';
      default:
        return 'border-l-4 border-blue-500 bg-white';
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!traineeId) return;

    try {
      await supabase
        .from('announcement_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('announcement_id', announcementId)
        .eq('trainee_id', traineeId);
      
      router.refresh();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          {locale === 'ar' ? 'الإعلانات والتعاميم' : 'Announcements & Circulars'}
        </h2>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {announcements.slice(0, 5).map((announcement) => (
          <div
            key={announcement.id}
            className={`p-4 transition-colors hover:bg-gray-50 ${getPriorityStyles(announcement.priority)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(announcement.type)}
                  <h3 className="font-semibold text-gray-900">
                    {locale === 'ar' ? announcement.title_ar : announcement.title}
                  </h3>
                  {announcement.is_pinned && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {locale === 'ar' ? 'مثبت' : 'Pinned'}
                    </span>
                  )}
                  {announcement.priority === 'urgent' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                      {locale === 'ar' ? 'عاجل' : 'Urgent'}
                    </span>
                  )}
                </div>

                {/* Content Preview or Full */}
                <p
                  className={`text-gray-600 text-sm mb-2 ${
                    expandedId === announcement.id ? '' : 'line-clamp-2'
                  }`}
                >
                  {locale === 'ar' ? announcement.content_ar : announcement.content}
                </p>

                {/* Workshop Details */}
                {announcement.type === 'workshop' && announcement.workshop_date && (
                  <div className="bg-purple-50 rounded-lg p-3 mb-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-purple-900">
                      <Calendar size={16} />
                      <span className="font-medium">
                        {new Date(announcement.workshop_date).toLocaleDateString(
                          locale === 'ar' ? 'ar-EG' : 'en-US',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-900">
                      <Clock size={16} />
                      <span>
                        {new Date(announcement.workshop_date).toLocaleTimeString(
                          locale === 'ar' ? 'ar-EG' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                    </div>
                    {announcement.workshop_location && (
                      <div className="flex items-center gap-2 text-sm text-purple-900">
                        <MapPin size={16} />
                        <span>
                          {locale === 'ar'
                            ? announcement.workshop_location_ar
                            : announcement.workshop_location}
                        </span>
                      </div>
                    )}
                    {announcement.workshop_type && (
                      <span className="inline-block px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded">
                        {announcement.workshop_type === 'online'
                          ? locale === 'ar'
                            ? 'عن بُعد'
                            : 'Online'
                          : announcement.workshop_type === 'in-person'
                          ? locale === 'ar'
                            ? 'حضوري'
                            : 'In-Person'
                          : locale === 'ar'
                          ? 'مختلط'
                          : 'Hybrid'}
                      </span>
                    )}
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    {new Date(announcement.created_at).toLocaleDateString(
                      locale === 'ar' ? 'ar-EG' : 'en-US'
                    )}
                  </span>
                  {expandedId !== announcement.id && (
                    <button
                      onClick={() => setExpandedId(announcement.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {locale === 'ar' ? 'عرض المزيد' : 'Show More'}
                    </button>
                  )}
                  {expandedId === announcement.id && (
                    <button
                      onClick={() => setExpandedId(null)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {locale === 'ar' ? 'عرض أقل' : 'Show Less'}
                    </button>
                  )}
                </div>
              </div>

              {traineeId && (
                <button
                  onClick={() => markAsRead(announcement.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                  title={locale === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {announcements.length > 5 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <span className="text-sm text-gray-500">
            {locale === 'ar'
              ? `و ${announcements.length - 5} إعلانات أخرى`
              : `and ${announcements.length - 5} more announcements`}
          </span>
        </div>
      )}
    </div>
  );
}
