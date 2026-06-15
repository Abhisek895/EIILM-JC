import React, { useState } from 'react';
import DashboardLayout from '@layouts/DashboardLayout';
import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'next/router';

type AnalyticsData = {
  kpiCards: Array<{ label: string; value: string; trend: string; isPositive: boolean; icon: string; color: string }>;
  courses: Array<{ name: string; code: string; students: number; percentage: number }>;
  funnelSteps: Array<{ stepName: string; count: number; percentage: number; color: string }>;
};

const DATA_SET_A: AnalyticsData = {
  kpiCards: [
    { label: 'Total Enrolled Students', value: '5,240', trend: '+14% from last term', isPositive: true, icon: '🎓', color: 'from-primary-500 to-indigo-600' },
    { label: 'Admission Conversion Rate', value: '24.2%', trend: '+3.5% this month', isPositive: true, icon: '🎯', color: 'from-emerald-400 to-teal-500' },
    { label: 'Monthly Website Traffic', value: '45,820', trend: '+28% brand reach', isPositive: true, icon: '⚡', color: 'from-sky-400 to-primary-500' },
    { label: 'Average Faculty Ratio', value: '1:25', trend: 'Optimal mentorship density', isPositive: true, icon: '👨‍🏫', color: 'from-violet-500 to-fuchsia-600' },
  ],
  courses: [
    { name: 'Bachelor of Computer Applications', code: 'BCA', students: 1840, percentage: 35 },
    { name: 'Master of Business Administration', code: 'MBA', students: 1520, percentage: 29 },
    { name: 'Bachelor of Commerce', code: 'B.COM', students: 1250, percentage: 24 },
    { name: 'Bachelor of Arts', code: 'BA', students: 630, percentage: 12 },
  ],
  funnelSteps: [
    { stepName: 'Total Leads Received', count: 1240, percentage: 100, color: 'bg-primary-600' },
    { stepName: 'Leads Successfully Contacted', count: 918, percentage: 74, color: 'bg-indigo-500' },
    { stepName: 'Highly Interested Prospects', count: 558, percentage: 45, color: 'bg-violet-500' },
    { stepName: 'Students Officially Enrolled', count: 272, percentage: 22, color: 'bg-emerald-500' },
  ]
};

const DATA_SET_B: AnalyticsData = {
  kpiCards: [
    { label: 'Total Enrolled Students', value: '5,310', trend: '+18% term-on-term', isPositive: true, icon: '🎓', color: 'from-primary-500 to-indigo-600' },
    { label: 'Admission Conversion Rate', value: '26.8%', trend: '+5.1% this week', isPositive: true, icon: '🎯', color: 'from-emerald-400 to-teal-500' },
    { label: 'Monthly Website Traffic', value: '49,200', trend: '+35% tech summit impact', isPositive: true, icon: '⚡', color: 'from-sky-400 to-primary-500' },
    { label: 'Average Faculty Ratio', value: '1:24', trend: 'Upgraded mentor density', isPositive: true, icon: '👨‍🏫', color: 'from-violet-500 to-fuchsia-600' },
  ],
  courses: [
    { name: 'Bachelor of Computer Applications', code: 'BCA', students: 1910, percentage: 36 },
    { name: 'Master of Business Administration', code: 'MBA', students: 1580, percentage: 30 },
    { name: 'Bachelor of Commerce', code: 'B.COM', students: 1190, percentage: 22 },
    { name: 'Bachelor of Arts', code: 'BA', students: 630, percentage: 12 },
  ],
  funnelSteps: [
    { stepName: 'Total Leads Received', count: 1350, percentage: 100, color: 'bg-primary-600' },
    { stepName: 'Leads Successfully Contacted', count: 1026, percentage: 76, color: 'bg-indigo-500' },
    { stepName: 'Highly Interested Prospects', count: 648, percentage: 48, color: 'bg-violet-500' },
    { stepName: 'Students Officially Enrolled', count: 324, percentage: 24, color: 'bg-emerald-500' },
  ]
};

export default function AdminAnalyticsPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData>(DATA_SET_A);
  const [isDataA, setIsDataA] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  React.useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const role = user?.role;
        const canRead = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.analytics?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const showSuccessToast = (title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleRefresh = () => {
    setData(isDataA ? DATA_SET_B : DATA_SET_A);
    setIsDataA(!isDataA);
    showSuccessToast('Metrics Refreshed', 'Analytics charts and funnel metrics updated successfully!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Enterprise Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time charts, conversion funnels, and enrollment trends.</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 border border-transparent rounded-xl transition-all font-semibold shadow-md text-sm"
          >
            <span>🔄</span> Refresh Metrics
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.kpiCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{card.label}</span>
                  <h3 className="text-3xl font-black text-gray-900 mt-2">{card.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-xl shadow-md`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-600 flex items-center gap-1">📈 {card.trend}</span>
                <span className="text-gray-400">Live</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Funnel */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-gray-800 text-base uppercase tracking-wider">Admission Conversion Funnel</h3>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Campaign Funnel</span>
            </div>
            
            <div className="space-y-6">
              {data.funnelSteps.map((step, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200 flex items-center justify-center text-[8px]">{i + 1}</span>
                      {step.stepName}
                    </span>
                    <span className="font-black">{step.count} ({step.percentage}%)</span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full bg-gray-100 h-4 rounded-xl overflow-hidden shadow-inner relative flex items-center">
                    <div 
                      style={{ width: `${step.percentage}%` }}
                      className={`h-full ${step.color} transition-all duration-500 ease-out`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Popularity */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-gray-800 text-base uppercase tracking-wider">Active Enrollment By Course</h3>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Share</span>
              </div>

              <div className="space-y-4">
                {data.courses.map((course, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold text-sm">
                        {course.code}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-xs truncate max-w-[200px] sm:max-w-xs">{course.name}</h4>
                        <p className="text-gray-400 text-[10px] mt-0.5 font-medium">Standard University Curriculum</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-gray-900 text-sm">{course.students}</span>
                      <span className="block text-[10px] font-bold text-primary-600 mt-0.5">{course.percentage}% share</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in custom success Toast popup notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
            ✓
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">{toast.title}</div>
            <div className="text-xs text-emerald-400 mt-0.5">{toast.message}</div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
