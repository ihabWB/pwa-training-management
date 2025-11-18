'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCheck,
  FileText,
  ListTodo,
  ClipboardCheck,
  Calendar,
  Settings,
  UserCircle,
  Bell,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  locale: string;
  userRole: 'admin' | 'supervisor' | 'trainee';
  userName?: string;
  isCollapsed?: boolean;
  setIsCollapsed?: (value: boolean) => void;
}

export default function Sidebar({ 
  locale, 
  userRole, 
  userName = 'مستخدم',
  isCollapsed: externalIsCollapsed,
  setIsCollapsed: externalSetIsCollapsed 
}: SidebarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = externalSetIsCollapsed || setInternalIsCollapsed;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push(`/${locale}/login`);
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
      alert(locale === 'ar' ? 'حدث خطأ أثناء تسجيل الخروج' : 'Error logging out');
    }
  };

  const adminMenu = [
    { icon: LayoutDashboard, label: t('dashboard'), href: `/${locale}/dashboard` },
    { icon: Bell, label: t('announcements'), href: `/${locale}/announcements` },
    { icon: Users, label: t('trainees'), href: `/${locale}/trainees` },
    { icon: UserCheck, label: t('supervisors'), href: `/${locale}/supervisors` },
    { icon: Building2, label: t('institutions'), href: `/${locale}/institutions` },
    { icon: FileText, label: t('reports'), href: `/${locale}/reports` },
    { icon: ListTodo, label: t('tasks'), href: `/${locale}/tasks` },
    { icon: ClipboardCheck, label: t('evaluations'), href: `/${locale}/evaluations` },
    { icon: Calendar, label: t('attendance'), href: `/${locale}/attendance` },
  ];

  const supervisorMenu = [
    { icon: LayoutDashboard, label: t('dashboard'), href: `/${locale}/supervisor/dashboard` },
    { icon: Users, label: t('trainees'), href: `/${locale}/supervisor/my-trainees` },
    { icon: FileText, label: t('reports'), href: `/${locale}/reports` },
    { icon: ListTodo, label: t('tasks'), href: `/${locale}/tasks` },
    { icon: ClipboardCheck, label: t('evaluations'), href: `/${locale}/evaluations` },
    { icon: Calendar, label: t('attendance'), href: `/${locale}/supervisor/attendance` },
  ];

  const traineeMenu = [
    { icon: LayoutDashboard, label: t('dashboard'), href: `/${locale}/trainee/dashboard` },
    { icon: UserCircle, label: t('profile'), href: `/${locale}/trainee/profile` },
    { icon: FileText, label: t('reports'), href: `/${locale}/trainee/my-reports` },
    { icon: ListTodo, label: t('tasks'), href: `/${locale}/trainee/my-tasks` },
    { icon: ClipboardCheck, label: t('evaluations'), href: `/${locale}/trainee/my-evaluations` },
    { icon: Calendar, label: t('attendance'), href: `/${locale}/trainee/attendance` },
  ];

  const menuItems = userRole === 'admin' ? adminMenu : userRole === 'supervisor' ? supervisorMenu : traineeMenu;

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} h-full
          ${isCollapsed ? 'w-20' : 'w-64'}
          bg-white border-${locale === 'ar' ? 'l' : 'r'} border-gray-200
          flex flex-col z-40
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : locale === 'ar' ? 'translate-x-full' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="flex-shrink-0">
              <Image 
                src="/logo PWA.png" 
                alt="Palestinian Water Authority Logo" 
                width={50} 
                height={50}
                className="rounded-lg"
                priority
              />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-base leading-tight">
                  {locale === 'ar' ? 'سلطة المياه الفلسطينية' : 'Palestinian Water Authority'}
                </h1>
                <p className="text-xs text-gray-500 leading-tight mt-1">
                  {locale === 'ar' 
                    ? 'نظام متابعة برنامج التدريب/البنك الدولي' 
                    : 'Training Program Monitoring System/World Bank'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle size={24} className="text-gray-600" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{userName}</p>
                <Badge variant="outline" className="text-xs">
                  {userRole === 'admin' ? 'مدير' : userRole === 'supervisor' ? 'مشرف' : 'متدرب'}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden lg:flex absolute top-20 
            ${locale === 'ar' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}
            w-6 h-6 bg-white border-2 border-gray-200 rounded-full
            items-center justify-center hover:bg-gray-50
            transition-colors z-50
          `}
          title={isCollapsed ? (locale === 'ar' ? 'توسيع' : 'Expand') : (locale === 'ar' ? 'طي' : 'Collapse')}
        >
          {isCollapsed ? (
            locale === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
          ) : (
            locale === 'ar' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg
                      transition-colors duration-200
                      ${isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon size={20} />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link
            href={`/${locale}/settings`}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100`}
            title={isCollapsed ? (t('settings')) : ''}
          >
            <Settings size={20} />
            {!isCollapsed && <span>{t('settings')}</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full`}
            title={isCollapsed ? (locale === 'ar' ? 'تسجيل الخروج' : 'Logout') : ''}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
