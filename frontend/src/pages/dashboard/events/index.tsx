import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import DashboardLayout from '@layouts/DashboardLayout';
import { eventApi, mediaApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';
import ConfirmDialogModal, { ConfirmDialogState } from '@components/admin/ConfirmDialogModal';
import { getImageUrl } from '@utils/getImageUrl';
import ImageCropperModal from '@components/admin/ImageCropperModal';

type Event = {
  id: number;
  title: string;
  description: string | null;
  banner: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  registrationLink: string | null;
  status: 'draft' | 'published' | 'completed';
};

type EventForm = {
  title: string;
  description: string;
  banner: string;
  startDate: string;
  endDate: string;
  location: string;
  registrationLink: string;
  status: 'draft' | 'published' | 'completed';
};

const EMPTY_FORM: EventForm = {
  title: '',
  description: '',
  banner: '',
  startDate: '',
  endDate: '',
  location: '',
  registrationLink: '',
  status: 'draft',
};


export default function AdminEventsPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        const canRead = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.events?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.events?.includes('write'));
  const canDelete = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.events?.includes('delete'));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await eventApi.getAll(1, 100);
      setEvents(res?.data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
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

  const openEdit = (ev: Event) => {
    setEditId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description || '',
      banner: ev.banner || '',
      startDate: ev.startDate ? ev.startDate.split('T')[0] : '',
      endDate: ev.endDate ? ev.endDate.split('T')[0] : '',
      location: ev.location || '',
      registrationLink: ev.registrationLink || '',
      status: ev.status,
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
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      banner: form.banner || null,
      location: form.location || null,
      registrationLink: form.registrationLink || null,
      description: form.description || null,
    };

    try {
      if (editId) {
        await eventApi.update(editId, payload);
        showSuccessToast('Event Modified', 'Event details have been modified successfully!');
      } else {
        await eventApi.create(payload);
        showSuccessToast('Event Created', 'New event has been created successfully!');
      }
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleBannerSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, GIF, WebP, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropperState({ isOpen: true, imageSrc: reader.result?.toString() || null, file });
    });
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = async (file: File) => {
    setCropperState({ isOpen: false, imageSrc: null, file: null });
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await mediaApi.upload(formData);
      if (res?.data?.path) {
        setForm((prev) => ({ ...prev, banner: res.data.path }));
      } else if (res?.data?.url) {
        setForm((prev) => ({ ...prev, banner: res.data.url }));
      } else {
        setError('Upload succeeded but no URL returned.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: number, title: string) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete Event',
      message: `Delete event "${title}"? This cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await eventApi.remove(id);
          showSuccessToast('Event Deleted', 'Event has been deleted successfully!');
          await load();
        } catch {
          showSuccessToast('Deletion Failed', 'Failed to delete event');
        }
      }
    });
  };

  const STATUS_COLORS: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-primary-100 text-primary-700',
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? ev.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-500 text-sm mt-1">{events.length} events total</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
            </select>
            {canWrite && (
              <button
                onClick={openCreate}
                className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 font-semibold text-sm transition-colors whitespace-nowrap"
              >
                + Add Event
              </button>
            )}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{editId ? 'Edit Event' : 'Add Event'}</h2>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Seminar Hall / Online"
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
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Banner Image</label>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBannerSelect(file);
                        e.target.value = '';
                      }}
                    />

                    {form.banner ? (
                      /* Image preview with replace/remove controls */
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                        <img
                          src={getImageUrl(form.banner)}
                          alt="Banner preview"
                          className="w-full h-40 object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors w-32 flex justify-center items-center gap-1.5"
                          >
                            {uploading ? (
                              <><span className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />Uploading...</>
                            ) : (
                              <>📁 Upload New</>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={openMediaGallery}
                            className="bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors w-32"
                          >
                            🖼️ Gallery
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, banner: '' }))}
                            className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors w-32"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Upload zone */
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center h-40 flex flex-col items-center justify-center bg-gray-50">
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-medium text-primary-600">Uploading image...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full px-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 py-2 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2">
                              📁 Upload New Banner
                            </button>
                            <button type="button" onClick={openMediaGallery} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2">
                              🖼️ Browse Gallery
                            </button>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP — max 10MB</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Link (External)</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={form.registrationLink}
                      onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                      placeholder="e.g. https://forms.gle/..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 h-28 resize-none"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : editId ? 'Update Event' : 'Create Event'}
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
                  {['Title', 'Location', 'Start Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-2.5">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      {events.length === 0 ? 'No events yet. Click "Add Event" to get started.' : 'No events match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{ev.title}</td>
                      <td className="px-4 py-2.5 text-gray-600">{ev.location || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[ev.status] || STATUS_COLORS.draft}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3 whitespace-nowrap -mt-0.5">
                          {canWrite && (
                            <button
                              onClick={() => openEdit(ev)}
                              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(ev.id, ev.title)}
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
        aspectRatio={16 / 9} // 16:9 for event banners
        onClose={() => setCropperState({ isOpen: false, imageSrc: null, file: null })}
        onCropComplete={handleBannerUpload}
      />
    </DashboardLayout>
  );
}
