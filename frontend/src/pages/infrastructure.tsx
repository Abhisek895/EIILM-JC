import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { infrastructureApi, siteSettingsApi } from '@api/endpoints';
import Link from 'next/link';
import { getImageUrl } from '@utils/image';
import HeroSlider from '@components/HeroSlider';
import FadeIn from '@components/FadeIn';
import { Building, Sparkles, Building2, PlayCircle, Volume2, VolumeX } from 'lucide-react';

type InfraItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  icon: string;
  category: 'facility' | 'tour' | 'campus_highlight' | 'hero';
  status: 'active' | 'inactive' | 'maintenance';
};

export default function InfrastructurePage() {
  const [tours, setTours] = useState<InfraItem[]>([]);
  const [facilities, setFacilities] = useState<InfraItem[]>([]);
  const [highlights, setHighlights] = useState<InfraItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [mutedVideos, setMutedVideos] = useState<Record<number, boolean>>({});
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({});
  const [videoAspectRatios, setVideoAspectRatios] = useState<Record<number, number>>({});
  const [isIdle, setIsIdle] = useState(false);

  const toggleMute = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setMutedVideos(prev => ({ ...prev, [id]: prev[id] === undefined ? true : !prev[id] }));
  };

  const togglePlay = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const video = document.getElementById(`video-${id}`) as HTMLVideoElement;
    if (video) {
      if (video.paused) video.play();
      else video.pause();
    }
  };

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>, id: number) => {
    const video = e.currentTarget;
    if (video.videoHeight > 0) {
      setVideoAspectRatios(prev => {
        const newRatio = video.videoWidth / video.videoHeight;
        if (prev[id] === newRatio) return prev;
        return { ...prev, [id]: newRatio };
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsIdle(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      infrastructureApi.getAll(1, 100),
      siteSettingsApi.getMap()
    ])
      .then(([infraRes, settingsRes]: any) => {
        const data: InfraItem[] = infraRes?.data || [];
        setTours(data.filter(i => i.category === 'tour' && i.status === 'active'));
        setFacilities(data.filter(i => i.category === 'facility' && i.status === 'active'));
        setHighlights(data.filter(i => (i.category === 'hero' || i.category === 'campus_highlight') && i.status === 'active'));
        setSiteSettings(settingsRes?.data || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      {/* Hero Banner Slider */}
      <HeroSlider
        pageKey="infrastructure"
        fallbackTagline={siteSettings.infra_hero_tagline || 'Campus Infrastructure'}
        fallbackHeading={siteSettings.infra_hero_heading || 'World-Class Facilities'}
        fallbackSubheading={siteSettings.infra_hero_subheading || 'Experience an environment designed to inspire innovation, foster creativity, and provide the ultimate student experience.'}
      />

      <div className="container mx-auto px-6 py-12">
        {/* Filter Tabs */}
        {!loading && (highlights.length > 0 || facilities.length > 0 || tours.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {['All', 'Campus Highlights', 'Facilities', 'Virtual Tours'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${filter === t
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && highlights.length === 0 && facilities.length === 0 && tours.length === 0 && (
          <FadeIn className="text-center py-20 text-gray-400">
            <div className="flex justify-center mb-6 text-gray-300">
              <Building size={64} />
            </div>
            <p className="text-lg font-medium text-gray-600">No infrastructure details available.</p>
            <p className="text-sm mt-1">Check back soon for updates.</p>
          </FadeIn>
        )}

        {/* Content sections */}
        {!loading && (
          <div className="space-y-16">

            {/* Highlights Section */}
            {(filter === 'All' || filter === 'Campus Highlights') && highlights.length > 0 && (
              <div>
                <h2 className="text-4xl font-display font-bold text-gray-900 mb-10 tracking-tight">Campus Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {highlights.map((highlight, idx) => {
                    const isVideoValid = highlight.videoUrl &&
                      typeof highlight.videoUrl === 'string' &&
                      highlight.videoUrl.trim() !== '' &&
                      highlight.videoUrl !== 'null' &&
                      /\.(mp4|webm|ogg|mov)$/i.test(highlight.videoUrl);

                    return (
                      <FadeIn delay={idx * 0.1} key={highlight.id}>
                      <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 border border-gray-100/80 group flex flex-col h-full relative">
                        <div className="relative h-64 overflow-hidden bg-gray-50 flex items-center justify-center">
                          {isVideoValid ? (
                            <video
                              id={`video-${highlight.id}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              autoPlay
                              muted={mutedVideos[highlight.id] ?? false}
                              loop
                              playsInline
                              poster={getImageUrl(highlight.imageUrl)}
                            >
                              <source src={getImageUrl(highlight.videoUrl)} type="video/mp4" />
                            </video>
                          ) : highlight.imageUrl ? (
                            <img
                              src={getImageUrl(highlight.imageUrl)}
                              alt={highlight.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="text-gray-300 group-hover:scale-110 transition-transform duration-700 ease-out">
                              <Sparkles size={64} />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 z-10">
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md bg-white/80 text-gray-900 border border-white/50 shadow-sm uppercase tracking-wider flex items-center gap-2">
                              <Sparkles size={14} className="text-primary-600" /> Highlight
                            </span>
                          </div>
                          {isVideoValid && (
                            <button
                              onClick={(e) => toggleMute(e, highlight.id)}
                              className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 border border-white/20 shadow-lg"
                              aria-label="Toggle mute"
                            >
                              {(mutedVideos[highlight.id] ?? false) ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                          )}
                        </div>

                        <div className="p-8 flex flex-col flex-grow relative z-10 bg-white">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">{highlight.title}</h3>
                          <p className="text-gray-500 flex-grow leading-relaxed break-words">{highlight.description}</p>
                        </div>
                      </div>
                      </FadeIn>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Facilities Section */}
            {(filter === 'All' || filter === 'Facilities') && facilities.length > 0 && (
              <div>
                <h2 className="text-4xl font-display font-bold text-gray-900 mb-10 tracking-tight">State-of-the-Art Facilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {facilities.map((facility, idx) => (
                    <FadeIn delay={idx * 0.1} key={facility.id}>
                    <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col h-full relative transform hover:-translate-y-1 border border-gray-100/80">
                      <div className="relative h-64 overflow-hidden bg-gray-50 flex items-center justify-center">
                        {facility.imageUrl ? (
                          <img
                            src={getImageUrl(facility.imageUrl)}
                            alt={facility.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="text-gray-300 group-hover:scale-110 transition-transform duration-700 ease-out">
                            <Building2 size={64} />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md bg-white/80 text-gray-900 border border-white/50 shadow-sm uppercase tracking-wider flex items-center gap-2">
                            <Building2 size={14} className="text-primary-600" /> Facility
                          </span>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow bg-white relative z-20">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">{facility.title}</h3>
                        <p className="text-gray-500 flex-grow leading-relaxed break-words">{facility.description}</p>
                      </div>
                    </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            )}

            {/* Virtual Tours Section */}
            {(filter === 'All' || filter === 'Virtual Tours') && tours.length > 0 && (
              <div>
                <h2 className="text-4xl font-display font-bold text-gray-900 mb-10 tracking-tight">Virtual Campus Tour</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tours.map((tour, idx) => (
                    <FadeIn delay={idx * 0.1} key={tour.id}>
                    <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col h-full relative transform hover:-translate-y-1 border border-gray-100/80">
                      <div className="relative h-64 overflow-hidden bg-gray-50 flex items-center justify-center">
                        {tour.videoUrl ? (
                          <video
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            controls preload="metadata"
                            poster={getImageUrl(tour.imageUrl)}
                          >
                            <source src={getImageUrl(tour.videoUrl)} type="video/mp4" />
                          </video>
                        ) : tour.imageUrl ? (
                          <img
                            src={getImageUrl(tour.imageUrl)}
                            alt={tour.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="text-gray-300 group-hover:scale-110 transition-transform duration-700 ease-out">
                            <PlayCircle size={64} />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md bg-indigo-50/90 text-indigo-700 border border-indigo-100 shadow-sm flex items-center gap-2 tracking-wider uppercase">
                            <PlayCircle size={14} /> Virtual Tour
                          </span>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow bg-white relative z-20">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-300">{tour.title}</h3>
                        <p className="text-gray-500 flex-grow leading-relaxed break-words">{tour.description}</p>
                      </div>
                    </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Stats footer (Matching Courses style) */}
        {!loading && (highlights.length > 0 || facilities.length > 0 || tours.length > 0) && (
          <div className="mt-16 bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-2">Ready to Experience It Yourself?</h3>
            <p className="text-primary-100 mb-6">Schedule a visit or apply today to join our world-class campus.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/admissions"
                className="inline-block bg-white text-primary-700 font-bold px-8 py-3 rounded-full hover:bg-primary-50 transition-all shadow-md"
              >
                Apply for Admission
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-all"
              >
                Schedule a Visit
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
