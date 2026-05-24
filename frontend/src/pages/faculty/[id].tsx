import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { facultyApi } from '@api/endpoints';
import Link from 'next/link';

type FacultyMember = {
  id: number;
  name: string;
  designation: string | null;
  photo: string | null;
  qualification: string | null;
  experience: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  department?: { id: number; name: string; slug: string | null };
};

export default function FacultyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [faculty, setFaculty] = useState<FacultyMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    facultyApi
      .getById(Number(id))
      .then((res: any) => setFaculty(res?.data || null))
      .catch(() => setFaculty(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-20 animate-pulse text-center text-gray-400">
          Loading...
        </div>
      </MainLayout>
    );
  }

  if (!faculty) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-20 text-center">
          <p className="text-5xl mb-4">👤</p>
          <h1 className="text-2xl font-bold text-gray-800">Faculty Member Not Found</h1>
          <Link href="/faculty" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Faculty
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-6">
          <Link href="/faculty" className="text-blue-200 text-sm hover:text-white mb-3 inline-block">
            ← All Faculty
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Photo */}
              <div className="md:w-64 h-72 md:h-auto bg-gray-100 flex-shrink-0">
                {faculty.photo ? (
                  <img
                    src={faculty.photo}
                    alt={faculty.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl">
                    👤
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-8 flex-1">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{faculty.name}</h1>
                {faculty.designation && (
                  <p className="text-blue-600 font-semibold text-lg mb-2">{faculty.designation}</p>
                )}
                {faculty.department && (
                  <Link
                    href={faculty.department.slug ? `/departments/${faculty.department.slug}` : '#'}
                    className="inline-block bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full mb-4 hover:bg-blue-100"
                  >
                    {faculty.department.name}
                  </Link>
                )}

                <div className="space-y-3 text-sm text-gray-600 mt-4">
                  {faculty.qualification && (
                    <div>
                      <span className="font-semibold text-gray-800">Qualification:</span>{' '}
                      {faculty.qualification}
                    </div>
                  )}
                  {faculty.experience && (
                    <div>
                      <span className="font-semibold text-gray-800">Experience:</span>{' '}
                      {faculty.experience}
                    </div>
                  )}
                  {faculty.email && (
                    <div>
                      <span className="font-semibold text-gray-800">Email:</span>{' '}
                      <a href={`mailto:${faculty.email}`} className="text-blue-600 hover:underline">
                        {faculty.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {faculty.bio && (
              <div className="px-8 pb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{faculty.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
