import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@layouts/DashboardLayout';
import { siteSettingsApi, authApi } from '@api/endpoints';
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
  const { isAuthenticated, isHydrated, user } = useAuth();
  const router = useRouter();
  
  // Tab State: 'site' | 'security'
  const [activeTab, setActiveTab] = useState<'site' | 'security'>('site');
  
  // Site settings state
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password Security state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingPass, setVerifyingPass] = useState(false);
  
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

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

  // Handle OTP cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

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

  // Password Strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak ⚠️', color: 'bg-rose-500 w-1/3' };
    if (score <= 4) return { score, label: 'Medium ⚡', color: 'bg-amber-500 w-2/3' };
    return { score, label: 'Strong 💪', color: 'bg-emerald-500 w-full' };
  };

  const strength = getPasswordStrength(newPassword);

  // Trigger Request OTP
  const handleRequestOtp = async () => {
    if (otpCooldown > 0) return;
    setRequestingOtp(true);
    setPassError('');
    try {
      await authApi.requestPasswordChangeOtp();
      setOtpSent(true);
      setOtpCooldown(60);
      showToast('Security Code Sent', 'Verification OTP sent successfully to your administrator email!');
    } catch (err: any) {
      setPassError(err?.response?.data?.message || 'Failed to trigger verification OTP.');
      showToast('OTP Request Failed', 'Failed to send verification OTP', 'error');
    } finally {
      setRequestingOtp(false);
    }
  };

  // Verify and Mutate Password
  const handleVerifyAndPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!otpCode || otpCode.length !== 6) {
      setPassError('Please enter a valid 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Confirm password does not match new password.');
      return;
    }

    setVerifyingPass(true);
    try {
      await authApi.verifyPasswordChangeOtp(otpCode, newPassword);
      showToast('Password Changed', '✓ Password updated successfully!');
      
      // Reset form states
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
      setOtpCooldown(0);
    } catch (err: any) {
      setPassError(err?.response?.data?.message || 'Failed to change password. Double check your OTP code.');
      showToast('Password Change Failed', 'Failed to update password', 'error');
    } finally {
      setVerifyingPass(false);
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
              Configure system parameters, homepage assets, and administrator authentication security.
            </p>
          </div>
          
          {/* Glowing Tab Switches */}
          <div className="flex bg-gray-200/80 backdrop-blur-md p-1 rounded-2xl border border-gray-300/40 w-fit">
            <button
              onClick={() => setActiveTab('site')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 ${
                activeTab === 'site'
                  ? 'bg-white text-gray-900 shadow-md transform scale-102 border border-gray-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>⚙️</span> Site Settings
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 ${
                activeTab === 'security'
                  ? 'bg-white text-gray-900 shadow-md transform scale-102 border border-gray-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>🛡️</span> Security Hub
            </button>
          </div>
        </div>

        {/* Tab 1: Site settings form */}
        {activeTab === 'site' && (
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
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-28 resize-none bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-inner"
                          value={form[field.key] || ''}
                          placeholder={field.placeholder}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        />
                      ) : (
                        <input
                          type={field.type}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-inner"
                          value={form[field.key] || ''}
                          placeholder={field.placeholder}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold text-sm disabled:opacity-50 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
                  >
                    {saving ? 'Saving changes...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Security settings panel */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info panel */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl relative overflow-hidden border border-slate-700/50">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500 rounded-full filter blur-3xl opacity-10" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500 rounded-full filter blur-3xl opacity-10" />

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-inner">
                🛡️
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight">Security Standards</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Administrator operations require heightened authentication guardrails. Changing your credential requires active OTP validation delivered to your confirmed security address.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-700/50 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">✓</span>
                  <span>SMTP Delivery Enabled</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">✓</span>
                  <span>128-bit Cryptographic OTP</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">✓</span>
                  <span>Auto-Invalidation on Success</span>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/30 rounded-2xl p-4 text-xs space-y-2 mt-4">
                <div className="text-slate-400 font-bold uppercase tracking-wider">Active Admin User</div>
                <div className="font-extrabold text-sm text-slate-200">{user?.name || 'Administrator'}</div>
                <div className="text-slate-400 font-mono text-[11px] truncate">{user?.email || 'sarkarabhisek50@gmail.com'}</div>
              </div>
            </div>

            {/* OTP Form panel */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-800">Credential Update Panel</h2>
                <p className="text-xs text-gray-400 mt-0.5">Securely mutate your administrative password using cryptographic OTP validation.</p>
              </div>

              {passError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-shake">
                  <span>❌</span> {passError}
                </div>
              )}

              {!otpSent ? (
                /* Step 1: Request OTP */
                <div className="py-8 text-center max-w-md mx-auto space-y-5">
                  <div className="text-5xl">🔑</div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-gray-800">Trigger Identity Authentication</h4>
                    <p className="text-xs text-gray-500 leading-relaxed px-4">
                      A unique 6-digit verification code will be sent to <strong>{user?.email || 'sarkarabhisek50@gmail.com'}</strong>. Once received, enter the code alongside your new password to verify and apply mutations.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={requestingOtp || otpCooldown > 0}
                      className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all disabled:opacity-50 shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                    >
                      {requestingOtp ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Secure Code...</span>
                        </>
                      ) : otpCooldown > 0 ? (
                        <span>Resend OTP in ({otpCooldown}s)</span>
                      ) : (
                        <span>🔒 Send Verification OTP</span>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Input OTP & Password */
                <form onSubmit={handleVerifyAndPasswordChange} className="space-y-5">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📧</span>
                      <span>OTP Code sent to your inbox. Expiry in 10 minutes.</span>
                    </div>
                    {otpCooldown > 0 ? (
                      <span className="font-bold whitespace-nowrap bg-blue-100 px-3 py-1 rounded-xl text-blue-800">
                        Cooldown: {otpCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-blue-600 hover:text-blue-800 font-extrabold underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  {/* OTP input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      6-Digit Verification OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-mono font-extrabold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all shadow-inner"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>

                  {/* Password fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all shadow-inner"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all shadow-inner"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Strength Visualizer */}
                  {newPassword && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Password Complexity</span>
                        <span className="font-extrabold text-slate-800">{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${strength.color}`} />
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                        Use 8+ characters, including at least one uppercase letter, one number, and one symbol character for superior credential security.
                      </p>
                    </div>
                  )}

                  {/* Submit / Cancel buttons */}
                  <div className="pt-4 border-t border-gray-50 flex flex-col md:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={verifyingPass}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold text-sm disabled:opacity-50 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {verifyingPass ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying & Saving...</span>
                        </>
                      ) : (
                        <span>✓ Update Password</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPassError('');
                      }}
                      className="border border-gray-200 hover:bg-gray-50 text-gray-600 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slide-in glowing Success / Error Toast notification pop-up */}
      {toast && toast.visible && (
        <div className="fixed top-6 right-6 z-50 animate-bounce flex items-center gap-3 bg-slate-900 border border-slate-850 text-white px-6 py-4.5 rounded-2xl shadow-2xl transition-all duration-300">
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
