import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { inquiryApi, courseApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import { Send, User, Mail, Phone, MapPin, BookOpen, CheckCircle2, MessageSquare } from 'lucide-react';

export default function AdmissionsContactPage() {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'admissions' | 'contact'>('admissions');

  // Admissions State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  // Contact State
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactAddress, setContactAddress] = useState<string>('');
  const [contactLoading, setContactLoading] = useState(true);
  const [contactFormStatus, setContactFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    // Check URL parameters to set initial tab and course
    if (router.isReady) {
      if (router.query.tab === 'contact') {
        setActiveTab('contact');
      } else if (router.query.course) {
        setCourseId(router.query.course as string);
        setActiveTab('admissions');
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [coursesRes, settingsRes] = await Promise.allSettled([
          courseApi.getAll(1, 100),
          siteSettingsApi.getMap()
        ]);

        if (coursesRes.status === 'fulfilled') {
          const res: any = coursesRes.value;
          setCourses(res?.data?.items || res?.data || []);
        }

        if (settingsRes.status === 'fulfilled') {
          const map: any = settingsRes.value?.data;
          setContactEmail(map?.email || '');
          setContactPhone(map?.phone || '');
          setContactAddress(map?.address || '');
        }
      } catch (err) {
        console.error('Failed to load initial data', err);
      } finally {
        setContactLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const submitAdmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('idle');
    setLoading(true);

    try {
      const response: any = await inquiryApi.create({
        fullName,
        email,
        phone,
        city,
        message,
        courseId: courseId ? Number(courseId) : undefined,
      });

      if (response.success) {
        setStatus('success');
        setStatusMessage('Inquiry submitted successfully. Our admissions team will contact you shortly.');
        setFullName('');
        setEmail('');
        setPhone('');
        setCity('');
        setMessage('');
        setCourseId('');
      } else {
        setStatus('error');
        setStatusMessage('Unable to submit inquiry. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Unable to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormStatus('submitting');
    setTimeout(() => {
      setContactFormStatus('success');
      setTimeout(() => setContactFormStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <MainLayout>
      <HeroSlider
        pageKey="admissions"
        fallbackTagline={activeTab === 'admissions' ? "Admissions Open" : "Get In Touch"}
        fallbackHeading={activeTab === 'admissions' ? "Take the First Step Towards Your Future" : "We'd Love to Hear From You"}
        fallbackSubheading={activeTab === 'admissions'
          ? "Join our community of innovators, leaders, and thinkers. Apply now for the upcoming academic session."
          : "Whether you have a question about admissions, programs, or anything else, our team is ready to answer all your questions."}
      />

      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 py-16 bg-gray-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto">

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-100 inline-flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveTab('admissions')}
                className={`px-6 sm:px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === 'admissions'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                Apply for Admission
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 sm:px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 ${activeTab === 'contact'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/30'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                General Inquiry & Contact
              </button>
            </div>
          </div>

          {/* TAB CONTENT: ADMISSIONS */}
          {activeTab === 'admissions' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-stretch">
              {/* Left Column (visually Right): Information */}
              <FadeIn className="lg:col-span-2 space-y-8 lg:order-last">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Campus Location</h2>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    Visit our state-of-the-art campus to experience our world-class infrastructure and meet our expert admissions counselors.
                  </p>

                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                    <h3 className="font-bold text-gray-900 mb-3">Why Apply Here?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500" /> UGC Recognized Degrees
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500" /> 100% Placement Assistance
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500" /> State-of-the-art Infrastructure
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-64 md:h-80 w-full relative">
                    <iframe
                      src="https://maps.google.com/maps?q=EIILM-Kolkata%2C%20Jalpaiguri%20Campus%2C%20Porapara%20Road%20Pandapara%2C%20Kalibari%20Rd%2C%20Area%2C%20Jalpaiguri%2C%20West%20Bengal%20735132&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="EIILM Jalpaiguri Campus Location"
                    ></iframe>
                  </div>
                </div>
              </FadeIn>

              {/* Right Column (visually Left): Admission Form */}
              <FadeIn className="lg:col-span-3 lg:order-first h-full" delay={0.2}>
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 md:p-10 border border-gray-100 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-bl from-primary-100 to-indigo-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-6 relative z-10">Application Form</h2>

                  {status !== 'idle' && (
                    <div className={`p-4 rounded-xl mb-6 relative z-10 font-medium text-sm flex items-start gap-3 ${status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {status === 'success' ? <CheckCircle2 className="flex-shrink-0 mt-0.5" size={18} /> : null}
                      {statusMessage}
                    </div>
                  )}

                  <form onSubmit={submitAdmission} className="space-y-5 relative z-10 flex flex-col flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User size={14} /> Full Name *</label>
                        <input type="text" required placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Mail size={14} /> Email Address *</label>
                        <input type="email" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Phone size={14} /> Phone Number *</label>
                        <input type="tel" required placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MapPin size={14} /> City *</label>
                        <input type="text" required placeholder="Mumbai" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><BookOpen size={14} /> Interested Course</label>
                      <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm text-gray-800 appearance-none cursor-pointer">
                        <option value="">Select a Course (Optional)</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.courseName} {c.courseType ? `(${c.courseType})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 flex-grow flex flex-col">
                      <label className="text-sm font-semibold text-gray-700">Any Questions?</label>
                      <textarea rows={6} placeholder="Ask us anything about the admission process..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none text-sm flex-grow"></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 mt-2 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-primary-600/30 shadow-lg hover:-translate-y-0.5 text-sm"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting Application...
                        </div>
                      ) : (
                        <><Send size={16} /> Submit Application</>
                      )}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                      By submitting this form, you agree to our privacy policy and consent to being contacted by our admissions team.
                    </p>
                  </form>
                </div>
              </FadeIn>
            </div>
          )}

          {/* TAB CONTENT: CONTACT */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-stretch">
              {/* Left Column: Contact Form */}
              <FadeIn className="lg:col-span-3 h-full">
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 border border-gray-100 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                        <MessageSquare size={20} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                    </div>

                    <form onSubmit={submitContact} className="space-y-4 md:space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Full Name</label>
                          <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Email Address</label>
                          <input type="email" required placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none text-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                          <input type="tel" required placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Subject</label>
                          <input type="text" required placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none text-sm" />
                        </div>
                      </div>

                      <div className="space-y-1.5 flex-grow flex flex-col">
                        <label className="text-sm font-semibold text-gray-700">Your Message</label>
                        <textarea required rows={6} placeholder="Write your message here..." className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none resize-none text-sm flex-grow"></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={contactFormStatus !== 'idle'}
                        className={`w-full py-3.5 px-6 mt-2 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2.5 text-sm ${contactFormStatus === 'success'
                          ? 'bg-green-500 shadow-green-500/30'
                          : 'bg-gray-900 hover:bg-black shadow-gray-900/30 hover:shadow-lg hover:-translate-y-0.5'
                          } shadow-md`}
                      >
                        {contactFormStatus === 'idle' && <><Send size={18} /> Send Message</>}
                        {contactFormStatus === 'submitting' && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </div>
                        )}
                        {contactFormStatus === 'success' && 'Message Sent Successfully!'}
                      </button>
                    </form>
                  </div>
                </div>
              </FadeIn>

              {/* Right Column: Contact Info Cards */}
              <FadeIn className="lg:col-span-2 flex flex-col h-full gap-6" delay={0.2}>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] px-8 py-6 md:px-10 md:py-8 text-white relative overflow-hidden shadow-2xl">
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-primary-500 opacity-20 rounded-full blur-2xl"></div>

                  <h3 className="text-2xl font-bold mb-6 relative z-10 text-white">Contact Information</h3>

                  <div className="space-y-6 relative z-10">
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                        <Mail size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Us</h4>
                        {contactLoading ? (
                          <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                        ) : (
                          <a href={`mailto:${contactEmail}`} className="text-lg font-medium hover:text-primary-300 transition-colors break-all">
                            {contactEmail || 'info@college.edu'}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                        <Phone size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Call Us</h4>
                        {contactLoading ? (
                          <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                        ) : (
                          <a href={`tel:${contactPhone}`} className="text-lg font-medium hover:text-primary-300 transition-colors">
                            {contactPhone || '+91 98765 43210'}
                          </a>
                        )}
                        <p className="text-gray-400 text-sm mt-1">Mon-Fri from 8am to 5pm</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                        <MapPin size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Visit Us</h4>
                        {contactLoading ? (
                          <div className="h-4 w-40 bg-white/20 rounded animate-pulse" />
                        ) : (
                          <p className="text-lg font-medium leading-snug">
                            {contactAddress || 'College Campus, Near NH-17, Jorhat, Assam'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 w-full relative flex-grow min-h-[250px]">
                  <iframe 
                    src="https://maps.google.com/maps?q=EIILM-Kolkata%2C%20Jalpaiguri%20Campus%2C%20Porapara%20Road%20Pandapara%2C%20Kalibari%20Rd%2C%20Area%2C%20Jalpaiguri%2C%20West%20Bengal%20735132&t=k&z=17&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="EIILM Jalpaiguri Campus Location"
                  ></iframe>
                </div>
              </FadeIn>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
