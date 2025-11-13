import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import StatCard from '@/components/dashboard/stat-card';
import RecentActivity from '@/components/dashboard/recent-activity';
import UpcomingTasks from '@/components/dashboard/upcoming-tasks';
import { Users, Building2, UserCheck, FileText, ListTodo, TrendingUp } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function DashboardPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    redirect(`/${locale}/login`);
  }

  // Redirect trainees to their own dashboard
  if (userProfile.role === 'trainee') {
    redirect(`/${locale}/trainee/dashboard`);
  }

  // Fetch dashboard statistics
  const [
    { count: totalTrainees },
    { count: activeTrainees },
    { count: totalInstitutions },
    { count: totalSupervisors },
    { count: pendingReports },
    { count: pendingTasks },
  ] = await Promise.all([
    supabase.from('trainees').select('*', { count: 'exact', head: true }),
    supabase.from('trainees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('institutions').select('*', { count: 'exact', head: true }),
    supabase.from('supervisors').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  // Fetch recent activities (simplified for now)
  const recentActivities = [
    {
      id: '1',
      user: 'أحمد محمد',
      action: 'رفع',
      entity: 'تقرير أسبوعي',
      timestamp: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: '2',
      user: 'سارة علي',
      action: 'أكملت',
      entity: 'مهمة تدريبية',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'approved',
    },
  ];

  // Fetch upcoming tasks (simplified for now)
  const upcomingTasks = [
    {
      id: '1',
      title: 'إعداد تقرير شهري عن التقدم',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      priority: 'high' as const,
      assignedTo: 'جميع المتدربين',
      status: 'pending',
    },
    {
      id: '2',
      title: 'حضور ورشة عمل تقنية',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      priority: 'medium' as const,
      assignedTo: 'مجموعة A',
      status: 'pending',
    },
  ];

  return (
    <DashboardLayout
      locale={locale}
      userRole={userProfile.role}
      userName={userProfile.full_name}
      notificationCount={5}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">مرحباً بعودتك، {userProfile.full_name}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="إجمالي المتدربين"
            value={totalTrainees || 0}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            trend={{ value: 12, isPositive: true }}
          />
          
          <StatCard
            title="المتدربون النشطون"
            value={activeTrainees || 0}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
            trend={{ value: 8, isPositive: true }}
          />
          
          <StatCard
            title="المؤسسات"
            value={totalInstitutions || 0}
            icon={Building2}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
          
          <StatCard
            title="المشرفون"
            value={totalSupervisors || 0}
            icon={UserCheck}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
          
          <StatCard
            title="التقارير المعلقة"
            value={pendingReports || 0}
            icon={FileText}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-50"
          />
          
          <StatCard
            title="المهام المعلقة"
            value={pendingTasks || 0}
            icon={ListTodo}
            iconColor="text-red-600"
            iconBgColor="bg-red-50"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivity activities={recentActivities} />
          
          {/* Upcoming Tasks */}
          <UpcomingTasks 
            tasks={upcomingTasks} 
            locale={locale}
            showAssignee={true}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={`/${locale}/trainees/new`}
            className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white hover:shadow-lg transition-shadow"
          >
            <Users size={32} className="mb-3" />
            <h3 className="text-lg font-semibold">إضافة متدرب جديد</h3>
            <p className="text-sm text-blue-100 mt-1">تسجيل متدرب في البرنامج</p>
          </a>
          
          <a
            href={`/${locale}/tasks/new`}
            className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white hover:shadow-lg transition-shadow"
          >
            <ListTodo size={32} className="mb-3" />
            <h3 className="text-lg font-semibold">إنشاء مهمة جديدة</h3>
            <p className="text-sm text-green-100 mt-1">تعيين مهمة للمتدربين</p>
          </a>
          
          <a
            href={`/${locale}/reports`}
            className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg text-white hover:shadow-lg transition-shadow"
          >
            <FileText size={32} className="mb-3" />
            <h3 className="text-lg font-semibold">مراجعة التقارير</h3>
            <p className="text-sm text-purple-100 mt-1">اعتماد ومراجعة التقارير</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
