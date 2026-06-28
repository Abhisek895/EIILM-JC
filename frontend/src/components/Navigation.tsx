import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';
import { siteSettingsApi } from '@api/endpoints';
import { Menu, X, ChevronDown, Phone, GraduationCap } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

const ACADEMICS_LINKS = [
  { label: 'Courses', href: '/courses' },
  { label: 'Departments', href: '/departments' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Infrastructure', href: '/infrastructure' },
  { label: 'Notices', href: '/notices' },
];

const CAMPUS_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Events', href: '/events' },
  { label: 'Placements', href: '/placements' },
  { label: 'Contact', href: '/contact' },
];

const ALL_MOBILE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Courses', href: '/courses' },
  { label: 'Departments', href: '/departments' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Infrastructure', href: '/infrastructure' },
  { label: 'Placements', href: '/placements' },
  { label: 'About Us', href: '/about' },
  { label: 'Events', href: '/events' },
  { label: 'Notices', href: '/notices' },
  { label: 'Contact', href: '/contact' },
];

function DropdownMenu({ label, links, activeHref }: { label: string; links: { label: string; href: string }[]; activeHref: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = links.some(l => l.href === activeHref);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary-50 hover:text-primary-700 ${activeHref === link.href ? 'text-primary-600 bg-primary-50/50' : 'text-gray-700'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileAccordionMenu({ label, links, activeHref }: { label: string; links: { label: string; href: string }[]; activeHref: string }) {
  const [open, setOpen] = useState(false);
  const isActive = links.some(l => l.href === activeHref);
  return (
    <div className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive || open ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>{label}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pl-4 py-1 space-y-1 border-l-2 border-gray-100 ml-4 mt-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center min-h-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeHref === link.href ? 'text-primary-600 font-bold' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Navigation: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const [collegeName, setCollegeName] = useState('');
  const [showCollegeName, setShowCollegeName] = useState(true);
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [phone, setPhone] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    siteSettingsApi
      .getMap()
      .then((res: any) => {
        const data = res?.data;
        if (data?.college_name) setCollegeName(data.college_name);
        else setCollegeName('');
        if (data?.show_college_name === 'false') setShowCollegeName(false);
        else setShowCollegeName(true);
        if (data?.logo) setLogo(data.logo);
        if (data?.favicon) setFavicon(data.favicon);
        if (data?.phone) setPhone(data.phone);
      })
      .catch(() => setCollegeName(''));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  const portalHref =
    user?.role === 'admin' || user?.role === 'super_admin' ? '/dashboard' : '/student';
  const portalLabel =
    user?.role === 'admin' || user?.role === 'super_admin' ? 'Dashboard' : 'Student Portal';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isAdmissions = router.pathname === '/admissions';

  return (
    <>
      {favicon && (
        <Head>
          <link rel="icon" href={getImageUrl(favicon)} />
          <link rel="apple-touch-icon" href={getImageUrl(favicon)} />
        </Head>
      )}

      <nav
        className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${
          isAdmissions
            ? 'border-t-8 border-t-[#2E3138] border-b-[6px] border-b-[#F4B615]'
            : scrolled
            ? 'shadow-md border-b border-gray-100'
            : 'shadow-sm'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {collegeName || logo ? (
              <>
                {logo ? (
                  <img src={getImageUrl(logo)} alt={collegeName || 'Logo'} className="h-14 object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
                    {collegeName.charAt(0)}
                  </div>
                )}
                {showCollegeName && (
                  <span className="font-extrabold text-xl text-primary-700 hidden sm:block">{collegeName}</span>
                )}
              </>
            ) : (
              <div className="w-40 h-8 bg-gray-200 rounded animate-pulse" />
            )}
          </Link>

          {!isAdmissions && (
            <>
              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-5">
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${router.pathname === '/' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
                >
                  Home
                </Link>
                <Link
                  href="/admissions"
                  className={`text-sm font-medium transition-colors ${router.pathname === '/admissions' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
                >
                  Admissions
                </Link>
                <DropdownMenu label="Academics" links={ACADEMICS_LINKS} activeHref={router.pathname} />
                <DropdownMenu label="Campus Life" links={CAMPUS_LINKS} activeHref={router.pathname} />
              </div>

              {/* Auth buttons */}
              <div className="hidden lg:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      href={portalHref}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      {portalLabel}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-semibold shadow-sm hover:shadow-md active:scale-95"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-sm font-semibold text-gray-700 hover:text-primary-600"
                    >
                      Student Login
                    </Link>
                    <Link
                      href="/admissions"
                      className="text-sm bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-md shadow-primary-600/20 active:scale-95"
                    >
                      Apply Now
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>

        {/* Mobile menu — animated slide down */}
        {!isAdmissions && (
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-gray-100 bg-white px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
              <Link
                href="/"
                className={`flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname === '/' ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/admissions"
                className={`flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname === '/admissions' ? 'text-primary-600 bg-primary-50 border-l-4 border-primary-600' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Admissions
              </Link>
              
              <MobileAccordionMenu label="Academics" links={ACADEMICS_LINKS} activeHref={router.pathname} />
              <MobileAccordionMenu label="Campus Life" links={CAMPUS_LINKS} activeHref={router.pathname} />

              <div className="border-t border-gray-100 pt-3 mt-2 flex gap-3">
                {isAuthenticated ? (
                  <>
                    <Link href={portalHref} className="flex-1 text-center min-h-[44px] flex items-center justify-center text-primary-600 font-semibold text-sm bg-primary-50 rounded-lg">
                      {portalLabel}
                    </Link>
                    <button onClick={handleLogout} className="flex-1 min-h-[44px] text-primary-500 hover:text-primary-600 font-semibold text-sm transition-colors bg-gray-50 rounded-lg">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex-1 text-center min-h-[44px] flex items-center justify-center text-gray-700 font-semibold text-sm bg-gray-50 rounded-lg">
                      Student Login
                    </Link>
                    <Link
                      href="/admissions"
                      className="flex-1 text-center min-h-[44px] flex items-center justify-center bg-primary-600 text-white rounded-lg text-sm font-bold shadow-md active:scale-95 transition-transform"
                    >
                      Apply Now
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sticky Mobile Bottom CTA Bar — shows after scrolling past hero */}
      {!isAdmissions && scrolled && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center gap-0 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-2 duration-300">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex-1 flex items-center justify-center gap-2 min-h-[54px] bg-white text-primary-700 font-bold text-sm border-r border-gray-200 active:bg-gray-50 transition-colors"
            >
              <Phone size={16} />
              Call Us
            </a>
          )}
          <Link
            href="/admissions"
            className="flex-1 flex items-center justify-center gap-2 min-h-[54px] bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-sm active:from-primary-700 active:to-primary-600 transition-all"
          >
            <GraduationCap size={16} />
            Apply Now
          </Link>
        </div>
      )}
    </>
  );
};

export default Navigation;
