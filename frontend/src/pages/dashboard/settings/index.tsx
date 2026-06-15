import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { siteSettingsApi, authApi, mediaApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';
import { getImageUrl } from '@utils/getImageUrl';


const SETTINGS_FIELDS = [
  { key: 'logo', label: 'College Logo', type: 'image', placeholder: '' },
  { key: 'favicon', label: 'Favicon / App Icon', type: 'image', placeholder: '' },
  { key: 'college_name', label: 'College Name', type: 'text', placeholder: 'e.g. ABC College' },
  { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. Excellence in Education' },
  { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Full postal address' },
  { key: 'about', label: 'About Us (About Page Content)', type: 'textarea', placeholder: 'Write about the college history, vision, mission...' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'info@college.edu' },
  { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 XXXXX XXXXX' },

  // Settings now only contains Global Info
  { key: 'copyright', label: 'Footer Copyright Text', type: 'text', placeholder: '© 2025 College. All rights reserved.' },
  { key: 'theme_color', label: 'Primary Theme Color', type: 'color', placeholder: '#2563eb' },
  { key: 'theme_color_secondary', label: 'Secondary Theme Color', type: 'color', placeholder: '#a855f7' },
  { key: 'theme_color_accent', label: 'Accent Theme Color', type: 'color', placeholder: '#f43f5e' },
  { key: 'facebook_url', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/...' },
  { key: 'twitter_url', label: 'Twitter / X URL', type: 'url', placeholder: 'https://twitter.com/...' },
  { key: 'instagram_url', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/...' },
];


export default function AdminSettingsPage() {
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  
  // Site settings state
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  // Toast Notification state
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        const role = user?.role;
        const canRead = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.settings?.includes('read'));
        if (!canRead) router.push('/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const role = user?.role;
  const canWrite = role === 'super_admin' || (role === 'admin' && user?.permissions?.modules?.settings?.includes('write'));

  const load = useCallback(async () => {
    try {
      const res: any = await siteSettingsApi.getMap();
      const data = res?.data || {};
      const initial: Record<string, string> = {};
      SETTINGS_FIELDS.forEach((f) => {
        initial[f.key] = data[f.key] || '';
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

  const handleImageUpload = async (key: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please select a valid image file', 'error');
      return;
    }
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
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Page title and description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Settings</h1>
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
              <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-gray-800">Global Website Configuration</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Parameters stored dynamically, powering live pages across all routes.</p>
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
                  {SETTINGS_FIELDS.map((field) => (
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
                              if (file) handleImageUpload(field.key, file);
                              e.target.value = '';
                            }}
                          />
                          {form[field.key] ? (
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 group w-32 h-32 flex items-center justify-center bg-gray-50 p-2">
                              <img
                                src={getImageUrl(form[field.key])}
                                alt={field.label}
                                className="max-w-full max-h-full object-contain"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => fileInputRefs.current[field.key]?.click()}
                                  disabled={uploading[field.key]}
                                  className="bg-white text-gray-800 text-[10px] font-bold px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                >
                                  {uploading[field.key] ? '...' : 'Replace'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setForm((prev) => ({ ...prev, [field.key]: '' }))}
                                  className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-red-600 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all flex flex-col items-center justify-center min-h-[128px]"
                              onClick={() => fileInputRefs.current[field.key]?.click()}
                            >
                              {uploading[field.key] ? (
                                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <div className="text-2xl mb-1">🖼️</div>
                                  <p className="text-xs font-semibold text-gray-600">Upload {field.label}</p>
                                </>
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
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}>
            {toast.type === 'success' ? '✓' : '✗'}
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">
              {toast.title}
            </div>
            <div className={`text-xs mt-0.5 ${
              toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
