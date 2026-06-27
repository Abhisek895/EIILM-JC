import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { useAuth } from '@hooks/useAuth';
import { studentApi } from '@api/endpoints';
import Link from 'next/link';
import { BookOpen, Award, AlertCircle } from 'lucide-react';

export default function GradesPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    studentApi.grades()
      .then((res: any) => {
        if (res?.data) setGrades(res.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, isHydrated, router]);

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen pb-12">
        <div className="bg-primary-900 text-white pt-16 pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">My Academic Record</h1>
            <p className="text-primary-200">View your grades, credits, and overall academic performance.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-12">
          {/* Quick Links */}
          <div className="flex gap-3 mb-8 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 max-w-fit">
            <Link href="/student" className="px-5 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/student/grades" className="px-5 py-2 bg-primary-50 text-primary-700 rounded-xl font-bold transition-colors">
              Grades & Results
            </Link>
            <Link href="/student/fees" className="px-5 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Fee Management
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Grade Report</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Credits</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500 animate-pulse">Loading grades...</td></tr>
                  ) : grades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <AlertCircle size={48} className="mb-4 text-gray-300" />
                          <p className="text-lg font-bold text-gray-900">No Grades Found</p>
                          <p>Your academic records will appear here once published.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    grades.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{g.semester}</td>
                        <td className="px-6 py-4 text-gray-700">{g.subject}</td>
                        <td className="px-6 py-4 font-mono text-gray-500">{g.credits}</td>
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-lg text-primary-600">{g.grade}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${g.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : g.status === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
