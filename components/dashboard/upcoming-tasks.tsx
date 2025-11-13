'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle } from 'lucide-react';
import { formatDate, getDaysRemaining, getPriorityColor } from '@/lib/utils';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  status: string;
}

interface UpcomingTasksProps {
  tasks: Task[];
  title?: string;
  locale: string;
  showAssignee?: boolean;
}

export default function UpcomingTasks({ 
  tasks, 
  title = 'المهام القادمة',
  locale,
  showAssignee = false 
}: UpcomingTasksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد مهام قادمة</p>
          ) : (
            <>
              {tasks.map((task) => {
                const daysRemaining = getDaysRemaining(task.dueDate);
                const isOverdue = daysRemaining < 0;
                
                return (
                  <div key={task.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {showAssignee && task.assignedTo && (
                      <p className="text-xs text-gray-600 mb-2">
                        معين لـ: {task.assignedTo}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar size={14} className={isOverdue ? 'text-red-500' : 'text-gray-500'} />
                      <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {formatDate(task.dueDate, locale)}
                      </span>
                      {isOverdue ? (
                        <Badge variant="destructive" className="text-xs">
                          متأخر {Math.abs(daysRemaining)} يوم
                        </Badge>
                      ) : daysRemaining <= 3 ? (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          {daysRemaining} يوم متبقي
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              
              <Link href={`/${locale}/tasks`}>
                <Button variant="outline" className="w-full mt-4">
                  عرض جميع المهام
                </Button>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
