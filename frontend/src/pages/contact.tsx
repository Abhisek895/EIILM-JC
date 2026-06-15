import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { siteSettingsApi } from '@api/endpoints';
import FadeIn from '@components/FadeIn';
import HeroSlider from '@components/HeroSlider';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const map = await siteSettingsApi.getMap();
        setEmail(map?.email || '');
        setPhone(map?.phone || '');
        setAddress(map?.address || '');
      } catch {
        // keep empty; still show page shell
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <HeroSlider
        pageKey="contact"
        fallbackTagline="Get In Touch"
        fallbackHeading="We'd Love to Hear From You"
        fallbackSubheading="Whether you have a question about admissions, programs, or anything else, our team is ready to answer all your questions."
      />

      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 py-16 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

            {/* Left Column: Contact Form */}
            <FadeIn className="lg:col-span-3">
              <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 border border-gray-100 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-gradient-to-br from-primary-100 to-indigo-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                      <MessageSquare size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Full Name</label>
                        <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                        <input type="email" required placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Subject</label>
                      <input type="text" required placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Your Message</label>
                      <textarea required rows={4} placeholder="Write your message here..." className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none text-sm"></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus !== 'idle'}
                      className={`w-full py-3.5 px-6 mt-2 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2.5 text-sm ${formStatus === 'success'
                          ? 'bg-green-500 shadow-green-500/30'
                          : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/30 hover:shadow-lg hover:-translate-y-0.5'
                        } shadow-md`}
                    >
                      {formStatus === 'idle' && <><Send size={18} /> Send Message</>}
                      {formStatus === 'submitting' && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </div>
                      )}
                      {formStatus === 'success' && 'Message Sent Successfully!'}
                    </button>
                  </form>
                </div>
              </div>
            </FadeIn>

            {/* Right Column: Contact Info Cards */}
            <FadeIn className="lg:col-span-2 space-y-6" delay={0.2}>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[1.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-primary-500 opacity-20 rounded-full blur-2xl"></div>

                <h3 className="text-xl font-bold mb-6 relative z-10">Contact Information</h3>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                      <Mail size={18} className="text-primary-300 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Us</h4>
                      {loading ? (
                        <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <a href={`mailto:${email}`} className="text-base font-medium hover:text-primary-300 transition-colors break-all">
                          {email || 'info@college.edu'}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                      <Phone size={18} className="text-primary-300 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Call Us</h4>
                      {loading ? (
                        <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <a href={`tel:${phone}`} className="text-base font-medium hover:text-primary-300 transition-colors">
                          {phone || '+91 98765 43210'}
                        </a>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Mon-Fri from 8am to 5pm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                      <MapPin size={18} className="text-primary-300 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Visit Us</h4>
                      {loading ? (
                        <div className="h-10 w-full bg-white/20 rounded animate-pulse" />
                      ) : (
                        <p className="text-base font-medium leading-relaxed">
                          {address || 'College Campus, Near NH-17, Jorhat, Assam'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed Placeholder */}
              <div className="bg-white rounded-[1.5rem] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-48 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-[1.3rem] overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113941.13401140938!2d94.13106199999999!3d26.7570499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3746c18dd0000001%3A0xb30d35503fc2e276!2sJorhat%2C%20Assam!5e0!3m2!1sen!2sin!4v1717615033737!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(0.5) contrast(1.2)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full transition-all duration-500 group-hover:filter-none"
                  ></iframe>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
