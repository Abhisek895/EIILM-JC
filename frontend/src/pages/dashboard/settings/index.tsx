import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { siteSettingsApi, authApi, mediaApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';
import { getImageUrl } from '@utils/getImageUrl';
import ImageCropperModal from '@components/admin/ImageCropperModal';


const GLOBAL_SETTINGS_FIELDS = [
  { key: 'logo', label: 'College Logo', type: 'image', placeholder: '' },
  { key: 'favicon', label: 'Favicon / App Icon', type: 'image', placeholder: '' },
  { key: 'college_name', label: 'College Name', type: 'text', placeholder: 'e.g. ABC College' },
  { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. Excellence in Education' },
  { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Full postal address' },
  { key: 'about', label: 'About Us (About Page Content)', type: 'textarea', placeholder: 'Write about the college history, vision, mission...' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'info@college.edu' },
  { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 XXXXX XXXXX' },
  { key: 'copyright', label: 'Footer Copyright Text', type: 'text', placeholder: '© 2025 College. All rights reserved.' },
  { key: 'theme_color', label: 'Primary Theme Color', type: 'color', placeholder: '#2563eb' },
  { key: 'theme_color_secondary', label: 'Secondary Theme Color', type: 'color', placeholder: '#a855f7' },
  { key: 'theme_color_accent', label: 'Accent Theme Color', type: 'color', placeholder: '#f43f5e' },
  { key: 'facebook_url', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/...' },
  { key: 'twitter_url', label: 'Twitter / X URL', type: 'url', placeholder: 'https://twitter.com/...' },
  { key: 'instagram_url', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/...' },
];

const MODAL_SETTINGS_FIELDS = [
  { key: 'modal_enabled', label: 'Enable Modal Banner', type: 'toggle', placeholder: '' },
  { key: 'modal_banner_image', label: 'Banner Image', type: 'image', placeholder: '' },
  { key: 'modal_initial_delay', label: 'Show After (Seconds)', type: 'number', placeholder: '5' },
  { key: 'modal_repeat_interval', label: 'Show Again After Every (Seconds)', type: 'number', placeholder: '86400' },
  { key: 'modal_start_date', label: 'Start Date (Optional)', type: 'date', placeholder: '' },
  { key: 'modal_end_date', label: 'End Date (Optional)', type: 'date', placeholder: '' },
];

const ABOUT_SETTINGS_FIELDS = [
  { key: 'about_features', label: '4 Image Grid Blocks (JSON format)', type: 'textarea', placeholder: '[\n  { "label": "Academic Excellence", "icon": "GraduationCap", "bg": "bg-primary-600" }\n]' },
  { key: 'about_story_subtitle', label: 'Story Subtitle (e.g. Our Story)', type: 'text', placeholder: 'Our Story' },
  { key: 'about_story_heading', label: 'Story Heading', type: 'text', placeholder: 'Building Tomorrow\'s Leaders Since Inception' },
  { key: 'about_mission', label: 'Mission Statement', type: 'textarea', placeholder: 'To provide quality...' },
  { key: 'about_vision', label: 'Vision Statement', type: 'textarea', placeholder: 'To be a nationally recognized...' },
  { key: 'about_values', label: 'Core Values Array (JSON format)', type: 'textarea', placeholder: '[\n  { "title": "Excellence", "desc": "...", "color": "bg-amber-500", "icon": "Star" }\n]' },
  { key: 'about_timeline', label: 'Timeline Array (JSON format)', type: 'textarea', placeholder: '[\n  { "year": "Est.", "title": "Foundation", "desc": "...", "side": "left" }\n]' },
  { key: 'about_director_quote', label: 'Director\'s Quote', type: 'textarea', placeholder: 'Education is not merely...' },
  { key: 'about_director_name', label: 'Director\'s Name', type: 'text', placeholder: 'The Director' },
  { key: 'about_accreditations', label: 'Accreditations', type: 'string_array', placeholder: 'e.g. NAAC Accredited' },
];

const CONTACT_SETTINGS_FIELDS = [
  { key: 'contact_office_hours', label: 'Office Hours', type: 'textarea', placeholder: 'Mon-Fri 9AM-5PM...' },
  { key: 'contact_map_url', label: 'Google Maps Embed URL', type: 'url', placeholder: 'https://www.google.com/maps/embed?...' },
  { key: 'contact_faqs', label: 'FAQs Array (JSON format)', type: 'textarea', placeholder: '[\n  { "q": "How to apply?", "a": "Online..." }\n]' },
];

const HOME_SETTINGS_FIELDS = [
  { key: 'home_hero_title', label: 'Hero Title', type: 'text', placeholder: 'Find the right path in minutes' },
  { key: 'home_hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Most first-time visitors want three answers quickly...' },
  { key: 'home_actions', label: 'Quick Action Cards (JSON format)', type: 'textarea', placeholder: '[\n  { "title": "Apply for Admission", "desc": "...", "href": "/admissions", "icon": "Send", "chip": "Start here" }\n]' },
  { key: 'home_strengths_title', label: 'Strengths Title', type: 'text', placeholder: 'Why students choose us' },
  { key: 'home_strengths_subtitle', label: 'Strengths Subtitle', type: 'textarea', placeholder: 'A good college choice feels clear, supportive, and career-focused...' },
  { key: 'home_features', label: 'Strengths Cards (JSON format)', type: 'textarea', placeholder: '[\n  { "title": "Career-ready learning", "desc": "...", "icon": "Briefcase", "gradient": "from-emerald-500 to-teal-600" }\n]' },
];


const StringArrayField = ({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder?: string }) => {
  const [items, setItems] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && value !== undefined) {
      setItems(value ? value.split(',').map(s => s.trim()).filter(Boolean) : []);
      setInitialized(true);
    }
  }, [value, initialized]);

  useEffect(() => {
    if (initialized) {
      onChange(items.join(', '));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, initialized]);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-inner"
            value={item}
            onChange={(e) => {
              const newItems = [...items];
              newItems[idx] = e.target.value.replace(/,/g, '');
              setItems(newItems);
            }}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => setItems(items.filter((_, i) => i !== idx))}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems([...items, ''])}
        className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-colors w-fit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Item
      </button>
    </div>
  );
};

export default function AdminSettingsPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();

  // Site settings state
  const [activeTab, setActiveTab] = useState<'global' | 'modal' | 'home' | 'about' | 'contact'>('global');
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // Toast Notification state
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Image Cropper State
  const [cropperState, setCropperState] = useState<{ isOpen: boolean; imageSrc: string | null; file: File | null; field: string | null }>({
    isOpen: false,
    imageSrc: null,
    file: null,
    field: null,
  });

  // Media Gallery Modal State
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [galleryField, setGalleryField] = useState<string | null>(null);

  const openMediaGallery = async (fieldKey: string) => {
    setGalleryField(fieldKey);
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
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const role = user?.role;
        const canRead = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.settings?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || ((role === 'admin' || role === 'faculty') && user?.permissions?.modules?.settings?.includes('write'));

  const load = useCallback(async () => {
    try {
      const res: any = await siteSettingsApi.getMap();
      const data = res?.data || {};
      const initial: Record<string, string> = {};
      [...GLOBAL_SETTINGS_FIELDS, ...MODAL_SETTINGS_FIELDS, ...HOME_SETTINGS_FIELDS, ...ABOUT_SETTINGS_FIELDS, ...CONTACT_SETTINGS_FIELDS].forEach((f) => {
        let val = data[f.key] || '';

        // Auto-fill JSON defaults if blank so user doesn't have to start from scratch
        if (!val && f.key === 'about_features') {
          val = '[\n  { "label": "Academic Excellence", "icon": "GraduationCap", "bg": "bg-primary-600" },\n  { "label": "Global Exposure", "icon": "Globe", "bg": "bg-indigo-600" },\n  { "label": "Accredited Programs", "icon": "Shield", "bg": "bg-violet-600" },\n  { "label": "Innovation Driven", "icon": "Lightbulb", "bg": "bg-sky-600" }\n]';
        } else if (!val && f.key === 'about_timeline') {
          val = '[\n  { "year": "Est.", "title": "Foundation", "desc": "The college was established...", "side": "left" }\n]';
        } else if (!val && f.key === 'about_values') {
          val = '[\n  { "title": "Excellence", "desc": "We hold ourselves to...", "color": "bg-amber-500", "icon": "Star" }\n]';
        } else if (!val && f.key === 'home_actions') {
          val = '[\n  { "title": "Apply for Admission", "desc": "Submit an inquiry and get guided support from the admissions team.", "href": "/admissions", "icon": "Send", "chip": "Start here" },\n  { "title": "Explore Courses", "desc": "Compare duration, eligibility, and fees before you decide.", "href": "/courses", "icon": "BookOpen", "chip": "Compare options" },\n  { "title": "Check Placements", "desc": "See the career outcomes and employer support students care about most.", "href": "/placements", "icon": "Briefcase", "chip": "Career proof" },\n  { "title": "Talk to a Counselor", "desc": "Ask about scholarships, documents, hostel, or campus life.", "href": "/contact", "icon": "MessageSquare", "chip": "Get answers" }\n]';
        } else if (!val && f.key === 'home_features') {
          val = '[\n  { "title": "Career-ready learning", "desc": "Programs are presented clearly so students can quickly understand the path from classroom to career.", "icon": "Briefcase", "gradient": "from-emerald-500 to-teal-600" },\n  { "title": "Guided admissions", "desc": "Fast response, clear steps, and a counselor-led process so visitors never feel stuck.", "icon": "Zap", "gradient": "from-primary-500 to-primary-700" },\n  { "title": "Experienced faculty", "desc": "Students can trust the value of learning from mentors who make complex topics feel manageable.", "icon": "GraduationCap", "gradient": "from-sky-500 to-blue-600" },\n  { "title": "Practical labs and projects", "desc": "The site should communicate hands-on learning, not just theory, because students want outcomes.", "icon": "ClipboardCheck", "gradient": "from-violet-500 to-purple-600" },\n  { "title": "Campus life and support", "desc": "Hostel, clubs, events, and student services help first-time visitors picture themselves here.", "icon": "Building2", "gradient": "from-amber-500 to-orange-600" },\n  { "title": "Scholarship and growth support", "desc": "Admissions guidance should reduce anxiety and make the next step feel simple and achievable.", "icon": "Sparkles", "gradient": "from-rose-500 to-pink-600" }\n]';
        } else if (!val && f.key === 'contact_faqs') {
          val = '[\n  { "q": "How can I apply for admission?", "a": "You can apply online..." }\n]';
        } else if (!val) {
          // Pre-fill plain text defaults from placeholder if empty
          val = f.placeholder || '';
        }

        initial[f.key] = val;
      });
      setForm(initial);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const settings = Object.entries(form).map(([key, value]) => ({ key, value }));
      await siteSettingsApi.bulkUpdate(settings);
      setSaved(true);
      showToast('Site Settings Saved', 'Site settings updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save settings');
      showToast('Settings Update Failed', 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (key: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please select a valid image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropperState({ isOpen: true, imageSrc: reader.result?.toString() || null, file, field: key });
    });
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (file: File) => {
    const key = cropperState.field;
    setCropperState({ isOpen: false, imageSrc: null, file: null, field: null });
    if (!key) return;

    setUploading((prev) => ({ ...prev, [key]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res: any = await mediaApi.upload(formData);
      if (res?.data?.path || res?.data?.url) {
        setForm((prev) => ({ ...prev, [key]: res.data.path || res.data.url }));
        showToast('Image Uploaded', 'Remember to click Save Changes to persist.', 'success');
      }
    } catch (err) {
      showToast('Upload Failed', 'Failed to upload image.', 'error');
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page title and description */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-500 text-sm mt-1">
              Configure system parameters and homepage assets.
            </p>
          </div>
        </div>

        {/* Site settings form */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100/80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 pt-4 space-y-6">
              <div className="flex bg-gray-200/60 p-1.5 rounded-2xl w-fit font-semibold text-sm overflow-x-auto max-w-full hide-scrollbar -mt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('global')}
                  className={`px-4 lg:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'global' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  🌍 Global Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('modal')}
                  className={`px-4 lg:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'modal' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  📣 Popup Banner
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className={`px-4 lg:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'home' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  🏠 Home Page
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className={`px-4 lg:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'about' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  ℹ️ About Page
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className={`px-4 lg:px-6 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'contact' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  📞 Contact Page
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {activeTab === 'global' ? 'Global Website Configuration' : activeTab === 'modal' ? 'Global Modal Configuration' : activeTab === 'home' ? 'Home Page Configuration' : activeTab === 'about' ? 'About Page Configuration' : 'Contact Page Configuration'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeTab === 'global' ? 'Parameters stored dynamically, powering live pages across all routes.' : 'Configure the page-specific content and meta-data.'}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-2 animate-shake">
                  <span>❌</span> {error}
                </div>
              )}
              {saved && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2">
                  <span>✓</span> Site settings saved successfully!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(activeTab === 'global' ? GLOBAL_SETTINGS_FIELDS : activeTab === 'modal' ? MODAL_SETTINGS_FIELDS : activeTab === 'home' ? HOME_SETTINGS_FIELDS : activeTab === 'about' ? ABOUT_SETTINGS_FIELDS : CONTACT_SETTINGS_FIELDS).map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-inner ${field.key === 'about' ? 'h-64' : 'h-28'}`}
                        value={form[field.key] || ''}
                        placeholder={field.placeholder}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      />
                    ) : field.type === 'image' ? (
                      <div className="w-full">
                        <input
                          ref={(el) => { fileInputRefs.current[field.key] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageSelect(field.key, file);
                            e.target.value = '';
                          }}
                        />
                        {form[field.key] ? (
                          <div className="relative rounded-xl overflow-hidden border border-gray-200 group w-48 h-32 flex items-center justify-center bg-gray-50 p-2">
                            <img
                              src={getImageUrl(form[field.key])}
                              alt={field.label}
                              className="max-w-full max-h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[field.key]?.click()}
                                disabled={uploading[field.key]}
                                className="bg-white text-gray-800 text-xs font-bold px-2 py-1.5 rounded hover:bg-gray-100 transition-colors w-28"
                              >
                                {uploading[field.key] ? '...' : 'Upload New'}
                              </button>
                              <button
                                type="button"
                                onClick={() => openMediaGallery(field.key)}
                                className="bg-primary-500 text-white text-xs font-bold px-2 py-1.5 rounded hover:bg-primary-600 transition-colors w-28"
                              >
                                Gallery
                              </button>
                              <button
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, [field.key]: '' }))}
                                className="bg-red-500 text-white text-xs font-bold px-2 py-1.5 rounded hover:bg-red-600 transition-colors w-28"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center w-48 mx-auto md:mx-0 flex flex-col items-center justify-center min-h-[128px] bg-gray-50">
                            {uploading[field.key] ? (
                              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="flex flex-col gap-2 w-full px-2">
                                <button type="button" onClick={() => fileInputRefs.current[field.key]?.click()} className="w-full bg-primary-100 text-primary-700 hover:bg-primary-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                  Upload New
                                </button>
                                <button type="button" onClick={() => openMediaGallery(field.key)} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                  Browse Gallery
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : field.type === 'color' ? (
                      <div className="flex items-center gap-3 w-full border border-gray-200 rounded-xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-inner">
                        <input
                          type="color"
                          className="w-10 h-10 p-0 border-0 rounded cursor-pointer flex-shrink-0"
                          value={form[field.key] || '#2563eb'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm({ ...form, [field.key]: val });
                            if (window.applyDynamicTheme) {
                              window.applyDynamicTheme(
                                field.key === 'theme_color' ? val : form.theme_color || '#3b82f6',
                                field.key === 'theme_color_secondary' ? val : form.theme_color_secondary || '#a855f7',
                                field.key === 'theme_color_accent' ? val : form.theme_color_accent || '#f43f5e'
                              );
                            }
                          }}
                        />
                        <input
                          type="text"
                          className="flex-1 bg-transparent border-none focus:outline-none text-sm font-mono"
                          value={form[field.key] || '#2563eb'}
                          placeholder="#HEXCODE"
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm({ ...form, [field.key]: val });
                            if (window.applyDynamicTheme && /^#[0-9A-F]{6}$/i.test(val)) {
                              window.applyDynamicTheme(
                                field.key === 'theme_color' ? val : form.theme_color || '#3b82f6',
                                field.key === 'theme_color_secondary' ? val : form.theme_color_secondary || '#a855f7',
                                field.key === 'theme_color_accent' ? val : form.theme_color_accent || '#f43f5e'
                              );
                            }
                          }}
                        />
                      </div>
                    ) : field.type === 'string_array' ? (
                      <StringArrayField
                        value={form[field.key] || ''}
                        onChange={(val) => setForm((prev) => ({ ...prev, [field.key]: val }))}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'toggle' ? (
                      <div className="flex items-center mt-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, [field.key]: form[field.key] === 'true' ? 'false' : 'true' })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${form[field.key] === 'true' ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form[field.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          {form[field.key] === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-inner"
                        value={form[field.key] || ''}
                        placeholder={field.placeholder}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>

              {canWrite && (
                <div className="pt-4 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-bold text-sm disabled:opacity-50 transition-all shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 cursor-pointer"
                  >
                    {saving ? 'Saving changes...' : 'Save Settings'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Slide-in glowing Success / Error Toast notification pop-up */}
      {toast && toast.visible && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-slate-850 text-white px-6 py-4.5 rounded-2xl shadow-2xl transition-all duration-300">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}>
            {toast.type === 'success' ? '✓' : '✗'}
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">
              {toast.title}
            </div>
            <div className={`text-xs mt-0.5 ${toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
              {toast.message}
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

      <ImageCropperModal
        isOpen={cropperState.isOpen}
        imageSrc={cropperState.imageSrc}
        aspectRatio={cropperState.field === 'logo' || cropperState.field === 'favicon' ? undefined : 16 / 9}
        onClose={() => setCropperState({ isOpen: false, imageSrc: null, file: null, field: null })}
        onCropComplete={handleImageUpload}
      />
    </DashboardLayout>
  );
}
