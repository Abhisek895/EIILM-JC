import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { placementApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import Breadcrumb from '@components/Breadcrumb';
import { motion } from 'framer-motion';
import { getImageUrl } from '@utils/getImageUrl';
import { TrendingUp, Building2, Award, Users, Briefcase, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type PlacementRecord = {
  id: number; studentName: string; companyName: string; companyLogo: string | null;
  package: string; year: string; course: string | null; studentImage: string | null;
  placementType: 'placement' | 'internship'; status: string;
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <FadeIn>
      <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4`}>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
        </div>
      </div>
    </FadeIn>
  );
}

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    const load = async () => {
      try {
        const [placRes, settRes] = await Promise.allSettled([
          placementApi.getAll(1, 100, 'published'),
          siteSettingsApi.getMap(),
        ]);
        if (placRes.status === 'fulfilled') {
          const r: any = placRes.value;
          if (r.success) setPlacements(r.data || []);
        }
        if (settRes.status === 'fulfilled') setSiteSettings((settRes.value as any)?.data || {});
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const years = ['All', ...Array.from(new Set(placements.map(p => p.year?.trim() || ''))).filter(y => y).sort((a, b) => b.localeCompare(a))];
  const filtered = placements.filter(p => {
    const matchYear = yearFilter === 'All' || (p.year?.trim() || '') === yearFilter;
    const matchType = typeFilter === 'All' || p.placementType === typeFilter;
    return matchYear && matchType;
  });

  // Compute stats
  const totalPlacements = placements.filter(p => p.placementType === 'placement').length;
  const totalInternships = placements.filter(p => p.placementType === 'internship').length;
  const companies = new Set(placements.map(p => p.companyName)).size;

  return (
    <MainLayout>
      <HeroSlider
        pageKey="placements"
        fallbackTagline={siteSettings.placement_hero_tagline || 'Career Placements'}
        fallbackHeading={siteSettings.placement_hero_heading || 'Outstanding Placements'}
        fallbackSubheading={siteSettings.placement_hero_subheading || 'Celebrating the success of our students securing top roles in global organizations.'}
      />
      <Breadcrumb items={[{ label: 'Placements' }]} />

      <section className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600 mb-3 md:mb-4">Our Track Record</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
              <Award size={40} className="text-primary-600" /> Placement Highlights
            </h2>
          </FadeIn>

          {/* Stats row */}
          {!loading && placements.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <StatCard icon={Users} label="Students Placed" value={`${totalPlacements}+`} color="bg-primary-600" />
              <StatCard icon={Briefcase} label="Internships" value={`${totalInternships}+`} color="bg-emerald-600" />
              <StatCard icon={Building2} label="Recruiting Companies" value={`${companies}+`} color="bg-violet-600" />
            </div>
          )}

          {/* Filters */}
          {!loading && placements.length > 0 && (
            <FadeIn className="flex flex-col items-center gap-4 mb-8">
              {/* Type filter */}
              <div className="flex bg-white border border-gray-200 p-1 rounded-full gap-1">
                {[{ id: 'All', label: 'All Records' }, { id: 'placement', label: '💼 Placements' }, { id: 'internship', label: '🎓 Internships' }].map(t => (
                  <button key={t.id} onClick={() => setTypeFilter(t.id)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${typeFilter === t.id ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'text-gray-500 hover:text-gray-900'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Year filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {years.map(y => (
                  <button key={y} onClick={() => setYearFilter(y)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${yearFilter === y ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'}`}>
                    {y === 'All' ? 'All Years' : y}
                  </button>
                ))}
              </div>
            </FadeIn>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <FadeIn className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={40} className="text-primary-300" />
              </div>
              <p className="text-xl font-bold text-gray-600 mb-2">No placement records found.</p>
              <p className="text-gray-400">Try selecting a different filter or check back later.</p>
            </FadeIn>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((p, idx) => (
              <FadeIn key={p.id} delay={idx * 0.05}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(0,0,0,0.10)' }}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:border-primary-100 transition-all flex flex-col"
                >
                  {/* Photo */}
                  <div className="h-56 relative bg-gray-50 overflow-hidden">
                    {p.studentImage ? (
                      <img src={getImageUrl(p.studentImage)} alt={p.studentName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100">
                        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-2xl font-extrabold text-primary-400">
                            {p.studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full shadow-sm font-bold text-xs uppercase tracking-wide">
                      {p.placementType === 'internship' ? '🎓 Intern' : '💼 Placed'}
                    </div>
                    {/* Package badge */}
                    <div className="absolute bottom-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-xl shadow-lg font-extrabold text-sm">
                      {p.package}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col gap-3 flex-grow">
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 leading-snug">{p.studentName}</h3>
                      <p className="text-sm text-primary-600 font-semibold">{p.course || 'Student'} · {p.year}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 mt-auto">
                      {p.companyLogo ? (
                        <div className="w-9 h-9 bg-white rounded-lg p-1 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                          <img src={getImageUrl(p.companyLogo)} alt={p.companyName} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 bg-white rounded-lg border border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400">
                          <Building2 size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                          {p.placementType === 'internship' ? 'Interning at' : 'Placed at'}
                        </p>
                        <p className="text-sm font-extrabold text-gray-900 truncate">{p.companyName}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <FadeIn className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-[#0a1128] to-primary-900 rounded-3xl p-12 md:p-16 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm font-semibold px-5 py-2 rounded-full mb-6">
                <TrendingUp size={16} /> 100% Placement Assistance
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white md:mb-4">Your Career Starts Here</h2>
              <p className="text-primary-200 text-xl mb-10 max-w-2xl mx-auto">
                Join hundreds of successful alumni who launched their careers from our campus.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/admissions" className="bg-white text-primary-800 font-bold px-10 py-4 rounded-full hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-1 text-lg inline-block">
                  Apply Now
                </Link>
                <Link href="/contact" className="border-2 border-white/60 text-white font-bold px-10 py-4 rounded-full hover:bg-white/10 transition-all text-lg inline-block">
                  Contact Admissions <ArrowRight size={18} className="inline ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </MainLayout>
  );
}
