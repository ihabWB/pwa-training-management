'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface OrphanedTraineesAlertProps {
  locale: string;
}

export default function OrphanedTraineesAlert({ locale }: OrphanedTraineesAlertProps) {
  const [orphanedCount, setOrphanedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOrphanedTrainees = async () => {
      try {
        const supabase = createClient();

        // Get all users with trainee role
        const { data: traineeUsers } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'trainee');

        if (!traineeUsers || traineeUsers.length === 0) {
          setOrphanedCount(0);
          setLoading(false);
          return;
        }

        // Check which ones don't have trainee records
        let count = 0;
        for (const user of traineeUsers) {
          const { data: traineeRecord } = await supabase
            .from('trainees')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!traineeRecord) {
            count++;
          }
        }

        setOrphanedCount(count);
      } catch (error) {
        console.error('Error checking orphaned trainees:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOrphanedTrainees();
  }, []);

  if (loading || orphanedCount === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            {locale === 'ar' ? 'تنبيه: سجلات متدربين ناقصة' : 'Alert: Incomplete Trainee Records'}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {locale === 'ar'
                ? `تم العثور على ${orphanedCount} مستخدم بدور "متدرب" بدون سجل كامل. هذا قد يسبب مشاكل عند محاولتهم تسجيل الدخول.`
                : `Found ${orphanedCount} user(s) with "trainee" role but incomplete records. This may cause login issues.`}
            </p>
          </div>
          <div className="mt-4">
            <Link href={`/${locale}/admin/fix-trainees`}>
              <Button size="sm" variant="outline" className="bg-white hover:bg-yellow-50">
                {locale === 'ar' ? 'إصلاح السجلات الآن' : 'Fix Records Now'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
