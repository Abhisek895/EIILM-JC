import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  siteName?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Educational Institution',
  description = 'Welcome to our premier educational institution. Explore our courses, campus, and admissions.',
  keywords = 'education, college, university, courses, admissions',
  image = '/logo.png', // Fallback to local logo if no image is provided
  url = '',
  siteName = 'College ERP',
}) => {
  // Format the title correctly
  const formattedTitle = title === siteName ? title : `${title} | ${siteName}`;

  return (
    <Head>
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={formattedTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Head>
  );
};

export default SEO;
