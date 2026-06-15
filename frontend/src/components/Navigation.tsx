import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';
import { siteSettingsApi } from '@api/endpoints';
import { Menu, X } from 'lucide-react';

import { getImageUrl } from '@utils/getImageUrl';

const DEFAULT_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Departments', href: '/departments' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Notices', href: '/notices' },
  { label: 'Events', href: '/events' },
  { label: 'Placements', href: '/placements' },
  { label: 'Infrastructure', href: '/infrastructure' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const Navigation: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const [collegeName, setCollegeName] = useState('');
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    siteSettingsApi
      .getMap()
      .then((res: any) => {
        const data = res?.data;
        if (data?.college_name) {
          setCollegeName(data.college_name);
        } else {
          setCollegeName('College ERP');
        }
        if (data?.logo) setLogo(data.logo);
        if (data?.favicon) setFavicon(data.favicon);
      })
      .catch(() => {
        setCollegeName('College ERP');
      });
  }, []);

  const portalHref =
    user?.role === 'admin' || user?.role === 'super_admin' ? '/dashboard' : '/student';
  const portalLabel =
    user?.role === 'admin' || user?.role === 'super_admin' ? 'Dashboard' : 'Student Portal';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      {favicon && (
        <Head>
          <link rel="icon" href={getImageUrl(favicon)} />
          <link rel="apple-touch-icon" href={getImageUrl(favicon)} />
        </Head>
      )}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {collegeName || logo ? (
              <>
                {logo ? (
                  <img src={getImageUrl(logo)} alt={collegeName || 'Logo'} className="h-14 object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
                    {collegeName.charAt(0)}
                  </div>
                )}
                <span className="font-extrabold text-xl text-primary-700">{collegeName}</span>
              </>
            ) : (
              <div className="w-40 h-8 bg-gray-200 rounded animate-pulse" />
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {DEFAULT_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${router.pathname === link.href
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                  }`}
              >
                {link.label}
              </Link>
            ))}
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
                  className="text-sm bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-semibold shadow-sm hover:shadow-md"
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
                  Login
                </Link>
                <Link
                  href="/admissions"
                  className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Apply Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-primary-600"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
            {DEFAULT_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-700 hover:text-primary-600 font-medium py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-3 flex gap-3">
              {isAuthenticated ? (
                <>
                  <Link href={portalHref} className="text-primary-600 font-semibold text-sm">
                    {portalLabel}
                  </Link>
                  <button onClick={handleLogout} className="text-primary-500 hover:text-primary-600 font-semibold text-sm transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 font-semibold text-sm">
                    Login
                  </Link>
                  <Link
                    href="/admissions"
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                  >
                    Apply Now
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
