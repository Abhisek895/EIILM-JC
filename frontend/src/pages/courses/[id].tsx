import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { courseApi } from '@api/endpoints';
import Link from 'next/link';
import FadeIn from '@components/FadeIn';
import { GraduationCap, Landmark, ScrollText, Clock, ClipboardCheck, IndianRupee, BookOpen, Download, ArrowLeft, CheckCircle2, Award } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

type Course = {
  id: number;
  courseName: string;
  courseCode?: string;
  courseType: string;
  duration?: string;
  description?: string;
  eligibility?: string;
  fees?: string;
  showFees?: boolean;
  banner?: string;
  syllabus?: string;
  specialization?: string;
  status: string;
  slug?: string;
};

const COURSE_TYPE_COLORS: Record<string, string> = {
  UG: 'bg-primary-500 text-white',
  PG: 'bg-indigo-500 text-white',
  Diploma: 'bg-emerald-500 text-white',
  Certificate: 'bg-amber-500 text-white',
};

export default function CourseDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchCourse = async () => {
        try {
          const res: any = await courseApi.getById(Number(id));
          setCourse(res.data);
        } catch (err) {
          console.error('Failed to load course details', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-screen text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">The course you are looking for does not exist or has been removed.</p>
          <Link href="/courses" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
            Browse All Courses
          </Link>
        </div>
      </MainLayout>
    );
  }


  const bannerUrl = course.banner ? getImageUrl(course.banner) : 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop';

  return (
    <MainLayout>
      {/* 1. Massive Hero Section with Parallax/Zoom */}
      <div className="relative w-full h-[600px] md:h-[700px] bg-black overflow-hidden flex justify-center group">

        {/* Absolute Top Nav */}
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-40">
          <Link href="/courses" className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-sm transition-all bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg hover:shadow-2xl hover:-translate-x-1">
            <ArrowLeft size={16} /> Back to Courses
          </Link>
        </div>

        {/* Background Image with Slow Zoom Animation */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerUrl}
            alt={course.courseName}
            className="w-full h-full object-cover opacity-40 transition-transform duration-[20s] ease-out scale-105 group-hover:scale-110"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-black/50 to-black/30"></div>
          {/* Subtle glowing orb effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent opacity-80 mix-blend-screen"></div>
        </div>

        {/* Hero Content (Positioned bottom 20%) */}
        <div className="absolute inset-0 flex flex-col items-center justify-end z-10 pb-[120px] sm:pb-[150px] md:pb-[180px]">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-center flex flex-col items-center">
            <FadeIn>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <span className={`px-5 py-2 text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-2xl ${COURSE_TYPE_COLORS[course.courseType] || COURSE_TYPE_COLORS.UG}`}>
                  {course.courseType} Programme
                </span>
                {course.courseCode && (
                  <span className="px-5 py-2 text-xs font-black bg-black/40 text-white border border-white/20 backdrop-blur-md rounded-full tracking-[0.2em] uppercase shadow-xl">
                    {course.courseCode}
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-8 leading-[1.1] drop-shadow-2xl">
                {course.courseName}
              </h1>

              {course.specialization && (
                <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 shadow-2xl">
                  <Award className="text-primary-400" size={24} />
                  <p className="text-lg md:text-xl text-white/80 font-medium">
                    Specialization in <span className="text-white font-bold tracking-wide">{course.specialization}</span>
                  </p>
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </div>

      {/* 2. Floating Highlights Card - Sleek Dark Mode Overlapping */}
      <div className="w-full bg-gray-50 relative z-30 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <FadeIn delay={0.2} className="-mt-32 md:-mt-40 relative">
            <div className="bg-gray-900 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-800 p-8 md:p-12 overflow-hidden relative">
              {/* Subtle background glow inside card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-800 relative z-10">

                {/* Duration */}
                <div className="flex flex-col items-center text-center md:px-6 group">
                  <div className="w-16 h-16 rounded-3xl bg-gray-800 text-primary-400 flex items-center justify-center mb-5 group-hover:-translate-y-2 group-hover:bg-primary-900/50 transition-all duration-300 shadow-inner">
                    <Clock size={32} strokeWidth={2} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Duration</p>
                  <p className="font-black text-white text-2xl">{course.duration || 'TBA'}</p>
                </div>

                {/* Eligibility */}
                <div className="flex flex-col items-center text-center md:px-6 pt-8 md:pt-0 group">
                  <div className="w-16 h-16 rounded-3xl bg-gray-800 text-emerald-400 flex items-center justify-center mb-5 group-hover:-translate-y-2 group-hover:bg-emerald-900/50 transition-all duration-300 shadow-inner">
                    <ClipboardCheck size={32} strokeWidth={2} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Eligibility</p>
                  <p className="font-black text-white text-xl leading-snug max-w-[200px]">{course.eligibility || 'Standard Criteria'}</p>
                </div>

                {/* Program Fee */}
                <div className="flex flex-col items-center text-center md:px-6 pt-8 md:pt-0 group">
                  <div className="w-16 h-16 rounded-3xl bg-gray-800 text-amber-400 flex items-center justify-center mb-5 group-hover:-translate-y-2 group-hover:bg-amber-900/50 transition-all duration-300 shadow-inner">
                    <Landmark size={32} strokeWidth={2} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Program Fee</p>
                  {course.showFees !== false ? (
                    course.fees ? (
                      <div className="font-black text-white text-3xl flex items-center justify-center gap-1">
                        <IndianRupee size={28} />
                        {!isNaN(Number(course.fees)) ? Number(course.fees).toLocaleString('en-IN') : course.fees}
                      </div>
                    ) : (
                      <p className="font-black text-white text-2xl">TBA</p>
                    )
                  ) : (
                    <p className="font-black text-white text-2xl">Contact Office</p>
                  )}
                </div>

              </div>
            </div>
          </FadeIn>
        </div>

        {/* 3. Main Content (Editorial Layout) */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20">

          <FadeIn delay={0.3}>
            <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
              {/* Left Column: Heading */}
              <div className="md:w-1/3 flex-shrink-0">
                <div className="sticky top-24">
                  <div className="w-16 h-2 bg-primary-600 rounded-full mb-6"></div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 md:mb-6 leading-tight">
                    About the <br />
                    <span className="text-primary-600">Programme</span>
                  </h2>
                  <p className="text-gray-500 font-medium">Everything you need to know about what you will learn and achieve.</p>
                </div>
              </div>

              {/* Right Column: Prose */}
              <div className="md:w-2/3">
                <div className="prose prose-lg md:prose-xl prose-primary text-gray-600 max-w-none leading-relaxed text-justify first-letter:text-6xl first-letter:font-black first-letter:text-primary-600 first-letter:mr-2 first-letter:float-left">
                  {course.description ? (
                    course.description.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-8">{paragraph}</p>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center">
                      <p className="!mb-0">Detailed curriculum and program information will be updated soon. Please contact the admissions office for more details.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Syllabus Download Banner - Floating Style */}
          {course.syllabus && (
            <FadeIn delay={0.4} className="mt-20">
              <div className="relative bg-white rounded-[3rem] p-1 border border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-indigo-50 opacity-50"></div>
                <div className="relative bg-white rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">

                  <div className="flex items-center gap-8 text-center md:text-left">
                    <div className="hidden md:flex w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 items-center justify-center flex-shrink-0 shadow-inner">
                      <BookOpen className="text-primary-600" size={40} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 md:mb-3 tracking-tight">
                        Official Curriculum
                      </h2>
                      <p className="text-gray-500 text-lg max-w-md">
                        Download the full semester breakdown and syllabus structure.
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Link
                      href={`/admissions?intent=syllabus&course=${course.id}`}
                      className="group/btn relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-gray-900 rounded-2xl hover:bg-primary-600 overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(var(--color-primary-600),0.4)]"
                    >
                      <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover/btn:w-56 group-hover/btn:h-56 opacity-10"></span>
                      <span className="relative flex items-center gap-3 text-lg">
                        <Download strokeWidth={2.5} size={22} className="group-hover/btn:-translate-y-1 group-hover/btn:scale-110 transition-transform duration-300" />
                        Get Syllabus PDF
                      </span>
                    </Link>
                  </div>

                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>

      {/* 4. Full-width Call to Action Footer (Brutalist / Modern) */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        {/* Dynamic mesh gradient background */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600 rounded-full blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[150px] opacity-30 translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>

        <FadeIn className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <GraduationCap size={40} className="text-white" strokeWidth={1.5} />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white md:mb-8 leading-[1.1] tracking-tight">
            Your Future <br /> Starts Here.
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 mb-14 leading-relaxed max-w-3xl font-medium">
            Join the <span className="text-white font-bold">{course.courseName}</span> programme and unlock endless possibilities for your career.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg">
            <Link
              href={`/admissions?course=${course.id}`}
              className="w-full bg-primary-600 text-white px-8 py-5 rounded-full font-black hover:bg-primary-500 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(var(--color-primary-600),0.4)] text-lg flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              Apply Online <ArrowLeft size={20} className="rotate-180" strokeWidth={3} />
            </Link>
            <Link
              href="/contact"
              className="w-full bg-white/5 border border-white/20 text-white px-8 py-5 rounded-full font-bold hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-lg flex items-center justify-center uppercase tracking-wider"
            >
              Contact Us
            </Link>
          </div>
        </FadeIn>
      </section>

    </MainLayout>
  );
}
