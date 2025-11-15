'use client';

import { useTranslations } from 'next-intl';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  locale: string;
  notificationCount?: number;
}

export default function Navbar({ locale, notificationCount = 0 }: NavbarProps) {
  const t = useTranslations('common');

  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    window.location.href = window.location.pathname.replace(`/${locale}`, `/${newLocale}`);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 text-gray-400" 
              style={{ [locale === 'ar' ? 'right' : 'left']: '12px' }} 
              size={20} 
            />
            <input
              type="text"
              placeholder={t('search')}
              className={`
                w-full px-10 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                ${locale === 'ar' ? 'pr-10 text-right' : 'pl-10'}
              `}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Language Switcher - Toggle Switch */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 shadow-sm">
            <button
              onClick={() => locale !== 'ar' && toggleLocale()}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                locale === 'ar' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => locale !== 'en' && toggleLocale()}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                locale === 'en' 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              EN
            </button>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" disabled>
            <Bell size={20} />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 flex items-center justify-center"
                variant="destructive"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
