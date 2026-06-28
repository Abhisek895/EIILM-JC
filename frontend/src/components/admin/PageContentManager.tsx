import React, { useEffect, useState, useRef, useCallback } from 'react';
import { cmsApi, mediaApi, siteSettingsApi } from '@api/endpoints';
import { getImageUrl } from '@utils/getImageUrl';

const PAGES_CONFIG = [
  { key: 'home', label: 'Homepage Slider', icon: '🏠' },
  { key: 'admissions', label: 'Admissions Page', icon: '🎓' },
  { key: 'courses', label: 'Courses Page', icon: '📚' },
  { key: 'departments', label: 'Departments Page', icon: '🏢' },
  { key: 'faculty', label: 'Faculty Page', icon: '👨‍🏫' },
  { key: 'placements', label: 'Placements Page', icon: '🏆' },
  { key: 'infrastructure', label: 'Infrastructure Page', icon: '🏛️' },
  { key: 'notices', label: 'Notices & Circulars', icon: '📢' },
  { key: 'events', label: 'Events Page', icon: '📅' },
  { key: 'about', label: 'About Us Page', icon: 'ℹ️' },
  { key: 'contact', label: 'Contact Us Page', icon: '📞' },
];

const STATS_FIELDS = [
  { key: 'stat_years', label: 'Years of Excellence', type: 'text', placeholder: '25+' },
  { key: 'stat_students', label: 'Students Enrolled', type: 'text', placeholder: '5000+' },
  { key: 'stat_faculty', label: 'Faculty Members', type: 'text', placeholder: '200+' },
  { key: 'stat_courses', label: 'Courses Offered', type: 'text', placeholder: '50+' },
];


export default function PageContentManager() {
  const [selectedPage, setSelectedPage] = useState<string>('home');

  // Slider State
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Stats State
  const [statsForm, setStatsForm] = useState<Record<string, string>>({});
  const [savingStats, setSavingStats] = useState(false);
  const [savedStats, setSavedStats] = useState(false);

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{ visible: boolean; title: string; message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' } | null>(null);

  // Edit Modal State
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      showToast('Error', 'Failed to load media gallery', 'error');
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    loadSlides(selectedPage);
  }, [selectedPage]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res: any = await siteSettingsApi.getMap();
      const data = res?.data || {};
      const initial: Record<string, string> = {};
      STATS_FIELDS.forEach(f => {
        initial[f.key] = data[f.key] || '';
      });
      setStatsForm(initial);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSlides = async (pageKey: string) => {
    try {
      setLoading(true);
      const res: any = await cmsApi.getPageSections(pageKey);
      const sections = res?.data || [];
      const heroSection = sections.find((s: any) => s.sectionKey === 'hero');

      if (heroSection && heroSection.config && Array.isArray(heroSection.config.slides)) {
        setSlides(heroSection.config.slides);
      } else {
        setSlides([]);
      }
    } catch (error) {
      console.error('Slider fetch error:', error);
      showToast('Error', `Failed to load sliders for ${pageKey}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, title, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveAll = async (newSlides = slides) => {
    try {
      setSaving(true);
      await cmsApi.upsertSection({
        pageKey: selectedPage,
        sectionKey: 'hero',
        config: { slides: newSlides },
      });
      showToast('Saved Successfully', `${selectedPage} slider has been updated.`);
    } catch (error) {
      showToast('Save Failed', 'Failed to update the slider.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStats(true);
    setSavedStats(false);
    try {
      const payload = Object.keys(statsForm).map((key) => ({ key, value: statsForm[key] }));
      await siteSettingsApi.bulkUpdate(payload);
      setSavedStats(true);
      setTimeout(() => setSavedStats(false), 3000);
    } catch (error) {
      showToast('Error', 'Failed to save global stats', 'error');
    } finally {
      setSavingStats(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please upload a valid image file.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await mediaApi.upload(formData);
      if (res?.data?.path || res?.data?.url) {
        setEditingSlide({ ...editingSlide, imageUrl: res.data.path || res.data.url });
        showToast('Image Uploaded', 'Image successfully uploaded.', 'success');
      }
    } catch (err) {
      showToast('Upload Failed', 'Failed to upload image.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openNewSlideModal = () => {
    setEditIndex(null);
    setEditingSlide({
      imageUrl: '',
      badge: 'Join US Now',
      heading: 'Addmitiomn open',
      subheading: 'Enter a descriptive subheading for this slide.',
      primaryCta: { label: 'ENQURIE NOW', href: 'http://localhost:3000/admissions' },
      secondaryCta: { label: 'Get Free Career Advice', href: 'http://localhost:3000/admissions' },
      bgColor: '#fecb00',
      logos: []
    });
  };

  const openEditModal = (index: number) => {
    setEditIndex(index);
    setEditingSlide({ ...slides[index] });
  };

  const handleDelete = (index: number) => {
    setConfirmDialog({
      visible: true,
      title: 'Delete Slide',
      message: 'Are you sure you want to delete this slide? This action cannot be removed.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        const newSlides = [...slides];
        newSlides.splice(index, 1);
        setSlides(newSlides);
        await handleSaveAll(newSlides);
      }
    });
  };

  const handleSaveModal = async () => {
    let newSlides = [...slides];
    if (editIndex !== null) {
      newSlides[editIndex] = editingSlide;
    } else {
      newSlides.push(editingSlide);
    }
    setSlides(newSlides);
    setEditingSlide(null);
    await handleSaveAll(newSlides);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setSlides(newSlides);
    await handleSaveAll(newSlides);
  };

  return (
    <div className="space-y-8 animate-in fade-in">

      {/* 1. Page Slider Manager Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-10">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dynamic Page Sliders</h2>
            <p className="text-gray-500 text-sm mt-1">Configure auto-swiping sliders for every main page on your website.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 shadow-sm"
            >
              {PAGES_CONFIG.map(p => (
                <option key={p.key} value={p.key}>{p.icon} {p.label}</option>
              ))}
            </select>

            <button
              onClick={openNewSlideModal}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-primary-500/20 whitespace-nowrap"
            >
              ➕ Add New Slide
            </button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse bg-gray-50 rounded-3xl p-8 border border-gray-100 h-64 flex items-center justify-center">
            <span className="text-gray-400 font-bold">Loading {selectedPage} slides...</span>
          </div>
        ) : slides.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-12 border border-gray-100 text-center shadow-inner">
            <div className="text-5xl mb-4">🖼️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Slides Yet</h3>
            <p className="text-gray-500 mb-6 text-sm">Add a banner slide to the {selectedPage} page hero section.</p>
            <button onClick={openNewSlideModal} className="bg-primary-100 text-primary-700 hover:bg-primary-200 font-bold px-6 py-2.5 rounded-xl transition-colors">
              Create First Slide
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide, index) => (
              <div key={index} className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-shadow group flex flex-col">
                <div className="relative h-48 bg-slate-900 group-hover:scale-[1.02] transition-transform duration-500">
                  {slide.imageUrl ? (
                    <img src={getImageUrl(slide.imageUrl)} alt="Slide" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-primary-600 to-indigo-800 opacity-80" />
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold rounded-lg text-slate-800 shadow-sm">
                    Slide {index + 1}
                  </div>

                  {/* Action overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button onClick={() => openEditModal(index)} className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center hover:scale-110 shadow-lg" title="Edit">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(index)} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 shadow-lg" title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  {slide.badge && <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">{slide.badge}</div>}
                  <h3 className="font-extrabold text-gray-900 text-lg mb-2 line-clamp-2">{slide.heading || 'Untitled'}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 flex-1">{slide.subheading}</p>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400">
                    <div className="flex gap-2">
                      <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className={`p-1.5 rounded-lg border ${index === 0 ? 'border-gray-100 text-gray-200' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>↑</button>
                      <button onClick={() => handleMove(index, 'down')} disabled={index === slides.length - 1} className={`p-1.5 rounded-lg border ${index === slides.length - 1 ? 'border-gray-100 text-gray-200' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>↓</button>
                    </div>
                    <span>Reorder</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Global Statistics Section */}
      {selectedPage === 'home' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">📈 Global Statistics Counters</h2>
            <p className="text-gray-500 text-sm mt-1">These numbers are displayed prominently across the site's statistic banners.</p>
          </div>
          <form onSubmit={handleSaveStats}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS_FIELDS.map((field) => (
                <div key={field.key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">{field.label}</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm transition-shadow"
                    placeholder={field.placeholder}
                    value={statsForm[field.key] || ''}
                    onChange={(e) => setStatsForm({ ...statsForm, [field.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={savingStats}
                className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-md transition-all ${savingStats ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-primary-500/30'
                  }`}
              >
                {savingStats ? 'Saving...' : 'Save Statistics'}
              </button>
              {savedStats && (
                <div className="animate-in fade-in slide-in-from-left-4 text-emerald-600 font-bold flex items-center gap-2">
                  <span className="bg-emerald-100 p-1 rounded-full text-xs">✓</span> Saved
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingSlide(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scaleUp">

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editIndex !== null ? 'Edit Slide' : 'Create New Slide'}</h2>
                <p className="text-xs text-gray-500 mt-1">Configure the visual and textual content for this carousel item.</p>
              </div>
              <button onClick={() => setEditingSlide(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* Image Section */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Background Image
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />

                  <div
                    className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary-400 group bg-gray-50 flex items-center justify-center"
                  >
                    {editingSlide.imageUrl ? (
                      <>
                        <img src={getImageUrl(editingSlide.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-sm font-bold gap-3 z-20">
                          {uploading ? 'Uploading...' : (
                            <>
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-xl text-white shadow-md flex items-center gap-2">📷 Upload New</button>
                              <button type="button" onClick={openMediaGallery} className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-4 py-2 rounded-xl text-white shadow-md flex items-center gap-2">📂 From Media Gallery</button>
                            </>
                          )}
                        </div>
                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => setEditingSlide({ ...editingSlide, imageUrl: '' })}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-30"
                          title="Remove Image"
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center">
                        {uploading ? (
                          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        ) : (
                          <div className="text-4xl mb-4">🖼️</div>
                        )}
                        <p className="text-sm font-bold text-gray-600 mb-4">{uploading ? 'Uploading...' : 'No image selected'}</p>

                        {!uploading && (
                          <div className="flex flex-col gap-2 w-full max-w-[200px]">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                              Upload New
                            </button>
                            <button type="button" onClick={openMediaGallery} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                              Browse Media Gallery
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-4">1920x1080 recommended</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed bg-primary-50 p-3 rounded-xl border border-primary-100">
                    <strong>Tip:</strong> Use high-quality, wide-aspect ratio images. A dark overlay will automatically be applied to ensure text readability.
                  </p>
                </div>

                {/* Content Section */}
                <div className="lg:col-span-3 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPage === 'home' && (
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Banner Background Color</label>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200 shrink-0">
                            <input
                              type="color"
                              className="w-full h-full cursor-pointer border-0 p-0 transform scale-150"
                              value={editingSlide.bgColor || '#fecb00'}
                              onChange={(e) => setEditingSlide({ ...editingSlide, bgColor: e.target.value })}
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white uppercase font-mono"
                              value={editingSlide.bgColor || '#fecb00'}
                              onChange={(e) => setEditingSlide({ ...editingSlide, bgColor: e.target.value })}
                              placeholder="#fecb00"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">Changes the background color of the slanted text area (defaults to yellow).</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-span-2 mt-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Small Badge / Tagline</label>
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white"
                        value={editingSlide.badge || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                        placeholder="e.g. Excellence in Education"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Main Heading</label>
                      <textarea
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white h-20 resize-none"
                        value={editingSlide.heading || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, heading: e.target.value })}
                        placeholder="e.g. Welcome to Our College"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Subheading / Description</label>
                      <textarea
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50 hover:bg-white h-24 resize-none"
                        value={editingSlide.subheading || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, subheading: e.target.value })}
                        placeholder="e.g. A premier institution of higher learning..."
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Call to Action Buttons</h4>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Primary CTA */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-primary-600 uppercase">Primary Button</div>
                        <input
                          type="text"
                          placeholder="Button Label"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          value={editingSlide.primaryCta?.label || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, primaryCta: { ...editingSlide.primaryCta, label: e.target.value } })}
                        />
                        <input
                          type="text"
                          placeholder="URL / Link (e.g. /admissions)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          value={editingSlide.primaryCta?.href || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, primaryCta: { ...editingSlide.primaryCta, href: e.target.value } })}
                        />
                      </div>

                      {/* Secondary CTA */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-gray-500 uppercase">Secondary Button</div>
                        <input
                          type="text"
                          placeholder="Button Label"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          value={editingSlide.secondaryCta?.label || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, secondaryCta: { ...editingSlide.secondaryCta, label: e.target.value } })}
                        />
                        <input
                          type="text"
                          placeholder="URL / Link (e.g. /courses)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          value={editingSlide.secondaryCta?.href || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, secondaryCta: { ...editingSlide.secondaryCta, href: e.target.value } })}
                        />
                      </div>
                    </div>
                  </div>


                  {selectedPage === 'home' && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                      <h4 className="text-sm font-bold text-gray-800">Logos (e.g., Accreditations, Partners)</h4>
                      <p className="text-xs text-gray-500">These will appear as small icons at the top right of the banner.</p>
                      <div className="flex flex-wrap gap-3">
                        {editingSlide.logos?.map((logoUrl: string, i: number) => (
                          <div key={i} className="relative group w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center p-1.5">
                            <img src={getImageUrl(logoUrl)} alt="Logo" className="max-w-full max-h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                const newLogos = [...editingSlide.logos];
                                newLogos.splice(i, 1);
                                setEditingSlide({ ...editingSlide, logos: newLogos });
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 shadow-md transition-all z-10"
                              title="Remove Logo"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <label className="w-14 h-14 border-2 border-dashed border-gray-300 hover:border-primary-500 rounded-xl flex items-center justify-center cursor-pointer text-gray-400 hover:text-primary-500 transition-colors bg-white shadow-sm hover:shadow-md">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const formData = new FormData();
                                formData.append('file', file);
                                const res: any = await mediaApi.upload(formData);
                                if (res?.data?.path || res?.data?.url) {
                                  const newLogos = [...(editingSlide.logos || []), res.data.path || res.data.url];
                                  setEditingSlide({ ...editingSlide, logos: newLogos });
                                }
                              } catch (err) {
                                showToast('Upload Failed', 'Failed to upload logo.', 'error');
                              }
                            }}
                          />
                          <span className="text-xl font-bold">+</span>
                        </label>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl">
              <button onClick={() => setEditingSlide(null)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-2.5 rounded-xl shadow-md disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving...' : 'Save Slide'}
              </button>
            </div>
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
                <p className="text-xs text-gray-500 mt-1">Select an image to use for your slide background.</p>
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
                        setEditingSlide({ ...editingSlide, imageUrl: item.fileUrl });
                        setShowMediaGallery(false);
                      }}
                      className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-500 transition-all flex flex-col h-40"
                    >
                      <div className="flex-1 bg-gray-100 overflow-hidden relative">
                        <img src={getImageUrl(item.fileUrl)} alt={item.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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

      {toast && toast.visible && (
        <div className="fixed top-6 right-6 z-50 animate-bounce flex items-center gap-3 bg-slate-900 border border-slate-850 text-white px-6 py-4.5 rounded-2xl shadow-2xl transition-all duration-300">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
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

      {/* Custom Confirm Dialog Modal */}
      {confirmDialog && confirmDialog.visible && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmDialog(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col animate-scaleUp p-6 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${confirmDialog.type === 'danger' ? 'bg-red-100 text-red-500' :
                confirmDialog.type === 'warning' ? 'bg-yellow-100 text-yellow-500' :
                  'bg-blue-100 text-blue-500'
              }`}>
              <span className="text-3xl">
                {confirmDialog.type === 'danger' ? '🗑️' : confirmDialog.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl shadow-md transition-all ${confirmDialog.type === 'danger' ? 'bg-red-500 hover:bg-red-600' :
                    confirmDialog.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                      'bg-primary-600 hover:bg-primary-700'
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
