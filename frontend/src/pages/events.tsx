import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import {  eventApi , siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import { Calendar, MapPin, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

type Event = {
  id: number;
  title: string;
  description: string | null;
  banner: string | null;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  registrationLink: string | null;
  status: string;
};


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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const formatDate = (d: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <MainLayout>
      <HeroSlider 
        pageKey="events"
        fallbackTagline={siteSettings.events_hero_tagline || 'Campus Life'}
        fallbackHeading={siteSettings.events_hero_heading || 'Upcoming Events'}
        fallbackSubheading={siteSettings.events_hero_subheading || 'Discover academic seminars, cultural fests, and student activities happening around the campus.'}
      />

      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <FadeIn className="text-center py-20 text-gray-500">
            <div className="flex justify-center mb-6 text-gray-300">
              <CalendarDays size={64} />
            </div>
            <p className="text-lg font-medium text-gray-600">No events scheduled yet.</p>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e, idx) => (
              <FadeIn delay={idx * 0.1} key={e.id}>
              <div
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {e.banner ? (
                  <img src={getImageUrl(e.banner)} alt={e.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white">
                    <CalendarDays size={64} className="opacity-50" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="font-bold text-gray-900 text-xl mb-3 leading-tight group-hover:text-primary-600 transition-colors">{e.title}</h2>
                  {e.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                      {e.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm text-gray-500 font-medium mb-6">
                    {e.startDate && (
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-primary-500" /> {formatDate(e.startDate)}{e.endDate && e.endDate !== e.startDate ? ` – ${formatDate(e.endDate)}` : ''}</div>
                    )}
                    {e.location && <div className="flex items-center gap-2"><MapPin size={16} className="text-primary-500" /> {e.location}</div>}
                  </div>
                  {e.registrationLink && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <a
                        href={e.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white text-sm font-bold px-4 py-3 rounded-xl transition-all"
                      >
                        Register Now →
                      </a>
                    </div>
                  )}
                </div>
              </div>
              </FadeIn>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors text-sm font-bold shadow-sm"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="px-4 py-2 text-sm font-semibold text-gray-500">Page {page} of {totalPages}</span>
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
    </MainLayout>
  );
}
