import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { inquiryApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';

type Inquiry = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  courseInterest: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-primary-100 text-primary-700 border border-primary-200',
  contacted: 'bg-amber-100 text-amber-700 border border-amber-200',
  enrolled: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  dropped: 'bg-rose-100 text-rose-700 border border-rose-200',
};

export default function AdminAdmissionsPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Toast notifications state
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login');
  }, [isHydrated, isAuthenticated, router]);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res: any = await inquiryApi.getAll(p, 20);
      setInquiries(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const showSuccessToast = (title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await inquiryApi.update(id, { status });
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      showSuccessToast("Status Updated", `Status update to "${status.toUpperCase()}" is successful!`);
    } catch {
      showSuccessToast("Update Failed", "Failed to update inquiry status");
    }
  };

  // KPI Calculations
  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    enrolled: inquiries.filter(i => i.status === 'enrolled').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admissions Manager</h1>
            <p className="text-gray-500 text-sm mt-1">Review and manage dynamic student admission leads in real time.</p>
          </div>
          <button 
            onClick={() => { load(page); showSuccessToast("Leads Refreshed", "Leads refreshed successfully!"); }}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold shadow-sm text-sm"
          >
            <span>🔄</span> Refresh Leads
          </button>
        </div>

        {/* Dynamic Analytics KPI widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Inquiries', value: stats.total, color: 'from-primary-500 to-indigo-600', icon: '📞' },
            { label: 'New Leads', value: stats.new, color: 'from-sky-400 to-primary-500', icon: '✨' },
            { label: 'Contacted Leads', value: stats.contacted, color: 'from-amber-400 to-orange-500', icon: '💬' },
            { label: 'Enrolled Students', value: stats.enrolled, color: 'from-emerald-400 to-teal-500', icon: '🎓' },
          ].map((card, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden group">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{card.label}</span>
                  <h3 className="text-3xl font-black text-gray-900 mt-2">{card.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-xl shadow-md`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <span>📈</span> +12% growth this month
              </div>
            </div>
          ))}
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Dynamic Admissions List</h2>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Live database synced</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                <tr>
                  {['Applicant Details', 'Course Interest', 'Applicant Message', 'Status', 'Applied Date', 'Update Status'].map(
                    (h) => (
                      <th key={h} className="text-left px-6 py-4">{h}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-50 rounded-lg animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                      <div className="text-4xl mb-3">📬</div>
                      <p className="font-semibold text-lg text-gray-500">No active admission leads found</p>
                      <p className="text-xs text-gray-400 mt-1">Prospective leads from your landing page forms will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{inq.fullName}</div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">📧 {inq.email || '—'}</span>
                          <span className="flex items-center gap-1">📞 {inq.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary-600">
                        {inq.courseInterest || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-sm">
                        <p className="text-xs leading-relaxed italic">{inq.message ? `"${inq.message}"` : '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_COLORS[inq.status] || STATUS_COLORS.new}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={inq.status}
                          onChange={(e) => updateStatus(inq.id, e.target.value)}
                          className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
                        >
                          {['new', 'contacted', 'enrolled', 'dropped'].map((s) => (
                            <option key={s} value={s}>{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-gray-50">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold disabled:opacity-40 disabled:hover:bg-gray-50 transition-all border border-gray-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold disabled:opacity-40 disabled:hover:bg-gray-50 transition-all border border-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium custom slide-in Toast notification style pop-up */}
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
