import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { siteSettingsApi } from '@api/endpoints';
import FadeIn from '@components/FadeIn';
import SEO from '@components/SEO';
import { motion } from 'framer-motion';
import {
  Award, BookOpen, Users, Target, Eye, Heart,
  GraduationCap, Globe, Shield, Lightbulb, Star, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import HeroSlider from '@components/HeroSlider';

type SiteSettings = Record<string, string>;

// ── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        const duration = 2000;
        const startTime = performance.now();
        const animate = (now: number) => {
          const p = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(2, -10 * p);
          setCount(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(animate);
          else setCount(target);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, started]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Value Card ───────────────────────────────────────────────────────────────
function ValueCard({ icon: Icon, title, desc, color }: {
  icon: React.ElementType; title: string; desc: string; color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-2xl p-7 border border-gray-100 flex flex-col gap-4 transition-shadow"
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={26} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ── Timeline Item ────────────────────────────────────────────────────────────
function TimelineItem({ year, title, desc, side }: {
  year: string; title: string; desc: string; side: 'left' | 'right';
}) {
  return (
    <FadeIn className={`flex items-start gap-6 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary-600/30">
          {year}
        </div>
        <div className="w-0.5 h-12 bg-primary-100" />
      </div>
      <div className={`pt-2 max-w-xs ${side === 'right' ? 'mr-0' : ''}`}>
        <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
      </div>
    </FadeIn>
  );
}

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [about, setAbout] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const map = await siteSettingsApi.getMap();
        const data = (map as any)?.data || map;
        if (data && typeof data === 'object') setSettings(data);
        setAbout((data as any)?.about || '');
      } catch { /* keep fallback */ } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const collegeName = settings.college_name || 'EIILM Kolkata Jalpaiguri Campus';

  const isHtml = /^<[a-z][\s\S]*>/i.test(about);

  // Safely Parse JSON Arrays

  let aboutFeatures = [];
  try { aboutFeatures = settings.about_features ? JSON.parse(settings.about_features) : []; } catch (e) { }
  if (!aboutFeatures.length) {
    aboutFeatures = [
      { icon: 'GraduationCap', label: 'Academic Excellence', bg: 'bg-primary-600' },
      { icon: 'Globe', label: 'Global Exposure', bg: 'bg-indigo-600' },
      { icon: 'Shield', label: 'Accredited Programs', bg: 'bg-violet-600' },
      { icon: 'Lightbulb', label: 'Innovation Driven', bg: 'bg-sky-600' },
    ];
  }
  const FeatureIconMap: any = { GraduationCap, Globe, Shield, Lightbulb, Star, Heart, Users, BookOpen, Target, Award };

  let coreValues = [];
  try { coreValues = settings.about_values ? JSON.parse(settings.about_values) : []; } catch (e) { }
  if (!coreValues.length) {
    coreValues = [
      { icon: 'Star', title: 'Excellence', desc: 'We hold ourselves to the highest standards in teaching, research, and student development.', color: 'bg-amber-500' },
      { icon: 'Heart', title: 'Integrity', desc: 'Honesty, transparency, and ethical conduct are the cornerstones of everything we do.', color: 'bg-rose-500' },
      { icon: 'Users', title: 'Inclusivity', desc: 'We celebrate diversity and create an environment where every student feels valued and heard.', color: 'bg-indigo-500' },
      { icon: 'Lightbulb', title: 'Innovation', desc: 'We nurture creative thinking and encourage students to challenge boundaries and pioneer change.', color: 'bg-emerald-500' },
      { icon: 'BookOpen', title: 'Scholarship', desc: 'A deep commitment to academic rigor and life-long learning drives our academic community.', color: 'bg-primary-600' },
      { icon: 'Globe', title: 'Global Outlook', desc: 'We prepare students to succeed in a connected world by developing cross-cultural understanding.', color: 'bg-violet-600' },
    ];
  }

  let timelineEvents = [];
  try { timelineEvents = settings.about_timeline ? JSON.parse(settings.about_timeline) : []; } catch (e) { }
  if (!timelineEvents.length) {
    timelineEvents = [
      { year: 'Est.', title: 'Foundation', desc: 'The college was established with a mission to provide quality education to the youth of the region.', side: 'left' },
      { year: '+5', title: 'First Batch Graduates', desc: 'Our inaugural batch of graduates went on to prestigious institutions and companies across India.', side: 'right' },
      { year: '+10', title: 'NAAC Accreditation', desc: 'The institution received accreditation, affirming its commitment to quality education.', side: 'left' },
      { year: '+15', title: 'Campus Expansion', desc: 'New infrastructure — labs, library and sports facilities — added to enrich student experience.', side: 'right' },
      { year: 'Now', title: 'A New Era', desc: 'Today we serve thousands of students with modern programs and industry-ready curriculum.', side: 'left' },
    ];
  }

  // Icon mapping for JSON strings
  const IconMap: any = { Star, Heart, Users, Lightbulb, BookOpen, Globe };


  const statsData = [
    { label: 'Years of Excellence', valStr: settings.stat_years !== undefined ? settings.stat_years : '25+' },
    { label: 'Students Enrolled', valStr: settings.stat_students !== undefined ? settings.stat_students : '5000+' },
    { label: 'Faculty Members', valStr: settings.stat_faculty !== undefined ? settings.stat_faculty : '200+' },
    { label: 'Courses Offered', valStr: settings.stat_courses !== undefined ? settings.stat_courses : '50+' },
  ];

  const stats = statsData
    .filter(s => s.valStr.trim() !== '')
    .map(s => {
      const match = s.valStr.match(/^(\d+)(.*)$/);
      return {
        label: s.label,
        value: match ? parseInt(match[1], 10) : parseInt(s.valStr) || 0,
        suffix: match ? match[2] : ''
      };
    });

  return (
    <MainLayout>
      <SEO 
        title="About Us" 
        siteName={collegeName || 'College ERP'} 
        description={settings.tagline || 'Learn about our mission, vision, and core values.'}
      />
      {/* ── HERO ── */}
      <HeroSlider
        pageKey="about"
        fallbackTagline="About Our Institution"
        fallbackHeading={collegeName}
        fallbackSubheading={settings.tagline || 'Shaping futures through excellence in education, innovation, and character.'}
      />

      {/* ── STATS BAND ── */}
      {stats.length > 0 && (
        <section className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-12 bg-primary-700 relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <FadeIn className="text-center mb-12 md:mb-16">
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-200 mb-3 md:mb-4">Institution Overview</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">About Us</h2>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
              {stats.map((s, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="py-2">
                    <div className="text-3xl md:text-3xl sm:text-4xl font-extrabold text-white">
                      {loading ? '—' : <AnimatedCounter target={isNaN(s.value) ? 0 : s.value} suffix={s.suffix} />}
                    </div>
                    <div className="text-primary-200 text-xs uppercase tracking-widest font-semibold mt-1">{s.label}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT / STORY ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: decorative illustration area */}
            <FadeIn>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 p-8 w-full h-full">
                      {[
                        { icon: GraduationCap, label: 'Academic Excellence', bg: 'bg-primary-600' },
                        { icon: Globe, label: 'Global Exposure', bg: 'bg-indigo-600' },
                        { icon: Shield, label: 'Accredited Programs', bg: 'bg-violet-600' },
                        { icon: Lightbulb, label: 'Innovation Driven', bg: 'bg-sky-600' },
                      ].map(({ icon: Icon, label, bg }, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className={`${bg} rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-white text-center shadow-lg cursor-default`}
                        >
                          <Icon size={32} />
                          <span className="text-xs font-bold uppercase tracking-wider leading-tight">{label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-5 -right-5 bg-amber-400 text-amber-900 rounded-2xl px-6 py-3 font-bold text-sm shadow-xl">
                  ⭐ NAAC Accredited
                </div>
              </div>
            </FadeIn>

            {/* Right: text content */}
            <FadeIn delay={0.15}>
              <p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-3">{settings.about_story_subtitle || 'Our Story'}</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {settings.about_story_heading || "Building Tomorrow's Leaders Since Inception"}
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-4 bg-gray-200 rounded animate-pulse ${i === 4 ? 'w-3/5' : 'w-full'}`} />
                  ))}
                </div>
              ) : about ? (
                isHtml ? (
                  <div
                    className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-primary-600"
                    dangerouslySetInnerHTML={{ __html: about }}
                  />
                ) : (
                  <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{about}</p>
                )
              ) : (
                <>
                  <p className="text-gray-600 text-lg leading-relaxed mb-5">
                    {collegeName} stands as a beacon of quality education, nurturing young minds into accomplished professionals. Founded with a vision to bridge the gap between academic knowledge and industry demands, we have consistently delivered graduates who lead with competence and integrity.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Our campus embodies a culture of curiosity, collaboration, and continuous growth — providing students with world-class infrastructure, expert faculty, and transformative experiences that prepare them for the complexities of the modern world.
                  </p>
                </>
              )}
              <div className="flex gap-4 mt-8">
                <Link href="/admissions" className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-7 py-3 rounded-full hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 hover:-translate-y-0.5">
                  Apply Now <ChevronRight size={16} />
                </Link>
                <Link href="/courses" className="inline-flex items-center gap-2 border-2 border-primary-600 text-primary-600 font-bold px-7 py-3 rounded-full hover:bg-primary-50 transition-all">
                  Explore Courses
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-2">Our Purpose</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Mission & Vision</h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <FadeIn delay={0.05} className="h-full">
              <div className="relative bg-white rounded-3xl p-10 shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-600 rounded-l-3xl" />
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-5">
                  <Target size={28} className="text-primary-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {settings.about_mission || 'Our mission is to provide quality education that nurtures intellectual growth, critical thinking, innovation, and ethical values. We are committed to empowering students with the knowledge, skills, and confidence needed to excel in their careers, contribute to society, and become responsible global citizens.'}
                </p>
              </div>
            </FadeIn>
            {/* Vision */}
            <FadeIn delay={0.1} className="h-full">
              <div className="relative bg-white rounded-3xl p-10 shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 rounded-l-3xl" />
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
                  <Eye size={28} className="text-indigo-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {settings.about_vision || 'Our vision is to be a leading institution of higher education that fosters academic excellence, innovation, research, and holistic development. We aspire to inspire students with the knowledge, skills, and confidence needed to become future leaders, contribute to society, and create positive impact.'}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-2">What We Stand For</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Our Core Values</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((v: any, i: number) => {
              const MappedIcon = IconMap[v.icon] || Star;
              return (
                <FadeIn key={i} delay={i * 0.07}>
                  <ValueCard icon={MappedIcon} title={v.title} desc={v.desc} color={v.color} />
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-2">Our Journey</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Milestones Through the Years</h2>
          </FadeIn>
          <div className="flex flex-col gap-4 max-w-4xl mx-auto relative">
            {/* Center line */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-primary-100" />
            {timelineEvents.map((item: any, i: number) => (
              <div key={i} className={`md:grid md:grid-cols-2 gap-8 items-start ${i % 2 === 1 ? '' : ''}`}>
                <div className={i % 2 === 1 ? 'md:col-start-2' : ''}>
                  <TimelineItem {...item} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIRECTOR'S MESSAGE ── */}
      <section className="py-20 bg-gradient-to-br from-[#0f1b4c] via-primary-900 to-indigo-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mx-auto mb-6">
                <GraduationCap size={36} className="text-white" />
              </div>
              <div className="text-amber-400 text-3xl font-serif mb-4">"</div>
              <blockquote className="text-xl md:text-2xl text-white/90 leading-relaxed font-light mb-8 italic">
                {settings.about_director_quote || `Education is not merely a transfer of knowledge, but a transformation of character. At ${collegeName}, we believe in empowering every student to discover their potential and pursue excellence with purpose.`}
              </blockquote>
              <div className="h-0.5 w-16 bg-amber-400 mx-auto mb-6" />
              <p className="font-bold text-white text-lg">{settings.about_director_name || 'The Director'}</p>
              <p className="text-primary-300 text-sm">{collegeName}</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── ACCREDITATIONS / BADGES ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-8">Recognitions & Affiliations</p>
            <div className="flex flex-wrap justify-center gap-6">
              {(settings.about_accreditations ? settings.about_accreditations.split(',').map(s => s.trim()).filter(Boolean) : ['NAAC Accredited', 'UGC Recognized', 'AICTE Approved', 'ISO Certified', 'State University Affiliated']).map((badge, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 text-gray-700 font-semibold text-sm hover:border-primary-400 hover:text-primary-700 transition-colors">
                  <Shield size={14} className="text-primary-600" />
                  {badge}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary-900/20">
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
              />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white md:mb-4">Ready to Join Our Community?</h2>
                <p className="text-primary-100 text-xl mb-10 max-w-xl mx-auto">
                  Take the first step towards your future. Explore our programs and apply today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/admissions"
                    className="inline-block bg-white text-primary-700 font-bold px-10 py-4 rounded-full hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-1 text-lg"
                  >
                    Apply Now
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-block border-2 border-white/70 text-white font-bold px-10 py-4 rounded-full hover:bg-white/10 transition-all text-lg"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </MainLayout>
  );
}
