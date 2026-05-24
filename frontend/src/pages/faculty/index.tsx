import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import Link from 'next/link';
import { facultyApi, departmentApi } from '@api/endpoints';

type FacultyMember = {
  id: number;
  name: string;
  designation: string | null;
  photo: string | null;
  qualification: string | null;
  experience: string | null;
  email: string | null;
  department?: { id: number; name: string; slug: string | null };
};

type Department = { id: number; name: string; slug: string | null };

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const load = async (deptId?: number) => {
    setLoading(true);
    try {
      const res: any = await facultyApi.getAll(1, 100, deptId);
      setFaculty(res?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentApi.getAll(1, 50).then((res: any) => {
      setDepartments(res?.data || []);
    });
    load();
  }, []);

  const handleDeptFilter = (id?: number) => {
    setSelectedDept(id);
    load(id);
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-3">Our Faculty</h1>
          <p className="text-blue-100 max-w-xl">
            Meet our distinguished team of educators, researchers, and industry experts.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Department filter */}
        {departments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => handleDeptFilter(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedDept === undefined
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Departments
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => handleDeptFilter(d.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedDept === d.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : faculty.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">👨‍🏫</p>
            <p className="text-lg">No faculty members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {faculty.map((f) => (
              <Link
                key={f.id}
                href={`/faculty/${f.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group"
              >
                <div className="h-52 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {f.photo ? (
                    <img
                      src={f.photo}
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg">{f.name}</h3>
                  {f.designation && (
                    <p className="text-blue-600 text-sm font-medium">{f.designation}</p>
                  )}
                  {f.qualification && (
                    <p className="text-gray-500 text-xs mt-1">{f.qualification}</p>
                  )}
                  {f.department && (
                    <span className="inline-block mt-2 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                      {f.department.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
