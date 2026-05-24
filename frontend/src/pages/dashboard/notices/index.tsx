import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { noticeApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';

type Notice = {
  id: number;
  title: string;
  description: string | null;
  pdfUrl: string | null;
  publishDate: string | null;
  expiryDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'expired';
};

type NoticeForm = {
  title: string;
  description: string;
  pdfUrl: string;
  publishDate: string;
  expiryDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'expired';
  sendToStudents: 'yes' | 'no';
  sendToFaculty: 'yes' | 'no';
};

const EMPTY_FORM: NoticeForm = {
  title: '',
  description: '',
  pdfUrl: '',
  publishDate: '',
  expiryDate: '',
  priority: 'medium',
  status: 'draft',
  sendToStudents: 'yes',
  sendToFaculty: 'yes',
};

export default function AdminNoticesPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<NoticeForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom states for File Upload & success Toast pop-up
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login');
  }, [isHydrated, isAuthenticated, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await noticeApi.getAll(1, 100);
      setNotices(res?.data || []);
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showSuccessToast = (title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setShowForm(true);
    setError('');
  };

  const openEdit = (n: Notice) => {
    setEditId(n.id);
    setForm({
      title: n.title,
      description: n.description || '',
      pdfUrl: n.pdfUrl || '',
      publishDate: n.publishDate ? n.publishDate.split('T')[0] : '',
      expiryDate: n.expiryDate ? n.expiryDate.split('T')[0] : '',
      priority: n.priority,
      status: n.status,
      sendToStudents: 'yes',
      sendToFaculty: 'yes',
    });
    setSelectedFile(null);
    setShowForm(true);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Construct FormData to support both JSON fields and direct file attachments
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('priority', form.priority);
    formData.append('status', form.status);
    formData.append('sendToStudents', form.sendToStudents);
    formData.append('sendToFaculty', form.sendToFaculty);
    if (form.description) formData.append('description', form.description);
    if (form.publishDate) formData.append('publishDate', form.publishDate);
    if (form.expiryDate) formData.append('expiryDate', form.expiryDate);
    if (form.pdfUrl && !selectedFile) formData.append('pdfUrl', form.pdfUrl);
    
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      if (editId) {
        await noticeApi.update(editId, formData);
        showSuccessToast('Notice Modified', 'Notice modification is successful!');
      } else {
        await noticeApi.create(formData);
        showSuccessToast('Notice Created', 'Notice publication is successful!');
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete notice "${title}"? This cannot be undone.`)) return;
    try {
      await noticeApi.remove(id);
      showSuccessToast('Notice Deleted', 'Notice deletion is successful!');
      await load();
    } catch {
      showSuccessToast('Deletion Failed', 'Failed to delete notice');
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700',
  };

  const PRIORITY_COLORS: Record<string, string> = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notices & Announcements</h1>
            <p className="text-gray-500 text-sm mt-1">{notices.length} notices total</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors"
          >
            + Add Notice
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{editId ? 'Edit Notice' : 'Add Notice'}</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.priority}
                      onChange={(e: any) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.status}
                      onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send Mail to Students?</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.sendToStudents}
                      onChange={(e: any) => setForm({ ...form, sendToStudents: e.target.value })}
                    >
                      <option value="yes">YES (Send Broadcast)</option>
                      <option value="no">NO (Do Not Send)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send Mail to Faculty?</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.sendToFaculty}
                      onChange={(e: any) => setForm({ ...form, sendToFaculty: e.target.value })}
                    >
                      <option value="yes">YES (Send Broadcast)</option>
                      <option value="no">NO (Do Not Send)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.publishDate}
                      onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachment File (PDF, Image, etc.)</label>
                    {form.pdfUrl && (
                      <div className="text-xs text-blue-600 font-semibold mb-2 flex items-center gap-1.5">
                        <span>📎 Current Attachment:</span>
                        <a 
                          href={`http://localhost:5002${form.pdfUrl}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="underline hover:text-blue-800"
                        >
                          {form.pdfUrl.split('/').pop()}
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          setSelectedFile(files[0]);
                        }
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description / Content</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : editId ? 'Update Notice' : 'Create Notice'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-600 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Title', 'Priority', 'Publish Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : notices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      No notices yet. Click &quot;Add Notice&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  notices.map((n) => (
                    <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{n.title}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border ${PRIORITY_COLORS[n.priority] || PRIORITY_COLORS.medium} capitalize`}>
                          {n.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {n.publishDate ? new Date(n.publishDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[n.status] || STATUS_COLORS.draft}`}>
                          {n.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(n)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(n.id, n.title)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Slide-in custom success Toast popup notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300">
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
