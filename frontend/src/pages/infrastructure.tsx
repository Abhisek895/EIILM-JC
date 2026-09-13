import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@layouts/MainLayout';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import SEO from '@components/SEO';
import { infrastructureApi, siteSettingsApi } from '@api/endpoints';
import { getImageUrl } from '@utils/image';
import {
  ArrowRight,
  Building,
  Building2,
  PlayCircle,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

type InfraItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  icon: string;
  category: 'facility' | 'tour' | 'campus_highlight' | 'hero';
  status: 'active' | 'inactive' | 'maintenance';
};

type SectionTabId = 'All' | 'Campus Highlights' | 'Facilities' | 'Virtual Tours';
type SectionKind = 'highlight' | 'facility' | 'tour';

const SECTION_TABS: Array<{ id: SectionTabId; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'Campus Highlights', label: 'Highlights' },
  { id: 'Facilities', label: 'Facilities' },
  { id: 'Virtual Tours', label: 'Tours' },
];

const SECTION_META: Record<SectionKind, { badge: string; badgeIcon: React.ElementType }> = {
  highlight: { badge: 'Highlight', badgeIcon: Sparkles },
  facility: { badge: 'Facility', badgeIcon: Building2 },
  tour: { badge: 'Virtual Tour', badgeIcon: PlayCircle },
};

const STAT_GRADIENTS = [
  'from-primary-600 to-indigo-700',
  'from-emerald-500 to-teal-600',
  'from-violet-600 to-fuchsia-700',
  'from-amber-500 to-orange-600',
];

function OverviewStatCard({
  icon: Icon,
  label,
  value,
  note,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-5 transition-transform duration-700 group-hover:scale-150`} />
      <div className="relative z-10">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-black/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon size={26} />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">{label}</p>
        <p className="mt-2 text-4xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{note}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string; }) {
  return (
    <FadeIn className="mx-auto w-full max-w-3xl rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
        <Icon size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500">{description}</p>
    </FadeIn>
  );
}

function InfrastructureCard({
  item,
  kind,
  isFeatured,
  muted,
  onToggleMute,
}: {
  item: InfraItem;
  kind: SectionKind;
  isFeatured: boolean;
  muted?: boolean;
  onToggleMute?: (e: React.MouseEvent, id: number) => void;
}) {
  const meta = SECTION_META[kind];
  const BadgeIcon = meta.badgeIcon;
  const isVideoValid =
    typeof item.videoUrl === 'string' &&
    item.videoUrl.trim() !== '' &&
    item.videoUrl !== 'null' &&
    /\.(mp4|webm|ogg|mov)$/i.test(item.videoUrl);

  const showControls = kind !== 'highlight';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-900/20 ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <div className={`relative h-full w-full ${isFeatured ? 'min-h-[400px] md:min-h-[500px]' : 'aspect-[4/3]'}`}>
        {isVideoValid ? (
          showControls ? (
            <video
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
              controls
              preload="metadata"
              poster={item.imageUrl ? getImageUrl(item.imageUrl) : undefined}
            >
              <source src={getImageUrl(item.videoUrl)} type="video/mp4" />
            </video>
          ) : (
            <video
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
              autoPlay
              muted={muted ?? false}
              loop
              playsInline
              poster={item.imageUrl ? getImageUrl(item.imageUrl) : undefined}
            >
              <source src={getImageUrl(item.videoUrl)} type="video/mp4" />
            </video>
          )
        ) : item.imageUrl ? (
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600">
            <BadgeIcon size={80} />
          </div>
        )}

        {/* Premium Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-75" />

        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-sm backdrop-blur-md">
          <BadgeIcon size={14} className="text-primary-400" />
          {meta.badge}
        </div>

        {kind === 'highlight' && isVideoValid && onToggleMute && (
          <button
            onClick={(e) => onToggleMute(e, item.id)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-black/60"
            aria-label="Toggle mute"
          >
            {(muted ?? false) ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 transform transition-transform duration-500 ease-out">
          <h3 className={`font-black tracking-tight text-white drop-shadow-md ${isFeatured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
            {item.title}
          </h3>
          <p className={`mt-3 leading-relaxed text-slate-300 drop-shadow line-clamp-3 ${isFeatured ? 'text-lg md:text-xl' : 'text-sm'}`}>
            {item.description}
          </p>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary-400 opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            <span>Explore further</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function InfrastructurePage() {
  const [items, setItems] = useState<InfraItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SectionTabId>('All');
  const [mutedVideos, setMutedVideos] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([infrastructureApi.getAll(1, 100), siteSettingsApi.getMap()])
      .then(([infraRes, settingsRes]) => {
        if (!isMounted) return;

        if (infraRes.status === 'fulfilled') {
          const data: InfraItem[] = ((infraRes.value as any)?.data as InfraItem[]) || [];
          setItems(data.filter((item) => item.status === 'active'));
        }

        if (settingsRes.status === 'fulfilled') {
          setSiteSettings(((settingsRes.value as any)?.data as Record<string, string>) || {});
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute counts
  const highlightsCount = items.filter(i => i.category === 'hero' || i.category === 'campus_highlight').length;
  const facilitiesCount = items.filter(i => i.category === 'facility').length;
  const toursCount = items.filter(i => i.category === 'tour').length;

  const overviewStats = [
    {
      icon: Sparkles,
      label: 'Campus Highlights',
      value: `${highlightsCount}`.padStart(2, '0'),
      note: 'Important moments and student-facing spaces.',
      accent: STAT_GRADIENTS[0],
    },
    {
      icon: Building2,
      label: 'Facilities',
      value: `${facilitiesCount}`.padStart(2, '0'),
      note: 'Learning spaces, support spaces, and campus essentials.',
      accent: STAT_GRADIENTS[1],
    },
    {
      icon: PlayCircle,
      label: 'Virtual Tours',
      value: `${toursCount}`.padStart(2, '0'),
      note: 'Walkthroughs that help students explore before they visit.',
      accent: STAT_GRADIENTS[2],
    },
    {
      icon: Building,
      label: 'Visit Support',
      value: 'Open',
      note: 'Admissions can help plan your campus visit.',
      accent: STAT_GRADIENTS[3],
    },
  ];

  const tabs = SECTION_TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === 'All'
        ? items.length
        : tab.id === 'Campus Highlights'
        ? highlightsCount
        : tab.id === 'Facilities'
        ? facilitiesCount
        : toursCount,
  }));

  // Filter items for masonry
  const filteredItems = items.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Campus Highlights') return item.category === 'hero' || item.category === 'campus_highlight';
    if (filter === 'Facilities') return item.category === 'facility';
    if (filter === 'Virtual Tours') return item.category === 'tour';
    return true;
  });

  return (
    <MainLayout>
      <SEO
        title="Campus Infrastructure & Facilities"
        description="Explore our modern campus infrastructure, computer labs, library, smart classrooms, and student amenities at EIILM Jalpaiguri."
      />
      <HeroSlider
        pageKey="infrastructure"
        fallbackTagline={siteSettings.infra_hero_tagline || 'Campus Infrastructure'}
        fallbackHeading={siteSettings.infra_hero_heading || 'World-Class Facilities'}
        fallbackSubheading={
          siteSettings.infra_hero_subheading ||
          'Experience an environment designed to inspire innovation, foster creativity, and provide the ultimate student experience.'
        }
      />

      <section className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-slate-50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          {/* Header & Stats Block */}
          <FadeIn className="grid gap-10 lg:grid-cols-[1fr_1fr] items-center mb-16">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-50/60 via-transparent to-transparent" />
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-600">Our Campus</p>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl leading-tight">
                  Designed to feel calm, modern, and student-first.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  This layout is intentionally structured to help prospective students quickly understand
                  the quality of our spaces, the range of facilities, and the overall campus experience.
                </p>
              </div>
            </div>

            <div className="flex flex-row gap-5 overflow-x-auto pb-6 snap-x w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {overviewStats.map((stat) => (
                <div key={stat.label} className="min-w-[280px] md:min-w-0 md:flex-1 shrink-0 snap-start">
                  <OverviewStatCard
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                    note={stat.note}
                    accent={stat.accent}
                  />
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Filter Tabs */}
          {items.length > 0 && (
            <div className="mb-12 flex flex-nowrap overflow-x-auto items-center justify-start md:justify-center gap-3 pb-4 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {tabs.map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 ${
                      active
                        ? 'bg-slate-950 text-white shadow-xl shadow-slate-900/20 scale-105'
                        : 'bg-white text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Gallery Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-[2rem] bg-slate-200 aspect-[4/3]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No infrastructure details available yet."
              description="The campus page will automatically fill in once infrastructure items are published from the admin panel."
            />
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => {
                  let kind: SectionKind = 'facility';
                  if (item.category === 'tour') kind = 'tour';
                  if (item.category === 'campus_highlight' || item.category === 'hero') kind = 'highlight';

                  // Make the first item featured if viewing "All" or if it's the only item
                  const isFeatured = filter === 'All' ? index === 0 : filteredItems.length === 1;

                  return (
                    <InfrastructureCard
                      key={item.id}
                      item={item}
                      kind={kind}
                      isFeatured={isFeatured}
                      muted={mutedVideos[item.id]}
                      onToggleMute={(e, id) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMutedVideos((prev) => ({ ...prev, [id]: prev[id] === undefined ? true : !prev[id] }));
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Edge-to-Edge CTA Banner */}
      {!loading && items.length > 0 && (
        <section className="bg-white">
          <FadeIn>
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 py-24 px-4 text-center text-white shadow-2xl">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary-600/20 blur-[100px]" />
              <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]" />

              <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
                <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-primary-400">
                  Ready to experience it yourself?
                </p>
                <h2 className="mb-8 text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl leading-tight">
                  Schedule a visit or apply today to explore the campus in person.
                </h2>
                
                <div className="flex flex-wrap justify-center gap-5 mt-10">
                  <Link
                    href="/admissions"
                    className="inline-flex items-center justify-center rounded-full bg-primary-600 px-10 py-4 text-base font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1 hover:bg-primary-500 hover:shadow-[0_15px_40px_rgba(37,99,235,0.5)]"
                  >
                    Apply for Admission
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-white/5 px-10 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/60 hover:bg-white/10"
                  >
                    Schedule a Visit
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      )}
    </MainLayout>
  );
}
