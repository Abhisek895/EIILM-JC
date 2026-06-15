import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { cmsApi, noticeApi, eventApi, siteSettingsApi } from '@api/endpoints';
import Link from 'next/link';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import { Calendar, MapPin, GraduationCap, Building2, Zap } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

// ─── Types ────────────────────────────────────────────────────────────────────
type Notice = { id: number; title: string; publishDate: string | null; priority: string };
type Event = { id: number; title: string; startDate: string | null; location: string | null; banner: string | null };
type PageSection = { id: number; sectionKey: string; config: Record<string, any>; sortOrder: number };
type SiteSettings = Record<string, string>;


// ─── Section Components ───────────────────────────────────────────────────────


function AnimatedCounter({ valueStr }: { valueStr: string }) {
  const match = valueStr.match(/^(\d+)(.*)$/);
  const targetNumber = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : valueStr;

  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetNumber === null) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setCount(Math.floor(easeProgress * targetNumber));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, targetNumber]);

  if (targetNumber === null) return <>{valueStr}</>;

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

function StatsSection({ config, settings }: { config: Record<string, any>; settings: SiteSettings }) {
  // Always build from DB settings to ensure it responds to the admin panel
  const stats = [
    { label: 'Years of Excellence', value: settings.stat_years },
    { label: 'Students Enrolled', value: settings.stat_students },
    { label: 'Faculty Members', value: settings.stat_faculty },
    { label: 'Courses Offered', value: settings.stat_courses },
  ];

  const activeStats = stats.filter((s: any) => s.value && s.value.trim() !== '');

  if (activeStats.length === 0) return null;

  return (
    <div className="bg-primary-700 text-white py-0">
      <div className="container mx-auto px-6">
        <div className="flex flex-row flex-nowrap items-center justify-between gap-6 md:gap-8 overflow-x-auto hide-scrollbar w-full">
          {activeStats.map((s: any, i: number) => (
            <div key={i} className="py-2 flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="text-2xl md:text-3xl font-extrabold leading-none">
                <AnimatedCounter valueStr={s.value} />
              </span>
              <span className="text-primary-200 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-none">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoticesSection({ notices }: { notices: Notice[] }) {
  return (
    <section className="py-20 bg-gray-50">
      <FadeIn className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Notices</h2>
          <Link href="/notices" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
            View All →
          </Link>
        </div>
        {notices.length === 0 ? (
          <p className="text-gray-500">No notices published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {notices.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between bg-white rounded-lg p-5 shadow-sm border-l-4 border-primary-500 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 pr-4">
                  {n.priority === 'high' && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">
                      URGENT
                    </span>
                  )}
                  <span className="text-gray-800 font-medium line-clamp-2">{n.title}</span>
                </div>
                {n.publishDate && (
                  <span className="text-gray-400 text-sm flex-shrink-0">
                    {new Date(n.publishDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </section>
  );
}

function EventsSection({ events }: { events: Event[] }) {
  return (
    <section className="py-20">
      <FadeIn className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
          <Link href="/events" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
            View All →
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="text-gray-500">No upcoming events.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {events.map((e) => (
              <div key={e.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {e.banner && (
                  <img src={getImageUrl(e.banner)} alt={e.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-3">{e.title}</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    {e.startDate && (
                      <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(e.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    )}
                    {e.location && <span className="flex items-center gap-2"><MapPin size={16} /> {e.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </section>
  );
}

function FeaturesSection({ config }: { config: Record<string, any> }) {
  const features = config.features || [
    { title: 'Academic Excellence', desc: 'World-class faculty and curriculum designed for the modern world.', icon: <GraduationCap size={40} className="text-primary-500" /> },
    { title: 'Industry Connect', desc: 'Strong industry partnerships providing internships and placements.', icon: <Building2 size={40} className="text-primary-500" /> },
    { title: 'Dynamic CMS', desc: 'All website content managed through an admin panel — no coding needed.', icon: <Zap size={40} className="text-primary-500" /> },
  ];
  return (
    <section className="py-20 bg-gray-50">
      <FadeIn className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {config.heading || 'Why Choose Us'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {features.map((f: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
              <div className="mb-6 flex justify-center">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function CTASection({ config, settings }: { config: Record<string, any>; settings: SiteSettings }) {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-indigo-700 text-white relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <FadeIn className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          {config.heading || 'Ready to Begin Your Journey?'}
        </h2>
        <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          {config.subheading || `Join ${settings.college_name || 'our college'} and shape your future.`}
        </p>
        <Link
          href={config.cta?.href || '/admissions'}
          className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-full hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
        >
          {config.cta?.label || 'Apply Now'}
        </Link>
      </FadeIn>
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
      return (
        <HeroSlider
          pageKey="home"
          fallbackTagline={settings.tagline || 'Excellence in Education'}
          fallbackHeading={settings.hero_heading || `Welcome to ${settings.college_name || 'Our College'}`}
          fallbackSubheading={settings.hero_subheading || 'A premier institution of higher learning committed to academic excellence and holistic development.'}
        />
      );
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
  { id: 1, sectionKey: 'hero', config: { slides: [] }, sortOrder: 0 },
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium">Loading content...</div>
          </div>
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
