import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import Link from 'next/link';
import { departmentApi } from '@api/endpoints';

type Department = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  status: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentApi
      .getAll(1, 50)
      .then((res: any) => {
        if (res?.data) setDepartments(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-3">Departments</h1>
          <p className="text-blue-100 max-w-xl">
            Explore our diverse academic departments, each committed to excellence in education and
            research.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-14">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">🏛️</p>
            <p className="text-lg">No departments found yet.</p>
            <p className="text-sm mt-2">Departments will appear here once added by the admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                href={dept.slug ? `/departments/${dept.slug}` : '#'}
                className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200 group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <span className="text-2xl">🎓</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {dept.name}
                </h2>
                {dept.description && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {dept.description}
                  </p>
                )}
                <div className="mt-4 text-blue-600 text-sm font-semibold">
                  Learn More →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
