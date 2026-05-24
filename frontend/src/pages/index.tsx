import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { cmsApi, noticeApi, eventApi, siteSettingsApi } from '@api/endpoints';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
type Notice = { id: number; title: string; publishDate: string | null; priority: string };
type Event = { id: number; title: string; startDate: string | null; location: string | null; banner: string | null };
type PageSection = { id: number; sectionKey: string; config: Record<string, any>; sortOrder: number };
type SiteSettings = Record<string, string>;

// ─── Section Components ───────────────────────────────────────────────────────
function HeroSection({ config, settings }: { config: Record<string, any>; settings: SiteSettings }) {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-24">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200 mb-3">
          {settings.tagline || config.badge || 'Excellence in Education'}
        </p>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          {config.heading || settings.hero_heading || `Welcome to ${settings.college_name || 'Our College'}`}
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
          {config.subheading || settings.hero_subheading || 'A premier institution of higher learning committed to academic excellence and holistic development.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={config.primaryCta?.href || '/admissions'}
            className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-blue-50 transition-all shadow-lg"
          >
            {config.primaryCta?.label || 'Apply for Admission'}
          </Link>
          <Link
            href={config.secondaryCta?.href || '/courses'}
            className="inline-block border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-all"
          >
            {config.secondaryCta?.label || 'Explore Courses'}
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatsSection({ config, settings }: { config: Record<string, any>; settings: SiteSettings }) {
  const stats = config.stats || [
    { label: 'Years of Excellence', value: settings.stat_years || '25+' },
    { label: 'Students Enrolled', value: settings.stat_students || '5000+' },
    { label: 'Faculty Members', value: settings.stat_faculty || '200+' },
    { label: 'Courses Offered', value: settings.stat_courses || '50+' },
  ];
  return (
    <div className="bg-blue-700 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s: any, i: number) => (
            <div key={i} className="p-4">
              <div className="text-4xl font-extrabold mb-1">{s.value}</div>
              <div className="text-blue-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoticesSection({ notices }: { notices: Notice[] }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Notices</h2>
          <Link href="/notices" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            View All →
          </Link>
        </div>
        {notices.length === 0 ? (
          <p className="text-gray-500">No notices published yet.</p>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500"
              >
                <div className="flex items-center gap-3">
                  {n.priority === 'high' && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                      URGENT
                    </span>
                  )}
                  <span className="text-gray-800 font-medium">{n.title}</span>
                </div>
                {n.publishDate && (
                  <span className="text-gray-400 text-sm hidden md:block">
                    {new Date(n.publishDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EventsSection({ events }: { events: Event[] }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
          <Link href="/events" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            View All →
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="text-gray-500">No upcoming events.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => (
              <div key={e.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {e.banner && (
                  <img src={e.banner} alt={e.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{e.title}</h3>
                  <div className="flex flex-col gap-1 text-sm text-gray-500">
                    {e.startDate && (
                      <span>📅 {new Date(e.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    )}
                    {e.location && <span>📍 {e.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturesSection({ config }: { config: Record<string, any> }) {
  const features = config.features || [
    { title: 'Academic Excellence', desc: 'World-class faculty and curriculum designed for the modern world.', icon: '🎓' },
    { title: 'Industry Connect', desc: 'Strong industry partnerships providing internships and placements.', icon: '🤝' },
    { title: 'Dynamic CMS', desc: 'All website content managed through an admin panel — no coding needed.', icon: '⚡' },
  ];
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {config.heading || 'Why Choose Us'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ config, settings }: { config: Record<string, any>; settings: SiteSettings }) {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          {config.heading || 'Ready to Begin Your Journey?'}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {config.subheading || `Join ${settings.college_name || 'our college'} and shape your future.`}
        </p>
        <Link
          href={config.cta?.href || '/admissions'}
          className="inline-block bg-white text-blue-700 font-bold px-10 py-4 rounded-full hover:bg-blue-50 transition-all shadow-lg text-lg"
        >
          {config.cta?.label || 'Apply Now'}
        </Link>
      </div>
    </section>
  );
}

// ─── Section Renderer ─────────────────────────────────────────────────────────
function SectionRenderer({
  section,
  notices,
  events,
  settings,
}: {
  section: PageSection;
  notices: Notice[];
  events: Event[];
  settings: SiteSettings;
}) {
  const cfg = section.config || {};

  switch (section.sectionKey) {
    case 'hero':
      return <HeroSection config={cfg} settings={settings} />;
    case 'stats':
      return <StatsSection config={cfg} settings={settings} />;
    case 'notices_list':
      return <NoticesSection notices={notices} />;
    case 'events_list':
      return <EventsSection events={events} />;
    case 'features':
      return <FeaturesSection config={cfg} />;
    case 'cta':
      return <CTASection config={cfg} settings={settings} />;
    default:
      return null;
  }
}

// ─── Default sections (shown when DB has no page_sections rows) ───────────────
const DEFAULT_SECTIONS: PageSection[] = [
  { id: 1, sectionKey: 'hero', config: {}, sortOrder: 0 },
  { id: 2, sectionKey: 'stats', config: {}, sortOrder: 1 },
  { id: 3, sectionKey: 'features', config: {}, sortOrder: 2 },
  { id: 4, sectionKey: 'notices_list', config: {}, sortOrder: 3 },
  { id: 5, sectionKey: 'events_list', config: {}, sortOrder: 4 },
  { id: 6, sectionKey: 'cta', config: {}, sortOrder: 5 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sectionsRes, noticesRes, eventsRes, settingsRes] = await Promise.allSettled([
          cmsApi.getPageSections('home'),
          noticeApi.getAll(1, 5),
          eventApi.getAll(1, 3),
          siteSettingsApi.getMap(),
        ]);

        // Sections
        if (sectionsRes.status === 'fulfilled') {
          const data = (sectionsRes.value as any)?.data;
          setSections(Array.isArray(data) && data.length > 0 ? data : DEFAULT_SECTIONS);
        } else {
          setSections(DEFAULT_SECTIONS);
        }

        // Notices
        if (noticesRes.status === 'fulfilled') {
          const data = (noticesRes.value as any)?.data;
          setNotices(Array.isArray(data) ? data : []);
        }

        // Events
        if (eventsRes.status === 'fulfilled') {
          const data = (eventsRes.value as any)?.data;
          setEvents(Array.isArray(data) ? data : []);
        }

        // Settings
        if (settingsRes.status === 'fulfilled') {
          const data = (settingsRes.value as any)?.data;
          if (data && typeof data === 'object') setSettings(data);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-400 text-lg">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          notices={notices}
          events={events}
          settings={settings}
        />
      ))}
    </MainLayout>
  );
}
