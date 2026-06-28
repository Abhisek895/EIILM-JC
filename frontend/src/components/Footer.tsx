import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { siteSettingsApi } from '@api/endpoints';
import { Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

// Simple SVG Icons for Social Media Fallbacks
const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const Youtube = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);
const Linkedin = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const DEFAULT_SETTINGS = {
  college_name: '',
  logo: '',
  show_college_name: true,
  tagline: 'A student-first college experience focused on clear guidance, practical learning, and career outcomes.',
  show_tagline: true,
  address: 'College Campus, Near NH-17, Jorhat, Assam',
  email: 'info@college.edu',
  phone: '+91 98765 43210',
  copyright: 'Copyright 2026. All rights reserved.',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
  social_linkedin: '',
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
            logo: data.logo || '',
            show_college_name: data.show_college_name !== 'false',
            tagline: data.tagline || DEFAULT_SETTINGS.tagline,
            show_tagline: data.show_tagline !== 'false',
            address: data.address || DEFAULT_SETTINGS.address,
            email: data.email || DEFAULT_SETTINGS.email,
            phone: data.phone || DEFAULT_SETTINGS.phone,
            copyright: data.copyright || DEFAULT_SETTINGS.copyright,
            social_facebook: data.social_facebook || '',
            social_instagram: data.social_instagram || '',
            social_youtube: data.social_youtube || '',
            social_linkedin: data.social_linkedin || '',
          });
        }
      })
      .catch(() => {
        // Keep defaults.
      });
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const socials = [
    { icon: Facebook, href: settings.social_facebook, label: 'Facebook', color: 'hover:bg-[#1877F2]' },
    { icon: Instagram, href: settings.social_instagram, label: 'Instagram', color: 'hover:bg-[#E1306C]' },
    { icon: Youtube, href: settings.social_youtube, label: 'YouTube', color: 'hover:bg-[#FF0000]' },
    { icon: Linkedin, href: settings.social_linkedin, label: 'LinkedIn', color: 'hover:bg-[#0A66C2]' },
  ].filter(s => s.href);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-6 pt-14 pb-6">
        <div className="grid grid-cols-1 gap-8 mb-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            {settings.logo && (
              <div className="mb-4">
                <img
                  src={getImageUrl(settings.logo)}
                  alt={settings.college_name || 'Logo'}
                  className="h-14 object-contain brightness-0 invert opacity-90"
                />
              </div>
            )}
            {settings.show_college_name && settings.college_name && !settings.logo && (
              <h3 className="mb-3 text-xl font-extrabold text-white">{settings.college_name}</h3>
            )}
            {settings.show_tagline && (
              <p className="text-sm leading-relaxed text-gray-400">
                {settings.tagline}
              </p>
            )}
            {/* Social Links */}
            {socials.length > 0 && (
              <div className="flex gap-2 mt-5">
                {socials.map(({ icon: Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all ${color} active:scale-95`}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
            {/* Fallback static social icons if none configured */}
            {socials.length === 0 && (
              <div className="flex gap-2 mt-5">
                {[
                  { icon: Facebook, label: 'Facebook', color: 'hover:bg-[#1877F2]' },
                  { icon: Instagram, label: 'Instagram', color: 'hover:bg-[#E1306C]' },
                  { icon: Youtube, label: 'YouTube', color: 'hover:bg-[#FF0000]' },
                  { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-[#0A66C2]' },
                ].map(({ icon: Icon, label, color }) => (
                  <button
                    key={label}
                    aria-label={label}
                    className={`w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 transition-all ${color} hover:text-white active:scale-95 cursor-default`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            )}
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
                  <Link href={link.href} className="transition-colors hover:text-white hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Campus Life
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Placements', href: '/placements' },
                { label: 'Events', href: '/events' },
                { label: 'Infrastructure', href: '/infrastructure' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white hover:translate-x-1 inline-block">
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
                <Mail size={16} className="mt-0.5 shrink-0 text-primary-400" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors break-all">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-primary-400" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary-400" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 md:flex-row">
          <p className="text-sm text-gray-500">{settings.copyright}</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-500 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 transition-colors hover:text-white">
              Terms of Use
            </Link>
            <Link href="/contact" className="text-gray-500 transition-colors hover:text-white">
              Support
            </Link>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Extra bottom padding on mobile for the sticky CTA bar */}
      <div className="lg:hidden h-[54px]" />
    </footer>
  );
};

export default Footer;
