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

import Link from 'next/link';
import { UserCircle, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

export default function StudentPortalPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
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

        if (meResponse?.data) setProfile(meResponse.data);
        if (courseResponse?.data) setCourses(courseResponse.data);
      } catch (err) {
        console.error('Failed to load portal data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, isHydrated, router]);

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen pb-12">
        <div className="bg-primary-900 text-white pt-16 pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome back, {profile?.name || user?.name || 'Student'}! 👋</h1>
            <p className="text-primary-200">Here is an overview of your academic journey and pending actions.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-12">
          {/* Quick Links */}
          <div className="flex gap-3 mb-8 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 max-w-fit">
            <Link href="/student" className="px-5 py-2 bg-primary-50 text-primary-700 rounded-xl font-bold transition-colors">
              Dashboard
            </Link>
            <Link href="/student/grades" className="px-5 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Grades & Results
            </Link>
            <Link href="/student/fees" className="px-5 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Fee Management
            </Link>
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center animate-pulse text-gray-500 font-bold">
              Loading dashboard...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Card */}
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                  <UserCircle size={64} strokeWidth={1} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{profile?.name || user?.name || 'Unknown'}</h2>
                <p className="text-sm text-gray-500 mb-6">{profile?.email || user?.email}</p>
                <div className="w-full space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold text-gray-500">Role</span>
                    <span className="text-sm font-bold text-gray-900 uppercase">{profile?.role || user?.role}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold text-gray-500">Status</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 rounded-md">{profile?.status || 'Active'}</span>
                  </div>
                </div>
              </div>

              {/* Courses Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-fuchsia-50 text-fuchsia-600 rounded-xl flex items-center justify-center">
                      <GraduationCap size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">My Active Courses</h2>
                  </div>
                  <Link href="/courses" className="text-sm font-bold text-primary-600 flex items-center gap-1 hover:text-primary-700">
                    Browse All <ArrowRight size={16} />
                  </Link>
                </div>
                
                <div className="p-6">
                  {courses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen size={48} className="mx-auto text-gray-200 mb-3" />
                      <p className="font-bold">No active courses found.</p>
                      <p className="text-sm">You are not enrolled in any courses for this semester.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {courses.map((course) => (
                        <div key={course.id} className="border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl p-4 flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-bold text-fuchsia-600 bg-fuchsia-100 px-2 py-1 rounded-md mb-2 inline-block">
                              {course.courseCode || 'CORE'}
                            </span>
                            <h3 className="font-bold text-gray-900 leading-tight mb-1">{course.courseName}</h3>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-4 pt-4 border-t border-gray-200">
                            {course.courseType} • {course.duration || 'TBD'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
