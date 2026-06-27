import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { siteSettingsApi } from '@api/endpoints';
import FadeIn from '@components/FadeIn';
import HeroSlider from '@components/HeroSlider';
import SEO from '@components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, ChevronDown, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const FAQS = [
  { q: 'How can I apply for admission?', a: 'You can apply online through our Admissions page. Fill in the application form with your details and the course you are interested in, and our team will get back to you within 2 business days.' },
  { q: 'What documents are required for admission?', a: 'Generally, you will need your previous academic mark sheets, identity proof, passport-size photographs, and any other certificates relevant to the course. Specific requirements are shared during the admission process.' },
  { q: 'Is there a hostel facility available?', a: 'Yes, we provide hostel facilities for outstation students. Please contact the admissions office to check availability and fee structure for the current academic year.' },
  { q: 'What are the college office hours?', a: 'Our administrative office is open Monday to Friday, 9:00 AM to 5:00 PM, and on Saturdays from 9:00 AM to 1:00 PM. We are closed on Sundays and public holidays.' },
  { q: 'Does the college provide placement assistance?', a: 'Yes, we have a dedicated Placement Cell that actively connects students with top companies through campus recruitment drives, internship programs, and career counseling sessions.' },
];

function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn delay={idx * 0.07}>
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="font-bold text-gray-900">{q}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
          </motion.div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-5 text-gray-600 leading-relaxed">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeIn>
  );
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    const run = async () => {
      try {
        const map: any = await siteSettingsApi.getMap();
        const data = map?.data || map;
        setSettings(data);
        setEmail(data?.email || '');
        setPhone(data?.phone || '');
        setAddress(data?.address || '');
      } catch { } finally { setLoading(false); }
    };
    run();
  }, []);

  let parsedFaqs = [];
  try { parsedFaqs = settings.contact_faqs ? JSON.parse(settings.contact_faqs) : []; } catch (e) { }
  if (!parsedFaqs.length) {
    parsedFaqs = FAQS;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
      setTimeout(() => setFormStatus('idle'), 4000);
    }, 1500);
  };

  return (
    <MainLayout>
      <SEO
        title="Contact Us"
        description="Get in touch with us for general inquiries, admissions, and more. Our team is ready to answer all your questions."
      />
      <HeroSlider
        pageKey="contact"
        fallbackTagline="Get In Touch"
        fallbackHeading="We'd Love to Hear From You"
        fallbackSubheading="Whether you have a question about admissions, programs, or anything else, our team is ready to answer."
      />

      {/* ── CONTACT FORM + INFO ── */}
      <section className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-20 lg:pt-24 pb-20 bg-gray-50/50 min-h-screen relative z-20 -mt-10 md:-mt-16 lg:-mt-20 rounded-t-3xl md:rounded-t-[3rem] shadow-[0_-12px_40px_rgb(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <FadeIn className="text-center mb-12 md:mb-16">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-600 mb-3 md:mb-4">Reach Out</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">Contact Us</h2>
            <p className="text-gray-500 mt-3 md:mt-4 text-lg max-w-lg mx-auto">We typically respond within one business day.</p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {/* Form */}
            <FadeIn className="lg:col-span-3 h-full">
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Send us a Message</h3>
                  </div>

                  {formStatus === 'success' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6">
                      <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                      <p className="font-semibold">Message sent! We'll get back to you within 1 business day.</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Full Name</label>
                        <input type="text" required placeholder="John Doe" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                        <input type="email" required placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                        <input type="tel" required placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Subject</label>
                        <input type="text" required placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none text-sm" />
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-grow flex flex-col">
                      <label className="text-sm font-semibold text-gray-700">Your Message</label>
                      <textarea required rows={6} placeholder="Write your message here..." className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 transition-all outline-none resize-none text-sm flex-grow"></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus !== 'idle'}
                      className={`w-full py-3.5 px-6 mt-2 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2.5 text-sm ${formStatus === 'success'
                        ? 'bg-green-500 shadow-green-500/30'
                        : 'bg-gray-900 hover:bg-black shadow-gray-900/30 hover:shadow-lg hover:-translate-y-0.5'
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
            <FadeIn className="lg:col-span-2 flex flex-col h-full gap-6" delay={0.2}>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] px-8 py-6 md:px-10 md:py-8 text-white relative overflow-hidden shadow-2xl">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-primary-500 opacity-20 rounded-full blur-2xl"></div>

                <h3 className="text-2xl font-bold mb-6 relative z-10 text-white">Contact Information</h3>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                      <Mail size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Us</h4>
                      {loading ? (
                        <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <a href={`mailto:${email}`} className="text-lg font-medium hover:text-primary-300 transition-colors break-all">
                          {email || 'info@college.edu'}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                      <Phone size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Call Us</h4>
                      {loading ? (
                        <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <a href={`tel:${phone}`} className="text-lg font-medium hover:text-primary-300 transition-colors">
                          {phone || '+91 98765 43210'}
                        </a>
                      )}
                      <p className="text-gray-400 text-sm mt-1">Mon-Fri from 8am to 5pm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                      <MapPin size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Visit Us</h4>
                      {loading ? (
                        <div className="h-4 w-40 bg-white/20 rounded animate-pulse" />
                      ) : (
                        <p className="text-lg font-medium leading-snug">
                          {address || 'College Campus, Near NH-17, Jorhat, Assam'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-2 md:p-3 border border-gray-100 relative overflow-hidden flex-grow flex flex-col min-h-[250px]">
                <div className="rounded-[1.5rem] overflow-hidden w-full relative flex-grow">
                  <iframe
                    src={settings?.contact_map_url || "https://maps.google.com/maps?q=EIILM-Kolkata%2C%20Jalpaiguri%20Campus%2C%20Porapara%20Road%20Pandapara%2C%20Kalibari%20Rd%2C%20Area%2C%20Jalpaiguri%2C%20West%20Bengal%20735132&t=k&z=17&ie=UTF8&iwloc=&output=embed"}
                    width="100%" height="100%"
                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="College Location"
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
