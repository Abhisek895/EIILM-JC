import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { noticeApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import { ClipboardList, FileText, BellRing, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

type Notice = {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
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
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);


  const load = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await noticeApi.getAll(p, 15);
      setNotices(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch {
      setError('Unable to load notices. API unreachable.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { load(page); }, [page]);

  return (
    <MainLayout>
      <HeroSlider
        pageKey="notices"
        fallbackTagline={siteSettings.notices_hero_tagline || 'Stay Updated'}
        fallbackHeading={siteSettings.notices_hero_heading || 'Important Notices'}
        fallbackSubheading={siteSettings.notices_hero_subheading || 'Stay informed with the latest announcements, schedules, and important updates from the college.'}
      />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 py-12">
        {error && (
          <div className="text-center py-6">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <FadeIn className="text-center py-20 text-gray-500">
            <div className="flex justify-center mb-6 text-gray-300">
              <ClipboardList size={64} />
            </div>
            <p className="text-lg font-medium text-gray-600">No notices published yet.</p>
          </FadeIn>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col sm:flex-row h-full"
                >
                  {/* Date Side block */}
                  <div className="bg-primary-50 px-6 py-4 flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-gray-100 min-w-[120px]">
                    <span className="text-3xl font-bold text-primary-600">
                      {new Date(n.publishDate || '').getDate()}
                    </span>
                    <span className="text-sm font-semibold text-primary-800 uppercase tracking-wider">
                      {new Date(n.publishDate || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Content block */}
                  <div className="p-6 flex-grow flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      {n.priority === 'high' && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded flex-shrink-0">
                          URGENT
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {n.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                      {n.description}
                    </p>

                    {n.pdfUrl && n.pdfUrl !== 'null' && (
                      <div className="mt-4">
                        <a
                          href={n.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FileText size={16} /> View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>   {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
