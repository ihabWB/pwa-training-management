'use client';

import { useState } from 'react';
import { User, Lock, Bell, Globe, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SettingsContentProps {
  user: any;
  locale: string;
  email: string;
}

export default function SettingsContent({
  user,
  locale,
  email,
}: SettingsContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form
  const [profileData, setProfileData] = useState({
    full_name: user.full_name || '',
    phone_number: user.phone_number || '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    report_reminders: true,
    task_reminders: true,
    evaluation_alerts: true,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(
        locale === 'ar'
          ? 'تم تحديث الملف الشخصي بنجاح'
          : 'Profile updated successfully'
      );
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError(
        locale === 'ar'
          ? 'كلمات المرور غير متطابقة'
          : 'Passwords do not match'
      );
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError(
        locale === 'ar'
          ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
          : 'Password must be at least 8 characters'
      );
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      });

      if (updateError) throw updateError;

      setSuccess(
        locale === 'ar'
          ? 'تم تغيير كلمة المرور بنجاح'
          : 'Password changed successfully'
      );
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    router.push(`/${newLocale}/settings`);
  };

  const tabs = [
    {
      id: 'profile',
      label: locale === 'ar' ? 'الملف الشخصي' : 'Profile',
      icon: User,
    },
    {
      id: 'security',
      label: locale === 'ar' ? 'الأمان' : 'Security',
      icon: Lock,
    },
    {
      id: 'notifications',
      label: locale === 'ar' ? 'الإشعارات' : 'Notifications',
      icon: Bell,
    },
    {
      id: 'preferences',
      label: locale === 'ar' ? 'التفضيلات' : 'Preferences',
      icon: Globe,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Tabs Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {locale === 'ar'
                  ? 'معلومات الملف الشخصي'
                  : 'Profile Information'}
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, full_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <Input value={email} disabled className="bg-gray-100" />
                  <p className="text-xs text-gray-500 mt-1">
                    {locale === 'ar'
                      ? 'لا يمكن تغيير البريد الإلكتروني'
                      : 'Email cannot be changed'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <Input
                    value={profileData.phone_number}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'الدور' : 'Role'}
                  </label>
                  <Input
                    value={
                      locale === 'ar'
                        ? ({
                            admin: 'مدير',
                            supervisor: 'مشرف',
                            trainee: 'متدرب',
                          } as Record<string, string>)[user.role] || user.role
                        : user.role
                    }
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      {locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={18} />
                      {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ar'
                      ? 'تأكيد كلمة المرور'
                      : 'Confirm Password'}
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      {locale === 'ar' ? 'جاري التغيير...' : 'Changing...'}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2" size={18} />
                      {locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {locale === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ar'
                        ? 'إشعارات البريد الإلكتروني'
                        : 'Email Notifications'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {locale === 'ar'
                        ? 'تلقي إشعارات عبر البريد الإلكتروني'
                        : 'Receive notifications via email'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email_notifications}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          email_notifications: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ar'
                        ? 'تذكير بالتقارير'
                        : 'Report Reminders'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {locale === 'ar'
                        ? 'تذكير بالتقارير المستحقة'
                        : 'Get reminders for pending reports'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.report_reminders}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          report_reminders: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ar' ? 'تذكير بالمهام' : 'Task Reminders'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {locale === 'ar'
                        ? 'تذكير بالمهام المستحقة'
                        : 'Get reminders for pending tasks'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.task_reminders}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          task_reminders: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {locale === 'ar'
                        ? 'تنبيهات التقييمات'
                        : 'Evaluation Alerts'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {locale === 'ar'
                        ? 'إشعارات عند إضافة تقييم جديد'
                        : 'Get notified when new evaluation is added'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.evaluation_alerts}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          evaluation_alerts: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <p className="text-sm text-gray-500 text-center mt-4">
                  {locale === 'ar'
                    ? 'ملاحظة: بعض الإشعارات قيد التطوير'
                    : 'Note: Some notifications are under development'}
                </p>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {locale === 'ar' ? 'التفضيلات' : 'Preferences'}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {locale === 'ar' ? 'اللغة' : 'Language'}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleLanguageChange('ar')}
                      className={`p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${
                        locale === 'ar'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Globe size={20} />
                      <span className="font-medium">العربية</span>
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${
                        locale === 'en'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Globe size={20} />
                      <span className="font-medium">English</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {locale === 'ar' ? 'معلومات النظام' : 'System Information'}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      {locale === 'ar' ? 'الإصدار:' : 'Version:'} 1.0.0
                    </p>
                    <p>
                      {locale === 'ar' ? 'آخر تحديث:' : 'Last Updated:'}{' '}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
