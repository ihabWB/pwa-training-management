'use client';

import { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Navbar from './navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  locale: string;
  userRole: 'admin' | 'supervisor' | 'trainee';
  userName?: string;
  notificationCount?: number;
}

export default function DashboardLayout({
  children,
  locale,
  userRole,
  userName,
  notificationCount = 0,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [marginValue, setMarginValue] = useState('16rem');

  useEffect(() => {
    const updateMargin = () => {
      if (typeof window === 'undefined') return;
      
      if (window.innerWidth >= 1024) {
        setMarginValue(isCollapsed ? '5rem' : '16rem');
      } else {
        setMarginValue('0');
      }
    };

    updateMargin();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateMargin);
      return () => window.removeEventListener('resize', updateMargin);
    }
  }, [isCollapsed]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        locale={locale} 
        userRole={userRole} 
        userName={userName}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <div 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          [locale === 'ar' ? 'marginRight' : 'marginLeft']: marginValue
        }}
      >
        <Navbar locale={locale} notificationCount={notificationCount} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
