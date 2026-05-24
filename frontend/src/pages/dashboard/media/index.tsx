import React, { useState } from 'react';
import DashboardLayout from '@layouts/DashboardLayout';

type MediaItem = {
  id: number;
  name: string;
  type: 'image' | 'video' | 'document';
  size: string;
  url: string;
  uploadedAt: string;
};

const INITIAL_MEDIA: MediaItem[] = [
  { id: 1, name: 'college_main_campus_hero.jpg', type: 'image', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800', uploadedAt: '24 May 2026' },
  { id: 2, name: 'bca_syllabus_2026.pdf', type: 'document', size: '1.2 MB', url: '#', uploadedAt: '23 May 2026' },
  { id: 3, name: 'mba_campus_placement_presentation.pdf', type: 'document', size: '4.8 MB', url: '#', uploadedAt: '22 May 2026' },
  { id: 4, name: 'college_annual_tech_fest_banner.png', type: 'image', size: '3.1 MB', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', uploadedAt: '21 May 2026' },
  { id: 5, name: 'student_induction_opening_keynote.mp4', type: 'video', size: '45.2 MB', url: '#', uploadedAt: '20 May 2026' },
  { id: 6, name: 'dr_abhisek_sarkar_avatar.jpg', type: 'image', size: '350 KB', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', uploadedAt: '19 May 2026' }
];

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Custom Toast State
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const showSuccessToast = (title: string, message: string) => {
    setToast({ visible: true, title, message });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleFakeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newItem: MediaItem = {
        id: Date.now(),
        name: file.name,
        type: file.type.includes('image') ? 'image' : file.type.includes('video') ? 'video' : 'document',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: file.type.includes('image') ? URL.createObjectURL(file) : '#',
        uploadedAt: 'Today',
      };
      
      setMediaItems((prev) => [newItem, ...prev]);
      setIsUploading(false);
      showSuccessToast('Asset Uploaded', `Upload of "${file.name}" is successful!`);
    }, 1500);
  };

  const handleDelete = (id: number, name: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
    showSuccessToast('Asset Deleted', `Deletion of "${name}" is successful!`);
  };

  // Filtered Media List
  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Media Library</h1>
          <p className="text-gray-500 text-sm mt-1">Upload, search, and manage assets driving dynamic web content.</p>
        </div>

        {/* Drag and Drop Upload Box */}
        <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden transition-all hover:border-blue-400 group">
          {isUploading ? (
            <div className="space-y-4 py-4">
              <div className="animate-spin text-4xl mx-auto">⏳</div>
              <div>
                <p className="font-bold text-gray-800 text-base">Uploading to Cloud Storage...</p>
                <p className="text-xs text-gray-500 mt-1">Optimizing, compressing, and caching file configurations.</p>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer space-y-3 w-full py-4 block">
              <div className="text-4xl">📁</div>
              <div>
                <p className="font-bold text-gray-800 text-base">Drag & Drop files or <span className="text-blue-600 hover:text-blue-700 underline">Browse Local Files</span></p>
                <p className="text-xs text-gray-400 mt-1">Supports JPEG, PNG, MP4, PDF, and DOC files up to 50MB</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFakeUpload} 
                accept="image/*,video/*,application/pdf"
              />
            </label>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          {/* Category Tabs */}
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
                  filterType === tab.type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <span className="absolute left-4 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search library assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
            />
          </div>
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center border border-gray-100 text-gray-400 shadow-sm">
            <div className="text-5xl mb-4">📂</div>
            <h3 className="text-lg font-bold text-gray-600">No media assets found</h3>
            <p className="text-xs text-gray-400 mt-1">Try relaxing your search terms or upload some new files.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedia.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                {/* Thumb Container */}
                <div className="h-44 bg-gray-50 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-100/50 transition-colors">
                  {item.type === 'image' && item.url !== '#' ? (
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-5xl select-none">
                      {item.type === 'video' ? '🎥' : '📄'}
                    </div>
                  )}
                  {/* File badge type */}
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md shadow-sm">
                    {item.type}
                  </span>
                </div>

                {/* Details Footer */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-gray-400 text-xs mt-1 flex items-center justify-between font-medium">
                      <span>{item.size}</span>
                      <span>• {item.uploadedAt}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1"
                    >
                      🔗 Open URL
                    </a>
                    <button 
                      onClick={() => handleDelete(item.id, item.name)}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
