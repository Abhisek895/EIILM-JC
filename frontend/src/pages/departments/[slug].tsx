import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { departmentApi, facultyApi } from '@api/endpoints';
import Link from 'next/link';

type Department = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  faculty?: FacultyMember[];
};

type FacultyMember = {
  id: number;
  name: string;
  designation: string | null;
  photo: string | null;
  qualification: string | null;
  email: string | null;
};

export default function DepartmentDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [dept, setDept] = useState<Department | null>(null);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return;

    Promise.all([
      departmentApi.getBySlug(slug),
      facultyApi.getAll(1, 50),
    ])
      .then(([deptRes, facultyRes]: any[]) => {
        if (!deptRes?.data) {
          setNotFound(true);
          return;
        }
        setDept(deptRes.data);

        // Filter faculty by department
        const allFaculty = facultyRes?.data || [];
        setFaculty(
          allFaculty.filter(
            (f: FacultyMember & { department?: { slug?: string } }) =>
              f.department?.slug === slug
          )
        );
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-20 text-center text-gray-400 animate-pulse">
          Loading department...
        </div>
      </MainLayout>
    );
  }

  if (notFound || !dept) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-20 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Department Not Found</h1>
          <Link href="/departments" className="text-blue-600 hover:underline">
            ← Back to Departments
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-6">
          <Link href="/departments" className="text-blue-200 text-sm hover:text-white mb-3 inline-block">
            ← All Departments
          </Link>
          <h1 className="text-4xl font-extrabold">{dept.name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {dept.description && (
          <div className="max-w-3xl mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Department</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{dept.description}</p>
          </div>
        )}

        {faculty.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Faculty Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculty.map((f) => (
                <Link
                  key={f.id}
                  href={`/faculty/${f.id}`}
                  className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
                    {f.photo ? (
                      <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{f.name}</h3>
                    {f.designation && (
                      <p className="text-blue-600 text-sm">{f.designation}</p>
                    )}
                    {f.qualification && (
                      <p className="text-gray-500 text-xs mt-0.5">{f.qualification}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
