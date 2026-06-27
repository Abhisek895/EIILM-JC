import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { dashboardApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';

type DashboardStats = {
  totalUsers: number;
  totalStudents: number;
  totalCourses: number;
  totalInquiries: number;
};

type Inquiry = {
  id: number;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const role = user?.role;
    const canRead = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.dashboard?.includes('read')) || role === 'student';
    if (!canRead) {
      // Find the first module they have access to
      const perms = user?.permissions?.modules || {};
      const firstModule = Object.keys(perms).find((key) => perms[key]?.includes('read'));
      
      if (firstModule && firstModule !== 'dashboard') {
        router.push(`/dashboard/${firstModule}`);
        return;
      }

      setAccessDenied(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [statsResponse, inquiriesResponse]: any = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentInquiries(5),
        ]);

        if (statsResponse?.success) {
          setStats(statsResponse.data);
        }

        if (inquiriesResponse?.success) {
          setRecentInquiries(inquiriesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, isHydrated, router, user]);

  const cards = useMemo(
    () => [
      { label: 'Total Students', value: stats?.totalStudents ?? 0 },
      { label: 'Total Users', value: stats?.totalUsers ?? 0 },
      { label: 'Courses', value: stats?.totalCourses ?? 0 },
      { label: 'Inquiries', value: stats?.totalInquiries ?? 0 },
    ],
    [stats]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

        {loading ? (
          <div className="card">Loading dashboard...</div>
        ) : accessDenied ? (
          <div className="card text-center py-16 flex flex-col items-center justify-center">
             <div className="text-5xl mb-4 opacity-80">🔒</div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Access Restricted</h2>
             <p className="text-gray-500 text-lg">You don't have permission to view the dashboard statistics.</p>
             <p className="text-gray-400 mt-2 text-sm font-medium">Please use the sidebar menu to navigate to your authorized modules.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((stat) => (
                <div key={stat.label} className="card">
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-6">Recent Inquiries</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Name</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Email</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Status</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.length === 0 ? (
                      <tr>
                        <td className="py-3 px-4 text-gray-500" colSpan={4}>
                          No inquiries yet.
                        </td>
                      </tr>
                    ) : (
                      recentInquiries.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{item.fullName}</td>
                          <td className="py-3 px-4">{item.email || '-'}</td>
                          <td className="py-3 px-4 capitalize">{item.status}</td>
                          <td className="py-3 px-4">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

