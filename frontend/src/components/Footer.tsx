import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { siteSettingsApi } from '@api/endpoints';

const DEFAULT_SETTINGS = {
  college_name: 'EIILM College',
  address: 'College Campus, Near NH-17, Jorhat, Assam',
  email: 'info@eiilm.edu',
  phone: '+91 376 2342 123',
  copyright: '© 2025 EIILM College. All rights reserved.',
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
      .catch(() => {/* keep defaults */});
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <h3 className="text-white font-extrabold text-xl mb-3">{settings.college_name}</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              A premier institution committed to academic excellence, innovation, and holistic
              development of every student.
            </p>
          </div>

          {/* Academics */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Academics
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Courses', href: '/courses' },
                { label: 'Departments', href: '/departments' },
                { label: 'Faculty', href: '/faculty' },
                { label: 'Notices', href: '/notices' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admissions */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Admissions
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Apply Now', href: '/admissions' },
                { label: 'Events', href: '/events' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-2">
                <span>📧</span>
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
              <li className="flex gap-2">
                <span>📞</span>
                <a href={`tel:${settings.phone}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
              <li className="flex gap-2">
                <span>📍</span>
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">{settings.copyright}</p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
