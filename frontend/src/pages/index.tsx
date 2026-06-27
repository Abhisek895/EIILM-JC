import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '@layouts/MainLayout';
import { cmsApi, courseApi, eventApi, noticeApi, siteSettingsApi } from '@api/endpoints';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import SEO from '@components/SEO';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  Clock,
  GraduationCap,
  IndianRupee,
  Landmark,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  ScrollText,
  Users,
  Zap,
} from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

const ICON_MAP: Record<string, React.ElementType> = {
  ArrowRight, Award, Bell, BookOpen, Briefcase, Building2, Calendar, ChevronRight, ClipboardCheck,
  Clock, GraduationCap, IndianRupee, Landmark, MapPin, MessageSquare, Send, Sparkles, ScrollText, Users, Zap
};

type Notice = {
  id: number;
  title: string;
  publishDate: string | null;
  priority: string;
};

type Event = {
  id: number;
  title: string;
  startDate: string | null;
  location: string | null;
  banner: string | null;
};

type Course = {
  id: number;
  courseName: string;
  courseCode?: string;
  courseType: string;
  duration?: string;
  description?: string;
  eligibility?: string;
  fees?: string;
  showFees?: boolean;
  banner?: string;
  specialization?: string;
  status: string;
  slug?: string;
};

type PageSection = {
  id: number;
  sectionKey: string;
  config: Record<string, any>;
  sortOrder: number;
};

type SiteSettings = Record<string, string>;

type SectionProps = {
  settings: SiteSettings;
  courses: Course[];
  notices: Notice[];
  events: Event[];
};

const DEFAULT_FEATURES = [
  {
    title: 'Career-ready learning',
    desc: 'Programs are presented clearly so students can quickly understand the path from classroom to career.',
    icon: Briefcase,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Guided admissions',
    desc: 'Fast response, clear steps, and a counselor-led process so visitors never feel stuck.',
    icon: Zap,
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    title: 'Experienced faculty',
    desc: 'Students can trust the value of learning from mentors who make complex topics feel manageable.',
    icon: GraduationCap,
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    title: 'Practical labs and projects',
    desc: 'The site should communicate hands-on learning, not just theory, because students want outcomes.',
    icon: ClipboardCheck,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Campus life and support',
    desc: 'Hostel, clubs, events, and student services help first-time visitors picture themselves here.',
    icon: Building2,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Scholarship and growth support',
    desc: 'Admissions guidance should reduce anxiety and make the next step feel simple and achievable.',
    icon: Sparkles,
    gradient: 'from-rose-500 to-pink-600',
  },
];

const STUDENT_ACTIONS = [
  {
    title: 'Apply for Admission',
    desc: 'Submit an inquiry and get guided support from the admissions team.',
    href: '/admissions',
    icon: Send,
    chip: 'Start here',
  },
  {
    title: 'Explore Courses',
    desc: 'Compare duration, eligibility, and fees before you decide.',
    href: '/courses',
    icon: BookOpen,
    chip: 'Compare options',
  },
  {
    title: 'Check Placements',
    desc: 'See the career outcomes and employer support students care about most.',
    href: '/placements',
    icon: Briefcase,
    chip: 'Career proof',
  },
  {
    title: 'Talk to a Counselor',
    desc: 'Ask about scholarships, documents, hostel, or campus life.',
    href: '/contact',
    icon: MessageSquare,
    chip: 'Get answers',
  },
];

const COURSE_TYPE_META: Record<string, { icon: React.ElementType; gradient: string; badgeClass: string }> = {
  UG: {
    icon: GraduationCap,
    gradient: 'from-sky-500 to-blue-600',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  PG: {
    icon: Landmark,
    gradient: 'from-violet-500 to-purple-600',
    badgeClass: 'bg-violet-100 text-violet-700',
  },
  Diploma: {
    icon: ScrollText,
    gradient: 'from-amber-500 to-orange-600',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  Certificate: {
    icon: Award,
    gradient: 'from-emerald-500 to-teal-600',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
};

const PLACEHOLDER_GRADIENTS = [
  'from-primary-600 to-indigo-700',
  'from-violet-600 to-purple-700',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-primary-600',
];

function normalizeList<T>(payload: any): T[] {
  const raw = payload?.data ?? payload;

  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.rows)) return raw.rows;
  if (Array.isArray(raw?.data)) return raw.data;

  return [];
}

function normalizeConfig(config: any): Record<string, any> {
  if (!config) return {};
  if (typeof config === 'string') {
    try {
      const parsed = JSON.parse(config);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof config === 'object' ? config : {};
}

function formatFee(course: Course) {
  if (course.showFees === false) return 'Contact for fees';
  if (!course.fees) return 'TBA';
  const numeric = Number(course.fees);
  return Number.isNaN(numeric) ? course.fees : numeric.toLocaleString('en-IN');
}

function getTrustBadges(settings: SiteSettings) {
  const accreditationBadges = (settings.about_accreditations || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const statBadges = [
    settings.stat_years ? `${settings.stat_years} years` : '',
    settings.stat_students ? `${settings.stat_students} students` : '',
    settings.stat_courses ? `${settings.stat_courses} courses` : '',
    settings.stat_faculty ? `${settings.stat_faculty} faculty` : '',
  ].filter(Boolean);

  const defaults = [
    'Admissions support',
    'Scholarship guidance',
    'Placement focus',
    'Campus life',
  ];

  return Array.from(new Set([...statBadges, ...accreditationBadges, ...defaults].filter(Boolean))).slice(0, 6);
}

function AnimatedCounter({ valueStr }: { valueStr: string }) {
  const match = valueStr.match(/^(\d+)(.*)$/);
  const targetNumber = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : valueStr;
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (targetNumber === null) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const duration = 2000;
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

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function StudentFirstSection({ settings }: SectionProps) {
  const trustBadges = getTrustBadges(settings);

  const heroTitle = settings.home_hero_title || 'Find the right path in minutes';
  const heroSubtitle = settings.home_hero_subtitle || 'Most first-time visitors want three answers quickly: what can I study, how do I apply, and will this help my career?';

  let actions = STUDENT_ACTIONS;
  try {
    if (settings.home_actions) {
      actions = JSON.parse(settings.home_actions).map((item: any) => ({
        ...item,
        icon: ICON_MAP[item.icon] || Send
      }));
    }
  } catch (e) {
    // silently fallback to defaults if JSON is invalid
  }

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div
        className="absolute inset-0 opacity-50"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />
      <div className="container relative mx-auto px-6">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-2">
            Start here
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-5xl">
            {heroTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            {heroSubtitle}
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <FadeIn key={action.title} delay={index * 0.06}>
                <Link href={action.href} className="group block h-full">
                  <motion.div
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                    className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 transition-all"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                        <Icon size={26} />
                      </div>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {action.chip}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-primary-700">
                      {action.title}
                    </h3>
                    <p className="mt-3 flex-grow text-sm leading-relaxed text-gray-500">
                      {action.desc}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
                      Continue <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.div>
                </Link>
              </FadeIn>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-gray-500">
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="transition-colors hover:text-primary-600">
              {settings.phone}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="transition-colors hover:text-primary-600">
              {settings.email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturedProgramsSection({ courses }: SectionProps) {
  const featuredCourses = courses.slice(0, 3);

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <FadeIn className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-2">
              Popular choices
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 md:text-5xl">
              Programs students explore first
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              Compare a few strong options before you dive into the full course list.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            View all courses <ArrowRight size={16} />
          </Link>
        </FadeIn>

        {featuredCourses.length === 0 ? (
          <FadeIn className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">No courses published yet.</p>
            <p className="mt-1">Check back soon or contact admissions for guidance.</p>
          </FadeIn>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredCourses.map((course, index) => {
              const meta = COURSE_TYPE_META[course.courseType] || {
                icon: GraduationCap,
                gradient: PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length],
                badgeClass: 'bg-gray-100 text-gray-600',
              };
              const Icon = meta.icon;

              return (
                <FadeIn key={course.id} delay={index * 0.08}>
                  <motion.article
                    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white transition-all"
                  >
                    <Link href={`/courses/${course.id}`} className="relative block h-40 sm:h-56 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
                      {course.banner ? (
                        <img
                          src={getImageUrl(course.banner)}
                          alt={course.courseName}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/90">
                          <Icon size={72} className="drop-shadow-md" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-950/20" />
                      <div className="absolute left-4 top-4 z-10">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${meta.badgeClass} shadow-sm`}>
                          {course.courseType}
                        </span>
                      </div>
                      {course.courseCode && (
                        <div className="absolute bottom-4 right-4 z-10">
                          <span className="rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                            {course.courseCode}
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-4 sm:p-7">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                        Student spotlight
                      </p>
                      <h3 className="mt-1 sm:mt-2 text-lg sm:text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-700">
                        {course.courseName}
                      </h3>

                      <div className="mt-2 sm:mt-3 mb-2 sm:mb-0">
                        {course.specialization && (
                          <span className="inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
                            {course.specialization}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-2 sm:p-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700">
                          <Clock size={16} className="shrink-0 text-primary-500" />
                          <span className="truncate">{course.duration || 'Duration TBA'}</span>
                        </div>
                        <div
                          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-700"
                          title={course.eligibility || ''}
                        >
                          <ClipboardCheck size={16} className="shrink-0 text-primary-500" />
                          <span className="truncate">{course.eligibility || 'Eligibility TBA'}</span>
                        </div>
                      </div>

                      <p className="mt-3 sm:mt-5 flex-grow text-xs sm:text-sm leading-snug sm:leading-relaxed text-gray-500">
                        {course.description || 'Programme details will be updated soon.'}
                      </p>

                      <div className="mt-4 sm:mt-6 flex items-end justify-between gap-4 border-t border-gray-100 pt-3 sm:pt-5">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Program Fee
                          </p>
                          {course.showFees === false ? (
                            <div className="text-sm font-semibold text-gray-500">Contact for fees</div>
                          ) : course.fees ? (
                            <div className="flex items-center gap-0.5 text-base sm:text-lg font-bold text-gray-900 truncate">
                              <IndianRupee size={16} className="text-gray-900 flex-shrink-0" />
                              <span className="truncate">{formatFee(course)}</span>
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-gray-500">TBA</div>
                          )}
                        </div>
                        <Link
                          href={`/courses/${course.id}`}
                          className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-primary-600 px-3 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg whitespace-nowrap"
                        >
                          View Details <ArrowRight size={16} className="flex-shrink-0" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function StatsSection({ settings }: SectionProps) {
  const statsMeta = [
    {
      label: 'Years of Excellence',
      value: settings.stat_years !== undefined ? settings.stat_years : '25+',
      icon: Award,
      color: 'from-amber-400 to-orange-500',
    },
    {
      label: 'Students Enrolled',
      value: settings.stat_students !== undefined ? settings.stat_students : '5000+',
      icon: Users,
      color: 'from-sky-400 to-blue-600',
    },
    {
      label: 'Faculty Members',
      value: settings.stat_faculty !== undefined ? settings.stat_faculty : '200+',
      icon: GraduationCap,
      color: 'from-emerald-400 to-teal-600',
    },
    {
      label: 'Courses Offered',
      value: settings.stat_courses !== undefined ? settings.stat_courses : '50+',
      icon: BookOpen,
      color: 'from-violet-400 to-purple-600',
    },
  ];

  const active = statsMeta.filter((stat) => stat.value && stat.value.trim() !== '');

  if (active.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1128] to-primary-900 py-16">
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="container relative mx-auto px-6">
        <FadeIn className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary-200 mb-2">
            Proof at a glance
          </p>
          <h2 className="text-3xl font-extrabold text-white md:text-5xl">
            A quick snapshot of the college
          </h2>
        </FadeIn>

        <div
          className={`grid gap-6 ${
            active.length <= 2 ? 'grid-cols-2' : active.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
          }`}
        >
          {active.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="text-3xl font-extrabold text-white md:text-4xl">
                    <AnimatedCounter valueStr={stat.value!} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary-200">
                    {stat.label}
                  </div>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NoticesSection({ notices }: SectionProps) {
  if (!notices) return null;

  return (
    <section className="bg-gray-50 py-20">
      <FadeIn className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary-600">
              Stay updated
            </p>
            <h2 className="flex items-center gap-3 text-3xl font-extrabold text-gray-900 md:text-5xl">
              <Bell size={32} className="text-primary-600" /> Latest notices
            </h2>
          </div>
          <Link
            href="/notices"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            View all notices <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {notices.length === 0 ? (
          <p className="py-10 text-center text-gray-500">No notices published yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {notices.map((notice, index) => (
              <motion.article
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
                className="group cursor-default rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-primary-200"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  {notice.priority === 'high' && (
                    <span className="flex-shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-600">
                      Urgent
                    </span>
                  )}
                  {notice.publishDate && (
                    <span className="ml-auto flex-shrink-0 text-xs text-gray-400">
                      {new Date(notice.publishDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                <p className="font-semibold leading-snug text-gray-800 transition-colors group-hover:text-primary-700 line-clamp-3">
                  {notice.title}
                </p>
                <div className="mt-4 h-0.5 w-0 rounded-full bg-primary-500 transition-all duration-500 group-hover:w-full" />
              </motion.article>
            ))}
          </div>
        )}
      </FadeIn>
    </section>
  );
}

function EventsSection({ events }: SectionProps) {
  if (!events) return null;

  return (
    <section className="bg-white py-20">
      <FadeIn className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary-600">
              What is happening
            </p>
            <h2 className="flex items-center gap-3 text-3xl font-extrabold text-gray-900 md:text-5xl">
              <Calendar size={32} className="text-primary-600" /> Upcoming events
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            View all events <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {events.map((event, index) => {
              const dateObj = event.startDate ? new Date(event.startDate) : null;

              return (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all hover:border-primary-100 hover:shadow-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary-600 to-indigo-700">
                    {event.banner ? (
                      <img
                        src={getImageUrl(event.banner)}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <Calendar size={64} className="text-white" />
                      </div>
                    )}
                    {dateObj && (
                      <div className="absolute left-4 top-4 w-14 overflow-hidden rounded-xl bg-white text-center text-primary-700 shadow-lg">
                        <div className="bg-primary-600 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                          {dateObj.toLocaleDateString('en-IN', { month: 'short' })}
                        </div>
                        <div className="py-1.5 text-2xl font-extrabold leading-none">
                          {dateObj.getDate()}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="mb-3 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-700">
                      {event.title}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-sm text-gray-500">
                      {dateObj && (
                        <span className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary-400" />
                          {dateObj.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin size={14} className="text-primary-400" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </FadeIn>
    </section>
  );
}

function FeaturesSection({ settings }: SectionProps & { config?: Record<string, any> }) {
  const heading = settings.home_strengths_title || 'Why students choose us';
  const subheading = settings.home_strengths_subtitle || settings.tagline || 'A good college choice feels clear, supportive, and career-focused the moment a student lands on the page.';

  let features = DEFAULT_FEATURES;
  try {
    if (settings.home_features) {
      features = JSON.parse(settings.home_features).map((item: any) => ({
        ...item,
        icon: ICON_MAP[item.icon] || Sparkles
      }));
    }
  } catch (e) {
    // silently fallback
  }

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <FadeIn className="mb-14 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary-600">
            Our strengths
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-5xl">{heading}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            {subheading}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={feature.title} delay={index * 0.07}>
                <motion.article
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                  whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(0,0,0,0.10)' }}
                  className="group rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 transition-all"
                >
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-black/10`}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary-700">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-gray-500">{feature.desc}</p>
                </motion.article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection({ settings, notices, events }: SectionProps & { config?: Record<string, any> }) {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <FadeIn>
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 p-12 text-center text-white shadow-2xl shadow-primary-900/30 md:p-20"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
            />
            <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-primary-300/20 blur-3xl" />

            <div className="relative z-10">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-200">
                Ready to move forward?
              </p>
              <h2 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-5xl">
                Start your application with confidence
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-100">
                {settings.college_name
                  ? `Join ${settings.college_name} and compare your options before you apply.`
                  : 'Join our college and compare your options before you apply.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/admissions"
                  className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-primary-700 shadow-xl transition-all hover:-translate-y-1 hover:bg-primary-50"
                >
                  Apply Now
                </Link>
                <Link
                  href="/courses"
                  className="inline-block rounded-full border-2 border-white/70 px-10 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
                >
                  Explore Courses
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold text-primary-100">
                {[
                  'Fast response',
                  'Scholarship guidance',
                  'Placement support',
                ].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

function SectionRenderer({
  section,
  notices,
  events,
  settings,
  courses,
}: {
  section: PageSection;
  notices: Notice[];
  events: Event[];
  settings: SiteSettings;
  courses: Course[];
}) {
  const cfg = normalizeConfig(section.config);

  switch (section.sectionKey) {
    case 'hero':
      return (
        <HeroSlider
          pageKey="home"
          initialSlides={Array.isArray(cfg.slides) ? cfg.slides : undefined}
          fallbackTagline={settings.tagline || 'Excellence in Education'}
          fallbackHeading={settings.hero_heading || `Welcome to ${settings.college_name || 'Our College'}`}
          fallbackSubheading={settings.hero_subheading || 'A premier institution committed to academic excellence and holistic development.'}
        />
      );
    case 'student_first':
      return <StudentFirstSection settings={settings} courses={courses} notices={notices} events={events} />;
    case 'featured_courses':
      return <FeaturedProgramsSection settings={settings} courses={courses} notices={notices} events={events} />;
    case 'stats':
      return <StatsSection settings={settings} courses={courses} notices={notices} events={events} />;
    case 'notices_list':
      return <NoticesSection settings={settings} courses={courses} notices={notices} events={events} />;
    case 'events_list':
      return <EventsSection settings={settings} courses={courses} notices={notices} events={events} />;
    case 'features':
      return <FeaturesSection settings={settings} courses={courses} notices={notices} events={events} />;
    case 'cta':
      return <CTASection settings={settings} courses={courses} notices={notices} events={events} />;
    default:
      return null;
  }
}

const DEFAULT_SECTIONS: PageSection[] = [
  { id: 1, sectionKey: 'hero', config: { slides: [] }, sortOrder: 0 },
  { id: 2, sectionKey: 'student_first', config: {}, sortOrder: 1 },
  { id: 3, sectionKey: 'featured_courses', config: {}, sortOrder: 2 },
  { id: 4, sectionKey: 'stats', config: {}, sortOrder: 3 },
  { id: 5, sectionKey: 'features', config: {}, sortOrder: 4 },
  { id: 6, sectionKey: 'notices_list', config: {}, sortOrder: 5 },
  { id: 7, sectionKey: 'events_list', config: {}, sortOrder: 6 },
  { id: 8, sectionKey: 'cta', config: {}, sortOrder: 7 },
];

export default function HomePage() {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sectionsRes, noticesRes, eventsRes, settingsRes, coursesRes] = await Promise.allSettled([
          cmsApi.getPageSections('home'),
          noticeApi.getAll(1, 6),
          eventApi.getAll(1, 3),
          siteSettingsApi.getMap(),
          courseApi.getAll(1, 6, 'published'),
        ]);

        if (sectionsRes.status === 'fulfilled') {
          const data = normalizeList<PageSection>(sectionsRes.value);
          if (Array.isArray(data) && data.length > 0) {
            const apiKeys = new Set(data.map((section) => section.sectionKey));
            const missingDefaults = DEFAULT_SECTIONS.filter((section) => !apiKeys.has(section.sectionKey));
            const merged = [...data, ...missingDefaults].sort((a, b) => a.sortOrder - b.sortOrder);
            setSections(merged);
          } else {
            setSections(DEFAULT_SECTIONS);
          }
        } else {
          setSections(DEFAULT_SECTIONS);
        }

        if (noticesRes.status === 'fulfilled') {
          setNotices(normalizeList<Notice>(noticesRes.value));
        }

        if (eventsRes.status === 'fulfilled') {
          setEvents(normalizeList<Event>(eventsRes.value));
        }

        if (settingsRes.status === 'fulfilled') {
          const data = settingsRes.value?.data ?? settingsRes.value;
          if (data && typeof data === 'object') {
            setSettings(data);
          }
        }

        if (coursesRes.status === 'fulfilled') {
          const data = normalizeList<Course>(coursesRes.value);
          setCourses(Array.isArray(data) ? data : []);
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50">
          <div className="flex flex-col items-center gap-5">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-ping rounded-full border-4 border-primary-100 opacity-60" />
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
            <div className="font-semibold tracking-wide text-gray-500">Loading content...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO
        title="Home"
        siteName={settings.college_name || 'College ERP'}
        description={
          settings.tagline ||
          'Welcome to our student-first college website. Explore courses, admissions, campus life, and placements.'
        }
      />
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          notices={notices}
          events={events}
          settings={settings}
          courses={courses}
        />
      ))}
    </MainLayout>
  );
}
