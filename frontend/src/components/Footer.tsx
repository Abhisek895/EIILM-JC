import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { siteSettingsApi } from '@api/endpoints';
import { Mail, Phone, MapPin } from 'lucide-react';

const DEFAULT_SETTINGS = {
  college_name: '',
  address: 'College Campus, Near NH-17, Jorhat, Assam',
  email: 'info@college.edu',
  phone: '+91 98765 43210',
  copyright: 'Copyright 2026. All rights reserved.',
};

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    siteSettingsApi
      .getMap()
      .then((res: any) => {
        const data = res?.data;
        if (data && typeof data === 'object') {
          setSettings({
            college_name: data.college_name || DEFAULT_SETTINGS.college_name,
            address: data.address || DEFAULT_SETTINGS.address,
            email: data.email || DEFAULT_SETTINGS.email,
            phone: data.phone || DEFAULT_SETTINGS.phone,
            copyright: data.copyright || DEFAULT_SETTINGS.copyright,
          });
        }
      })
      .catch(() => {
        // Keep defaults.
      });
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 gap-8 mb-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-xl font-extrabold text-white">{settings.college_name}</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              A student-first college experience focused on clear guidance, practical learning,
              and career outcomes.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Academics
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Admissions', href: '/admissions' },
                { label: 'Courses', href: '/courses' },
                { label: 'Departments', href: '/departments' },
                { label: 'Faculty', href: '/faculty' },
                { label: 'Notices', href: '/notices' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Admissions
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Placements', href: '/placements' },
                { label: 'Events', href: '/events' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-700 pt-6 md:flex-row">
          <p className="text-sm text-gray-500">{settings.copyright}</p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-gray-500 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 transition-colors hover:text-white">
              Terms of Use
            </Link>
            <Link href="/contact" className="text-gray-500 transition-colors hover:text-white">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
