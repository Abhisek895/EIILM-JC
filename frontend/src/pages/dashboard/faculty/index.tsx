import { getImageUrl } from '@utils/image';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { facultyApi, departmentApi, mediaApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';
import ConfirmDialogModal, { ConfirmDialogState } from '@components/admin/ConfirmDialogModal';

type FacultyMember = {
  id: number;
  departmentId: number | null;
  name: string;
  designation: string | null;
  photo: string | null;
  qualification: string | null;
  experience: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  status: 'active' | 'inactive';
  department?: { id: number; name: string };
};

type Department = {
  id: number;
  name: string;
};

type FacultyForm = {
  departmentId: string;
  name: string;
  designation: string;
  photo: string;
  qualification: string;
  experience: string;
  email: string;
  phone: string;
  bio: string;
  status: 'active' | 'inactive';
};

const EMPTY_FORM: FacultyForm = {
  departmentId: '',
  name: '',
  designation: '',
  photo: '',
  qualification: '',
  experience: '',
  email: '',
  phone: '',
  bio: '',
  status: 'active',
};

export default function AdminFacultyPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FacultyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom states for File Upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  
  // Custom success Toast State
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const role = user?.role;
        const canRead = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.faculty?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.faculty?.includes('write'));
  const canDelete = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.faculty?.includes('delete'));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [facRes, deptRes]: any = await Promise.all([
        facultyApi.getAll(1, 100),
        departmentApi.getAll(1, 100),
      ]);
      setFaculty(facRes?.data || []);
      setDepartments(deptRes?.data || []);
    } catch (err) {
      console.error('Failed to load faculty details:', err);
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
    setShowForm(true);
    setError('');
  };

  const openEdit = (f: FacultyMember) => {
    setEditId(f.id);
    setForm({
      departmentId: f.departmentId ? String(f.departmentId) : '',
      name: f.name,
      designation: f.designation || '',
      photo: f.photo || '',
      qualification: f.qualification || '',
      experience: f.experience || '',
      email: f.email || '',
      phone: f.phone || '',
      bio: f.bio || '',
      status: f.status,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
    };

    try {
      if (editId) {
        await facultyApi.update(editId, payload);
        showSuccessToast('Faculty Modified', 'Faculty member details have been modified successfully!');
      } else {
        await facultyApi.create(payload);
        showSuccessToast('Faculty Created', 'New faculty member has been created successfully!');
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save faculty member');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    setUploadingImage(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res: any = await mediaApi.upload(fd);
      if (res?.data?.path) {
        setForm((prev) => ({ ...prev, photo: res.data.path }));
      } else if (res?.data?.url) {
        setForm((prev) => ({ ...prev, photo: res.data.url }));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete Faculty Member',
      message: `Delete faculty member "${name}"? This cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await facultyApi.remove(id);
          showSuccessToast('Faculty Deleted', 'Faculty member has been deleted successfully!');
          await load();
        } catch {
          showSuccessToast('Deletion Failed', 'Failed to delete faculty member');
        }
      }
    });
  };

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faculty Members</h1>
            <p className="text-gray-500 text-sm mt-1">{faculty.length} members total</p>
          </div>
          {canWrite && (
            <button
              onClick={openCreate}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-semibold text-sm transition-colors"
            >
              + Add Faculty
            </button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{editId ? 'Edit Faculty Member' : 'Add Faculty Member'}</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      placeholder="e.g. Professor / Asst. Professor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.qualification}
                      onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                      placeholder="e.g. Ph.D. in Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      placeholder="e.g. 10 Years"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.status}
                      onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">📸 Profile Photo (Optional)</label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                    {form.photo ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 group w-32 h-32 mx-auto">
                        <img
                          src={form.photo.startsWith('http') ? form.photo : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000'}${form.photo}`}
                          alt="Photo preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            {uploadingImage ? '...' : '📁 Replace'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, photo: '' }))}
                            className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-600 transition-colors"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all w-32 h-32 mx-auto flex flex-col items-center justify-center"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        {uploadingImage ? (
                          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-1" />
                        ) : (
                          <div className="text-2xl mb-1">📸</div>
                        )}
                        <p className="text-[10px] font-semibold text-gray-700 leading-tight">Click to upload photo</p>
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : editId ? 'Update Faculty' : 'Create Faculty'}
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
                  {['Name', 'Department', 'Designation', 'Email', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : faculty.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      No faculty members yet. Click &quot;Add Faculty&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  faculty.map((f) => (
                    <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                      <td className="px-4 py-3 text-gray-600">{f.department?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{f.designation || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{f.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[f.status] || STATUS_COLORS.active}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {canWrite && (
                            <button
                              onClick={() => openEdit(f)}
                              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(f.id, f.name)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
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

      <ConfirmDialogModal dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
    </DashboardLayout>
  );
}
