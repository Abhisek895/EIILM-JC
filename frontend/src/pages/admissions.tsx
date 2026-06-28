import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { inquiryApi, courseApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import SEO from '@components/SEO';
import { Send, CheckCircle2, Download } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

export default function AdmissionsContactPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    courseId: '',
    firstName: '',
    lastName: '',
    gender: '',
    bloodGroup: '',
    caste: '',
    dob: '',
    placeOfBirth: '',
    address: '',
    city: '',
    state: 'West Bengal',
    pin: '',
    mobile: '',
    altPhone: '',
    whatsapp: '',
    email: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    annualIncome: '',
    board12th: '',
    stream12th: '',
    yearOfPassing12th: '',
    aggregateMarks12th: '',
    schoolName: '',
    mbaCollegeName: '',
    mbaDegreeName: '',
    mbaSpecialization: '',
    mbaGraduationYear: '',
    mbaUniversity: '',
    mbaScore: '',
    source: '',
    sourceName: '',
    remarks: ''
  });

  const [intent, setIntent] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [contactMapUrl, setContactMapUrl] = useState<string>('');

  useEffect(() => {
    if (router.isReady) {
      if (router.query.intent === 'syllabus') setIntent('syllabus');
      if (router.query.course) setForm(prev => ({ ...prev, courseId: router.query.course as string }));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submitAdmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('idle');
    setLoading(true);

    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const payload = {
        ...form,
        fullName,
        email: form.email,
        phone: form.mobile,
        city: form.city,
        message: form.remarks,
        courseId: form.courseId ? Number(form.courseId) : undefined,
        source: form.source
      };

      const response: any = await inquiryApi.create(payload);

      if (response.success) {
        setStatus('success');
        if (intent === 'syllabus' && form.courseId) {
          const selectedCourse = courses.find((c) => c.id === Number(form.courseId));
          if (selectedCourse && selectedCourse.syllabus) {
            const url = getImageUrl(selectedCourse.syllabus);
            fetch(url).then(res => res.blob()).then(blob => {
              const blobUrl = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = `${selectedCourse.courseName.replace(/\s+/g, '_')}_Syllabus.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(blobUrl);
            }).catch(err => {
              window.open(url, '_blank');
            });
            setStatusMessage('Syllabus downloaded! Our admissions team will also contact you shortly.');
          } else {
            setStatusMessage('Application submitted successfully, but no syllabus is available for this course.');
          }
        } else {
          setStatusMessage('Application submitted successfully. Our admissions team will contact you shortly.');
        }

        // Reset form
        setForm({
          courseId: '', firstName: '', lastName: '', gender: '', bloodGroup: '', caste: '', dob: '',
          placeOfBirth: '', address: '', city: '', state: 'West Bengal', pin: '', mobile: '', altPhone: '',
          whatsapp: '', email: '', fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
          annualIncome: '', board12th: '', stream12th: '', yearOfPassing12th: '', aggregateMarks12th: '', schoolName: '',
          mbaCollegeName: '', mbaDegreeName: '', mbaSpecialization: '', mbaGraduationYear: '', mbaUniversity: '', mbaScore: '',
          source: '', sourceName: '', remarks: ''
        });
      } else {
        setStatus('error');
        setStatusMessage('Unable to submit application. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Unable to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourseObj = courses.find(c => c.id === Number(form.courseId));
  const isMBA = selectedCourseObj && selectedCourseObj.courseName.toLowerCase().includes('mba');

  // Mobile step wizard
  const [step, setStep] = React.useState(1);
  const TOTAL_STEPS = 4;
  const STEP_LABELS = ['Program', 'Personal', 'Academic', 'Submit'];

  const canGoNext = () => {
    if (step === 1) return !!form.courseId;
    if (step === 2) return !!(form.firstName && form.lastName && form.gender && form.mobile && form.email && form.city);
    if (step === 3) return !!(form.board12th && form.yearOfPassing12th);
    return true;
  };

  return (
    <MainLayout>
      <SEO title="Admissions" siteName="College ERP" description="Apply for admission." />
      <HeroSlider
        pageKey="admissions"
        hideTextOnMobile={true}
        fallbackTagline="Admissions Open"
        fallbackHeading="Take the First Step Towards Your Future"
        fallbackSubheading="Join our community of innovators, leaders, and thinkers. Apply now."
      />
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">


          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-stretch">
            {/* Information & Map Column */}
            <FadeIn className="lg:col-span-2 order-last flex flex-col gap-6 h-full justify-start">
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-2 md:p-3 border border-gray-100 relative overflow-hidden flex flex-col h-[350px] lg:h-[400px] order-1 lg:order-2">
                <div className="rounded-[1.5rem] overflow-hidden w-full h-full relative">
                  <iframe src={contactMapUrl || "https://maps.google.com/maps?q=EIILM-Kolkata%2C%20Jalpaiguri%20Campus%2C%20Porapara%20Road%20Pandapara%2C%20Kalibari%20Rd%2C%20Area%2C%20Jalpaiguri%2C%20West%20Bengal%20735132&t=k&z=17&ie=UTF8&iwloc=&output=embed"} width="100%" height="100%" style={{ border: 0, position: 'absolute', top: 0, left: 0 }} allowFullScreen loading="lazy" title="Campus Location"></iframe>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden order-2 lg:order-1">
                <h3 className="font-bold text-gray-900 mb-6 text-xl">Why Apply Here?</h3>
                <ul className="space-y-4">
                  {['UGC Recognized Degrees', '100% Placement Assistance', 'State-of-the-art Infrastructure', 'Experienced Industry Faculty', 'Scholarships Available', 'NAAC Accredited Institution'].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={14} className="text-green-600" />
                      </div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Admission Form Column */}
            <FadeIn className="lg:col-span-3 order-first h-full" delay={0.2}>
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Apply for Admission</h2>

                {/* Mobile Step Progress Bar */}
                <div className="lg:hidden mb-6">
                  <div className="flex items-center justify-between mb-2">
                    {STEP_LABELS.map((label, i) => (
                      <div key={label} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-gray-100 text-gray-400'}`}>
                          {step > i + 1 ? '✓' : i + 1}
                        </div>
                        <span className={`text-[10px] font-semibold ${step === i + 1 ? 'text-primary-600' : 'text-gray-400'}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
                      style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {status !== 'idle' && (
                  <div className={`p-4 rounded-xl mb-6 relative z-10 font-medium text-sm flex items-start gap-3 ${status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {status === 'success' && <CheckCircle2 className="flex-shrink-0 mt-0.5" size={18} />}
                    {statusMessage}
                  </div>
                )}

                <form onSubmit={submitAdmission} className="space-y-6 relative z-10">

                  {/* STEP 1 — Program Selection */}
                  <div className={step === 1 || undefined ? '' : 'hidden lg:block'}>
                  <div className={`lg:hidden ${step === 1 ? 'block' : 'hidden'}`}>
                  </div>
                  <div className="hidden lg:block space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="text-sm font-bold text-gray-800">Select the program you want to apply for: *</label>
                    <select required name="courseId" value={form.courseId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm text-gray-800">
                      <option value="">Select a Program</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.courseName} {c.courseType ? `(${c.courseType})` : ''}</option>
                      ))}
                    </select>
                  </div>
                  </div>

                  {/* Mobile Step 1 */}
                  <div className={`lg:hidden ${step === 1 ? 'block' : 'hidden'} space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-100`}>
                    <label className="text-sm font-bold text-gray-800">Select the program you want to apply for: *</label>
                    <select required name="courseId" value={form.courseId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm text-gray-800">
                      <option value="">Select a Program</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.courseName} {c.courseType ? `(${c.courseType})` : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Personal Details — desktop always visible, mobile only on step 2 */}
                  <div className={`space-y-4 lg:block ${step === 2 ? 'block' : 'hidden'}`}>
                    <h3 className="text-lg font-bold text-primary-700 border-b pb-2">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">First Name + Middle Name *</label>
                        <input type="text" required name="firstName" value={form.firstName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Last Name *</label>
                        <input type="text" required name="lastName" value={form.lastName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Gender *</label>
                        <select required name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Blood Group *</label>
                        <select required name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                          <option value="">Select</option>
                          <option value="unknown">unknown</option>
                          <option value="A+">A+</option><option value="A-">A-</option>
                          <option value="B+">B+</option><option value="B-">B-</option>
                          <option value="O+">O+</option><option value="O-">O-</option>
                          <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Cast Information *</label>
                        <select required name="caste" value={form.caste} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                          <option value="">Select</option>
                          <option value="General">General</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="OBC">OBC</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Date of Birth *</label>
                        <input type="date" required name="dob" value={form.dob} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Place of Birth *</label>
                        <input type="text" required name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className={`space-y-4 pt-2 lg:block ${step === 2 ? 'block' : 'hidden'}`}>
                    <h3 className="text-lg font-bold text-primary-700 border-b pb-2">Contact Details</h3>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Address *</label>
                      <input type="text" required name="address" value={form.address} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">City/Town/Village *</label>
                        <input type="text" required name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">State *</label>
                        <input type="text" required name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">PIN *</label>
                        <input type="text" required name="pin" value={form.pin} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Mobile Number (incl. +91) *</label>
                        <input type="tel" required name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Whatsapp Number *</label>
                        <input type="tel" required name="whatsapp" value={form.whatsapp} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Alternative Phone Number</label>
                        <input type="tel" name="altPhone" value={form.altPhone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Email ID *</label>
                        <input type="email" required name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Family Details */}
                  <div className={`space-y-4 pt-2 lg:block ${step === 3 ? 'block' : 'hidden'}`}>
                    <h3 className="text-lg font-bold text-primary-700 border-b pb-2">Family Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Father's Name *</label>
                        <input type="text" required name="fatherName" value={form.fatherName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Father's Occupation</label>
                        <input type="text" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Mother's Name *</label>
                        <input type="text" required name="motherName" value={form.motherName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Mother's Occupation</label>
                        <input type="text" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Annual Income (in INR)</label>
                      <input type="text" name="annualIncome" value={form.annualIncome} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                    </div>
                  </div>

                  {/* Academic Details */}
                  <div className={`space-y-4 pt-2 lg:block ${step === 3 ? 'block' : 'hidden'}`}>
                    <h3 className="text-lg font-bold text-primary-700 border-b pb-2">Academic Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Exam Board (12th standard) *</label>
                        <input type="text" required name="board12th" value={form.board12th} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Subject Stream (12th) *</label>
                        <select required name="stream12th" value={form.stream12th} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                          <option value="">Select Stream</option>
                          <option value="ARTS">ARTS</option>
                          <option value="SCIENCE">SCIENCE</option>
                          <option value="COMMERCE">COMMERCE</option>
                          <option value="OTHERS">OTHERS</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Year of Passing *</label>
                        <input type="text" required name="yearOfPassing12th" value={form.yearOfPassing12th} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Aggregate Marks (%) *</label>
                        <input type="number" min="0" max="100" step="0.01" required name="aggregateMarks12th" value={form.aggregateMarks12th} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">School Name *</label>
                        <input type="text" required name="schoolName" value={form.schoolName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* MBA Specific Fields */}
                  {isMBA && (
                    <div className="space-y-4 pt-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <h3 className="text-lg font-bold text-blue-800 border-b border-blue-200 pb-2">Graduation Details (MBA Applicants)</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">College Name</label>
                          <input type="text" name="mbaCollegeName" value={form.mbaCollegeName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">Name of Degree</label>
                          <input type="text" name="mbaDegreeName" value={form.mbaDegreeName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">Subject Specialization</label>
                          <input type="text" name="mbaSpecialization" value={form.mbaSpecialization} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">Year of Passing Graduation</label>
                          <input type="text" name="mbaGraduationYear" value={form.mbaGraduationYear} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">University Name</label>
                          <input type="text" name="mbaUniversity" value={form.mbaUniversity} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">Aggregate Score (% or GPA)</label>
                          <input type="text" name="mbaScore" value={form.mbaScore} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other Details */}
                  <div className={`space-y-4 pt-2 lg:block ${step === 4 ? 'block' : 'hidden'}`}>
                    <h3 className="text-lg font-bold text-primary-700 border-b pb-2">Other Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Who told you about us?</label>
                        <select name="source" value={form.source} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                          <option value="">Select Option</option>
                          <option value="Advertisement">Advertisement</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Friend">Friend</option>
                          <option value="College Representative">College Representative</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Name of the source</label>
                        <input type="text" name="sourceName" value={form.sourceName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm" placeholder="Name of Teacher / Friend / Rep" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Add Remarks (if any)</label>
                      <textarea rows={3} name="remarks" value={form.remarks} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm resize-none"></textarea>
                    </div>
                  </div>

                  {/* Mobile Next / Back Step Navigation */}
                  <div className="lg:hidden flex gap-3 mt-6">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(s => s - 1)}
                        className="flex-1 min-h-[48px] py-3 rounded-xl font-bold text-gray-700 border-2 border-gray-200 hover:border-gray-300 bg-white transition-all active:scale-95 text-sm"
                      >
                        ← Back
                      </button>
                    )}
                    {step < TOTAL_STEPS ? (
                      <button
                        type="button"
                        onClick={() => { if (canGoNext()) setStep(s => s + 1); }}
                        disabled={!canGoNext()}
                        className="flex-1 min-h-[48px] py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-600/30 transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 min-h-[48px] py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-600/30 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          <>
                            {intent === 'syllabus' ? <Download size={16} /> : <Send size={16} />}
                            {intent === 'syllabus' ? 'Download Syllabus' : 'Submit Application'}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Desktop Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="hidden lg:flex w-full py-4 mt-6 rounded-xl font-bold text-white transition-all duration-300 items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-primary-600/30 shadow-lg hover:-translate-y-0.5 text-sm active:scale-95"
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
