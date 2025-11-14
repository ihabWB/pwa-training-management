'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAuth() {
      const supabase = createClient();
      
      try {
        // 1. فحص المستخدم المصادق
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          setError(`Auth Error: ${authError.message}`);
          setLoading(false);
          return;
        }
        
        setAuthUser(user);
        
        if (!user) {
          setError('No authenticated user found');
          setLoading(false);
          return;
        }
        
        // 2. محاولة جلب بيانات المستخدم من جدول users
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          setError(`Profile Error: ${profileError.message} - Code: ${profileError.code}`);
        } else {
          setUserProfile(profile);
        }
      } catch (err: any) {
        setError(`Exception: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    testAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري الفحص...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">صفحة فحص المصادقة والصلاحيات</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-red-800 mb-2">خطأ:</h2>
            <p className="text-red-700 font-mono">{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">1. بيانات المستخدم المصادق (auth.users)</h2>
          {authUser ? (
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm" dir="ltr">
              {JSON.stringify(authUser, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">لا يوجد مستخدم مصادق</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">2. بيانات المستخدم من جدول users</h2>
          {userProfile ? (
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm" dir="ltr">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">فشل جلب بيانات المستخدم من جدول users</p>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ماذا يعني هذا؟</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• إذا كان المستخدم المصادق موجود ولكن البروفايل غير موجود: المشكلة في RLS على جدول users</li>
            <li>• إذا لم يكن هناك مستخدم مصادق: المشكلة في عملية تسجيل الدخول نفسها</li>
            <li>• إذا كان الخطأ "row-level security": يجب تعديل سياسات RLS</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
