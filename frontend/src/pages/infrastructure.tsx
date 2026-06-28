import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@layouts/MainLayout';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import Breadcrumb from '@components/Breadcrumb';
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
type CardVariant = 'featured' | 'grid';

const SECTION_TABS: Array<{ id: SectionTabId; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'Campus Highlights', label: 'Highlights' },
  { id: 'Facilities', label: 'Facilities' },
  { id: 'Virtual Tours', label: 'Tours' },
];

const SECTION_META: Record<
  SectionKind,
  {
    eyebrow: string;
    title: string;
    description: string;
    badge: string;
    badgeIcon: React.ElementType;
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  highlight: {
    eyebrow: 'Explore',
    title: 'Campus Highlights',
    description: 'Landmark moments and student-focused spaces that set the tone for a strong first impression.',
    badge: 'Highlight',
    badgeIcon: Sparkles,
    emptyTitle: 'No highlights added yet.',
    emptyDescription: 'Campus highlights will appear here once the admin publishes them.',
  },
  facility: {
    eyebrow: 'Infrastructure',
    title: 'State-of-the-Art Facilities',
    description: 'The academic, support, and communal spaces that make the campus feel complete and dependable.',
    badge: 'Facility',
    badgeIcon: Building2,
    emptyTitle: 'No facilities added yet.',
    emptyDescription: 'Facility cards will appear here once they are published.',
  },
  tour: {
    eyebrow: 'Experience',
    title: 'Virtual Campus Tour',
    description: 'Walk through the campus online before planning an in-person visit.',
    badge: 'Virtual Tour',
    badgeIcon: PlayCircle,
    emptyTitle: 'No tours added yet.',
    emptyDescription: 'Virtual tours will appear here once they are published.',
  },
};

const STAT_GRADIENTS = [
  'from-primary-600 to-indigo-700',
  'from-emerald-500 to-teal-600',
  'from-violet-600 to-fuchsia-700',
  'from-amber-500 to-orange-600',
];

function getGridClasses(count: number) {
  if (count <= 1) {
    return 'mx-auto grid max-w-4xl grid-cols-1 gap-8';
  }

  if (count === 2) {
    return 'mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2';
  }

  return 'grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3';
}

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
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-black/10`}>
        <Icon size={22} />
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{note}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <FadeIn className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary-600">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">{description}</p>
      </div>
      <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-primary-500" />
        {count} {count === 1 ? 'item' : 'items'}
      </div>
    </FadeIn>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <FadeIn className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-500">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/admissions"
          className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-700"
        >
          Apply for Admission
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full border-2 border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
        >
          Contact Admissions
        </Link>
      </div>
    </FadeIn>
  );
}

function InfrastructureCard({
  item,
  kind,
  variant = 'grid',
  muted,
  onToggleMute,
}: {
  item: InfraItem;
  kind: SectionKind;
  variant?: CardVariant;
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
    <article
      className={`group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)] ${
        variant === 'featured' ? 'lg:grid lg:grid-cols-[1.15fr_0.85fr]' : 'flex flex-col'
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          variant === 'featured' ? 'min-h-[280px] lg:min-h-[420px]' : 'aspect-[4/3]'
        }`}
      >
        {isVideoValid ? (
          showControls ? (
            <video
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              controls
              preload="metadata"
              poster={item.imageUrl ? getImageUrl(item.imageUrl) : undefined}
            >
              <source src={getImageUrl(item.videoUrl)} type="video/mp4" />
            </video>
          ) : (
            <video
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 text-slate-300">
            <BadgeIcon size={64} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/92 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-slate-900 shadow-sm backdrop-blur">
          <BadgeIcon size={14} className="text-primary-600" />
          {meta.badge}
        </div>

        {kind === 'highlight' && isVideoValid && onToggleMute && (
          <button
            onClick={(e) => onToggleMute(e, item.id)}
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-black/65"
            aria-label="Toggle mute"
          >
            {(muted ?? false) ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}

        {variant === 'featured' && (
          <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-700 backdrop-blur">
            Campus experience
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col p-6 lg:p-8 ${variant === 'featured' ? 'justify-between' : ''}`}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-600">Campus {meta.badge}</p>
          <h3 className={`mt-3 font-black tracking-tight text-slate-950 ${variant === 'featured' ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
            {item.title}
          </h3>
          <p className={`mt-3 leading-relaxed text-slate-600 ${variant === 'featured' ? 'text-base lg:text-lg' : 'text-sm'}`}>
            {item.description}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <span className="text-sm font-semibold text-slate-500">Student-first presentation</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 transition-transform group-hover:translate-x-0.5">
            {variant === 'featured' ? 'Featured view' : 'Explore view'}
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}

function CampusSection({
  activeFilter,
  filterKey,
  loading,
  items,
  kind,
  mutedVideos,
  onToggleMute,
  backgroundClass,
}: {
  activeFilter: SectionTabId;
  filterKey: Exclude<SectionTabId, 'All'>;
  loading: boolean;
  items: InfraItem[];
  kind: SectionKind;
  mutedVideos: Record<number, boolean>;
  onToggleMute: (e: React.MouseEvent, id: number) => void;
  backgroundClass: string;
}) {
  const meta = SECTION_META[kind];
  const visible = activeFilter === 'All' || activeFilter === filterKey;
  if (!visible) return null;

  return (
    <section className={backgroundClass}>
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow={meta.eyebrow}
          title={meta.title}
          description={meta.description}
          count={items.length}
        />

        {loading ? (
          <div className={getGridClasses(kind === 'facility' ? 3 : 1)}>
            {Array.from({ length: kind === 'facility' ? 3 : 1 }).map((_, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
              >
                <div className={`bg-slate-100 ${kind === 'facility' ? 'aspect-[4/3]' : 'min-h-[280px]'}`} />
                <div className="space-y-3 p-6 lg:p-8">
                  <div className="h-3 w-24 rounded-full bg-slate-100" />
                  <div className="h-7 w-3/4 rounded-full bg-slate-100" />
                  <div className="h-4 w-full rounded-full bg-slate-50" />
                  <div className="h-4 w-5/6 rounded-full bg-slate-50" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={meta.badgeIcon}
            title={meta.emptyTitle}
            description={meta.emptyDescription}
          />
        ) : (
          <div className={getGridClasses(items.length)}>
            {items.map((item) => (
              <InfrastructureCard
                key={item.id}
                item={item}
                kind={kind}
                variant={items.length === 1 ? 'featured' : 'grid'}
                muted={mutedVideos[item.id]}
                onToggleMute={onToggleMute}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function InfrastructurePage() {
  const [tours, setTours] = useState<InfraItem[]>([]);
  const [facilities, setFacilities] = useState<InfraItem[]>([]);
  const [highlights, setHighlights] = useState<InfraItem[]>([]);
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
          setTours(data.filter((item) => item.category === 'tour' && item.status === 'active'));
          setFacilities(data.filter((item) => item.category === 'facility' && item.status === 'active'));
          setHighlights(
            data.filter(
              (item) => (item.category === 'hero' || item.category === 'campus_highlight') && item.status === 'active'
            )
          );
        }

        if (settingsRes.status === 'fulfilled') {
          setSiteSettings(((settingsRes.value as any)?.data as Record<string, string>) || {});
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalItems = highlights.length + facilities.length + tours.length;
  const overviewStats = [
    {
      icon: Sparkles,
      label: 'Campus Highlights',
      value: `${highlights.length}`.padStart(2, '0'),
      note: 'Important moments and student-facing spaces.',
      accent: STAT_GRADIENTS[0],
    },
    {
      icon: Building2,
      label: 'Facilities',
      value: `${facilities.length}`.padStart(2, '0'),
      note: 'Learning spaces, support spaces, and campus essentials.',
      accent: STAT_GRADIENTS[1],
    },
    {
      icon: PlayCircle,
      label: 'Virtual Tours',
      value: `${tours.length}`.padStart(2, '0'),
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
        ? totalItems
        : tab.id === 'Campus Highlights'
        ? highlights.length
        : tab.id === 'Facilities'
        ? facilities.length
        : tours.length,
  }));

  return (
    <MainLayout>
      <HeroSlider
        pageKey="infrastructure"
        fallbackTagline={siteSettings.infra_hero_tagline || 'Campus Infrastructure'}
        fallbackHeading={siteSettings.infra_hero_heading || 'World-Class Facilities'}
        fallbackSubheading={
          siteSettings.infra_hero_subheading ||
          'Experience an environment designed to inspire innovation, foster creativity, and provide the ultimate student experience.'
        }
      />
      <Breadcrumb items={[{ label: 'Infrastructure' }]} />

      <section className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_16px_50px_rgba(15,23,42,0.06)] lg:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-transparent to-indigo-50/70" />
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary-600">Our Campus</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  Designed to feel calm, modern, and student-first.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                  This layout is intentionally structured to help prospective students quickly understand
                  the quality of our spaces, the range of facilities, and the overall campus experience.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/admissions"
                    className="inline-flex items-center justify-center rounded-full bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                  >
                    Apply Now
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border-2 border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
                  >
                    Plan a Visit
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {overviewStats.map((stat) => (
                <OverviewStatCard
                  key={stat.label}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  note={stat.note}
                  accent={stat.accent}
                />
              ))}
            </div>
          </FadeIn>

          {totalItems > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {tabs.map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                      active
                        ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                        active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {!loading && totalItems === 0 ? (
        <section className="bg-white py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <EmptyState
              icon={Building}
              title="No infrastructure details available yet."
              description="The campus page will automatically fill in once infrastructure items are published from the admin panel."
            />
          </div>
        </section>
      ) : (
        <>
          <CampusSection
            activeFilter={filter}
            filterKey="Campus Highlights"
            loading={loading}
            items={highlights}
            kind="highlight"
            mutedVideos={mutedVideos}
            onToggleMute={(e, id) => {
              e.preventDefault();
              e.stopPropagation();
              setMutedVideos((prev) => ({ ...prev, [id]: prev[id] === undefined ? true : !prev[id] }));
            }}
            backgroundClass="bg-white py-16 lg:py-20"
          />

          <CampusSection
            activeFilter={filter}
            filterKey="Facilities"
            loading={loading}
            items={facilities}
            kind="facility"
            mutedVideos={mutedVideos}
            onToggleMute={(e, id) => {
              e.preventDefault();
              e.stopPropagation();
              setMutedVideos((prev) => ({ ...prev, [id]: prev[id] === undefined ? true : !prev[id] }));
            }}
            backgroundClass="bg-slate-50 py-16 lg:py-20"
          />

          <CampusSection
            activeFilter={filter}
            filterKey="Virtual Tours"
            loading={loading}
            items={tours}
            kind="tour"
            mutedVideos={mutedVideos}
            onToggleMute={(e, id) => {
              e.preventDefault();
              e.stopPropagation();
              setMutedVideos((prev) => ({ ...prev, [id]: prev[id] === undefined ? true : !prev[id] }));
            }}
            backgroundClass="bg-white py-16 lg:py-20"
          />
        </>
      )}

      {!loading && totalItems > 0 && (
        <section className="bg-slate-50 py-16 lg:py-20">
          <FadeIn className="container mx-auto px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-primary-600 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] lg:p-12">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary-100">
                    Ready to experience it yourself?
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                    Schedule a visit or apply today to explore the campus in person.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-100 md:text-lg">
                    A strong infrastructure story builds trust quickly. This closing block turns that trust
                    into a clear next step for students and parents.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                  <Link
                    href="/admissions"
                    className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary-700 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-primary-50"
                  >
                    Apply for Admission
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white/60 px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
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
