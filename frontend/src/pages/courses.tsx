import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { courseApi, siteSettingsApi } from '@api/endpoints';
import Link from 'next/link';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import { GraduationCap, Landmark, ScrollText, Award, Clock, ClipboardCheck, IndianRupee, BookOpen, ArrowRight } from 'lucide-react';
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
  specialization?: string;
  status: string;
  slug?: string;
};

const COURSE_TYPE_COLORS: Record<string, string> = {
  UG: 'bg-primary-100 text-primary-700',
  PG: 'bg-violet-100 text-violet-700',
  Diploma: 'bg-amber-100 text-amber-700',
  Certificate: 'bg-emerald-100 text-emerald-700',
};

// Gradient placeholders when no banner is set
const PLACEHOLDER_GRADIENTS = [
  'from-primary-600 to-indigo-700',
  'from-violet-600 to-purple-700',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-primary-600',
];

const COURSE_ICONS: Record<string, any> = {
  UG: GraduationCap,
  PG: Landmark,
  Diploma: ScrollText,
  Certificate: Award,
};


export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    const load = async () => {
      try {
        const response: any = await courseApi.getAll(1, 50, 'published');
        if (response.success) {
          setCourses(response.data || []);
        }
        const settingsRes: any = await siteSettingsApi.getMap();
        setSiteSettings(settingsRes?.data || {});

      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const types = ['All', ...Array.from(new Set(courses.map((c) => c.courseType)))];
  const filtered = filter === 'All' ? courses : courses.filter((c) => c.courseType === filter);

  return (
    <MainLayout>
      {/* Hero Banner Slider */}
      <HeroSlider
        pageKey="courses"
        fallbackTagline={siteSettings.courses_hero_tagline || 'Academic Programmes'}
        fallbackHeading={siteSettings.courses_hero_heading || 'Explore Our Courses'}
        fallbackSubheading={siteSettings.courses_hero_subheading || 'Discover world-class programmes designed to shape your future and open doors to global opportunities.'}
      />

      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600 mb-3 md:mb-4">Academic Excellence</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">Our Programmes</h2>
          </FadeIn>
        {/* Filter Tabs */}
        {!loading && courses.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${filter === t
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <FadeIn className="text-center py-20 text-gray-400">
            <div className="flex justify-center mb-6">
              <BookOpen size={64} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-600">No courses published yet.</p>
            <p className="text-sm mt-1">Check back soon for programme listings.</p>
          </FadeIn>
        )}

        {/* Course cards grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((course, idx) => {
              const gradient = PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length];
              const Icon = COURSE_ICONS[course.courseType] || GraduationCap;
              const badgeClass = COURSE_TYPE_COLORS[course.courseType] || 'bg-gray-100 text-gray-600';

              return (
                <FadeIn delay={idx * 0.1} key={course.id} className="h-full">
                  <div
                    className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                  >
                    <Link href={`/courses/${course.id}`} className="relative block h-40 sm:h-56 overflow-hidden flex-shrink-0">
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                      {course.banner ? (
                        <img
                          src={getImageUrl(course.banner)}
                          alt={course.courseName}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/90">
                          <Icon size={72} className="drop-shadow-md" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-950/20" />
                      <div className="absolute left-4 top-4 z-10">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${badgeClass} shadow-sm`}>
                          {course.courseType}
                        </span>
                      </div>
                      {course.courseCode && (
                        <div className="absolute bottom-4 right-4 z-10">
                          <span className="rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                            {course.courseCode}
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-4 sm:p-7">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                        Student spotlight
                      </p>
                      <h3 className="mt-1 sm:mt-2 text-lg sm:text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-700">
                        {course.courseName}
                      </h3>

                      <div className="mt-2 sm:mt-3 mb-2 sm:mb-0">
                        {course.specialization && (
                          <span className="inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
                            {course.specialization}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-2 sm:p-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700">
                          <Clock size={16} className="shrink-0 text-primary-500" />
                          <span className="truncate">{course.duration || 'Duration TBA'}</span>
                        </div>
                        <div
                          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700"
                          title={course.eligibility || ''}
                        >
                          <ClipboardCheck size={16} className="shrink-0 text-primary-500" />
                          <span className="truncate">{course.eligibility || 'Eligibility TBA'}</span>
                        </div>
                      </div>

                      <p className="mt-3 sm:mt-5 flex-grow text-xs sm:text-sm leading-snug sm:leading-relaxed text-gray-500 line-clamp-3 break-words">
                        {course.description || 'Programme details will be updated soon.'}
                      </p>

                      <div className="mt-4 sm:mt-6 flex items-end justify-between gap-4 border-t border-gray-100 pt-3 sm:pt-5">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Program Fee
                          </p>
                          {course.showFees === false ? (
                            <div className="text-sm font-semibold text-gray-500">Contact for fees</div>
                          ) : course.fees ? (
                            <div className="flex items-center gap-0.5 text-base sm:text-lg font-bold text-gray-900 truncate">
                              <IndianRupee size={16} className="text-gray-900 flex-shrink-0" />
                              <span className="truncate">{!isNaN(Number(course.fees)) ? Number(course.fees).toLocaleString('en-IN') : course.fees}</span>
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-gray-500">TBA</div>
                          )}
                        </div>
                        <Link
                          href={`/courses/${course.id}`}
                          className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-primary-600 px-3 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg whitespace-nowrap"
                        >
                          View Details <ArrowRight size={16} className="flex-shrink-0" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        </div>
      </div>

      {/* Stats footer (Full Width) */}
      {!loading && courses.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-primary-600 to-indigo-700 text-white relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <FadeIn className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of students shaping their future.</p>
            <Link
              href="/admissions"
              className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-full hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
            >
              Apply for Admission
            </Link>
          </FadeIn>
        </section>
      )}
    </MainLayout>
  );
}
