import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { courseApi } from '@api/endpoints';

type Course = {
  id: number;
  courseName: string;
  courseCode?: string;
  courseType: string;
  duration?: string;
  description?: string;
  status: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response: any = await courseApi.getAll(1, 20);
        if (response.success) {
          setCourses(response.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Courses</h1>

        {loading ? (
          <div className="card">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="card">No courses published yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="card">
                <h2 className="text-xl font-bold text-gray-900">{course.courseName}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {course.courseCode || 'N/A'} • {course.courseType} • {course.duration || 'Duration TBD'}
                </p>
                <p className="text-gray-700 mt-3">{course.description || 'Details will be updated soon.'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
