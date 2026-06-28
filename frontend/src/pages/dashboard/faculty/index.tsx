import { getImageUrl } from '@utils/image';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import DashboardLayout from '@layouts/DashboardLayout';
import { facultyApi, departmentApi, mediaApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';
import ConfirmDialogModal, { ConfirmDialogState } from '@components/admin/ConfirmDialogModal';
import ImageCropperModal from '@components/admin/ImageCropperModal';

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
  sortOrder: number;
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
  sortOrder: string;
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
  sortOrder: '0',
};

export default function AdminFacultyPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
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

  // Image Cropper State
  const [cropperState, setCropperState] = useState<{ isOpen: boolean; imageSrc: string | null; file: File | null }>({
    isOpen: false,
    imageSrc: null,
    file: null,
  });

  // Media Gallery Modal State
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const openMediaGallery = async () => {
    setShowMediaGallery(true);
    setLoadingMedia(true);
    try {
      const res: any = await mediaApi.getAll(1, 100);
      setMediaItems(res?.data || []);
    } catch (err) {
      setError('Failed to load media gallery');
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const role = user?.role;
        const canRead = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.faculty?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.faculty?.includes('write'));
  const canDelete = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.faculty?.includes('delete'));

  const load = useCallback(async (p: number, search: string, dept: string) => {
    setLoading(true);
    try {
      const [facRes, deptRes]: any = await Promise.all([
        facultyApi.getAll(p, 10, dept && dept !== 'all' ? Number(dept) : undefined, search),
        departmentApi.getAll(1, 100),
      ]);
      setFaculty(facRes?.data || []);
      setTotalPages(facRes?.meta?.totalPages || facRes?.pagination?.totalPages || 1);
      setDepartments(deptRes?.data || []);
    } catch (err) {
      console.error('Failed to load faculty details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, activeSearch, departmentFilter);
  }, [load, page, activeSearch, departmentFilter]);

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
      sortOrder: f.sortOrder !== undefined ? String(f.sortOrder) : '0',
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
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editId) {
        await facultyApi.update(editId, payload);
        showSuccessToast('Faculty Updated', 'Faculty member has been updated successfully!');
      } else {
        await facultyApi.create(payload);
        showSuccessToast('Faculty Created', 'New faculty member has been created successfully!');
      }
      setShowForm(false);
      await load(page, activeSearch, departmentFilter);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save faculty member');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropperState({ isOpen: true, imageSrc: reader.result?.toString() || null, file });
    });
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (file: File) => {
    setCropperState({ isOpen: false, imageSrc: null, file: null });
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
          await load(page, activeSearch, departmentFilter);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Faculty Members</h1>
            <p className="text-gray-500 text-sm mt-1">Manage teaching staff and departments</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search faculty..."
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
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {canWrite && (
              <button
                onClick={openCreate}
                className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 font-semibold text-sm transition-colors whitespace-nowrap"
              >
                + Add Faculty
              </button>
            )}
          </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order (Optional)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                      placeholder="e.g. 1"
                    />
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
                        if (file) handleImageSelect(file);
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
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded hover:bg-gray-100 transition-colors w-24"
                          >
                            {uploadingImage ? '...' : 'Upload New'}
                          </button>
                          <button
                            type="button"
                            onClick={openMediaGallery}
                            className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-primary-600 transition-colors w-24"
                          >
                            Gallery
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, photo: '' }))}
                            className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-600 transition-colors w-24"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center w-full h-32 mx-auto flex flex-col items-center justify-center bg-gray-50">
                        {uploadingImage ? (
                          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-1" />
                        ) : (
                          <div className="flex flex-col gap-2 w-full px-4 max-w-[200px]">
                            <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Upload New
                            </button>
                            <button type="button" onClick={openMediaGallery} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Browse Gallery
                            </button>
                          </div>
                        )}
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
                  {['Name', 'Department', 'Designation', 'Sort', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-2.5">
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
                      <td className="px-4 py-2.5 font-medium text-gray-900">{f.name}</td>
                      <td className="px-4 py-2.5 text-gray-600">{f.department?.name || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-600">{f.designation || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{f.sortOrder}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[f.status] || STATUS_COLORS.active}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3 whitespace-nowrap -mt-0.5">
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
        
        {totalPages > 1 && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        )}
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

      {/* Media Gallery Picker Modal */}
      {showMediaGallery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMediaGallery(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-scaleUp">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Media Gallery</h2>
                <p className="text-xs text-gray-500 mt-1">Select an image from your library.</p>
              </div>
              <button onClick={() => setShowMediaGallery(false)} className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full text-gray-600 shadow-sm border border-gray-200">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-bold">Loading media...</p>
                </div>
              ) : mediaItems.filter(item => item.fileType?.includes('image')).length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🖼️</div>
                  <h3 className="text-lg font-bold text-gray-800">No images found</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload images via the Media dashboard first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaItems.filter(item => item.fileType?.includes('image')).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        const imageUrl = item.fileUrl.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000'}${item.fileUrl}`;
                        setCropperState({ isOpen: true, imageSrc: imageUrl, file: null });
                        setShowMediaGallery(false);
                      }}
                      className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-500 transition-all flex flex-col h-40"
                    >
                      <div className="flex-1 bg-gray-100 overflow-hidden relative">
                        <img src={item.fileUrl.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000'}${item.fileUrl}`} alt={item.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white text-primary-700 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">Select</span>
                        </div>
                      </div>
                      <div className="p-2 truncate text-[10px] font-bold text-gray-600 text-center border-t border-gray-100 bg-gray-50 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                        {item.fileName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white rounded-b-3xl flex justify-end">
              <button onClick={() => setShowMediaGallery(false)} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialogModal dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
      
      <ImageCropperModal
        isOpen={cropperState.isOpen}
        imageSrc={cropperState.imageSrc}
        aspectRatio={1} // Square for faculty photos
        onClose={() => setCropperState({ isOpen: false, imageSrc: null, file: null })}
        onCropComplete={handleImageUpload}
      />
    </DashboardLayout>
  );
}
