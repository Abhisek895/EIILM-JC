import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import FadeIn from '@components/FadeIn';
import { siteSettingsApi, authApi } from '@api/endpoints';
import { getImageUrl } from '@utils/getImageUrl';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res: any = await siteSettingsApi.getMap();
        if (res?.data?.logo) {
          setLogoUrl(getImageUrl(res.data.logo));
        }
      } catch (err) {
        console.error('Failed to fetch site settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res: any = await authApi.requestForgotPasswordOtp(email);
      setSuccessMsg(res?.data?.message || 'OTP sent successfully.');
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res: any = await authApi.verifyForgotPasswordOtp(email, otpCode, newPassword);
      setSuccessMsg(res?.data?.message || 'Password reset successfully!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex lg:flex-row-reverse">
      {/* Right Panel: Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900 relative overflow-hidden flex-col justify-between p-12 lg:py-16 lg:pr-16 lg:pl-20 xl:pl-28 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="College Logo" className="h-14 w-auto object-contain bg-white p-2 rounded-xl shadow-sm" />
          ) : (
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <GraduationCap size={32} className="text-white" />
            </div>
          )}
          <span className="text-2xl font-bold font-display tracking-tight">EIILM Kolkata Jalpaiguri Campus</span>
        </div>

        <FadeIn className="relative z-10 max-w-xl mt-auto mb-auto">
          <h1 className="text-5xl font-display font-bold leading-tight mb-6">
            Account <br /><span className="text-primary-200">Recovery</span>
          </h1>
          <p className="text-lg text-primary-100/90 leading-relaxed">
            Don't worry, it happens to the best of us. Reset your password securely and get back to your courses, schedules, and important notices.
          </p>
        </FadeIn>

        <div className="relative z-10 flex items-center gap-4 text-sm text-primary-200 font-medium">
          <span>&copy; {new Date().getFullYear()} EIILM Kolkata Jalpaiguri Campus</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
          <span>Enterprise Resource Planning</span>
        </div>
      </div>

      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:justify-center">
        <div className="w-full max-w-[480px]">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            {logoUrl ? (
              <img src={logoUrl} alt="College Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="bg-primary-600 p-2 rounded-xl text-white">
                <GraduationCap size={28} />
              </div>
            )}
            <span className="text-3xl font-bold font-display text-gray-900 tracking-tight">EIILM Kolkata Jalpaiguri Campus</span>
          </div>

          <FadeIn>
            <div className="mb-10 text-center lg:text-left">
              <Link href="/auth/login" className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Login
              </Link>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">Forgot Password?</h2>
              <p className="text-gray-500 text-lg">
                {step === 1 ? "Enter your email address and we'll send you a verification code to reset your password." : "Enter the verification code sent to your email and your new password."}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="mt-0.5">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-r-lg mb-8 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="mt-0.5">
                  <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{successMsg}</p>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow shadow-sm"
                      placeholder="name@eiilm.edu"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Code <ArrowRight size={18} className="ml-1" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="otpCode" className="block text-sm font-semibold text-gray-700">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <KeyRound size={18} />
                    </div>
                    <input
                      id="otpCode"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow shadow-sm tracking-widest text-lg font-mono"
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow shadow-sm"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password <ArrowRight size={18} className="ml-1" />
                    </>
                  )}
                </button>
                
                <div className="text-center mt-4">
                   <button 
                     type="button" 
                     onClick={() => setStep(1)} 
                     className="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
                   >
                     Didn't receive code? Try again
                   </button>
                </div>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
