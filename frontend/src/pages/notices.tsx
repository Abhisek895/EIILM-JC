import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { noticeApi } from '@api/endpoints';

type Notice = {
  id: number;
  title: string;
  description: string | null;
  pdfUrl: string | null;
  publishDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: string;
};

const PRIORITY_STYLE = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res: any = await noticeApi.getAll(p, 15);
      setNotices(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-3">Notices & Announcements</h1>
          <p className="text-blue-100">Stay updated with the latest announcements from the college.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg">No notices published yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          PRIORITY_STYLE[n.priority] || PRIORITY_STYLE.low
                        }`}
                      >
                        {n.priority}
                      </span>
                      {n.publishDate && (
                        <span className="text-xs text-gray-400">
                          {new Date(n.publishDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <h2 className="font-semibold text-gray-900 text-lg">{n.title}</h2>
                    {n.description && (
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{n.description}</p>
                    )}
                  </div>
                  {n.pdfUrl && (
                    <a
                      href={n.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      📄 View PDF
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
