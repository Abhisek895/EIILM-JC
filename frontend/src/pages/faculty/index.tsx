import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import Link from 'next/link';
import { facultyApi, departmentApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import SEO from '@components/SEO';
import { motion } from 'framer-motion';
import { getImageUrl } from '@utils/getImageUrl';
import { GraduationCap, Mail, Users, ChevronRight } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

type FacultyMember = {
  id: number; name: string; designation: string | null; photo: string | null;
  qualification: string | null; experience: string | null; email: string | null;
  department?: { id: number; name: string; slug: string | null };
  sortOrder?: number;
  bio?: string | null;
};

type Department = { id: number; name: string; slug: string | null };

function LeadershipCard({ f }: { f: FacultyMember }) {
  const initials = f.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <FadeIn>
      <div className="bg-[#0B1120] w-[100vw] relative left-1/2 -translate-x-1/2 py-12 md:py-20 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 items-center px-4 sm:px-6 lg:px-8">
          {/* Left: Image */}
          <div className="relative w-full md:w-[35%] max-w-sm flex-shrink-0 mx-auto md:mx-0">
            {/* Yellow decoration behind image */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 sm:w-32 sm:h-32 bg-yellow-500 rounded-3xl z-0" />
            <div className="relative z-10 aspect-[4/5] w-full rounded-3xl overflow-hidden bg-blue-600 shadow-xl">
              {f.photo ? (
                <img
                  src={getImageUrl(f.photo)}
                  alt={f.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600">
                  <span className="text-6xl font-extrabold text-white/90">{initials}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Text */}
          <div className="flex-1 flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-yellow-500" />
              <span className="text-yellow-500 text-xs font-bold tracking-[0.2em] uppercase">Leadership</span>
            </div>
            <h2 className="text-white text-3xl md:text-5xl font-black mb-2">{f.name}</h2>
            <p className="text-blue-500 text-lg md:text-xl font-bold mb-6">{f.designation || 'Faculty Member'}</p>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
              {f.bio || 'A dedicated member of our leadership team, guiding our institution towards academic excellence and student success.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/faculty/${f.id}`} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-full text-sm flex items-center gap-2 transition-colors">
                <FaLinkedin size={18} className="text-black" /> Connect on LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function FacultyCard({ f, idx }: { f: FacultyMember; idx: number }) {
  const initials = f.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const gradients = [
    'from-primary-600 to-indigo-700',
    'from-violet-600 to-purple-700',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-sky-500 to-cyan-600',
  ];
  const gradient = gradients[idx % gradients.length];

  return (
    <FadeIn>
      <Link href={`/faculty/${f.id}`}>
        <motion.div
          whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}
          className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-primary-100 transition-all cursor-pointer"
        >
          {/* Photo / Avatar */}
          <div className="relative h-60 overflow-hidden bg-gray-100">
            {f.photo ? (
              <img
                src={getImageUrl(f.photo)}
                alt={f.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-4xl font-extrabold text-white/90">{initials}</span>
              </div>
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            {/* Email hover action */}
            {f.email && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                <div
                  role="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.location.href = `mailto:${f.email}`; }}
                  className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold text-sm px-4 py-2 rounded-full shadow-lg hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  <Mail size={14} /> Email
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
            <h3 className="font-extrabold text-gray-900 text-lg leading-snug group-hover:text-primary-700 transition-colors">{f.name}</h3>
            {f.designation && (
              <p className="text-primary-600 text-sm font-semibold mt-0.5">{f.designation}</p>
            )}
            {f.qualification && (
              <p className="text-gray-400 text-xs mt-1 flex items-center gap-1.5">
                <GraduationCap size={12} /> {f.qualification}
              </p>
            )}
            <div className="flex items-center justify-between mt-4">
              {f.department && (
                <span className="bg-primary-50 text-primary-600 text-xs font-bold px-3 py-1 rounded-full">
                  {f.department.name}
                </span>
              )}
              <span className="text-primary-600 text-xs font-bold flex items-center gap-1 ml-auto group-hover:gap-2 transition-all">
                Profile <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </FadeIn>
  );
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | undefined>(undefined);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (deptId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await facultyApi.getAll(1, 100, deptId);
      setFaculty(res?.data || []);
    } catch {
      setError('Unable to load faculty. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentApi.getAll(1, 50).then((res: any) => setDepartments(res?.data || []));
    siteSettingsApi.getMap().then((res: any) => setSiteSettings(res?.data || {}));
    load();
  }, []);

  const handleDeptFilter = (id?: number) => { setSelectedDept(id); load(id); };

  return (
    <MainLayout>
      <SEO
        title="Faculty Directory"
        description="Meet the esteemed professors, lecturers, and academic mentors guiding students at EIILM Jalpaiguri Campus."
      />
      <HeroSlider
        pageKey="faculty"
        fallbackTagline={siteSettings.faculty_hero_tagline || 'Academic Excellence'}
        fallbackHeading={siteSettings.faculty_hero_heading || 'Our Faculty'}
        fallbackSubheading={siteSettings.faculty_hero_subheading || 'Meet our distinguished team of educators, researchers, and industry experts dedicated to your growth.'}
      />

      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <FadeIn className="text-center mb-3 md:mb-4">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600 mb-2">The People Behind Your Growth</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2.5">
              <Users size={32} className="text-primary-600" /> Meet Our Team
            </h2>
          </FadeIn>



          {error && (
            <div className="text-center py-10 text-red-600 font-semibold">{error}</div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse border border-gray-100">
                  <div className="h-60 bg-gray-200" />
                  <div className="p-5 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && faculty.length === 0 && (
            <FadeIn className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-primary-300" />
              </div>
              <p className="text-xl font-bold text-gray-600 mb-2">No faculty members found.</p>
              <p className="text-gray-400">Try selecting a different department.</p>
            </FadeIn>
          )}

          {/* Faculty List */}
          {!loading && faculty.length > 0 && (
            <div className="flex flex-col gap-16">
              {/* Leadership Cards */}
              {faculty.some(f => f.sortOrder === 10) && (
                <div className="flex flex-col gap-10">
                  {faculty.filter(f => f.sortOrder === 10).map(f => (
                    <LeadershipCard key={f.id} f={f} />
                  ))}
                </div>
              )}

              {/* Regular Faculty Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {faculty.filter(f => f.sortOrder !== 10).map((f, idx) => (
                  <FacultyCard key={f.id} f={f} idx={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {!loading && faculty.length > 0 && (
        <section className="py-16 bg-white">
          <FadeIn className="container mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-10 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Learn From the Best</h2>
                <p className="text-primary-100 mb-7 max-w-lg mx-auto">Our faculty are committed to your success. Join our institution and get taught by industry experts.</p>
                <Link href="/admissions" className="bg-white text-primary-700 font-bold px-10 py-4 rounded-full hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-1 text-lg inline-block">
                  Apply Now
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>
      )}
    </MainLayout>
  );
}
