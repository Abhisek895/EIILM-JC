import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import Link from 'next/link';
import { departmentApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import SEO from '@components/SEO';
import FadeIn from '@components/FadeIn';
import { motion } from 'framer-motion';
import { Library, ChevronRight, BookOpen, FlaskConical, Cpu, Calculator, Globe, Music } from 'lucide-react';

type Department = {
  id: number; name: string; slug: string | null; description: string | null; status: string;
};

const DEPT_ICONS = [Library, BookOpen, FlaskConical, Cpu, Calculator, Globe, Music];
const DEPT_GRADIENTS = [
  'from-sky-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-700',
  'from-cyan-500 to-teal-600',
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      departmentApi.getAll(1, 50),
      siteSettingsApi.getMap(),
    ]).then(([deptRes, settingsRes]) => {
      if (deptRes.status === 'fulfilled') setDepartments((deptRes.value as any)?.data || []);
      else setError('Unable to load departments. API unreachable.');
      if (settingsRes.status === 'fulfilled') setSiteSettings((settingsRes.value as any)?.data || {});
    }).finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <SEO 
        title="Departments" 
        description="Discover our diverse academic departments, featuring expert faculty and innovative programs designed to shape the leaders of tomorrow."
      />
      <HeroSlider
        pageKey="departments"
        fallbackTagline={siteSettings.dept_hero_tagline || 'Academic Departments'}
        fallbackHeading={siteSettings.dept_hero_heading || 'Our Departments'}
        fallbackSubheading={siteSettings.dept_hero_subheading || 'Explore our diverse academic departments dedicated to excellence in teaching and research.'}
      />

      <section className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600 mb-3 md:mb-4">Our Academic Structure</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
              Departments &amp; Schools
            </h2>
            {!loading && departments.length > 0 && (
              <p className="text-gray-500 mt-3 text-lg">
                {departments.length} academic department{departments.length !== 1 ? 's' : ''} under one roof
              </p>
            )}
          </FadeIn>

          {error && <div className="text-center py-10 text-red-600 font-semibold">{error}</div>}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && departments.length === 0 && !error && (
            <FadeIn className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
                <Library size={40} className="text-primary-300" />
              </div>
              <p className="text-xl font-bold text-gray-600 mb-2">No departments added yet.</p>
              <p className="text-gray-400 text-sm">Departments will appear here once added by the admin.</p>
            </FadeIn>
          )}

          {/* Departments grid */}
          {!loading && departments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept, idx) => {
                const Icon = DEPT_ICONS[idx % DEPT_ICONS.length];
                const gradient = DEPT_GRADIENTS[idx % DEPT_GRADIENTS.length];
                const num = String(idx + 1).padStart(2, '0');
                return (
                  <FadeIn delay={idx * 0.08} key={dept.id}>
                    <Link href={dept.slug ? `/departments/${dept.slug}` : '#'}>
                      <motion.div
                        whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }}
                        className="group bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-primary-100 transition-all h-full flex flex-col relative overflow-hidden cursor-pointer"
                      >
                        {/* Number badge */}
                        <span className="absolute top-6 right-6 text-4xl font-black text-gray-100 group-hover:text-primary-50 transition-colors select-none">
                          {num}
                        </span>

                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                          <Icon size={26} className="text-white" />
                        </div>

                        <h2 className="text-xl font-extrabold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors leading-snug">
                          {dept.name}
                        </h2>

                        {dept.description && (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-grow">
                            {dept.description}
                          </p>
                        )}

                        <div className="mt-6 flex items-center gap-1 text-primary-600 text-sm font-bold group-hover:gap-2 transition-all">
                          Explore Department <ChevronRight size={16} />
                        </div>
                      </motion.div>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <FadeIn className="container mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-10 md:p-14 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white md:mb-4">Find Your Perfect Program</h2>
              <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
                Each department offers world-class courses designed for real-world impact. Explore and apply today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/courses" className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-full hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-1 text-lg inline-block">
                  Browse Courses
                </Link>
                <Link href="/admissions" className="border-2 border-white/70 text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all text-lg inline-block">
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </MainLayout>
  );
}
