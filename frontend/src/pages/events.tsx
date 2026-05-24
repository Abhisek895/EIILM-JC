import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { eventApi } from '@api/endpoints';

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
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-3">Events</h1>
          <p className="text-blue-100">Upcoming and recent events at the college.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-lg">No events scheduled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                {e.banner ? (
                  <img src={e.banner} alt={e.title} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-5xl">
                    🎉
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-bold text-gray-900 text-lg mb-3 leading-tight">{e.title}</h2>
                  {e.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-gray-500">
                    {e.startDate && (
                      <div>📅 {formatDate(e.startDate)}{e.endDate && e.endDate !== e.startDate ? ` – ${formatDate(e.endDate)}` : ''}</div>
                    )}
                    {e.location && <div>📍 {e.location}</div>}
                  </div>
                  {e.registrationLink && (
                    <a
                      href={e.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Register Now →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 text-sm font-medium"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 text-sm font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
