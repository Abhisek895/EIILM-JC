import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { siteSettingsApi } from '@api/endpoints';
import { useAuth } from '@hooks/useAuth';

const SETTINGS_FIELDS = [
  { key: 'college_name', label: 'College Name', type: 'text', placeholder: 'e.g. EIILM College' },
  { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'e.g. Excellence in Education' },
  { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Full postal address' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'info@college.edu' },
  { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 XXXXX XXXXX' },
  { key: 'hero_heading', label: 'Homepage Hero Heading', type: 'text', placeholder: 'Main heading on homepage' },
  { key: 'hero_subheading', label: 'Homepage Hero Subheading', type: 'textarea', placeholder: 'Subheading text' },
  { key: 'stat_years', label: 'Years of Excellence (stat)', type: 'text', placeholder: '25+' },
  { key: 'stat_students', label: 'Students Enrolled (stat)', type: 'text', placeholder: '5000+' },
  { key: 'stat_faculty', label: 'Faculty Members (stat)', type: 'text', placeholder: '200+' },
  { key: 'stat_courses', label: 'Courses Offered (stat)', type: 'text', placeholder: '50+' },
  { key: 'copyright', label: 'Footer Copyright Text', type: 'text', placeholder: '© 2025 College. All rights reserved.' },
  { key: 'facebook_url', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/...' },
  { key: 'twitter_url', label: 'Twitter / X URL', type: 'url', placeholder: 'https://twitter.com/...' },
  { key: 'instagram_url', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/...' },
];

export default function AdminSettingsPage() {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push('/auth/login');
  }, [isHydrated, isAuthenticated, router]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const settings = Object.entries(form).map(([key, value]) => ({ key, value }));
      await siteSettingsApi.bulkUpdate(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Changes here reflect immediately on the public website (navigation, footer, homepage).
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {saved && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-semibold">
                ✓ Settings saved successfully!
              </div>
            )}

            {SETTINGS_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    value={form[field.key] || ''}
                    placeholder={field.placeholder}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                ) : (
                  <input
                    type={field.type}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form[field.key] || ''}
                    placeholder={field.placeholder}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  />
                )}
              </div>
            ))}

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
