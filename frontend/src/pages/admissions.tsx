import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { inquiryApi, courseApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import SEO from '@components/SEO';
import { motion } from 'framer-motion';
import { Send, User, Mail, Phone, MapPin, BookOpen, CheckCircle2, MessageSquare, ClipboardList, Search, FileCheck, GraduationCap, Download } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

export default function AdmissionsContactPage() {
  const router = useRouter();

  // Admissions State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [courseId, setCourseId] = useState('');
  const [intent, setIntent] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  // Contact State
  const [contactMapUrl, setContactMapUrl] = useState<string>('');

  useEffect(() => {
    // Check URL parameters to set initial tab and course
    if (router.isReady) {
      if (router.query.intent === 'syllabus') {
        setIntent('syllabus');
      }
      if (router.query.course) {
        setCourseId(router.query.course as string);
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
          setContactMapUrl(map?.contact_map_url || '');
        }
      } catch (err) {
        console.error('Failed to load initial data', err);
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

        if (intent === 'syllabus' && courseId) {
          const selectedCourse = courses.find((c) => c.id === Number(courseId));
          if (selectedCourse && selectedCourse.syllabus) {
            const url = getImageUrl(selectedCourse.syllabus);

            // Force download by fetching as a blob first (bypasses browser PDF viewer)
            fetch(url)
              .then(res => res.blob())
              .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `${selectedCourse.courseName.replace(/\s+/g, '_')}_Syllabus.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch(err => {
                console.error("Failed to download via blob, falling back to new tab", err);
                window.open(url, '_blank');
              });

            setStatusMessage('Syllabus downloaded! Our admissions team will also contact you shortly.');
          } else {
            setStatusMessage('Inquiry submitted successfully, but no syllabus is available for this course.');
          }
        } else {
          setStatusMessage('Inquiry submitted successfully. Our admissions team will contact you shortly.');
        }

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


  return (
    <MainLayout>
      <SEO
        title="Admissions"
        siteName="College ERP"
        description="Apply for admission, contact our counselors, and take the first step towards your future."
      />
      <HeroSlider
        pageKey="admissions"
        hideTextOnMobile={true}
        fallbackTagline="Admissions Open"
        fallbackHeading="Take the First Step Towards Your Future"
        fallbackSubheading="Join our community of innovators, leaders, and thinkers. Apply now for the upcoming academic session."
      />
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600 mb-3 md:mb-4">Begin Your Journey</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">Apply for Admission</h2>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-stretch">
              {/* Left Column (visually Right): Information */}
              <FadeIn className="lg:col-span-2 lg:order-last flex flex-col gap-6 h-full">
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden">
                  <h3 className="font-bold text-gray-900 mb-6 text-xl">Why Apply Here?</h3>
                  <ul className="space-y-4">
                    {[
                      'UGC Recognized Degrees',
                      '100% Placement Assistance',
                      'State-of-the-art Infrastructure',
                      'Experienced Industry Faculty',
                      'Scholarships Available',
                      'NAAC Accredited Institution',
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={14} className="text-green-600" />
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Admission Tab Map */}
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-2 md:p-3 border border-gray-100 relative overflow-hidden flex-grow flex flex-col min-h-[250px]">
                  <div className="rounded-[1.5rem] overflow-hidden w-full relative flex-grow">
                    <iframe
                      src={contactMapUrl || "https://maps.google.com/maps?q=EIILM-Kolkata%2C%20Jalpaiguri%20Campus%2C%20Porapara%20Road%20Pandapara%2C%20Kalibari%20Rd%2C%20Area%2C%20Jalpaiguri%2C%20West%20Bengal%20735132&t=k&z=17&ie=UTF8&iwloc=&output=embed"}
                      width="100%"
                      height="100%"
                      style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Campus Location"
                    ></iframe>
                  </div>
                </div>
              </FadeIn>

              {/* Right Column (visually Left): Admission Form */}
              <FadeIn className="lg:col-span-3 lg:order-first h-full" delay={0.2}>
                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden h-full flex flex-col">
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
                        <>
                          {intent === 'syllabus' ? <Download size={16} /> : <Send size={16} />}
                          {intent === 'syllabus' ? 'Download Syllabus' : 'Submit Application'}
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                      By submitting this form, you agree to our privacy policy and consent to being contacted by our admissions team.
                    </p>
                  </form>
                </div>
              </FadeIn>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
