import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import Link from 'next/link';
import {  departmentApi , siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import { Building, Library } from 'lucide-react';

type Department = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  status: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    departmentApi
      .getAll(1, 50)
      .then((res: any) => {
        if (res?.data) setDepartments(res.data);
      })
      .catch(() => setError('Unable to load departments. API unreachable.'))
      .finally(() => setLoading(false));
  }, []);


  return (
    <MainLayout>
      <HeroSlider 
        pageKey="departments"
        fallbackTagline={siteSettings.dept_hero_tagline || 'Academic Departments'}
        fallbackHeading={siteSettings.dept_hero_heading || 'Our Departments'}
        fallbackSubheading={siteSettings.dept_hero_subheading || 'Explore our diverse academic departments dedicated to excellence in teaching and research.'}
      />

      <div className="container mx-auto px-6 py-14">
        {error && (
          <div className="text-center py-10">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {loading ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : departments.length === 0 ? (
          <FadeIn className="text-center py-20 text-gray-500">
            <div className="flex justify-center mb-6 text-gray-300">
              <Building size={64} />
            </div>
            <p className="text-lg font-medium text-gray-600">No departments found yet.</p>
            <p className="text-sm mt-2">Departments will appear here once added by the admin.</p>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => (
              <FadeIn delay={idx * 0.1} key={dept.id}>
              <Link
                href={dept.slug ? `/departments/${dept.slug}` : '#'}
                className="block bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-primary-200 group h-full flex flex-col"
              >
                <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <Library size={28} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {dept.name}
                </h2>
                {dept.description && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-grow">
                    {dept.description}
                  </p>
                )}
                <div className="mt-6 text-primary-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More <span>→</span>
                </div>
              </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
