import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cmsApi } from '@api/endpoints';

import { getImageUrl } from '@utils/getImageUrl';

interface HeroSliderProps {
  pageKey: string;
  fallbackTagline?: string;
  fallbackHeading?: string;
  fallbackSubheading?: string;
  initialSlides?: any[];
  hideTextOnMobile?: boolean;
}

export default function HeroSlider({ pageKey, fallbackTagline, fallbackHeading, fallbackSubheading, hideTextOnMobile }: HeroSliderProps) {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const res: any = await cmsApi.getPageSections(pageKey);
        const sections = res?.data || [];
        const heroSection = sections.find((s: any) => s.sectionKey === 'hero');
        if (heroSection?.config?.slides && Array.isArray(heroSection.config.slides) && heroSection.config.slides.length > 0) {
          setSlides(heroSection.config.slides);
        } else {
          setSlides([]);
        }
      } catch (e) {
        console.error(`Failed to load hero slider for ${pageKey}`, e);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, [pageKey]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="relative bg-primary-700 text-white overflow-hidden py-24 md:py-32 min-h-[300px] flex items-center justify-center animate-pulse">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback if no dynamic slides are configured for this page
  if (slides.length === 0) {
    return null;
  }

  const activeSlide = slides[currentSlide];

  if (pageKey === 'home') {
    return (
      <div className="relative w-full overflow-hidden h-[250px] lg:h-[350px] bg-white">
        {slides.map((slide: any, idx: number) => (
          <div
            key={idx}
            className={`absolute inset-0 flex transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Image section: dynamically sizes its exact width, no white gaps! */}
            {slide.imageUrl ? (
              <img
                src={getImageUrl(slide.imageUrl)}
                alt="Hero Banner"
                className="h-full w-auto max-w-[65%] object-contain object-left shrink-0 z-0"
              />
            ) : (
              <div className="h-full w-[50%] bg-slate-200 shrink-0 z-0" />
            )}

            {/* Slanted Overlay: fills all remaining space and perfectly overlaps the slant! */}
            <div
              className="flex-1 h-full z-10 flex flex-col justify-center items-end pr-16 md:pr-24 lg:pr-32 xl:pr-40 relative"
              style={{
                backgroundColor: slide.bgColor || '#fecb00',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 220px 100%)',
                marginLeft: '-220px',
                paddingLeft: '230px'
              }}
            >
              {/* Dynamic Logos for this slide */}
              {activeSlide.logos && activeSlide.logos.length > 0 && (
                <div className="absolute top-4 right-12 hidden lg:flex gap-2 opacity-90">
                  {activeSlide.logos.map((logoUrl: string, lIdx: number) => (
                    <div key={lIdx} className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden p-1.5 border border-gray-100">
                      <img src={getImageUrl(logoUrl)} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}

              <div className="w-full max-w-lg lg:max-w-xl mt-1 relative z-10 text-left">
                {activeSlide.badge && (
                  <p className="text-sm md:text-base lg:text-lg font-black text-slate-900 mb-0.5 uppercase tracking-tight">
                    {activeSlide.badge}
                  </p>
                )}

                <h1 className="text-2xl md:text-3xl lg:text-[42px] font-black text-slate-900 leading-tight tracking-tight mb-3 uppercase flex flex-wrap items-baseline gap-x-3">
                  {(() => {
                    const words = (activeSlide.heading || '').split(' ');
                    if (words.length >= 2) {
                      const splitIndex = Math.ceil(words.length / 2);
                      const first = words.slice(0, splitIndex).join(' ');
                      const rest = words.slice(splitIndex).join(' ');
                      return (
                        <>
                          <span>{first}</span>
                          <span className="text-[#2e3192] border-b-[4px] lg:border-b-[6px] border-[#2e3192] pb-0.5">{rest}</span>
                        </>
                      );
                    }
                    return activeSlide.heading;
                  })()}
                </h1>

                {activeSlide.subheading && (
                  <p className="text-xs md:text-sm lg:text-base text-[#2e3192] mb-4 font-semibold tracking-wide">
                    {activeSlide.subheading}
                  </p>
                )}

                <div className="mt-1">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-900 mb-1.5 uppercase tracking-widest">
                    {activeSlide.secondaryCta?.label || "GET FREE CAREER ADVICE"}
                  </p>
                  {(activeSlide.primaryCta?.label || true) && (
                    <Link
                      href={activeSlide.primaryCta?.href || '#'}
                      className="inline-block bg-[#2e3192] text-white font-bold px-6 py-2 md:px-8 md:py-2.5 hover:bg-blue-900 transition-all text-xs md:text-sm shadow-lg rounded-md border-2 border-[#2e3192] hover:border-blue-900"
                    >
                      {activeSlide.primaryCta?.label || "ENQUIRE NOW"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Floating Social Sidebar matching the reference */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col z-30 shadow-2xl">
          <button className="bg-[#2e3192] text-white p-3 md:p-3.5 hover:bg-blue-800 border-b border-blue-800/50 flex items-center justify-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.01 2.01a10 10 0 0 0-8.52 15.26L2 22l4.88-1.46a9.96 9.96 0 0 0 5.13 1.41h.01a10 10 0 0 0 10-10 10 10 0 0 0-10-10zm5.72 14.36c-.24.68-1.41 1.25-1.94 1.3-.5.06-1.16.14-3.32-.76-2.61-1.09-4.32-3.8-4.46-3.99-.13-.18-1.07-1.42-1.07-2.71 0-1.29.67-1.92.9-2.17.24-.26.51-.32.68-.32.17 0 .34.01.48.02.16.01.37-.06.57.42.22.54.74 1.81.8 1.95.07.13.11.29.02.48-.08.19-.13.31-.26.46-.12.16-.26.34-.36.47-.12.14-.25.29-.11.53.14.25.64 1.06 1.36 1.7.93.83 1.73 1.09 1.98 1.2.25.12.4.1.55-.07.15-.17.64-.75.81-1.01.17-.25.35-.21.57-.13.23.08 1.44.68 1.69.8.25.13.41.19.47.29.07.1.07.59-.17 1.27z" /></svg>
          </button>
          <button className="bg-[#2e3192] text-white p-3 md:p-3.5 hover:bg-blue-800 border-b border-blue-800/50 flex items-center justify-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" /></svg>
          </button>
          <button className="bg-[#2e3192] text-white p-3 md:p-3.5 hover:bg-blue-800 border-b border-blue-800/50 flex items-center justify-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
          </button>
          <button className="bg-[#2e3192] text-white p-3 md:p-3.5 hover:bg-blue-800 flex items-center justify-center">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" /></svg>
          </button>
        </div>

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-6 z-20 flex gap-2">
            {slides.map((slideItem: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8' : 'w-2 bg-white/70 hover:bg-white'}`}
                style={idx === currentSlide ? { backgroundColor: slideItem.bgColor || '#fecb00' } : {}}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Subpages Layout (Small Height, Centered Text, Dark Overlay)
  const containerPadding = "h-[250px] lg:h-[350px]";
  const headingSize = "text-3xl md:text-5xl mb-3 leading-tight";

  return (
    <div className={`relative bg-slate-900 text-white overflow-hidden flex items-center transition-all duration-1000 ${containerPadding}`}>
      {/* Background images for subpages */}
      <div className="absolute inset-0">
        {slides.map((slide: any, idx: number) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'}`}>
            {slide.imageUrl ? (
              <img src={getImageUrl(slide.imageUrl)} alt="Hero Background" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700" />
            )}
            <div className="absolute inset-0 bg-slate-900/60 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>
        ))}
      </div>

      <div className={`container relative mx-auto px-6 text-center z-10 transition-all duration-700 ${hideTextOnMobile ? 'hidden sm:block' : ''}`}>
        {activeSlide.badge && (
          <p className="text-sm font-bold uppercase tracking-widest text-primary-200 mb-3 animate-fadeIn">
            {activeSlide.badge}
          </p>
        )}

        <h1 className={`font-extrabold drop-shadow-lg tracking-tight animate-slideUp ${headingSize}`}>
          {activeSlide.heading}
        </h1>

        {activeSlide.subheading && (
          <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed drop-shadow animate-slideUp" style={{ animationDelay: '0.1s' }}>
            {activeSlide.subheading}
          </p>
        )}

        {(activeSlide.primaryCta?.label || activeSlide.secondaryCta?.label) && (
          <div className="flex flex-wrap justify-center gap-4 animate-slideUp mt-8" style={{ animationDelay: '0.2s' }}>
            {activeSlide.primaryCta?.label && (
              <Link
                href={activeSlide.primaryCta.href || '#'}
                className="inline-block bg-primary-500 text-white font-bold px-8 py-3 rounded-full hover:bg-primary-600 hover:scale-105 transition-all shadow-xl shadow-primary-900/20"
              >
                {activeSlide.primaryCta.label}
              </Link>
            )}
            {activeSlide.secondaryCta?.label && (
              <Link
                href={activeSlide.secondaryCta.href || '#'}
                className="inline-block border-2 border-white/80 text-white backdrop-blur-sm font-bold px-8 py-3 rounded-full hover:bg-white hover:text-primary-900 hover:scale-105 transition-all shadow-lg"
              >
                {activeSlide.secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute -bottom-10 md:-bottom-16 left-0 right-0 flex justify-center gap-2">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-8 bg-primary-500' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
