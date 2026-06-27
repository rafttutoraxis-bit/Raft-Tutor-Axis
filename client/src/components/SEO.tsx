import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schemaData?: object | object[];
  noindex?: boolean;
}

export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl = "https://rafttutoraxis.in/",
  ogTitle,
  ogDescription,
  ogImage = "https://rafttutoraxis.in/BG.png",
  ogUrl = "https://rafttutoraxis.in/",
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  schemaData,
  noindex = false,
}: SEOProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Indexing instructions */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta   name="robots"   content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content="Raft Tutor Axis" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />

      {/* Favicons & Manifest References */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#110d22" />

      {/* Verification meta tags */}
      <meta name="google-site-verification" content="YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_PLACEHOLDER" />
      <meta name="msvalidate.01" content="YOUR_BING_WEBMASTER_VERIFICATION_PLACEHOLDER" />
      
      {/* Google Analytics 4 (GA4) Placeholder */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZFGED5JHHR"></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ZFGED5JHHR');
        `}
      </script>

      {/* Structured Data (JSON-LD) */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
}
