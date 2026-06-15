import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@layouts/DashboardLayout';
import { mediaApi } from '@api/endpoints';
import InfrastructureManager from '@components/admin/InfrastructureManager';
import PageContentManager from '@components/admin/PageContentManager';
import ConfirmDialogModal, { ConfirmDialogState } from '@components/admin/ConfirmDialogModal';
import { useAuth } from '@hooks/useAuth';
import { getImageUrl } from '@utils/getImageUrl';

type MediaItem = {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
};


export default function AdminMediaPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'files' | 'infrastructure' | 'page-content'>('files');
  
  // -- File Manager State --
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<number | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const role = user?.role;
      const canRead = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.media?.includes('read'));
      if (!canRead) {
        window.location.href = '/dashboard';
        return;
      }
    }
    if (activeTab === 'files') {
      loadMedia();
    }
  }, [activeTab, user]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.media?.includes('write'));
  const canDelete = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.media?.includes('delete'));

  const loadMedia = async () => {
    try {
      const res: any = await mediaApi.getAll(1, 100);
      setMediaItems(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Custom Toast State
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);

  const showSuccessToast = (title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => { setToast(null); }, 2500);
  };

  // -----------------------------------------
  // File Manager Handlers
  // -----------------------------------------
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      await mediaApi.upload(fd);
      showSuccessToast('Asset Uploaded', `Upload of "${file.name}" is successful!`);
      loadMedia();
    } catch (err) {
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleReplaceClick = (id: number) => {
    setReplacingId(id);
    if (replaceInputRef.current) replaceInputRef.current.click();
  };

  const handleReplaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !replacingId) return;
    const file = files[0];
    
    try {
      const fd = new FormData();
      fd.append('file', file);
      await mediaApi.replace(replacingId, fd);
      showSuccessToast('Asset Replaced', `File replaced globally. Note: It may take a refresh or cache clear to see it updated. If the image is cached by your browser, you may need to hard refresh.`);
      loadMedia();
    } catch (err) {
      alert('Failed to replace file');
    } finally {
      setReplacingId(null);
      e.target.value = '';
    }
  };

  const handleDeleteFile = (id: number, name: string) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete File',
      message: 'Are you sure you want to delete this file? It will be removed globally.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await mediaApi.remove(id);
          showSuccessToast('Asset Deleted', `Deletion of "${name}" is successful!`);
          loadMedia();
        } catch (err) {
          alert('Failed to delete file');
        }
      }
    });
  };

  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(search.toLowerCase());
    
    let typeGroup = 'document';
    if (item.fileType?.includes('image')) typeGroup = 'image';
    if (item.fileType?.includes('video')) typeGroup = 'video';
    
    const matchesType = filterType === 'all' || typeGroup === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Media & CMS</h1>
            <p className="text-gray-500 text-sm mt-1">Manage files, homepage sliders, and infrastructure.</p>
          </div>
          <div className="flex bg-gray-200/60 p-1.5 rounded-2xl w-fit font-semibold text-sm">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 sm:px-6 py-2 rounded-xl transition-all ${
                activeTab === 'files' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📁 File Manager
            </button>

            <button
              onClick={() => setActiveTab('infrastructure')}
              className={`px-4 sm:px-6 py-2 rounded-xl transition-all ${
                activeTab === 'infrastructure' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏛️ Infrastructure
            </button>
            <button
              onClick={() => setActiveTab('page-content')}
              className={`px-4 sm:px-6 py-2 rounded-xl transition-all ${
                activeTab === 'page-content' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📑 Page Headers
            </button>
          </div>
        </div>

        {/* ======================= FILE MANAGER TAB ======================= */}
        {activeTab === 'files' && (
          <div className="space-y-6 animate-in fade-in">
            {canWrite && (
              <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden transition-all hover:border-primary-400 group">
                {isUploading ? (
                  <div className="space-y-4 py-4">
                    <div className="animate-spin text-4xl mx-auto">⏳</div>
                    <div>
                      <p className="font-bold text-gray-800 text-base">Uploading to Cloud Storage...</p>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-3 w-full py-4 block">
                    <div className="text-4xl">📁</div>
                    <div>
                      <p className="font-bold text-gray-800 text-base">Drag & Drop files or <span className="text-primary-600 underline">Browse</span></p>
                      <p className="text-xs text-gray-400 mt-1">Supports JPEG, PNG, MP4, PDF, and DOC files</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,application/pdf" />
                  </label>
                )}
              </div>
            )}

            {canWrite && (
              <input type="file" className="hidden" ref={replaceInputRef} onChange={handleReplaceUpload} accept="image/*,video/*,application/pdf" />
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="flex bg-gray-200/60 p-1.5 rounded-2xl w-fit font-semibold text-sm">
                {[
                  { type: 'all', label: 'All Files', icon: '📁' },
                  { type: 'image', label: 'Images', icon: '🖼️' },
                  { type: 'video', label: 'Videos', icon: '🎥' },
                  { type: 'document', label: 'Documents', icon: '📄' },
                ].map((tab) => (
                  <button
                    key={tab.type}
                    onClick={() => setFilterType(tab.type)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                      filterType === tab.type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.icon}</span> <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className="relative max-w-sm w-full">
                <span className="absolute left-4 top-2.5 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search library assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm transition-all"
                />
              </div>
            </div>

            {filteredMedia.length === 0 ? (
              <div className="bg-white rounded-2xl py-20 text-center border border-gray-100 text-gray-400 shadow-sm">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-lg font-bold text-gray-600">No media assets found</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMedia.map((item) => {
                  const isImage = item.fileType?.includes('image');
                  const isVideo = item.fileType?.includes('video');
                  const itemTypeStr = isImage ? 'image' : isVideo ? 'video' : 'document';
                  const mbSize = item.fileSize ? (item.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown';
                  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown';

                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                      <div className="h-44 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                        {isImage ? (
                          <img src={getImageUrl(item.fileUrl)} alt={item.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="text-5xl select-none">{isVideo ? '🎥' : '📄'}</div>
                        )}
                        <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md shadow-sm">
                          {itemTypeStr}
                        </span>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-primary-600" title={item.fileName}>{item.fileName}</h4>
                          <p className="text-gray-400 text-xs mt-1 flex justify-between font-medium"><span>{mbSize}</span><span>• {dateStr}</span></p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                          <a href={getImageUrl(item.fileUrl)} target="_blank" rel="noreferrer" className="text-xs text-primary-600 font-bold hover:text-primary-700">🔗 Open</a>
                          <div className="flex gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50/50">
                            {canWrite && (
                              <button onClick={() => handleReplaceClick(item.id)} className="text-xs text-primary-600 font-bold hover:bg-primary-100 px-2 py-1 rounded-md transition-colors" title="Replace file globally">🔄 Replace</button>
                            )}
                            {canDelete && (
                              <button onClick={() => handleDeleteFile(item.id, item.fileName)} className="text-xs text-rose-500 font-bold hover:bg-rose-100 px-2 py-1 rounded-md transition-colors" title="Delete file">🗑️</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* ======================= INFRASTRUCTURE TAB ======================= */}
        {activeTab === 'infrastructure' && (
          <InfrastructureManager />
        )}

        {/* ======================= PAGE CONTENT TAB ======================= */}
        {activeTab === 'page-content' && (
          <PageContentManager />
        )}
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md">✓</div>
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

