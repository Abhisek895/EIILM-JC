import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { courseApi, siteSettingsApi } from '@api/endpoints';
import Link from 'next/link';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import { GraduationCap, Landmark, ScrollText, Award, Clock, ClipboardCheck, IndianRupee, BookOpen } from 'lucide-react';
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

      <div className="container mx-auto px-6 py-12">
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
                    className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-gray-100/80 group flex flex-col h-full transform hover:-translate-y-1"
                  >
                    {/* Image / Gradient placeholder */}
                    <Link href={`/courses/${course.id}`} className="relative h-56 overflow-hidden bg-gray-50 block flex-shrink-0">
                      {course.banner ? (
                        <img
                          src={getImageUrl(course.banner)}
                          alt={course.courseName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white"><div class="text-white opacity-80"><svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.33a2 2 0 0 0-1.66 0L2.6 7.08a2 2 0 0 0 0 3.832l8.57 3.75a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg></div></div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-700 ease-out`}>
                          <Icon size={72} className="opacity-90 drop-shadow-md" />
                        </div>
                      )}

                      {/* Type badge overlay */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md bg-white/95 text-gray-900 shadow-sm uppercase tracking-wider`}>
                          {course.courseType}
                        </span>
                      </div>

                      {/* Course Code Badge inside image bottom-right */}
                      {course.courseCode && (
                        <div className="absolute bottom-4 right-4 z-10">
                          <span className="bg-gray-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-wider">
                            {course.courseCode}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Card body */}
                    <div className="p-7 flex flex-col flex-grow bg-white relative">

                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                        {course.courseName}
                      </h2>

                      {/* Specialization Wrapper (Fixed height to align grids) */}
                      <div className="min-h-[28px] mb-5">
                        {course.specialization && (
                          <span className="inline-block text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                            {course.specialization}
                          </span>
                        )}
                      </div>

                      {/* Meta Grid */}
                      {(course.duration || course.eligibility) && (
                        <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100/60 min-h-[60px]">
                          {course.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                              <Clock size={16} className="text-primary-500 flex-shrink-0" />
                              <span className="truncate">{course.duration}</span>
                            </div>
                          )}
                          {course.eligibility && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium" title={course.eligibility}>
                              <ClipboardCheck size={16} className="text-primary-500 flex-shrink-0" />
                              <span className="truncate">{course.eligibility}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex-grow">
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-0 break-words">
                          {course.description || 'Details will be updated soon.'}
                        </p>
                      </div>

                      {/* Footer: Fees & CTA */}
                      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Program Fee</p>
                          {course.showFees !== false ? (
                            course.fees ? (
                              <div className="text-lg font-bold text-gray-900 flex items-center gap-0.5">
                                <IndianRupee size={16} className="text-gray-900" />
                                {!isNaN(Number(course.fees)) ? Number(course.fees).toLocaleString('en-IN') : course.fees}
                              </div>
                            ) : (
                              <div className="text-sm font-semibold text-gray-500">TBA</div>
                            )
                          ) : (
                            <div className="text-sm font-semibold text-gray-500">Contact for Fees</div>
                          )}
                        </div>
                        <Link
                          href={`/courses/${course.id}`}
                          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                          View <span className="hidden sm:inline">Details</span> →
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
