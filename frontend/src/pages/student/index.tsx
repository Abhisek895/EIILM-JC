import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { useAuth } from '@hooks/useAuth';
import { studentApi } from '@api/endpoints';

type StudentProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

type Course = {
  id: number;
  courseName: string;
  courseCode?: string;
  courseType: string;
  duration?: string;
};

export default function StudentPortalPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const load = async () => {
      try {
        const [meResponse, courseResponse]: any = await Promise.all([
          studentApi.me(),
          studentApi.courses(1, 6),
        ]);

        if (meResponse.success) {
          setProfile(meResponse.data);
        }
        if (courseResponse.success) {
          setCourses(courseResponse.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, isHydrated, router]);

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Student Portal</h1>
        {loading ? (
          <div className="card">Loading your portal...</div>
        ) : (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-2">Profile</h2>
              <p>Name: {profile?.name || user?.name || '-'}</p>
              <p>Email: {profile?.email || user?.email || '-'}</p>
              <p>Role: {profile?.role || user?.role || '-'}</p>
              <p>Status: {profile?.status || 'active'}</p>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-3">Available Courses</h2>
              {courses.length === 0 ? (
                <p className="text-gray-600">No courses available right now.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold">{course.courseName}</p>
                      <p className="text-sm text-gray-600">
                        {course.courseCode || 'N/A'} • {course.courseType} • {course.duration || 'TBD'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
