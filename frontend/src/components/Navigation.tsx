import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@hooks/useAuth';
import { siteSettingsApi } from '@api/endpoints';

const DEFAULT_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Departments', href: '/departments' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Notices', href: '/notices' },
  { label: 'Events', href: '/events' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const Navigation: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const [collegeName, setCollegeName] = useState('EIILM College');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    siteSettingsApi
      .getMap()
      .then((res: any) => {
        const data = res?.data;
        if (data?.college_name) setCollegeName(data.college_name);
      })
      .catch(() => {/* keep default */});
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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
            {collegeName.charAt(0)}
          </div>
          <span className="font-extrabold text-xl text-blue-700">{collegeName}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {DEFAULT_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                router.pathname === link.href
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
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
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                {portalLabel}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                href="/admissions"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Apply Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 h-0.5 bg-current mb-1.5" />
          <div className="w-6 h-0.5 bg-current mb-1.5" />
          <div className="w-6 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          {DEFAULT_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-gray-700 hover:text-blue-600 font-medium py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 flex gap-3">
            {isAuthenticated ? (
              <>
                <Link href={portalHref} className="text-blue-600 font-semibold text-sm">
                  {portalLabel}
                </Link>
                <button onClick={handleLogout} className="text-red-500 font-semibold text-sm">
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
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                >
                  Apply Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
