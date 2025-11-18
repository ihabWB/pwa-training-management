'use client';

import { Bell, Calendar, Megaphone, MapPin, Clock, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
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

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'workshop':
        return {
          icon: Calendar,
          label: locale === 'ar' ? 'ورشة عمل' : 'Workshop',
          bgGradient: 'from-purple-500 to-purple-600',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          borderColor: 'border-purple-200',
        };
      case 'circular':
        return {
          icon: Megaphone,
          label: locale === 'ar' ? 'تعميم' : 'Circular',
          bgGradient: 'from-green-500 to-green-600',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
        };
      default:
        return {
          icon: Bell,
          label: locale === 'ar' ? 'إعلان' : 'Announcement',
          bgGradient: 'from-blue-500 to-blue-600',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          gradient: 'from-red-500 to-rose-600',
          badge: 'bg-red-500 text-white',
          label: locale === 'ar' ? 'عاجل' : 'Urgent',
          pulse: true,
        };
      case 'important':
        return {
          gradient: 'from-orange-500 to-amber-600',
          badge: 'bg-orange-500 text-white',
          label: locale === 'ar' ? 'هام' : 'Important',
          pulse: false,
        };
      default:
        return {
          gradient: '',
          badge: '',
          label: '',
          pulse: false,
        };
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
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {locale === 'ar' ? 'الإعلانات والتعاميم' : 'Announcements & Updates'}
            </h2>
            <p className="text-blue-100 text-sm">
              {locale === 'ar' 
                ? `${announcements.length} ${announcements.length === 1 ? 'إعلان' : 'إعلانات'} جديدة` 
                : `${announcements.length} ${announcements.length === 1 ? 'announcement' : 'announcements'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {announcements.slice(0, 5).map((announcement) => {
          const typeConfig = getTypeConfig(announcement.type);
          const priorityConfig = getPriorityConfig(announcement.priority);
          const TypeIcon = typeConfig.icon;
          const isExpanded = expandedId === announcement.id;

          return (
            <div
              key={announcement.id}
              className={`relative rounded-xl border-2 ${typeConfig.borderColor} bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                priorityConfig.pulse ? 'animate-pulse' : ''
              }`}
            >
              {/* Priority Ribbon */}
              {announcement.priority !== 'normal' && (
                <div className={`absolute top-0 ${locale === 'ar' ? 'left-0' : 'right-0'} z-10`}>
                  <div className={`${priorityConfig.badge} px-4 py-1 text-xs font-bold ${
                    locale === 'ar' ? 'rounded-br-lg' : 'rounded-bl-lg'
                  } shadow-lg flex items-center gap-1`}>
                    {priorityConfig.pulse && (
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    )}
                    {priorityConfig.label}
                  </div>
                </div>
              )}

              {/* Pinned Badge */}
              {announcement.is_pinned && (
                <div className={`absolute top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} z-10`}>
                  <div className={`bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold ${
                    locale === 'ar' ? 'rounded-bl-lg' : 'rounded-br-lg'
                  } shadow-lg flex items-center gap-1`}>
                    📌 {locale === 'ar' ? 'مثبت' : 'Pinned'}
                  </div>
                </div>
              )}

              <div className="p-5">
                {/* Type Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`${typeConfig.iconBg} p-3 rounded-xl flex-shrink-0`}>
                    <TypeIcon size={24} className={typeConfig.iconColor} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 ${typeConfig.iconBg} ${typeConfig.iconColor} text-xs font-semibold rounded-full`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {locale === 'ar' ? announcement.title_ar : announcement.title}
                    </h3>
                  </div>

                  {traineeId && (
                    <button
                      onClick={() => markAsRead(announcement.id)}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={locale === 'ar' ? 'إزالة' : 'Dismiss'}
                    >
                      <X size={20} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className={`text-gray-700 leading-relaxed ${!isExpanded && 'line-clamp-3'}`}>
                    {locale === 'ar' ? announcement.content_ar : announcement.content}
                  </p>
                </div>

                {/* Workshop Details */}
                {announcement.type === 'workshop' && announcement.workshop_date && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4 border-2 border-purple-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-200 rounded-lg">
                          <Calendar size={18} className="text-purple-700" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 font-medium">
                            {locale === 'ar' ? 'التاريخ' : 'Date'}
                          </p>
                          <p className="text-sm text-purple-900 font-semibold">
                            {new Date(announcement.workshop_date).toLocaleDateString(
                              locale === 'ar' ? 'ar-EG' : 'en-US',
                              { month: 'short', day: 'numeric', year: 'numeric' }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-200 rounded-lg">
                          <Clock size={18} className="text-purple-700" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 font-medium">
                            {locale === 'ar' ? 'الوقت' : 'Time'}
                          </p>
                          <p className="text-sm text-purple-900 font-semibold">
                            {new Date(announcement.workshop_date).toLocaleTimeString(
                              locale === 'ar' ? 'ar-EG' : 'en-US',
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </p>
                        </div>
                      </div>

                      {announcement.workshop_location && (
                        <div className="flex items-center gap-3 md:col-span-2">
                          <div className="p-2 bg-purple-200 rounded-lg">
                            <MapPin size={18} className="text-purple-700" />
                          </div>
                          <div>
                            <p className="text-xs text-purple-600 font-medium">
                              {locale === 'ar' ? 'الموقع' : 'Location'}
                            </p>
                            <p className="text-sm text-purple-900 font-semibold">
                              {locale === 'ar'
                                ? announcement.workshop_location_ar
                                : announcement.workshop_location}
                            </p>
                          </div>
                        </div>
                      )}

                      {announcement.workshop_type && (
                        <div className="md:col-span-2">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                            {announcement.workshop_type === 'online'
                              ? locale === 'ar' ? '🌐 عن بُعد' : '🌐 Online'
                              : announcement.workshop_type === 'in-person'
                              ? locale === 'ar' ? '👥 حضوري' : '👥 In-Person'
                              : locale === 'ar' ? '🔄 مختلط' : '🔄 Hybrid'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(announcement.created_at).toLocaleDateString(
                      locale === 'ar' ? 'ar-EG' : 'en-US',
                      { month: 'short', day: 'numeric' }
                    )}
                  </span>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : announcement.id)}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        {locale === 'ar' ? 'عرض أقل' : 'Show Less'}
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        {locale === 'ar' ? 'عرض المزيد' : 'Read More'}
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {announcements.length > 5 && (
        <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
          <span className="text-sm text-gray-600 font-medium">
            {locale === 'ar'
              ? `+${announcements.length - 5} إعلانات أخرى`
              : `+${announcements.length - 5} more announcements`}
          </span>
        </div>
      )}
    </div>
  );
}
