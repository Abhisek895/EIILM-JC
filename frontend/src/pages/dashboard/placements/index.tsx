import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import DashboardLayout from '@layouts/DashboardLayout';
import { placementApi, mediaApi, courseApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';
import ConfirmDialogModal, { ConfirmDialogState } from '@components/admin/ConfirmDialogModal';
import ImageCropperModal from '@components/admin/ImageCropperModal';

type PlacementRecord = {
  id: number;
  studentName: string;
  companyName: string;
  companyLogo: string | null;
  package: string;
  year: string;
  course: string | null;
  studentImage: string | null;
  placementType: 'placement' | 'internship';
  status: 'draft' | 'published' | 'archived';
};

type PlacementForm = {
  studentName: string;
  companyName: string;
  companyLogo: string;
  package: string;
  year: string;
  course: string;
  studentImage: string;
  placementType: 'placement' | 'internship';
  status: 'draft' | 'published' | 'archived';
};

const EMPTY_FORM: PlacementForm = {
  studentName: '',
  companyName: '',
  companyLogo: '',
  package: '',
  year: new Date().getFullYear().toString(),
  course: '',
  studentImage: '',
  placementType: 'placement',
  status: 'published',
};

export default function AdminPlacementPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState<PlacementForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Custom states for File Upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  
  // Custom success Toast State
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);

  // Image Cropper State
  const [cropperState, setCropperState] = useState<{ isOpen: boolean; imageSrc: string | null; file: File | null; field: 'studentImage' | 'companyLogo' | null }>({
    isOpen: false,
    imageSrc: null,
    file: null,
    field: null,
  });

  // Media Gallery Modal State
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [galleryField, setGalleryField] = useState<'studentImage' | 'companyLogo' | null>(null);

  const openMediaGallery = async (field: 'studentImage' | 'companyLogo') => {
    setGalleryField(field);
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
        const canRead = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.placements?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.placements?.includes('write'));
  const canDelete = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.placements?.includes('delete'));

  const load = useCallback(async (p: number, search: string, recordType: string, status: string) => {
    setLoading(true);
    try {
      const res: any = await placementApi.getAll(p, 10, status, search, recordType);
      setPlacements(res?.data || []);
      setTotalPages(res?.meta?.totalPages || 1);
      const coursesRes: any = await courseApi.getAll(1, 100);
      setCourses(coursesRes?.data?.items || coursesRes?.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, activeSearch, recordTypeFilter, statusFilter);
  }, [load, page, activeSearch, recordTypeFilter, statusFilter]);

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

  const openEdit = (p: PlacementRecord) => {
    setEditId(p.id);
    setForm({
      studentName: p.studentName,
      companyName: p.companyName,
      companyLogo: p.companyLogo || '',
      package: p.package,
      year: p.year,
      course: p.course || '',
      studentImage: p.studentImage || '',
      placementType: p.placementType || 'placement',
      status: p.status,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editId) {
        await placementApi.update(editId, form);
        showSuccessToast('Placement Modified', 'Placement record has been modified successfully!');
      } else {
        await placementApi.create(form);
        showSuccessToast('Placement Created', 'New placement record has been created successfully!');
      }
      setShowForm(false);
      await load(page, activeSearch, recordTypeFilter, statusFilter);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save placement');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (file: File, field: 'studentImage' | 'companyLogo') => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropperState({ isOpen: true, imageSrc: reader.result?.toString() || null, file, field });
    });
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (file: File) => {
    const field = cropperState.field;
    setCropperState({ isOpen: false, imageSrc: null, file: null, field: null });
    if (!field) return;
    
    setUploadingImage(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res: any = await mediaApi.upload(fd);
      const url = res?.data?.path || res?.data?.url;
      if (url) {
        setForm((prev) => ({ ...prev, [field]: url }));
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
      title: 'Delete Placement',
      message: `Delete placement record for "${name}"? This cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await placementApi.remove(id);
          showSuccessToast('Placement Deleted', 'Placement record has been deleted successfully!');
          await load(page, activeSearch, recordTypeFilter, statusFilter);
        } catch {
          showSuccessToast('Deletion Failed', 'Failed to delete placement record');
        }
      }
    });
  };

  const STATUS_COLORS: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-gray-100 text-gray-700',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Placement Records</h1>
            <p className="text-gray-500 text-sm mt-1">{placements.length} records on this page</p>
          </div>
          <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-2 lg:gap-3 w-full lg:w-auto">
            <form onSubmit={handleSearch} className="col-span-2 lg:col-span-1 relative w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim() === '') {
                    setPage(1);
                    setActiveSearch('');
                  }
                }}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full lg:w-64"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </form>
            <select
              value={recordTypeFilter}
              onChange={(e) => {
                setRecordTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-2 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full lg:w-auto"
            >
              <option value="all">All Types</option>
              <option value="placement">Placement</option>
              <option value="internship">Internship</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full lg:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            {canWrite && (
              <button
                onClick={openCreate}
                className="col-span-2 lg:col-span-1 bg-primary-600 text-white px-2 sm:px-3 py-2 rounded-lg hover:bg-primary-700 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap w-full lg:w-auto"
              >
                + Add Placement
              </button>
            )}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{editId ? 'Edit Placement Record' : 'Add Placement Record'}</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.studentName}
                      onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course / Dept *</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      required
                    >
                      <option value="" disabled>Select a Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.courseCode}>
                          {c.courseCode} {c.title ? `- ${c.title}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.package}
                      onChange={(e) => setForm({ ...form, package: e.target.value })}
                      required
                      placeholder="e.g. 12 LPA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Placement Year *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      required
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.status}
                      onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.placementType}
                      onChange={(e: any) => setForm({ ...form, placementType: e.target.value })}
                    >
                      <option value="placement">Placement</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  
                  {/* Student Image Upload */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">📸 Student Photo</label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file, 'studentImage');
                        e.target.value = '';
                      }}
                    />
                    {form.studentImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 w-full h-32">
                        <img
                          src={form.studentImage.startsWith('http') ? form.studentImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000'}${form.studentImage}`}
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded hover:bg-gray-100 w-24"
                          >
                            Upload New
                          </button>
                          <button
                            type="button"
                            onClick={() => openMediaGallery('studentImage')}
                            className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-primary-600 w-24"
                          >
                            Gallery
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, studentImage: '' }))}
                            className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-600 w-24"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center h-32 flex flex-col items-center justify-center">
                        {uploadingImage ? (
                          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="flex flex-col gap-2 w-full px-2">
                            <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Upload New
                            </button>
                            <button type="button" onClick={() => openMediaGallery('studentImage')} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Browse Gallery
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Company Logo Upload */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">🏢 Company Logo</label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file, 'companyLogo');
                        e.target.value = '';
                      }}
                    />
                    {form.companyLogo ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 w-full h-32 bg-gray-50 p-2">
                        <img
                          src={form.companyLogo.startsWith('http') ? form.companyLogo : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000'}${form.companyLogo}`}
                          alt="Company Logo"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded hover:bg-gray-100 w-24"
                          >
                            Upload New
                          </button>
                          <button
                            type="button"
                            onClick={() => openMediaGallery('companyLogo')}
                            className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-primary-600 w-24"
                          >
                            Gallery
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, companyLogo: '' }))}
                            className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-600 w-24"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center h-32 flex flex-col items-center justify-center bg-gray-50">
                        {uploadingImage ? (
                          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="flex flex-col gap-2 w-full px-2">
                            <button type="button" onClick={() => logoInputRef.current?.click()} className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Upload New
                            </button>
                            <button type="button" onClick={() => openMediaGallery('companyLogo')} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Browse Gallery
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : editId ? 'Update Record' : 'Create Record'}
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
            <table className="w-full text-sm responsive-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Type', 'Student', 'Company', 'Package', 'Course', 'Year', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
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
                ) : placements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No placement records yet. Click &quot;Add Placement&quot; to get started.
                    </td>
                  </tr>
                ) : (
                  placements.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td data-label="Type" className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${p.placementType === 'internship' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-primary-50 text-primary-600 border-primary-200'}`}>
                          {p.placementType === 'internship' ? 'Internship' : 'Placement'}
                        </span>
                      </td>
                      <td data-label="Student" className="px-4 py-2.5 font-medium text-gray-900">{p.studentName}</td>
                      <td data-label="Company" className="px-4 py-2.5 text-gray-600">{p.companyName}</td>
                      <td data-label="Package" className="px-4 py-2.5 text-gray-900 font-semibold">{p.package}</td>
                      <td data-label="Course" className="px-4 py-2.5 text-gray-600">{p.course || '—'}</td>
                      <td data-label="Year" className="px-4 py-2.5 text-gray-600">{p.year}</td>
                      <td data-label="Status" className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || STATUS_COLORS.published}`}>
                          {p.status}
                        </span>
                      </td>
                      <td data-label="Actions" className="px-4 py-2.5">
                        <div className="flex items-center gap-3 whitespace-nowrap -mt-0.5">
                          {canWrite && (
                            <button
                              onClick={() => openEdit(p)}
                              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id, p.studentName)}
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
                        if (galleryField) {
                          const imageUrl = item.fileUrl.startsWith('http') ? item.fileUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000'}${item.fileUrl}`;
                          setCropperState({ isOpen: true, imageSrc: imageUrl, file: null, field: galleryField });
                        }
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
        aspectRatio={cropperState.field === 'studentImage' ? 1 : undefined} // 1:1 for student photo, free for company logo
        onClose={() => setCropperState({ isOpen: false, imageSrc: null, file: null, field: null })}
        onCropComplete={handleImageUpload}
      />
    </DashboardLayout>
  );
}
