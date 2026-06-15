import React, { useEffect, useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { siteSettingsApi } from '@api/endpoints';
import FadeIn from '@components/FadeIn';

export default function AboutPage() {
  const [about, setAbout] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const map = await siteSettingsApi.getMap();
        setAbout((map as any)?.about || '');
      } catch {
        // keep empty; still show page shell
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Detect whether the content contains HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(about);

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-20">
        <FadeIn className="container mx-auto max-w-4xl px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-gray-900">About Our College</h1>
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100 leading-relaxed text-gray-700 text-lg">
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
              </div>
            ) : about ? (
              isHtml ? (
                <div
                  className="prose prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: about }}
                />
              ) : (
                <div className="prose prose-lg max-w-none text-gray-600 whitespace-pre-wrap">
                  {about}
                </div>
              )
            ) : (
              <p className="text-gray-500 text-center italic py-10">About information is not available.</p>
            )}
          </div>
        </FadeIn>
      </div>
    </MainLayout>
  );
}


