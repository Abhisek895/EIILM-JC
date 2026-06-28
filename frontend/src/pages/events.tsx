import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { eventApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import Breadcrumb from '@components/Breadcrumb';
import { motion } from 'framer-motion';
import { Calendar, MapPin, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, ArrowRight } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';
import Link from 'next/link';

type Event = {
  id: number; title: string; description: string | null; banner: string | null;
  startDate: string | null; endDate: string | null; location: string | null;
  registrationLink: string | null; status: string;
};

const BANNER_GRADIENTS = [
  'from-primary-600 to-indigo-700',
  'from-violet-600 to-purple-700',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res: any = await eventApi.getAll(p, 9);
      setEvents(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(page); }, [page]);
  useEffect(() => { siteSettingsApi.getMap().then((r: any) => setSiteSettings(r?.data || {})); }, []);

  const formatDate = (d: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <MainLayout>
      <HeroSlider
        pageKey="events"
        fallbackTagline={siteSettings.events_hero_tagline || 'Campus Life'}
        fallbackHeading={siteSettings.events_hero_heading || 'Upcoming Events'}
        fallbackSubheading={siteSettings.events_hero_subheading || 'Discover academic seminars, cultural fests, and student activities happening around the campus.'}
      />
      <Breadcrumb items={[{ label: 'Events' }]} />

      <section className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600 mb-3 md:mb-4">What's Happening</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
              <CalendarDays size={40} className="text-primary-600" /> Campus Events
            </h2>
          </FadeIn>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && events.length === 0 && (
            <FadeIn className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
                <CalendarDays size={40} className="text-primary-300" />
              </div>
              <p className="text-xl font-bold text-gray-600 mb-2">No events scheduled yet.</p>
              <p className="text-gray-400">Check back soon for upcoming events and activities.</p>
            </FadeIn>
          )}

          {/* Events grid */}
          {!loading && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((e, idx) => {
                const dateObj = e.startDate ? new Date(e.startDate) : null;
                const gradient = BANNER_GRADIENTS[idx % BANNER_GRADIENTS.length];
                return (
                  <FadeIn delay={idx * 0.08} key={e.id}>
                    <motion.div
                      whileHover={{ y: -8, boxShadow: '0 28px 56px rgba(0,0,0,0.12)' }}
                      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-primary-100 transition-all flex flex-col h-full"
                    >
                      {/* Banner */}
                      <div className="relative h-52 overflow-hidden flex-shrink-0">
                        {e.banner ? (
                          <img
                            src={getImageUrl(e.banner)} alt={e.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <CalendarDays size={64} className="text-white opacity-30" />
                          </div>
                        )}
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Date badge */}
                        {dateObj && (
                          <div className="absolute top-4 left-4 bg-white rounded-2xl overflow-hidden shadow-lg text-center w-14">
                            <div className="bg-primary-600 text-white text-[10px] font-black py-1 uppercase tracking-wider">
                              {dateObj.toLocaleDateString('en-IN', { month: 'short' })}
                            </div>
                            <div className="text-2xl font-extrabold py-1.5 leading-none text-gray-900">
                              {dateObj.getDate()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h2 className="font-extrabold text-gray-900 text-lg leading-snug mb-3 group-hover:text-primary-700 transition-colors">{e.title}</h2>
                        {e.description && (
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">{e.description}</p>
                        )}

                        <div className="space-y-2 text-sm text-gray-500 font-medium mb-5">
                          {e.startDate && (
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-primary-400 flex-shrink-0" />
                              {formatDate(e.startDate)}
                              {e.endDate && e.endDate !== e.startDate ? ` – ${formatDate(e.endDate)}` : ''}
                            </div>
                          )}
                          {e.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-primary-400 flex-shrink-0" /> {e.location}
                            </div>
                          )}
                        </div>

                        {e.registrationLink && (
                          <a
                            href={e.registrationLink} target="_blank" rel="noopener noreferrer"
                            className="mt-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-600/20 hover:-translate-y-0.5"
                          >
                            <ExternalLink size={15} /> Register Now
                          </a>
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
            <div className="flex justify-center items-center gap-3 mt-14">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-bold text-sm shadow-sm transition-all">
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="px-5 py-2.5 text-sm font-semibold text-gray-500 bg-white border border-gray-100 rounded-full">
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 font-bold text-sm shadow-sm transition-all">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <FadeIn className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Never Miss an Event</h3>
              <p className="text-gray-500">Stay connected with campus life — check back regularly for new events.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/notices" className="inline-flex items-center gap-2 border-2 border-primary-600 text-primary-600 font-bold px-6 py-3 rounded-full hover:bg-primary-50 transition-all">
                View Notices
              </Link>
              <Link href="/admissions" className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-6 py-3 rounded-full hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 hover:-translate-y-0.5">
                Apply Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </MainLayout>
  );
}
