import React, { useState, useEffect } from 'react';
import DashboardLayout from '@layouts/DashboardLayout';
import { useAuth } from '@hooks/useAuth';
import { useRouter } from 'next/router';
import { dashboardApi } from '@api/endpoints';

type AnalyticsData = {
  kpiCards: Array<{ label: string; value: string; trend: string; isPositive: boolean; icon: string; color: string }>;
  courses: Array<{ name: string; code: string; students: number; percentage: number }>;
  funnelSteps: Array<{ stepName: string; count: number; percentage: number; color: string }>;
  locations: Array<{ country: string; city: string; count: number; percentage: number }>;
};

// Safelist dynamic tailwind classes passed from the backend
const _safelist = 'bg-primary-600 bg-indigo-500 bg-violet-500 bg-emerald-500';

const AnimatedNumber = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const numMatch = value.match(/[\d.,]+/);
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }

    const numStr = numMatch[0].replace(/,/g, '');
    const target = parseFloat(numStr);

    if (isNaN(target)) {
      setDisplayValue(value);
      return;
    }

    const isInt = !numStr.includes('.');
    const suffix = value.replace(numMatch[0], '');

    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * easeProgress;

      let formattedVal = isInt
        ? Math.round(currentVal).toLocaleString()
        : currentVal.toFixed(1);

      setDisplayValue(formattedVal + suffix);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue}</span>;
};

const AnimatedProgressLine = ({ percentage, color }: { percentage: number, color: string }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Slight delay ensures the browser registers the 0% before transitioning
    const timer = setTimeout(() => setWidth(percentage), 50);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="w-full bg-gray-100 h-4 rounded-xl overflow-hidden shadow-inner relative flex items-center">
      <div
        style={{ width: `${width}%` }}
        className={`h-full ${color} transition-all duration-[1500ms] ease-out`}
      />
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  React.useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const role = user?.role;
        const canRead = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.analytics?.includes('read'));
        if (!canRead) {
          router.push('/dashboard');
        } else {
          fetchAnalytics();
        }
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getAnalytics();
      if ((res as any)?.data) {
        setData((res as any).data);
      }
    } catch (err: any) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessToast = (title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleRefresh = () => {
    fetchAnalytics().then(() => {
      showSuccessToast('Metrics Refreshed', 'Analytics charts and funnel metrics updated successfully!');
    });
  };

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Enterprise Analytics</h1>
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
                  <h3 className="text-3xl font-black text-gray-900 mt-2">
                    <AnimatedNumber value={card.value} />
                  </h3>
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
                    <span className="font-black">
                      <AnimatedNumber value={step.count.toString()} /> (<AnimatedNumber value={`${step.percentage}%`} />)
                    </span>
                  </div>
                  {/* Progress Line */}
                  <AnimatedProgressLine percentage={step.percentage} color={step.color} />
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
                      <span className="font-black text-gray-900 text-sm">
                        <AnimatedNumber value={course.students.toString()} />
                      </span>
                      <span className="block text-[10px] font-bold text-primary-600 mt-0.5">
                        <AnimatedNumber value={`${course.percentage}%`} /> share
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location Traffic Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-gray-800 text-base uppercase tracking-wider">Traffic by Location</h3>
            <span className="text-xs bg-fuchsia-50 text-fuchsia-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Top 5 Regions</span>
          </div>

          <div className="space-y-4">
            {data.locations && data.locations.length > 0 ? (
              data.locations.map((loc, i) => {
                const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
                const countryName = loc.country ? regionNames.of(loc.country) : 'Unknown';
                return (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-fuchsia-100 text-fuchsia-600 rounded-xl flex items-center justify-center font-bold text-sm uppercase">
                        {loc.country || 'UNK'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-xs truncate max-w-[200px] sm:max-w-xs">{loc.city && loc.city !== 'Unknown' ? loc.city : 'Unknown City'}</h4>
                        <p className="text-gray-400 text-[10px] mt-0.5 font-medium">{countryName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-gray-900 text-sm">
                        <AnimatedNumber value={loc.count.toString()} />
                      </span>
                      <span className="block text-[10px] font-bold text-fuchsia-600 mt-0.5">
                        <AnimatedNumber value={`${loc.percentage}%`} /> share
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-6 text-gray-400 font-bold text-sm">
                No location data available yet.
              </div>
            )}
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
