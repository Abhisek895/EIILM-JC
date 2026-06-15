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
  new: 'bg-primary-100 text-primary-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  enrolled: 'bg-green-100 text-green-700',
  dropped: 'bg-gray-100 text-gray-600',
};

export default function AdminInquiriesPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Custom success Toast State
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const role = user?.role;
        const canRead = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.inquiries?.includes('read')) || role === 'faculty';
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.inquiries?.includes('write')) || role === 'faculty';

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
      showSuccessToast('Inquiry Updated', `Inquiry status successfully changed to "${status.toUpperCase()}"!`);
    } catch {
      showSuccessToast('Update Failed', 'Failed to update inquiry status.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-500 text-sm mt-1">Admission inquiries from prospective students</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Contact', 'Course Interest', 'Message', 'Status', 'Date', 'Actions'].map(
                    (h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No inquiries yet.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq) => (
                    <tr key={inq.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{inq.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{inq.email || '—'}</div>
                        <div>{inq.phone || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inq.courseInterest || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs">
                        <p className="line-clamp-2">{inq.message || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[inq.status] || STATUS_COLORS.new}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        {canWrite ? (
                          <select
                            value={inq.status}
                            onChange={(e) => updateStatus(inq.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            {['new', 'contacted', 'enrolled', 'dropped'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-medium text-gray-500">{inq.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-4 flex justify-between items-center border-t border-gray-100">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
