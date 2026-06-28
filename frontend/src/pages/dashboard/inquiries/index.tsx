import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { inquiryApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

type Inquiry = {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  courseInterest: string | null;
  message: string | null;
  status: string;
  applicationDetails?: any;
  application_details?: any;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-primary-100 text-primary-700',
  contacted: 'bg-blue-100 text-blue-700',
  interested: 'bg-indigo-100 text-indigo-700',
  follow_up: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-600',
  enrolled: 'bg-emerald-100 text-emerald-700',
};

export default function AdminInquiriesPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Custom success Toast State
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const role = user?.role;
        const canRead = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.inquiries?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.inquiries?.includes('write'));

  const load = useCallback(async (p: number, search: string) => {
    setLoading(true);
    try {
      const res: any = await inquiryApi.getAll(p, 12, search);
      setInquiries(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, activeSearch); }, [page, activeSearch, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const showSuccessToast = (title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res: any = await inquiryApi.getAll(1, 10000);
      const allInquiries = res?.data || [];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inquiries');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Full Name', key: 'fullName', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'Course Interest', key: 'courseInterest', width: 25 },
        { header: 'Message', key: 'message', width: 40 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Date', key: 'date', width: 25 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }, // Indigo 600
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 30;

      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];

      allInquiries.forEach((inq: any, index: number) => {
        const row = worksheet.addRow({
          id: inq.id,
          fullName: inq.fullName || inq.full_name,
          email: inq.email || '—',
          phone: inq.phone || '—',
          courseInterest: inq.courseInterest || inq.course_interest || '—',
          message: inq.message || '—',
          status: inq.status.toUpperCase(),
          date: inq.createdAt || inq.created_at ? new Date(inq.createdAt || inq.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
        });

        row.alignment = { vertical: 'middle', wrapText: true };

        // Subtle alternating row colors
        if (index % 2 === 1) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' } // gray-50
          };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'Inquiries_Export.xlsx');

      showSuccessToast('Export Successful', 'Your styled Excel file has been downloaded.');
    } catch (err) {
      console.error(err);
      showSuccessToast('Export Failed', 'An error occurred while exporting.');
    } finally {
      setExporting(false);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Inquiries</h1>
            <p className="text-gray-500 text-sm mt-1">Admission inquiries from prospective students</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim() === '') {
                    setPage(1);
                    setActiveSearch('');
                  }
                }}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </form>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full sm:w-auto flex justify-center items-center px-4 py-2 bg-[#107C41] text-white rounded-lg shadow-sm text-sm font-medium hover:bg-[#185C37] disabled:opacity-50 transition-colors"
            >
            {exporting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                <path d="M2.859 2.877l12.57-1.795a.5.5 0 01.571.495v20.846a.5.5 0 01-.57.495L2.858 21.123a1 1 0 01-.859-.99V3.867a1 1 0 01.859-.99zM17 3h4a1 1 0 011 1v16a1 1 0 01-1 1h-4V3zm-6.8 9L7.3 8.364H4.89l3.96 4.382-4.14 4.887H7.13l2.25-3.088 2.27 3.088h2.39l-4.12-4.88 3.93-4.37h-2.31L10.2 12z" />
              </svg>
            )}
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Contact', 'Course Interest', 'Message', 'Status', 'Create Date', 'Actions'].map(
                    (h) => (
                      <th key={h} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">{h}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-2.5">
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
                  inquiries.map((inq: any) => (
                    <tr key={inq.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{inq.fullName || inq.full_name}</td>
                      <td className="px-4 py-2.5 text-gray-600">
                        <div>{inq.email || '—'}</div>
                        <div>{inq.phone || '—'}</div>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{inq.courseInterest || inq.course_interest || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-xs">
                        <p className="line-clamp-2">{inq.message || '—'}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[inq.status] || STATUS_COLORS.new}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {inq.createdAt || inq.created_at ? new Date(inq.createdAt || inq.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-2">
                          {canWrite ? (
                            <select
                              value={inq.status}
                              onChange={(e) => updateStatus(inq.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                              {['new', 'contacted', 'interested', 'follow_up', 'converted', 'rejected', 'closed', 'enrolled'].map((s) => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs font-medium text-gray-500">{inq.status}</span>
                          )}
                          {(inq.firstName || inq.first_name || inq.bloodGroup || inq.blood_group || inq.caste) && (
                            <button onClick={() => setSelectedInquiry(inq)} className="text-xs text-primary-600 font-semibold hover:underline text-left">
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-lg disabled:opacity-40 hover:bg-primary-700 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-lg disabled:opacity-40 hover:bg-primary-700 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <button onClick={() => setSelectedInquiry(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  'firstName', 'lastName', 'gender', 'bloodGroup', 'caste', 'dob', 'placeOfBirth',
                  'address', 'state', 'pin', 'altPhone', 'whatsapp', 'fatherName', 'fatherOccupation',
                  'motherName', 'motherOccupation', 'annualIncome', 'board12th', 'stream12th',
                  'yearOfPassing12th', 'aggregateMarks12th', 'schoolName', 'mbaCollegeName',
                  'mbaDegreeName', 'mbaSpecialization', 'mbaGraduationYear', 'mbaUniversity', 'mbaScore', 'sourceName'
                ].map((key) => {
                  const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                  const value = selectedInquiry[key as keyof Inquiry] || (selectedInquiry as any)[dbKey];
                  if (!value) return null;
                  return (
                    <div key={key} className="space-y-1">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm font-medium text-gray-900 bg-gray-50/50 p-2 rounded border border-gray-100">{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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
