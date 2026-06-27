import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { facultyApi } from '@api/endpoints';
import Link from 'next/link';
import { getImageUrl } from '@utils/getImageUrl';
import { motion } from 'framer-motion';
import FadeIn from '@components/FadeIn';
import {
  GraduationCap, Mail, Phone, Briefcase, BookOpen,
  ChevronLeft, ChevronRight, User, Building2
} from 'lucide-react';

type FacultyMember = {
  id: number; name: string; designation: string | null; photo: string | null;
  qualification: string | null; experience: string | null; email: string | null;
  phone: string | null; bio: string | null;
  department?: { id: number; name: string; slug: string | null };
};

function InfoPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-primary-300" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-0.5">{label}</p>
        <p className="text-white font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function FacultyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [faculty, setFaculty] = useState<FacultyMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    facultyApi
      .getById(Number(id))
      .then((res: any) => setFaculty(res?.data || null))
      .catch(() => setFaculty(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#0a1128] to-primary-900 flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!faculty) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <FadeIn className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
              <User size={40} className="text-primary-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Faculty Member Not Found</h1>
            <p className="text-gray-500 mb-8">This profile may have been removed or the URL is incorrect.</p>
            <Link href="/faculty" className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-7 py-3 rounded-full hover:bg-primary-700 transition-all">
              <ChevronLeft size={16} /> Back to Faculty
            </Link>
          </FadeIn>
        </div>
      </MainLayout>
    );
  }

  const initials = faculty.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <MainLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[420px] overflow-hidden bg-gradient-to-br from-[#0a1128] via-primary-800 to-indigo-900">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* Glow orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="container mx-auto px-6 pt-4 pb-16 relative z-10">
          <div className="grid md:grid-cols-[1fr_280px] gap-10 items-center">
            {/* Left: Info */}
            <div>
              {faculty.department && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <Link
                    href={faculty.department.slug ? `/departments/${faculty.department.slug}` : '#'}
                    className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 hover:bg-white/20 transition-colors"
                  >
                    <Building2 size={14} /> {faculty.department.name}
                  </Link>
                </motion.div>
              )}
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
                {faculty.name}
              </motion.h1>
              {faculty.designation && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="text-primary-300 text-xl font-semibold mb-8">
                  {faculty.designation}
                </motion.p>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {faculty.qualification && <InfoPill icon={GraduationCap} label="Qualification" value={faculty.qualification} />}
                {faculty.experience && <InfoPill icon={Briefcase} label="Experience" value={faculty.experience} />}
                {faculty.email && <InfoPill icon={Mail} label="Email" value={faculty.email} />}
                {faculty.phone && <InfoPill icon={Phone} label="Phone" value={faculty.phone} />}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="flex gap-3 mt-8">
                {faculty.email && (
                  <a href={`mailto:${faculty.email}`}
                    className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-full hover:bg-primary-50 transition-all shadow-lg hover:-translate-y-0.5">
                    <Mail size={16} /> Email Faculty
                  </a>
                )}
                <Link href="/faculty"
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-6 py-3 rounded-full hover:bg-white/10 transition-all">
                  <ChevronLeft size={16} /> All Faculty
                </Link>
              </motion.div>
            </div>

            {/* Right: Photo */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="hidden md:block">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/30 bg-white/5">
                {faculty.photo ? (
                  <img src={getImageUrl(faculty.photo)} alt={faculty.name} className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-indigo-700">
                    <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center text-4xl font-extrabold text-white mb-4">
                      {initials}
                    </div>
                    <p className="text-white/60 text-sm">No photo available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BIO ── */}
      {faculty.bio && (
        <section className="py-16 bg-white">
          <FadeIn className="container mx-auto px-6 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-primary-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">About {faculty.designation ? `${faculty.designation} ` : ''}{faculty.name}</h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              {faculty.bio}
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-16 bg-gray-50">
        <FadeIn className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-10 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Interested in Our Programs?</h2>
              <p className="text-primary-100 mb-7 max-w-xl mx-auto">Join a world-class institution guided by expert faculty like {faculty.name}.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/admissions" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-full hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-1">
                  Apply Now
                </Link>
                <Link href="/contact" className="border-2 border-white/70 text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-all">
                  Contact Admissions
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </MainLayout>
  );
}
