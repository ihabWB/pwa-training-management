'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Calendar, 
  Users, 
  Megaphone, 
  Pin, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Announcement {
  id: string;
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
  type: 'announcement' | 'workshop' | 'circular';
  priority: 'normal' | 'important' | 'urgent';
  target_all: boolean;
  workshop_date: string | null;
  workshop_type: string | null;
  workshop_location: string | null;
  workshop_location_ar: string | null;
  created_at: string;
  expires_at: string | null;
  is_pinned: boolean;
  is_active: boolean;
  created_by_user: {
    full_name: string;
  };
  announcement_recipients: Array<{
    id: string;
    trainee_id: string;
    read_at: string | null;
  }>;
}

interface AnnouncementsListProps {
  announcements: Announcement[];
  locale: string;
}

export default function AnnouncementsList({
  announcements,
  locale,
}: AnnouncementsListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [filter, setFilter] = useState<'all' | 'announcement' | 'workshop' | 'circular'>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredAnnouncements = announcements.filter((a) => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  const getTypeLabel = (type: string) => {
    const labels = {
      announcement: locale === 'ar' ? 'إعلان' : 'Announcement',
      workshop: locale === 'ar' ? 'ورشة' : 'Workshop',
      circular: locale === 'ar' ? 'تعميم' : 'Circular',
    };
    return labels[type as keyof typeof labels];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      announcement: Bell,
      workshop: Calendar,
      circular: Megaphone,
    };
    const Icon = icons[type as keyof typeof icons];
    return <Icon size={20} />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      announcement: 'bg-blue-100 text-blue-800',
      workshop: 'bg-purple-100 text-purple-800',
      circular: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors];
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      normal: {
        label: locale === 'ar' ? 'عادي' : 'Normal',
        className: 'bg-gray-100 text-gray-800',
      },
      important: {
        label: locale === 'ar' ? 'هام' : 'Important',
        className: 'bg-orange-100 text-orange-800',
      },
      urgent: {
        label: locale === 'ar' ? 'عاجل' : 'Urgent',
        className: 'bg-red-100 text-red-800',
      },
    };
    const conf = config[priority as keyof typeof config];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${conf.className}`}>
        {conf.label}
      </span>
    );
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(id);
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error toggling announcement:', error);
      alert(locale === 'ar' ? 'حدث خطأ' : 'Error occurred');
    } finally {
      setLoading(null);
    }
  };

  const togglePin = async (id: string, currentStatus: boolean) => {
    setLoading(id);
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_pinned: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error pinning announcement:', error);
      alert(locale === 'ar' ? 'حدث خطأ' : 'Error occurred');
    } finally {
      setLoading(null);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      return;
    }

    setLoading(id);
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert(locale === 'ar' ? 'حدث خطأ' : 'Error occurred');
    } finally {
      setLoading(null);
    }
  };

  const getReadStats = (announcement: Announcement) => {
    if (announcement.target_all) {
      return locale === 'ar' ? 'للجميع' : 'All';
    }
    const total = announcement.announcement_recipients.length;
    const read = announcement.announcement_recipients.filter((r) => r.read_at).length;
    return `${read}/${total}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'ar' ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setFilter('announcement')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'announcement'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'ar' ? 'الإعلانات' : 'Announcements'}
          </button>
          <button
            onClick={() => setFilter('workshop')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'workshop'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'ar' ? 'الورش' : 'Workshops'}
          </button>
          <button
            onClick={() => setFilter('circular')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'circular'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'ar' ? 'التعاميم' : 'Circulars'}
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="divide-y divide-gray-200">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {locale === 'ar' ? 'لا توجد إعلانات' : 'No announcements'}
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                announcement.is_pinned ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {announcement.is_pinned && (
                      <Pin className="text-blue-600" size={16} />
                    )}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTypeColor(announcement.type)}`}>
                      {getTypeIcon(announcement.type)}
                      <span className="text-xs font-medium">{getTypeLabel(announcement.type)}</span>
                    </div>
                    {getPriorityBadge(announcement.priority)}
                    {!announcement.is_active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {locale === 'ar' ? 'معطل' : 'Inactive'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {locale === 'ar' ? announcement.title_ar : announcement.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {locale === 'ar' ? announcement.content_ar : announcement.content}
                  </p>

                  {/* Workshop Details */}
                  {announcement.type === 'workshop' && announcement.workshop_date && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                          {new Date(announcement.workshop_date).toLocaleDateString(
                            locale === 'ar' ? 'ar-EG' : 'en-US',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )}
                        </span>
                      </div>
                      {announcement.workshop_type && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {announcement.workshop_type === 'online' 
                            ? (locale === 'ar' ? 'عن بُعد' : 'Online')
                            : announcement.workshop_type === 'in-person'
                            ? (locale === 'ar' ? 'حضوري' : 'In-Person')
                            : (locale === 'ar' ? 'مختلط' : 'Hybrid')
                          }
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {locale === 'ar' ? 'بواسطة:' : 'By:'} {announcement.created_by_user.full_name}
                    </span>
                    <span>
                      {new Date(announcement.created_at).toLocaleDateString(
                        locale === 'ar' ? 'ar-EG' : 'en-US'
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{getReadStats(announcement)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(announcement.id, announcement.is_pinned)}
                    disabled={loading === announcement.id}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.is_pinned
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={locale === 'ar' ? 'تثبيت' : 'Pin'}
                  >
                    <Pin size={18} />
                  </button>

                  <button
                    onClick={() => toggleActive(announcement.id, announcement.is_active)}
                    disabled={loading === announcement.id}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={announcement.is_active ? (locale === 'ar' ? 'إخفاء' : 'Hide') : (locale === 'ar' ? 'إظهار' : 'Show')}
                  >
                    {announcement.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>

                  <Link
                    href={`/${locale}/announcements/${announcement.id}/edit`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={locale === 'ar' ? 'تعديل' : 'Edit'}
                  >
                    <Edit size={18} />
                  </Link>

                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    disabled={loading === announcement.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={locale === 'ar' ? 'حذف' : 'Delete'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
