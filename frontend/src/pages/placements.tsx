import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { placementApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import { getImageUrl } from '@utils/getImageUrl';

type PlacementRecord = {
  id: number;
  studentName: string;
  companyName: string;
  companyLogo: string | null;
  package: string;
  year: string;
  course: string | null;
  studentImage: string | null;
  placementType: 'placement' | 'internship';
  status: string;
};


export default function PlacementsPage() {
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    const load = async () => {
      try {
        const response: any = await placementApi.getAll(1, 100, 'published');
        if (response.success) {
          setPlacements(response.data || []);
        }
        const settingsRes: any = await siteSettingsApi.getMap();
        setSiteSettings(settingsRes?.data || {});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const years = ['All', ...Array.from(new Set(placements.map((p) => p.year?.trim() || ''))).filter(y => y).sort((a, b) => b.localeCompare(a))];
  const filtered = placements.filter((p) => {
    const matchYear = yearFilter === 'All' || (p.year?.trim() || '') === yearFilter;
    const matchType = typeFilter === 'All' || p.placementType === typeFilter;
    return matchYear && matchType;
  });

  return (
    <MainLayout>
      {/* Hero Banner Slider */}
      <HeroSlider 
        pageKey="placements"
        fallbackTagline={siteSettings.placement_hero_tagline || 'Career Placements'}
        fallbackHeading={siteSettings.placement_hero_heading || 'Outstanding Placements'}
        fallbackSubheading={siteSettings.placement_hero_subheading || 'Celebrating the success of our students securing top roles in global organizations.'}
      />

      <div className="container mx-auto px-6 py-12">
        {/* Filter Tabs */}
        {!loading && placements.length > 0 && (
          <div className="flex flex-col items-center gap-4 mb-10">
            {/* Type Filter */}
            <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
              {[
                { id: 'All', label: 'All Records' },
                { id: 'placement', label: 'Placements' },
                { id: 'internship', label: 'Internships' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    typeFilter === t.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Year Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(y)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                  yearFilter === y
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                }`}
              >
                {y === 'All' ? 'All Years' : y}
              </button>
            ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100 p-4">
                <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-100 rounded-lg w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-lg font-medium">No placement records found.</p>
            <p className="text-sm mt-1">Check back later for updates.</p>
          </div>
        )}

        {/* Placements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((placement) => (
            <div
              key={placement.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              <div className="h-56 relative bg-gray-50 overflow-hidden">
                {placement.studentImage ? (
                  <img
                    src={getImageUrl(placement.studentImage)}
                    alt={placement.studentName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-200">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                {/* Type Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2.5 py-1 rounded-lg shadow-sm font-bold text-xs uppercase tracking-wider">
                  {placement.placementType === 'internship' ? 'Internship' : 'Placement'}
                </div>
                {/* Package Badge */}
                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-lg shadow-lg font-bold text-sm tracking-wide">
                  {placement.package}
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                    {placement.studentName}
                  </h3>
                  <p className="text-sm font-medium text-primary-600 mb-2">
                    {placement.course || 'Student'} • Class of {placement.year}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {placement.companyLogo ? (
                    <div className="w-10 h-10 bg-white rounded-lg p-1 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={getImageUrl(placement.companyLogo)}
                        alt={placement.companyName}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400">
                      🏢
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      {placement.placementType === 'internship' ? 'Interning at' : 'Placed at'}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {placement.companyName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
