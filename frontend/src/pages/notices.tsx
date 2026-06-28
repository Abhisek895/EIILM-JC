import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { noticeApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import Breadcrumb from '@components/Breadcrumb';
import { motion } from 'framer-motion';
import { Bell, FileText, ChevronLeft, ChevronRight, Search, AlertTriangle, Info } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

type Notice = {
  id: number; title: string; description: string | null; image: string | null;
  pdfUrl: string | null; publishDate: string | null;
  priority: 'low' | 'medium' | 'high'; status: string;
};

const PRIORITY_CONFIG = {
  high:   { label: 'Urgent',  color: 'border-l-red-500',   badge: 'bg-red-50 text-red-600 border-red-200',   icon: AlertTriangle },
  medium: { label: 'Important', color: 'border-l-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: Info },
  low:    { label: 'Notice',  color: 'border-l-gray-300',  badge: 'bg-gray-50 text-gray-500 border-gray-200',  icon: Bell },
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const load = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await noticeApi.getAll(p, 15);
      setNotices(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch { setError('Unable to load notices. Please try again later.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page]);

  const displayed = notices.filter(n => {
    const matchPriority = priorityFilter === 'all' || n.priority === priorityFilter;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    return matchPriority && matchSearch;
  });

  return (
    <MainLayout>
      <HeroSlider
        pageKey="notices"
        fallbackTagline="Stay Updated"
        fallbackHeading="Important Notices"
        fallbackSubheading="Stay informed with the latest announcements, schedules, and important updates from the college."
      />
      <Breadcrumb items={[{ label: 'Notices' }]} />

      <section className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600 mb-3 md:mb-4">Latest Updates</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
              <Bell size={40} className="text-primary-600" /> Notices &amp; Announcements
            </h2>
          </FadeIn>

          {/* Search + Filter bar */}
          <FadeIn className="flex flex-col sm:flex-row gap-4 mb-10 max-w-3xl mx-auto">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none text-sm"
              />
            </div>
            {/* Priority filter */}
            <div className="flex bg-white border border-gray-200 p-1 rounded-full gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'high', label: '🔴 Urgent' },
                { id: 'medium', label: '🟡 Important' },
                { id: 'low', label: 'Normal' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPriorityFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    priorityFilter === f.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </FadeIn>

          {error && <div className="text-center py-6 text-red-600 font-semibold">{error}</div>}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border-l-4 border-gray-200" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && displayed.length === 0 && (
            <FadeIn className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Bell size={32} className="text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-600 mb-2">No notices found.</p>
              <p className="text-gray-400 text-sm">
                {search ? 'Try a different search term.' : 'Check back soon for updates.'}
              </p>
            </FadeIn>
          )}

          {/* Notices list */}
          {!loading && displayed.length > 0 && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {displayed.map((n, i) => {
                const cfg = PRIORITY_CONFIG[n.priority] || PRIORITY_CONFIG.low;
                const PriorityIcon = cfg.icon;
                return (
                  <FadeIn delay={i * 0.05} key={n.id}>
                    <motion.div
                      whileHover={{ x: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                      className={`bg-white rounded-2xl border-l-4 ${cfg.color} shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row overflow-hidden`}
                    >
                      {/* Date column */}
                      <div className="sm:w-28 bg-primary-50/50 px-5 py-5 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-center border-b sm:border-b-0 sm:border-r border-gray-100 flex-shrink-0">
                        <span className="text-3xl font-extrabold text-primary-600 leading-none">
                          {n.publishDate ? new Date(n.publishDate).getDate() : '—'}
                        </span>
                        <span className="text-xs font-bold text-primary-800 uppercase tracking-wider mt-1">
                          {n.publishDate ? new Date(n.publishDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-grow flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${cfg.badge}`}>
                            <PriorityIcon size={11} /> {cfg.label}
                          </span>
                        </div>
                        <h3 className="text-gray-900 font-bold text-base leading-snug mb-1">{n.title}</h3>
                        {n.description && (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{n.description}</p>
                        )}
                        {n.pdfUrl && n.pdfUrl !== 'null' && (
                          <div className="mt-3">
                            <a
                              href={n.pdfUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
                            >
                              <FileText size={15} /> View Attachment
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </FadeIn>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-bold text-sm shadow-sm transition-all"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="px-5 py-2.5 text-sm font-semibold text-gray-500 bg-white border border-gray-100 rounded-full">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-bold text-sm shadow-sm transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
