'use client';

import { User, Building2, Calendar, MapPin, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';

interface TraineeProfileCardProps {
  trainee: any;
  locale: string;
  progressPercentage: number;
}

export default function TraineeProfileCard({
  trainee,
  locale,
  progressPercentage,
}: TraineeProfileCardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-2">
          <div className="flex items-start space-x-4 rtl:space-x-reverse">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {trainee.users?.full_name || 'N/A'}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Building2 className="w-4 h-4" />
                  <span className="text-blue-100">
                    {locale === 'ar'
                      ? trainee.institutions?.name_ar || trainee.institutions?.name
                      : trainee.institutions?.name || trainee.institutions?.name_ar || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-blue-100">
                    {trainee.university} - {trainee.major}
                  </span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="w-4 h-4" />
                  <span className="text-blue-100">
                    {locale === 'ar' ? 'سنة التخرج:' : 'Graduation Year:'}{' '}
                    {trainee.graduation_year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">
                {locale === 'ar' ? 'نسبة الإنجاز' : 'Progress'}
              </span>
            </div>
            <span className="text-2xl font-bold">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-sm text-blue-100">
            <div className="flex justify-between mb-1">
              <span>{locale === 'ar' ? 'تاريخ البدء:' : 'Start Date:'}</span>
              <span>{new Date(trainee.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>{locale === 'ar' ? 'تاريخ الانتهاء:' : 'End Date:'}</span>
              <span>
                {new Date(trainee.expected_end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
