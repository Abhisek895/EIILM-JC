import React, { useEffect, useState, useRef } from 'react';
import { infrastructureApi, mediaApi } from '@api/endpoints';
import ConfirmDialogModal, { ConfirmDialogState } from '@components/admin/ConfirmDialogModal';
import { getImageUrl } from '@utils/getImageUrl';


const extractVideoFrame = (file: File): Promise<File | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    const url = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      // Seek to 1 second, or middle if it's shorter
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const thumbFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
            resolve(thumbFile);
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      } else {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.src = url;
  });
};

export default function InfrastructureManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res: any = await infrastructureApi.getAll(1, 100);
      setItems(res?.data || []);
    } catch (error) {
      showToast('Error', 'Failed to load infrastructure data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, title, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    setUploadingMedia(true);
    setMediaUploadProgress(0);
    try {
      let thumbnailPath = '';
      if (isVideo) {
        // Generate and upload thumbnail first silently
        try {
          const thumbFile = await extractVideoFrame(file);
          if (thumbFile) {
            const thumbFormData = new FormData();
            thumbFormData.append('file', thumbFile);
            const thumbRes: any = await mediaApi.upload(thumbFormData);
            thumbnailPath = thumbRes?.data?.path || thumbRes?.data?.url || '';
          }
        } catch (e) {
          console.warn("Failed to generate video thumbnail", e);
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      const res: any = await mediaApi.upload(formData, (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setMediaUploadProgress(percentCompleted);
        }
      });
      if (res?.data?.path || res?.data?.url) {
        const path = res.data.path || res.data.url;
        if (isVideo) {
          setEditingItem({ ...editingItem, videoUrl: path, imageUrl: thumbnailPath });
        } else {
          setEditingItem({ ...editingItem, imageUrl: path, videoUrl: '' });
        }
        showToast('Media Uploaded', 'Media successfully uploaded.', 'success');
      }
    } catch (err) {
      showToast('Upload Failed', 'Failed to upload media.', 'error');
    } finally {
      setUploadingMedia(false);
      setMediaUploadProgress(0);
      if (mediaInputRef.current) mediaInputRef.current.value = '';
    }
  };

  const openNewModal = () => {
    setEditingItem({
      title: '',
      description: '',
      imageUrl: '',
      videoUrl: '',
      icon: '🏢',
      category: 'facility',
      status: 'active'
    });
  };

  const openEditModal = (item: any) => {
    setEditingItem({ ...item });
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await infrastructureApi.remove(id);
          showToast('Deleted', 'Item has been removed from the system.');
          loadData();
        } catch (error) {
          showToast('Delete Failed', 'Could not remove the item.', 'error');
        }
      }
    });
  };

  const handleSaveModal = async () => {
    if (!editingItem.title || !editingItem.category) {
      showToast('Validation Error', 'Title and Category are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingItem.id) {
        await infrastructureApi.update(editingItem.id, editingItem);
        showToast('Updated', 'Item updated successfully.');
      } else {
        await infrastructureApi.create(editingItem);
        showToast('Created', 'New infrastructure item added.');
      }
      setEditingItem(null);
      loadData();
    } catch (error) {
      showToast('Save Failed', 'Failed to save the item.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = categoryFilter === 'all' 
    ? items 
    : items.filter(item => item.category === categoryFilter);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Infrastructure & Campus Tours</h2>
          <p className="text-gray-500 text-sm mt-1">
            Add and organize campus facilities, virtual tours, and highlights.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-md shadow-primary-500/20 flex items-center gap-2"
        >
          <span>➕</span> Add New Record
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
        {['all', 'facility', 'tour', 'hero'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-colors ${
              categoryFilter === cat 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {cat === 'hero' ? 'Campus Highlight' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse bg-white rounded-3xl p-8 border border-gray-100 h-64 flex items-center justify-center">
          <span className="text-gray-400 font-bold">Loading records...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center shadow-sm">
          <div className="text-6xl mb-4">🏛️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Records Found</h3>
          <p className="text-gray-500 mb-6">There are no infrastructure items matching your filter.</p>
          <button onClick={openNewModal} className="bg-primary-100 text-primary-700 hover:bg-primary-200 font-bold px-6 py-3 rounded-xl transition-colors">
            Add Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-shadow group flex flex-col">
              <div className="relative h-48 bg-slate-100">
                {item.imageUrl ? (
                  <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                    {item.icon || '🏛️'}
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm ${
                    item.category === 'tour' ? 'bg-purple-100 text-purple-700' :
                    item.category === 'hero' ? 'bg-amber-100 text-amber-700' :
                    'bg-primary-100 text-primary-700'
                  }`}>
                    {item.category === 'hero' ? 'highlight' : item.category}
                  </span>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm ${
                    item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                {/* Action overlay */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button onClick={() => openEditModal(item)} className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center hover:scale-110 shadow-lg" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 shadow-lg" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                {item.icon && <div className="text-2xl mb-2">{item.icon}</div>}
                <h3 className="font-extrabold text-gray-900 text-lg mb-2 line-clamp-1">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 flex-1">{item.description || 'No description provided.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-scaleUp">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingItem.id ? 'Edit Record' : 'Create New Record'}</h2>
                <p className="text-xs text-gray-500 mt-1">Fill in the details to publish to the production site.</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-gray-600 shadow-sm">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    placeholder="e.g. Advanced Robotics Lab"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category *</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    >
                      <option value="facility">Facility</option>
                      <option value="tour">Virtual Tour</option>
                      <option value="hero">Campus Highlight (Hero)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Status</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white"
                      value={editingItem.status}
                      onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white h-24 resize-none"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  placeholder="Detailed description of the facility or highlight..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Media File (Image or Video)
                  </label>
                  <input type="file" accept="image/*,video/*" className="hidden" ref={mediaInputRef} onChange={handleMediaUpload} />
                  
                  <div 
                    onClick={() => mediaInputRef.current?.click()}
                    className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary-400 cursor-pointer group bg-gray-50 flex items-center justify-center flex-col"
                  >
                    {editingItem.imageUrl || editingItem.videoUrl ? (
                      <>
                        {editingItem.videoUrl ? (
                          <video src={getImageUrl(editingItem.videoUrl)} className="w-full h-full object-cover" />
                        ) : (
                          <img src={getImageUrl(editingItem.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-sm font-bold gap-2">
                          {uploadingMedia ? `Uploading... ${mediaUploadProgress}%` : '📷 Change Media'}
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 w-full">
                        {uploadingMedia ? (
                          <>
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm font-bold text-gray-600 mb-2">Uploading... {mediaUploadProgress}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden max-w-[200px] mx-auto">
                              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${mediaUploadProgress}%` }}></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl mb-2">📸</div>
                            <p className="text-sm font-bold text-gray-600">Upload Image or Video</p>
                            <p className="text-[10px] text-gray-400 mt-1">Recommended MP4 or JPG/PNG</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Emoji Icon</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white"
                      value={editingItem.icon}
                      onChange={(e) => setEditingItem({...editingItem, icon: e.target.value})}
                      placeholder="🏢"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Used as a visual identifier in lists.</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl">
              <button onClick={() => setEditingItem(null)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveModal}
                disabled={saving || !editingItem.title}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving ? (
                   <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : 'Publish Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && toast.visible && (
        <div className="fixed top-6 right-6 z-50 animate-bounce flex items-center gap-3 bg-slate-900 border border-slate-850 text-white px-6 py-4.5 rounded-2xl shadow-2xl transition-all duration-300">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}>
            {toast.type === 'success' ? '✓' : '✗'}
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">{toast.title}</div>
            <div className={`text-xs mt-0.5 ${toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {toast.message}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialogModal dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
    </div>
  );
}
